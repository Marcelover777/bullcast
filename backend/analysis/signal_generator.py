# backend/analysis/signal_generator.py
"""
Signal Generator v2 — 5-dimension scoring with magnitude and conformal confidence.
40% ML, 20% Technical, 20% Fundamental, 10% Sentiment, 10% Climate
"""
import logging
from datetime import date, timedelta

from supabase_client import get_client

logger = logging.getLogger(__name__)

WEIGHTS = {
    "ml": 0.40,
    "technical": 0.20,
    "fundamental": 0.20,
    "sentiment": 0.10,
    "climate": 0.10,
}


def _safe_float(val, default: float = 0.0) -> float:
    if val is None:
        return default
    try:
        result = float(val)
        return default if result != result else result  # NaN check
    except (ValueError, TypeError):
        return default


def _ml_score_v2(pred_15d: float, current: float, confidence: float) -> float:
    """Score proporcional à magnitude do retorno esperado."""
    if current <= 0:
        return 50.0
    expected_return = (pred_15d - current) / current
    score = 50 + expected_return * confidence * 200
    return round(min(100, max(0, score)), 1)


def _technical_score_v2(client) -> float:
    """RSI zones + MACD crossover + BB squeeze + farmer_trend."""
    try:
        tech_resp = (client.table("technical_indicators")
                     .select("rsi_14,macd_hist,bb_upper,bb_lower,bb_mid")
                     .order("date", desc=True)
                     .limit(1)
                     .execute())
        fund_resp = (client.table("fundamental_indicators")
                     .select("farmer_trend")
                     .order("date", desc=True)
                     .limit(1)
                     .execute())
    except Exception as exc:
        logger.warning("Erro buscando técnicos: %s", exc)
        return 50.0

    scores = []

    # RSI zones
    if tech_resp.data:
        rsi = _safe_float(tech_resp.data[0].get("rsi_14"), 50)
        if rsi < 30:
            scores.append(80)  # oversold → buy
        elif rsi > 70:
            scores.append(20)  # overbought → sell
        else:
            scores.append(50)

        # MACD crossover
        macd = _safe_float(tech_resp.data[0].get("macd_hist"))
        if macd > 0:
            scores.append(65)
        elif macd < 0:
            scores.append(35)
        else:
            scores.append(50)

        # BB squeeze
        bb_upper = _safe_float(tech_resp.data[0].get("bb_upper"))
        bb_lower = _safe_float(tech_resp.data[0].get("bb_lower"))
        bb_mid = _safe_float(tech_resp.data[0].get("bb_mid"), 1)
        bb_width = (bb_upper - bb_lower) / bb_mid if bb_mid else 0
        if bb_width < 0.03:
            scores.append(60)  # squeeze → breakout expected
        else:
            scores.append(50)

    # Farmer trend
    if fund_resp.data:
        ft = _safe_float(fund_resp.data[0].get("farmer_trend"), 50)
        scores.append(min(100, max(0, ft)))

    return round(sum(scores) / len(scores), 1) if scores else 50.0


def _fundamental_score_v2(client) -> float:
    """Real IBGE cycle + supply_pressure + basis + china_risk."""
    try:
        fund_resp = (client.table("fundamental_indicators")
                     .select("cycle_phase,seasonal_avg_pct,basis")
                     .order("date", desc=True)
                     .limit(1)
                     .execute())
        china_resp = (client.table("china_quota_tracking")
                      .select("quota_usage_pct")
                      .order("date", desc=True)
                      .limit(1)
                      .execute())
    except Exception as exc:
        logger.warning("Erro buscando fundamental: %s", exc)
        return 50.0

    score = 50.0

    if fund_resp.data:
        row = fund_resp.data[0]
        cycle = row.get("cycle_phase", "NEUTRO")
        if cycle == "RETENCAO":
            score += 15
        elif cycle == "LIQUIDACAO":
            score -= 15

        seasonal = _safe_float(row.get("seasonal_avg_pct"))
        score += min(max(seasonal * 2, -20), 20)

        basis = _safe_float(row.get("basis"))
        if basis > 0:
            score += 5
        elif basis < -5:
            score -= 5

    if china_resp.data:
        quota = _safe_float(china_resp.data[0].get("quota_usage_pct"))
        if quota > 80:
            score -= 10  # quota filling up = risk

    return round(min(100, max(0, score)), 1)


