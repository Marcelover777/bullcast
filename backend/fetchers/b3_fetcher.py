# backend/fetchers/b3_fetcher.py
import logging
from datetime import date, timedelta

import agrobr
import pandas as pd

from ..supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)


@with_retry
def fetch_futures(start: date | None = None) -> None:
    """Ingere ajustes diários futuros BGI (boi gordo B3)."""
    end = date.today()
    if start is None:
        start = end - timedelta(days=7)

    logger.info("Buscando futuros B3 %s → %s", start, end)
    df = agrobr.b3.bgi_futures(start=start, end=end)

    if df is None or df.empty:
        logger.warning("Sem dados B3 futuros para o período")
        return

    rows = []
    for _, row in df.iterrows():
        rows.append({
            "date": str(row["date"].date()),
            "contract_code": str(row["contract"]),
            "maturity_date": str(row["maturity"].date()) if pd.notna(row.get("maturity")) else None,
            "settle_price": float(row["settle"]),
            "open_interest": int(row.get("open_interest", 0) or 0),
            "volume": int(row.get("volume", 0) or 0),
        })

    if rows:
        upsert("futures_prices", rows, ["date", "contract_code"])
        logger.info("Upsert %d registros futures_prices", len(rows))
