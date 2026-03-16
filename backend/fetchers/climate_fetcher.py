# backend/fetchers/climate_fetcher.py
"""
NASA POWER via agrobr v1.x (async API): precipitação e temperatura por UF pecuária.
Usa nasa_power.clima_ponto(lat, lon, inicio, fim) que retorna:
  data, lat, lon, uf, temp_media, temp_max, temp_min, precip_mm,
  umidade_rel, radiacao_mj, vento_ms
"""
import asyncio
import logging
from datetime import date, timedelta

from supabase_client import upsert
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


def _run_async(coro):
    """Roda coroutine do agrobr em contexto sync."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            return pool.submit(asyncio.run, coro).result()
    else:
        return asyncio.run(coro)


@with_retry
def fetch_climate(start: date | None = None) -> None:
    end = date.today()
    if start is None:
        start = end - timedelta(days=30)

    logger.info("Buscando clima NASA POWER %s → %s", start, end)
    rows = []

    for state, (lat, lon) in STATE_COORDS.items():
        async def _fetch(la=lat, lo=lon):
            from agrobr.nasa_power import clima_ponto
            return await clima_ponto(lat=la, lon=lo, inicio=start, fim=end)

        try:
            df = _run_async(_fetch())
        except Exception as exc:
            logger.error("Erro clima estado %s: %s", state, exc)
            continue

        if df is None or df.empty:
            continue

        for _, row in df.iterrows():
            # agrobr v1.x retorna coluna "data" (date object)
            row_date = row.get("data") or row.get("date")
            if row_date is None:
                # Tenta usar o index
                if hasattr(row.name, "date"):
                    row_date = row.name
                else:
                    continue

            date_str = str(row_date.date()) if hasattr(row_date, "date") else str(row_date)
            prec = float(row.get("precip_mm") or row.get("PRECTOTCORR") or 0)

            rows.append({
                "date": date_str,
                "state": state,
                "precipitation_mm": round(prec, 1),
                "temp_avg": round(float(row.get("temp_media") or row.get("T2M") or 0), 1),
                "temp_max": round(float(row.get("temp_max") or row.get("T2M_MAX") or 0), 1),
                "precipitation_anomaly_pct": 0.0,   # calculado na análise
                "risk_level": "low",                 # calculado na análise
                "pasture_condition": "regular",      # calculado na análise
            })

    if rows:
        upsert("climate_data", rows, ["date", "state"])
        logger.info("Upsert %d registros climate_data", len(rows))
