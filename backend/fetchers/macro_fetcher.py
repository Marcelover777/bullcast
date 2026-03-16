# backend/fetchers/macro_fetcher.py
import logging
from datetime import date, timedelta

import httpx
import pandas as pd

from supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

BCB_USD_BRL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados?formato=json&dataInicial={start}&dataFinal={end}"
BCB_SELIC   = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json"


@with_retry
def fetch_macro(start: date | None = None) -> None:
    """Ingere câmbio USD/BRL e SELIC via API BCB."""
    end = date.today()
    if start is None:
        start = end - timedelta(days=7)

    fmt_start = start.strftime("%d/%m/%Y")
    fmt_end   = end.strftime("%d/%m/%Y")

    logger.info("Buscando macro BCB %s → %s", fmt_start, fmt_end)

    with httpx.Client(timeout=30) as client:
        usd_resp = client.get(BCB_USD_BRL.format(start=fmt_start, end=fmt_end))
        usd_resp.raise_for_status()
        usd_data = {d["data"]: float(d["valor"].replace(",", ".")) for d in usd_resp.json()}

        selic_resp = client.get(BCB_SELIC)
        selic_resp.raise_for_status()
        selic = float(selic_resp.json()[0]["valor"].replace(",", ".")) / 100

    rows = []
    for date_str, usd_brl in usd_data.items():
        d = pd.to_datetime(date_str, format="%d/%m/%Y").date()
        rows.append({"date": str(d), "usd_brl": usd_brl, "selic_rate": selic})

    if rows:
        upsert("macro_data", rows, ["date"])
        logger.info("Upsert %d registros macro_data", len(rows))
