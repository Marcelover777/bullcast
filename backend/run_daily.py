# backend/run_daily.py
"""
Orquestrador principal — executado pelo Railway Cron às 15h BRT, dias úteis.
Cron expression: 0 18 * * 1-5 (18h UTC = 15h BRT)

Ordem de execução:
  1. Fetchers (dados brutos)
  2. Feature Engineering
  3. ML Ensemble
  4. NLP + Sinais
  5. Black Swan Detection
  6. Claude API (textos PT-BR)
  7. Telegram Alert
"""
import logging
import os
import sys
from datetime import date

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("run_daily")


# ── Limpeza de proxy ──────────────────────────────────────
# Proxy NÃO é mais necessário: Firecrawl é a fonte primária de preços CEPEA
# e faz scraping server-side (sem precisar de proxy no nosso lado).
# O proxy Webshare causava 402 Payment Required no B3, NASA e CEPEA direto
# porque o monkey-patch de AsyncClient afetava TODO tráfego async (agrobr).
# Removemos todas as env vars de proxy para garantir conexão direta.
for _var in ("HTTPS_PROXY", "HTTP_PROXY", "ALL_PROXY",
             "https_proxy", "http_proxy", "all_proxy"):
    os.environ.pop(_var, None)
logger.info("Proxy removido — Firecrawl é fonte primária CEPEA, conexão direta para B3/NASA/APIs")


