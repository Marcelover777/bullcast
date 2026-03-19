# backend/fetchers/inpe_fetcher.py
"""
Busca focos de calor do INPE (BDQueimadas).
Fonte: file server CSV diário.
"""
import logging
from datetime import date, timedelta

import httpx
import pandas as pd
from io import StringIO

from supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

BASE_URL = "https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/diario/"
TARGET_STATES = {"São Paulo": "SP", "Mato Grosso": "MT", "Goiás": "GO",
                 "Mato Grosso do Sul": "MS", "Minas Gerais": "MG"}
RISK_THRESHOLDS = {"BAIXO": 10, "MEDIO": 30, "ALTO": 80}


def _parse_hotspots(csv_text: str, ref_date: date) -> list[dict]:
    """Parse INPE CSV and aggregate by state."""
    df = pd.read_csv(StringIO(csv_text))
    if df.empty:
        return []

    col_state = "estado" if "estado" in df.columns else df.columns[df.columns.str.contains("estado", case=False)][0]
    df["state_code"] = df[col_state].map(TARGET_STATES)
    df = df.dropna(subset=["state_code"])

    rows = []
    for state_code, group in df.groupby("state_code"):
        count = len(group)
        risk = "CRITICO"
        for level, threshold in sorted(RISK_THRESHOLDS.items(), key=lambda x: x[1]):
            if count <= threshold:
                risk = level
                break
        rows.append({
            "date": str(ref_date),
            "state": state_code,
            "hotspot_count": count,
            "risk_level": risk,
            "source": "INPE",
        })
    return rows


@with_retry
def fetch_fire_hotspots() -> None:
    """Busca CSV diário do INPE. Tenta hoje, fallback ontem."""
    today = date.today()
    for offset in [0, 1]:
        target_date = today - timedelta(days=offset)
        filename = f"focos_diario_{target_date.strftime('%Y%m%d')}.csv"
        url = f"{BASE_URL}{filename}"

        resp = httpx.get(url, timeout=30)
        if resp.status_code == 200:
            rows = _parse_hotspots(resp.text, target_date)
            if rows:
                upsert("fire_hotspots", rows, ["date", "state"])
                logger.info("✓ INPE Queimadas: %d estados em %s", len(rows), target_date)
                return
        elif resp.status_code == 404:
            logger.info("INPE CSV %s não disponível, tentando dia anterior", filename)
            continue
        else:
            logger.warning("INPE HTTP %d para %s", resp.status_code, url)

    logger.warning("INPE: nenhum CSV disponível para %s ou %s",
                   today, today - timedelta(days=1))
