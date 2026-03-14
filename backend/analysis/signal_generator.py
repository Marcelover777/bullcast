# backend/analysis/signal_generator.py
"""
Gera sinal BUY/SELL/HOLD combinando:
  40% ML (confiança + direção ensemble)
  25% Técnico (farmer_trend score)
  20% Fundamental (ciclo + basis + sazonalidade)
  15% Sentimento (media news positivas vs negativas)
"""
import logging
from datetime import date, timedelta

import pandas as pd

from ..supabase_client import get_client, upsert

logger = logging.getLogger(__name__)


def _ml_score(client) -> float:
    """0 = forte venda, 100 = forte compra."""
    resp = (client.table("ml_predictions")
            .select("horizon_days,pred_value,confidence")
            .order("created_at", desc=True)
            .limit(3)
            .execute())
    if not resp.data:
        return 50.0

    spot_resp = (client.table("spot_prices")
                 .select("price_per_arroba")
                 .eq("state", "SP")
                 .order("date", desc=True)
                 .limit(1)
                 .execute())
    current = float(spot_resp.data[0]["price_per_arroba"]) if spot_resp.data else 0

    scores = []
    for pred in resp.data:
        direction = 1 if float(pred["pred_value"]) > current else -1
        conf = float(pred["confidence"])
        scores.append(50 + direction * conf * 50)

    return round(sum(scores) / len(scores), 1)


def _technical_score(client) -> float:
    resp = (client.table("fundamental_indicators")
            .select("farmer_trend")
            .order("date", desc=True)
            .limit(1)
            .execute())
    return float(resp.data[0]["farmer_trend"]) if resp.data else 50.0


def _fundamental_score(client) -> float:
    resp = (client.table("fundamental_indicators")
            .select("cycle_phase,seasonal_avg_pct,basis")
            .order("date", desc=True)
            .limit(1)
            .execute())
    if not resp.data:
        return 50.0

    row = resp.data[0]
    score = 50.0

    cycle = row.get("cycle_phase", "NEUTRO")
    if cycle == "RETENCAO":  score += 15   # oferta cai → preço sobe
    elif cycle == "LIQUIDACAO": score -= 15

    seasonal = float(row.get("seasonal_avg_pct") or 0)
    score += min(max(seasonal * 2, -20), 20)

    basis = float(row.get("basis") or 0)
    if basis > 0: score += 5   # futuros acima do spot = pressão compradora
    elif basis < -5: score -= 5

    return round(min(max(score, 0), 100), 1)


def _sentiment_score(client) -> float:
    cutoff = (date.today() - timedelta(days=3)).isoformat()
    resp = (client.table("news_sentiment")
            .select("sentiment,impact_score")
            .gte("published_at", cutoff)
            .execute())

    if not resp.data:
        return 50.0

    pos = sum(r["impact_score"] for r in resp.data if r["sentiment"] == "POS")
    neg = sum(r["impact_score"] for r in resp.data if r["sentiment"] == "NEG")
    total = pos + neg

    return round(50 + (pos - neg) / max(total, 1) * 50, 1) if total else 50.0


def generate_signal() -> dict:
    client = get_client()

    ml   = _ml_score(client)
    tech = _technical_score(client)
    fund = _fundamental_score(client)
    sent = _sentiment_score(client)

    composite = round(ml * 0.40 + tech * 0.25 + fund * 0.20 + sent * 0.15, 1)

    if composite >= 62:
        signal = "BUY"
        confidence = min(1.0, (composite - 50) / 50)
    elif composite <= 38:
        signal = "SELL"
        confidence = min(1.0, (50 - composite) / 50)
    else:
        signal = "HOLD"
        confidence = 0.5 - abs(composite - 50) / 50

    confidence = round(confidence, 3)

    logger.info(
        "Sinal: %s %.0f%% | ML=%.1f Tec=%.1f Fund=%.1f Sent=%.1f → %.1f",
        signal, confidence * 100, ml, tech, fund, sent, composite,
    )

    # Busca previsões ML para o sinal
    pred_resp = (client.table("ml_predictions")
                 .select("horizon_days,pred_value")
                 .order("created_at", desc=True)
                 .limit(3)
                 .execute())
    preds = {r["horizon_days"]: r["pred_value"] for r in (pred_resp.data or [])}

    spot_resp = (client.table("spot_prices")
                 .select("price_per_arroba")
                 .eq("state", "SP")
                 .order("date", desc=True)
                 .limit(1)
                 .execute())
    price = float(spot_resp.data[0]["price_per_arroba"]) if spot_resp.data else 0

    row = {
        "date":          str(date.today()),
        "signal":        signal,
        "confidence":    confidence,
        "price_current": price,
        "price_pred_5d":  preds.get(5),
        "price_pred_15d": preds.get(15),
        "price_pred_30d": preds.get(30),
    }

    # NÃO fazer upsert aqui — run_daily.py faz o upsert único após circuit breaker + Claude.
    # Motivo: evitar race condition onde o signal fica no banco sem circuit_breaker_level.
    return row
