# backend/fetchers/ndvi_fetcher.py
"""
Busca índice NDVI de pastagem via Google Earth Engine API.
Produto: MOD13A2 v061 (NDVI 16 dias, 1km).
Fallback: forward-fill do último valor no feature_store.
"""
import json
import logging
import os
from datetime import date, timedelta

from supabase_client import upsert

logger = logging.getLogger(__name__)

# Bounding boxes das principais regiões pecuárias
STATE_BBOXES = {
    "SP": [-23.5, -53.0, -19.8, -44.2],
    "MT": [-17.9, -61.6, -7.4, -50.2],
    "GO": [-19.5, -53.2, -12.4, -45.9],
    "MS": [-24.1, -58.2, -17.2, -50.9],
    "MG": [-22.9, -51.0, -14.2, -39.9],
}


def _fetch_via_gee() -> list[dict]:
    """Busca NDVI via Google Earth Engine. Requer env GEE_SERVICE_ACCOUNT_KEY."""
    import ee

    key_json = os.environ.get("GEE_SERVICE_ACCOUNT_KEY")
    if not key_json:
        raise RuntimeError("GEE_SERVICE_ACCOUNT_KEY não configurada")

    credentials = ee.ServiceAccountCredentials(
        json.loads(key_json)["client_email"],
        key_data=key_json,
    )
    ee.Initialize(credentials)

    # Último composite disponível (~8-16 dias atrás)
    end = date.today()
    start = end - timedelta(days=20)

    rows = []
    collection = (ee.ImageCollection("MODIS/061/MOD13A2")
                  .filterDate(start.isoformat(), end.isoformat())
                  .select("NDVI"))

    if collection.size().getInfo() == 0:
        logger.warning("NDVI: nenhum composite disponível para %s → %s", start, end)
        return []

    image = collection.sort("system:time_start", False).first()
    img_date = date.fromtimestamp(image.get("system:time_start").getInfo() / 1000)

    for state, bbox in STATE_BBOXES.items():
        region = ee.Geometry.Rectangle(bbox)
        stats = image.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=region,
            scale=1000,
            maxPixels=1e9,
        ).getInfo()

        ndvi_raw = stats.get("NDVI", 0)
        ndvi_value = round(ndvi_raw * 0.0001, 4) if ndvi_raw else 0  # scale factor

        rows.append({
            "date": str(img_date),
            "state": state,
            "ndvi_value": ndvi_value,
            "ndvi_anomaly": 0,  # calculated in feature_store vs historical mean
            "source": "MODIS",
        })

    return rows


def fetch_ndvi() -> None:
    """Busca NDVI. Não levanta exceção se falhar (feature opcional)."""
    try:
        rows = _fetch_via_gee()
        if rows:
            upsert("ndvi_pasture", rows, ["date", "state"])
            logger.info("✓ NDVI: %d registros de %s", len(rows), rows[0]["date"])
        else:
            logger.warning("NDVI: nenhum dado retornado")
    except Exception as exc:
        logger.warning("NDVI falhou (não-crítico): %s", exc)
