# backend/fetchers/ibge_fetcher.py
"""
Busca dados reais de abate do IBGE (SIDRA tabela 1093).
Trimestral, ~2 meses de lag.
"""
import logging
from datetime import date

import httpx

from supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

SIDRA_URL = "https://apisidra.ibge.gov.br/values/t/1093/n1/all/v/all/p/last%201/c12716/115236,115237/c18/55,56"


def _calc_female_pct(data: list[dict]) -> float | None:
    """Calcula % fêmeas a partir dos dados SIDRA."""
    total = 0
    female = 0
    for row in data:
        val = row.get("V", "0").replace(".", "").replace(",", ".")
        try:
            v = float(val)
        except (ValueError, TypeError):
            continue
        if "Total" in str(row.get("D2N", "")):
            total += v
        if "Fêmea" in str(row.get("D2N", "")) or "mea" in str(row.get("D2N", "")):
            female += v
    if total <= 0:
        return None
    return round(female / total * 100, 2)


@with_retry
def fetch_ibge_slaughter() -> None:
    """Busca último trimestre de abate do IBGE SIDRA."""
    resp = httpx.get(SIDRA_URL, timeout=30)
    if resp.status_code != 200:
        raise RuntimeError(f"IBGE SIDRA HTTP {resp.status_code}")

    data = resp.json()
    if not data:
        logger.warning("IBGE SIDRA retornou dados vazios")
        return

    female_pct = _calc_female_pct(data)
    if female_pct is None:
        logger.warning("Não foi possível calcular female_pct dos dados IBGE")
        return

    # Extrai período (ex: "202401" → Q1 2024)
    period_str = data[0].get("D1C", "")
    year = period_str[:4]
    quarter = period_str[4:]
    # Map quarter to last month of quarter
    q_map = {"01": f"{year}-03-31", "02": f"{year}-06-30",
             "03": f"{year}-09-30", "04": f"{year}-12-31"}
    period_date = q_map.get(quarter, f"{year}-12-31")

    total_head = 0
    female_head = 0
    for row in data:
        val_str = row.get("V", "0").replace(".", "").replace(",", ".")
        try:
            v = int(float(val_str))
        except (ValueError, TypeError):
            continue
        if "Total" in str(row.get("D2N", "")):
            total_head = v
        if "Fêmea" in str(row.get("D2N", "")) or "mea" in str(row.get("D2N", "")):
            female_head = v

    upsert("slaughter_data", [{
        "period": period_date,
        "total_head": total_head,
        "female_head": female_head,
        "female_percent": female_pct,
        "state": "BR",
        "source": "IBGE_SIDRA",
    }], ["period", "state"])

    logger.info("✓ IBGE Abate: female_pct=%.1f%% período=%s", female_pct, period_date)