def run():
    logger.info("═══ BullCast Pipeline — %s ═══", date.today())
    errors = []

    # ── 1. Fetchers ────────────────────────────────────────
    from fetchers.cepea_fetcher import fetch_spot_prices, fetch_category_prices
    from fetchers.b3_fetcher import fetch_futures
    from fetchers.macro_fetcher import fetch_macro
    from fetchers.news_fetcher import fetch_news
    from fetchers.climate_fetcher import fetch_climate
    from fetchers.imea_fetcher import fetch_imea_prices
    from fetchers.weather_fetcher import fetch_weather_forecast
    from fetchers.inpe_fetcher import fetch_fire_hotspots
    from fetchers.ibge_fetcher import fetch_ibge_slaughter
    from fetchers.china_quota_fetcher import fetch_china_quota
    from fetchers.ndvi_fetcher import fetch_ndvi

    for name, fn in [
        ("CEPEA spot",     fetch_spot_prices),
        ("CEPEA categorias", fetch_category_prices),
        ("B3 futuros",     fetch_futures),
        ("IMEA MT+NUB",    fetch_imea_prices),
        ("Macro BCB",      fetch_macro),
        ("Notícias RSS",   fetch_news),
        ("Clima NASA",     fetch_climate),
        ("Previsão Tempo", fetch_weather_forecast),
        ("INPE Queimadas", fetch_fire_hotspots),
        ("IBGE Abate",     fetch_ibge_slaughter),
        ("China Quota",    fetch_china_quota),
        ("NDVI Pastagem",  fetch_ndvi),
    ]:
        try:
            fn()
            logger.info("✓ %s", name)
        except Exception as exc:
            logger.error("✗ %s: %s", name, exc)
            errors.append(f"Fetcher {name}: {exc}")

    # ── 2. Feature Engineering ─────────────────────────────
    from analysis.technical import compute_technical_indicators
    from analysis.farmer_scores import compute_farmer_scores
    from analysis.fundamental import compute_fundamental_indicators
    from analysis.climate_analyzer import compute_climate_risk
    from analysis.sentiment import classify_news

    for name, fn in [
        ("Indicadores técnicos", compute_technical_indicators),
        # fundamental ANTES de farmer_scores: ambos fazem upsert em fundamental_indicators.
        # Supabase upsert faz ON CONFLICT DO UPDATE SET (substitui todos os campos),
        # então farmer_scores deve ser o ÚLTIMO a escrever, pois inclui campos do fundamental.
        # farmer_scores lê os campos farmer_* e fundamental lê outros — mas ambos escrevem a
        # mesma row. Ordem correta: fundamental popula campos base, farmer_scores sobrescreve
        # com merge manual buscando o row anterior e enviando todos os campos juntos.
        # TODO futuro: unificar em um único compute_all_fundamental() para evitar duplo upsert.
        ("Fundamental",          compute_fundamental_indicators),
        ("Farmer scores",        compute_farmer_scores),
        ("Risco climático",      compute_climate_risk),
        ("Sentimento notícias",  classify_news),
    ]:
        try:
            fn()
            logger.info("✓ %s", name)
        except Exception as exc:
            logger.error("✗ %s: %s", name, exc)
            errors.append(f"Analysis {name}: {exc}")

    # ── 3. ML Ensemble ─────────────────────────────────────
    try:
        from ml_models.ensemble import run_ensemble
        run_ensemble()
        logger.info("✓ ML Ensemble")
    except Exception as exc:
        logger.error("✗ ML Ensemble: %s", exc)
        errors.append(f"ML: {exc}")

    # ── 4. Signal Generator ────────────────────────────────
    try:
        from analysis.signal_generator import generate_signal
        signal_row = generate_signal()
        logger.info("✓ Signal: %s", signal_row.get("signal"))
    except Exception as exc:
        logger.error("✗ Signal: %s", exc)
        signal_row = {"date": str(date.today()), "signal": "HOLD", "confidence": 0,
                      "price_current": 0, "price_pred_5d": 0,
                      "price_pred_15d": 0, "price_pred_30d": 0}
        errors.append(f"Signal: {exc}")

    # ── 5. Black Swan Detection ────────────────────────────
    try:
        from analysis.black_swan_detector import run_black_swan_detection
        circuit_level, bs_alerts = run_black_swan_detection()

        if circuit_level in ("LARANJA", "VERMELHO"):
            signal_row["signal"] = "HOLD"
            logger.warning("Circuit breaker %s → sinal alterado para HOLD", circuit_level)
    except Exception as exc:
        logger.error("✗ Black Swan: %s", exc)
        circuit_level = "VERDE"
        bs_alerts = []
        errors.append(f"BlackSwan: {exc}")

    # ── 6. Claude API — textos PT-BR + upsert único trade_signals ─────────────
    # IMPORTANTE: o upsert de trade_signals é feito UMA ÚNICA VEZ aqui,
    # com signal + circuit_breaker + textos Claude, evitando race condition.
    # generate_signal() apenas retorna o dict sem persistir.
    texts = {"recommendation_text": "Análise em andamento.", "explanation_text": "",
             "trend_text": "", "duration_text": ""}
    use_v2 = os.environ.get("USE_ML_V2", "false").lower() == "true"

    if use_v2:
        try:
            from claude_integration import generate_signal_texts_v2
            # Build full analyst context
            analyst_context = {
                "price_current": float(signal_row.get("price_current", 0)),
                "predictions": {
                    "5d": float(signal_row.get("price_pred_5d") or 0),
                    "15d": float(signal_row.get("price_pred_15d") or 0),
                    "30d": float(signal_row.get("price_pred_30d") or 0),
                },
                "confidence_interval_90": {
                    "15d": [
                        float(signal_row.get("interval_lower") or 0),
                        float(signal_row.get("interval_upper") or 0),
                    ]
                },
                "signal": signal_row.get("signal", "HOLD"),
                "signal_confidence": float(signal_row.get("confidence", 0)),
                "scores": {
                    "ml": float(signal_row.get("score_ml") or 50),
                    "technical": float(signal_row.get("score_technical") or 50),
                    "fundamental": float(signal_row.get("score_fundamental") or 50),
                    "sentiment": float(signal_row.get("score_sentiment") or 50),
                    "climate": float(signal_row.get("score_climate") or 50),
                },
            }
            texts = generate_signal_texts_v2(analyst_context)
            logger.info("✓ Claude Analyst v2 textos gerados")
        except Exception as exc:
            logger.error("✗ Claude Analyst v2: %s", exc)
            errors.append(f"Claude v2: {exc}")
    else:
        try:
            from claude_integration import generate_signal_texts
            from supabase_client import get_client, upsert

            client = get_client()
            fi_resp = (client.table("fundamental_indicators")
                       .select("cycle_phase,seasonal_avg_pct")
                       .order("date", desc=True)
                       .limit(1)
                       .execute())
            fi = fi_resp.data[0] if fi_resp.data else {}

            texts = generate_signal_texts(
                signal=signal_row.get("signal", "HOLD"),
                confidence=float(signal_row.get("confidence", 0)),
                price=float(signal_row.get("price_current", 0)),
                pred_15d=float(signal_row.get("price_pred_15d") or 0),
                cycle_phase=fi.get("cycle_phase", "NEUTRO"),
                seasonal_pct=float(fi.get("seasonal_avg_pct") or 0),
                volatility=circuit_level,
            )
            logger.info("✓ Claude API textos gerados")
        except Exception as exc:
            logger.error("✗ Claude API: %s", exc)
            errors.append(f"Claude: {exc}")

    # Upsert único — após circuit_breaker E Claude (evita double-write / race condition)
    try:
        from supabase_client import upsert
        upsert("trade_signals", [{
            **signal_row,
            "volatility_regime": circuit_level,
            "circuit_breaker_level": circuit_level,
            **texts,
        }], ["date"])
        logger.info("✓ trade_signals gravado (signal=%s circuit=%s)",
                    signal_row.get("signal"), circuit_level)
    except Exception as exc:
        logger.error("✗ Upsert trade_signals: %s", exc)
        errors.append(f"TradeSignalUpsert: {exc}")

    # ── 7. WhatsApp (Evolution API) + Telegram fallback ────
    try:
        from alerts.whatsapp_bot import send_daily_signal as wa_daily, send_crisis_alert as wa_crisis

        if circuit_level in ("LARANJA", "VERMELHO") and bs_alerts:
            wa_crisis(bs_alerts[0]["description"], circuit_level)

        wa_daily(
            signal=signal_row.get("signal", "HOLD"),
            price=float(signal_row.get("price_current", 0)),
            pred_15d=float(signal_row.get("price_pred_15d") or 0),
            recommendation=texts.get("recommendation_text", ""),
            explanation=texts.get("explanation_text", ""),
            vol_regime=circuit_level,
            circuit_level=circuit_level,
        )
        logger.info("✓ WhatsApp enviado")
    except Exception as exc:
        logger.error("✗ WhatsApp: %s", exc)
        errors.append(f"WhatsApp: {exc}")

    # ── Resumo ─────────────────────────────────────────────
    if errors:
        logger.warning("Pipeline concluído com %d erros:", len(errors))
        for e in errors:
            logger.warning("  - %s", e)
        # Exit 0 para erros parciais — Railway interpreta exit(1) como CRASH.
        # Erros de fetcher (CEPEA 403, RSS down) são esperados e não devem
        # impedir o próximo cron run. O pipeline é projetado para ser resiliente.
        logger.info("═══ Pipeline finalizado (parcial) ═══")
    else:
        logger.info("═══ Pipeline concluído com sucesso ═══")


if __name__ == "__main__":
    run()
