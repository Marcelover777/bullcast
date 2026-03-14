# backend/fetchers/cepea_fetcher.py
"""
Busca preços CEPEA via agrobr:
  - Spot boi gordo (por estado)
  - Categorias: bezerro, garrote, novilha, vaca gorda, boi magro
"""
import logging
from datetime import date, timedelta

import agrobr
import pandas as pd

from ..supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

STATES = ["SP", "MT", "MS", "GO", "MG", "RO"]
CATEGORIES = [
    ("boi_gordo", "Boi Gordo", 450, 540),
    ("vaca_gorda", "Vaca Gorda", 380, 450),
    ("garrote", "Garrote", 240, 360),
    ("novilha", "Novilha", 240, 360),
    ("bezerro", "Bezerro", 180, 240),
    ("bezerra", "Bezerra", 180, 240),
    ("boi_magro", "Boi Magro", 360, 450),
    ("novilhinha", "Novilhinha", 180, 240),
]


@with_retry
def fetch_spot_prices(start: date | None = None) -> None:
    """Ingere preços spot CEPEA SP (referência) e demais estados."""
    end = date.today()
    if start is None:
        start = end - timedelta(days=7)

    logger.info("Buscando spot CEPEA %s → %s", start, end)
    rows = []

    for state in STATES:
        try:
            df = agrobr.cepea.boi_gordo(state=state, start=start, end=end)
            if df is None or df.empty:
                logger.warning("Sem dados CEPEA para estado %s", state)
                continue

            for _, row in df.iterrows():
                rows.append({
                    "date": str(row["date"].date()),
                    "state": state,
                    "price_per_arroba": float(row["price"]),
                    "price_per_kg": float(row["price"]) / 15 * 0.54,
                    "variation_day": float(row.get("variation_day", 0) or 0),
                    "variation_week": float(row.get("variation_week", 0) or 0),
                    "source": "CEPEA",
                })
        except Exception as exc:
            logger.error("Erro CEPEA estado %s: %s", state, exc)

    if rows:
        upsert("spot_prices", rows, ["date", "state"])
        logger.info("Upsert %d registros spot_prices", len(rows))


@with_retry
def fetch_category_prices(start: date | None = None) -> None:
    """Ingere preços por categoria de animal."""
    end = date.today()
    if start is None:
        start = end - timedelta(days=7)

    logger.info("Buscando categorias CEPEA %s → %s", start, end)
    rows = []

    for slug, label, w_min, w_max in CATEGORIES:
        try:
            df = agrobr.cepea.categoria(slug, state="SP", start=start, end=end)
            if df is None or df.empty:
                continue

            for _, row in df.iterrows():
                price_kg = float(row["price"])
                weight_mid = (w_min + w_max) / 2
                rows.append({
                    "date": str(row["date"].date()),
                    "category": label,
                    "weight_min": w_min,
                    "weight_max": w_max,
                    "price_per_kg": price_kg,
                    "price_per_head": price_kg * weight_mid,
                    "variation_day": float(row.get("variation_day", 0) or 0),
                    "variation_week": float(row.get("variation_week", 0) or 0),
                    "state": "SP",
                    "source": "CEPEA",
                })
        except Exception as exc:
            logger.error("Erro CEPEA categoria %s: %s", label, exc)

    if rows:
        upsert("cattle_categories", rows, ["date", "category", "state"])
        logger.info("Upsert %d registros cattle_categories", len(rows))
