# backend/fetchers/climate_fetcher.py
"""
NASA POWER via agrobr: precipitação e temperatura por UF pecuária.
Estados: MT, MS, GO, PA, MG
"""
import logging
from datetime import date, timedelta

import agrobr

from ..supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

# Coordenadas centróides aproximadas por UF
STATE_COORDS = {
    "MT": (-12.64, -55.42),
    "MS": (-20.77, -54.78),
    "GO": (-15.98, -49.86),
    "PA": (-3.79, -52.48),
    "MG": (-18.51, -44.55),
}


@with_retry
def fetch_climate(start: date | None = None) -> None:
    end = date.today()
    if start is None:
        start = end - timedelta(days=30)

    logger.info("Buscando clima NASA POWER %s → %s", start, end)
    rows = []

    for state, (lat, lon) in STATE_COORDS.items():
        try:
            df = agrobr.climate.nasa_power(
                lat=lat, lon=lon, start=start, end=end,
                parameters=["PRECTOTCORR", "T2M", "T2M_MAX"],
            )
            if df is None or df.empty:
                continue

            for _, row in df.iterrows():
                prec = float(row.get("PRECTOTCORR", 0) or 0)
                rows.append({
                    "date": str(row.name.date()) if hasattr(row.name, "date") else str(row.get("date", "")),
                    "state": state,
                    "precipitation_mm": prec,
                    "temp_avg": float(row.get("T2M", 0) or 0),
                    "temp_max": float(row.get("T2M_MAX", 0) or 0),
                    "precipitation_anomaly_pct": 0.0,  # calculado na análise
                    "risk_level": "low",               # calculado na análise
                    "pasture_condition": "regular",     # calculado na análise
                })
        except Exception as exc:
            logger.error("Erro clima estado %s: %s", state, exc)

    if rows:
        upsert("climate_data", rows, ["date", "state"])
        logger.info("Upsert %d registros climate_data", len(rows))
