# backend/fetchers/china_quota_fetcher.py
"""
Busca volume de exportação de carne bovina para China (Comex Stat / SECEX).
NCM 0201 (fresca) e 0202 (congelada).
"""
import logging
import os
from datetime import date

import httpx

from supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

COMEX_URL = "https://comexstat.mdic.gov.br/pt/geral"
DEFAULT_QUOTA_TONS = 1_106_000


def _calc_quota_usage(data: list[dict], quota_tons: float) -> dict:
    """Calcula YTD volume e % da quota."""
    monthly_tons = {}
    for row in data:
        month = row.get("CO_MES", "01")
        kg = float(row.get("KG_LIQUIDO", 0))
        tons = kg / 1000  # kg → tons
        monthly_tons[month] = monthly_tons.get(month, 0) + tons

    ytd = sum(monthly_tons.values())
    last_month = max(monthly_tons.keys()) if monthly_tons else "01"
    month_vol = monthly_tons.get(last_month, 0)

    return {
        "month_volume_tons": round(month_vol, 2),
        "ytd_volume_tons": round(ytd, 2),
        "quota_total_tons": quota_tons,
        "quota_usage_pct": round(ytd / quota_tons * 100, 2) if quota_tons > 0 else 0,
    }


@with_retry
def fetch_china_quota() -> None:
    """Busca dados de exportação para China do Comex Stat."""
    quota_tons = float(os.environ.get("CHINA_QUOTA_TONS", DEFAULT_QUOTA_TONS))
    year = date.today().year

    # Comex Stat API — filtro: NCM 0201+0202, destino China
    params = {
        "coAno": year,
        "coPaisDestino": "160",  # China
        "coNcm": "0201,0202",
    }

    resp = httpx.get(COMEX_URL, params=params, timeout=30)
    if resp.status_code != 200:
        raise RuntimeError(f"Comex Stat HTTP {resp.status_code}")

    data = resp.json()
    if not data:
        logger.warning("Comex Stat sem dados para China %d", year)
        return

    result = _calc_quota_usage(data, quota_tons)

    upsert("china_quota_tracking", [{
        "date": str(date.today()),
        **result,
        "source": "COMEXSTAT",
    }], ["date"])

    logger.info("✓ China Quota: YTD=%.0ft (%.1f%% da cota)",
                result["ytd_volume_tons"], result["quota_usage_pct"])