def _sentiment_score_v2(client) -> float:
    """News sentiment + china risk combined."""
    try:
        cutoff = (date.today() - timedelta(days=3)).isoformat()
        resp = (client.table("news_sentiment")
                .select("sentiment,impact_score")
                .gte("published_at", cutoff)
                .execute())
    except Exception:
        return 50.0

    if not resp.data:
        return 50.0

    pos = sum(_safe_float(r.get("impact_score")) for r in resp.data if r.get("sentiment") == "POS")
    neg = sum(_safe_float(r.get("impact_score")) for r in resp.data if r.get("sentiment") == "NEG")
    total = pos + neg
    return round(50 + (pos - neg) / max(total, 1) * 50, 1) if total else 50.0


def _climate_score(client) -> float:
    """NDVI + fire hotspots + precipitation anomaly."""
    try:
        ndvi_resp = (client.table("ndvi_pasture")
                     .select("ndvi_value")
                     .eq("state", "MT")
                     .order("date", desc=True)
                     .limit(1)
                     .execute())
        fire_resp = (client.table("fire_hotspots")
                     .select("hotspot_count")
                     .order("date", desc=True)
                     .limit(5)
                     .execute())
    except Exception:
        return 50.0

    score = 50.0

    if ndvi_resp.data:
        ndvi = _safe_float(ndvi_resp.data[0].get("ndvi_value"), 0.65)
        if ndvi < 0.4:
            score -= 15  # poor pasture → supply stress
        elif ndvi > 0.7:
            score += 5

    if fire_resp.data:
        avg_fire = sum(_safe_float(r.get("hotspot_count")) for r in fire_resp.data) / len(fire_resp.data)
        if avg_fire > 50:
            score -= 10  # many fires → drought stress

    return round(min(100, max(0, score)), 1)


def _classify_signal(composite: float) -> tuple[str, float]:
    """Classify composite score into signal + confidence."""
    if composite >= 62:
        signal = "BUY"
        confidence = min(1.0, (composite - 50) / 50)
    elif composite <= 38:
        signal = "SELL"
        confidence = min(1.0, (50 - composite) / 50)
    else:
        signal = "HOLD"
        confidence = 0.5 - abs(composite - 50) / 50
    return signal, round(confidence, 3)


def generate_signal() -> dict:
    """Generate trading signal with 5-dimension scoring."""
    client = get_client()

    # Get ML predictions
    try:
        pred_resp = (client.table("ml_predictions")
                     .select("horizon_days,pred_value,pred_lower,pred_upper,confidence")
                     .order("created_at", desc=True)
                     .limit(3)
                     .execute())
        preds = {r["horizon_days"]: r for r in (pred_resp.data or [])}
    except Exception:
        preds = {}

    # Current price
    try:
        spot_resp = (client.table("spot_prices")
                     .select("price_per_arroba")
                     .eq("state", "SP")
                     .order("date", desc=True)
                     .limit(1)
                     .execute())
        price = _safe_float(spot_resp.data[0]["price_per_arroba"]) if spot_resp.data else 0
    except Exception:
        price = 0

    pred_15d = _safe_float(preds.get(15, {}).get("pred_value"))
    ml_conf = _safe_float(preds.get(15, {}).get("confidence"), 0.5)

    # Compute 5 dimension scores
    s_ml = _ml_score_v2(pred_15d, price, ml_conf)
    s_tech = _technical_score_v2(client)
    s_fund = _fundamental_score_v2(client)
    s_sent = _sentiment_score_v2(client)
    s_clim = _climate_score(client)

    composite = round(
        s_ml * WEIGHTS["ml"] +
        s_tech * WEIGHTS["technical"] +
        s_fund * WEIGHTS["fundamental"] +
        s_sent * WEIGHTS["sentiment"] +
        s_clim * WEIGHTS["climate"],
        1
    )

    signal, confidence = _classify_signal(composite)

    logger.info(
        "Sinal: %s %.0f%% | ML=%.1f Tec=%.1f Fund=%.1f Sent=%.1f Clim=%.1f → %.1f",
        signal, confidence * 100, s_ml, s_tech, s_fund, s_sent, s_clim, composite,
    )

    # Get interval from latest predictions
    p15 = preds.get(15, {})
    interval_lower = _safe_float(p15.get("pred_lower"))
    interval_upper = _safe_float(p15.get("pred_upper"))

    return {
        "date": str(date.today()),
        "signal": signal,
        "confidence": confidence,
        "price_current": price,
        "price_pred_5d": _safe_float(preds.get(5, {}).get("pred_value")),
        "price_pred_15d": pred_15d,
        "price_pred_30d": _safe_float(preds.get(30, {}).get("pred_value")),
        # v2 new fields
        "score_ml": s_ml,
        "score_technical": s_tech,
        "score_fundamental": s_fund,
        "score_sentiment": s_sent,
        "score_climate": s_clim,
        "interval_lower": interval_lower,
        "interval_upper": interval_upper,
    }
