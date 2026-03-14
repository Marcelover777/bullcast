# backend/analysis/farmer_scores.py
"""
Calcula os 3 velocímetros do FarmerGauges (0-100):
  - farmer_momentum  = "Força do Momento" (RSI + Stoch + Momentum)
  - farmer_trend     = "Tendência Geral" (sumário osciladores + MAs)
  - farmer_direction = "Rumo do Preço" (contagem MAs bullish/bearish)

Também calcula bullish_count, bearish_count, neutral_count.
Salva em fundamental_indicators (merge com dados fundamentalistas).
"""
import logging

import pandas as pd

from ..supabase_client import get_client, upsert

logger = logging.getLogger(__name__)


def _classify_rsi(rsi: float) -> str:
    if rsi >= 70: return "bearish"  # sobrecomprado
    if rsi <= 30: return "bullish"  # sobrevendido
    return "neutral"


def _classify_macd(hist: float) -> str:
    if hist > 0: return "bullish"
    if hist < 0: return "bearish"
    return "neutral"


def _to_score_100(value: float, low: float, high: float) -> float:
    """Normaliza valor de [low, high] para [0, 100]."""
    clamped = max(low, min(high, value))
    return round((clamped - low) / (high - low) * 100, 1)


def compute_farmer_scores() -> None:
    client = get_client()

    # Busca últimos indicadores técnicos
    resp = (client.table("technical_indicators")
            .select("*")
            .order("date", desc=False)
            .limit(60)
            .execute())

    if not resp.data:
        logger.warning("Sem technical_indicators para farmer scores")
        return

    df = pd.DataFrame(resp.data).sort_values("date")
    latest = df.iloc[-1]
    spot_resp = (client.table("spot_prices")
                 .select("price_per_arroba")
                 .eq("state", "SP")
                 .order("date", desc=True)
                 .limit(1)
                 .execute())

    price = float(spot_resp.data[0]["price_per_arroba"]) if spot_resp.data else 0

    rsi     = float(latest.get("rsi_14") or 50)
    macd_h  = float(latest.get("macd_hist") or 0)
    stoch_k = float(latest.get("stoch_k") or 50)
    sma_9   = float(latest.get("sma_9") or price)
    sma_21  = float(latest.get("sma_21") or price)
    sma_50  = float(latest.get("sma_50") or price)
    sma_200 = float(latest.get("sma_200") or price)
    ema_9   = float(latest.get("ema_9") or price)
    ema_21  = float(latest.get("ema_21") or price)

    # ── Farmer Momentum (Força do Momento): RSI + Stoch
    # RSI: 30=máx bullish, 50=neutro, 70=máx bearish
    # Stoch: <20=bullish, >80=bearish
    momentum_rsi   = 100 - _to_score_100(rsi, 30, 70)      # invertido: baixo RSI = força compradora
    momentum_stoch = 100 - _to_score_100(stoch_k, 20, 80)
    farmer_momentum = round((momentum_rsi * 0.6 + momentum_stoch * 0.4), 1)

    # ── Farmer Direction (Rumo do Preço): contagem MAs
    ma_signals = []
    for ma in [sma_9, sma_21, sma_50, ema_9, ema_21]:
        if price > ma: ma_signals.append("bullish")
        elif price < ma: ma_signals.append("bearish")
        else: ma_signals.append("neutral")

    if price > sma_200: ma_signals.append("bullish")
    else: ma_signals.append("bearish")

    bullish_ma = ma_signals.count("bullish")
    bearish_ma = ma_signals.count("bearish")
    neutral_ma = ma_signals.count("neutral")
    total_ma = len(ma_signals)
    farmer_direction = round(bullish_ma / total_ma * 100, 1)

    # ── Farmer Trend (Tendência Geral): combinação osciladores + MAs
    osc_signals = [_classify_rsi(rsi), _classify_macd(macd_h)]
    all_signals = osc_signals + ma_signals

    bullish_total = all_signals.count("bullish")
    bearish_total = all_signals.count("bearish")
    neutral_total = all_signals.count("neutral")
    total_all = len(all_signals)
    farmer_trend = round(bullish_total / total_all * 100, 1)

    # Busca row existente (populado por fundamental.py) para merge manual.
    # Supabase upsert faz ON CONFLICT DO UPDATE SET = substitui ALL campos.
    # Para não zerar campos de fundamental.py, envia todos os campos juntos.
    today_str = str(latest["date"])
    existing_resp = (client.table("fundamental_indicators")
                     .select("*")
                     .eq("date", today_str)
                     .limit(1)
                     .execute())
    existing = existing_resp.data[0] if existing_resp.data else {}

    row = {
        **existing,  # preserva campos populados por fundamental.py (basis, cycle_phase, etc.)
        "date": today_str,
        "farmer_momentum":  farmer_momentum,
        "farmer_trend":     farmer_trend,
        "farmer_direction": farmer_direction,
        "bullish_count":    bullish_total,
        "bearish_count":    bearish_total,
        "neutral_count":    neutral_total,
    }
    # Remove campos de controle que Supabase gera automaticamente
    row.pop("id", None)
    row.pop("created_at", None)

    upsert("fundamental_indicators", [row], ["date"])
    logger.info(
        "Farmer scores: momentum=%.1f trend=%.1f direction=%.1f | %d alta %d baixa %d neutro",
        farmer_momentum, farmer_trend, farmer_direction,
        bullish_total, bearish_total, neutral_total,
    )
