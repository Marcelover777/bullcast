# backend/fetchers/b3_fetcher.py
"""
Busca ajustes diários futuros BGI (boi gordo B3) via agrobr v1.x (async API).
Usa b3.historico(contrato='boi', inicio, fim) que retorna:
  data, ticker, descricao, vencimento_codigo, vencimento_mes, vencimento_ano,
  ajuste_anterior, ajuste_atual, variacao, ajuste_por_contrato, unidade
"""
import asyncio
import logging
from datetime import date, timedelta

import pandas as pd

from supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)


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
def fetch_futures(start: date | None = None) -> None:
    """Ingere ajustes diários futuros BGI (boi gordo B3)."""
    end = date.today()
    if start is None:
        start = end - timedelta(days=7)

    logger.info("Buscando futuros B3 %s → %s", start, end)

    async def _fetch():
        from agrobr.b3 import historico
        return await historico(contrato="boi", inicio=start, fim=end)

    try:
        df = _run_async(_fetch())
    except Exception as exc:
        logger.error("Erro B3 futuros: %s", exc)
        return

    if df is None or df.empty:
        logger.warning("Sem dados B3 futuros para o período")
        return

    rows = []
    for _, row in df.iterrows():
        row_date = row.get("data") or row.get("date")
        if row_date is None:
            continue
        date_str = str(row_date.date()) if hasattr(row_date, "date") else str(row_date)

        # Código do contrato = vencimento_codigo (ex: "BGIK25")
        contract_code = str(row.get("vencimento_codigo") or row.get("ticker") or "")
        settle = float(row.get("ajuste_atual") or row.get("settle") or 0)
        if settle <= 0:
            continue

        # Montar data de vencimento a partir de mes/ano
        venc_mes = int(row.get("vencimento_mes") or 0)
        venc_ano = int(row.get("vencimento_ano") or 0)
        maturity_str = None
        if venc_mes and venc_ano:
            try:
                # Último dia útil do mês de vencimento (aprox)
                maturity_str = f"{venc_ano}-{venc_mes:02d}-01"
            except Exception:
                pass

        rows.append({
            "date": date_str,
            "contract_code": contract_code,
            "maturity_date": maturity_str,
            "settle_price": settle,
            "open_interest": 0,
            "volume": int(row.get("ajuste_por_contrato") or row.get("volume") or 0),
        })

    if rows:
        # Dedup: agrobr pode retornar linhas duplicadas por (date, contract_code)
        # Postgres rejeita ON CONFLICT UPDATE com duplicatas no mesmo batch
        seen: dict[tuple[str, str], int] = {}
        for idx, r in enumerate(rows):
            key = (r["date"], r["contract_code"])
            seen[key] = idx  # último valor ganha
        rows = [rows[i] for i in sorted(seen.values())]

        upsert("futures_prices", rows, ["date", "contract_code"])
        logger.info("Upsert %d registros futures_prices", len(rows))
