# backend/analysis/black_swan_detector.py
"""
4 camadas de proteção anti-cisne-negro:
  1. Regime de volatilidade (desvio padrão 21d)
  2. NLP de crise (keywords hardcoded)
  3. Anomalia quantitativa (3σ, volume anormal)
  4. Circuit breaker (3 níveis: AMARELO/LARANJA/VERMELHO)
"""
import logging
from datetime import date, timedelta

import numpy as np
import pandas as pd

from supabase_client import get_client, upsert

logger = logging.getLogger(__name__)

CRISIS_KEYWORDS = [
    "embargo", "aftosa", "greve", "férias coletivas",
    "guerra", "tarifa china", "cota esgotada", "fechamento de fronteira",
    "surto", "doença", "paralisação frigorífico",
]


def detect_volatility_regime(client) -> tuple[str, float]:
    """Retorna (regime, std_dev)."""
    resp = (client.table("spot_prices")
            .select("price_per_arroba")
            .eq("state", "SP")
            .order("date", desc=True)
            .limit(22)
            .execute())

    if len(resp.data or []) < 5:
        return "CALMO", 0.0

    prices = pd.Series([float(r["price_per_arroba"]) for r in resp.data])
    returns = prices.pct_change().dropna()
    std = float(returns.std())

    if std > 0.025: regime = "EXTREMO"
    elif std > 0.012: regime = "ELEVADO"
    else: regime = "CALMO"

    logger.info("Volatilidade: %s (std=%.3f%%)", regime, std * 100)
    return regime, round(std, 4)


def detect_nlp_crisis(client) -> list[dict]:
    """Retorna alertas NLP das últimas 48h."""
    cutoff = (date.today() - timedelta(days=2)).isoformat()
    resp = (client.table("news_sentiment")
            .select("title,url,impact_score,published_at")
            .gte("published_at", cutoff)
            .gte("impact_score", 4)
            .execute())

    alerts = []
    for news in (resp.data or []):
        matched = [kw for kw in CRISIS_KEYWORDS if kw in news["title"].lower()]
        if matched:
            alerts.append({
                "type": "nlp_crisis",
                "severity": news["impact_score"],
                "description": news["title"][:200],
                "keywords_matched": matched,
            })

    return alerts


def detect_price_anomaly(client) -> dict | None:
    """Detecta variação CEPEA > 3σ."""
    resp = (client.table("spot_prices")
            .select("date,price_per_arroba")
            .eq("state", "SP")
            .order("date", desc=True)
            .limit(30)
            .execute())

    if len(resp.data or []) < 10:
        return None

    prices = pd.Series([float(r["price_per_arroba"]) for r in resp.data])
    returns = prices.pct_change().dropna()
    mean, std = returns.mean(), returns.std()
    latest_return = returns.iloc[0]

    if abs(latest_return - mean) > 3 * std:
        return {
            "type": "price_anomaly",
            "severity": 4,
            "description": f"Variação anormal de {latest_return:.1%} (>{3:.0f}σ)",
            "keywords_matched": ["anomalia_preco"],
        }
    return None


def run_black_swan_detection() -> tuple[str, list[dict]]:
    """
    Roda todas as camadas e retorna (circuit_breaker_level, alerts).
    circuit_breaker_level: VERDE / AMARELO / LARANJA / VERMELHO
    """
    client = get_client()

    vol_regime, _ = detect_volatility_regime(client)
    nlp_alerts    = detect_nlp_crisis(client)
    price_anomaly = detect_price_anomaly(client)

    all_alerts = nlp_alerts[:]
    if price_anomaly:
        all_alerts.append(price_anomaly)

    # Determina nível do circuit breaker
    max_severity = max((a["severity"] for a in all_alerts), default=0)

    if vol_regime == "EXTREMO" or max_severity >= 5:
        level = "VERMELHO"
    elif vol_regime == "ELEVADO" or max_severity >= 4:
        level = "LARANJA"
    elif max_severity >= 3:
        level = "AMARELO"
    else:
        level = "VERDE"

    logger.info("Circuit breaker: %s | vol=%s | %d alertas",
                level, vol_regime, len(all_alerts))

    # Persiste alertas
    # insert() puro — crisis_events não tem chave de conflito natural (é um log de eventos).
    if all_alerts:
        from supabase_client import insert
        rows = [{
            "event_type": a["type"],
            "severity": a["severity"],
            "description": a["description"],
            "keywords_matched": a["keywords_matched"],
            "circuit_breaker_level": level,
        } for a in all_alerts]
        insert("crisis_events", rows)

    return level, all_alerts
