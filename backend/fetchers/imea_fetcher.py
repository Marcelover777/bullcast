# backend/fetchers/imea_fetcher.py
"""
Busca preços IMEA (Instituto Mato-Grossense de Economia Agropecuária)
via agrobr v1.x para praças de MT — mais relevante que CEPEA para Nova Ubiratã.
Também calcula estimativa de preço para Nova Ubiratã com deságio regional.
"""
import asyncio
import logging
from datetime import date, timedelta

from supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

# Deságio médio Nova Ubiratã vs referência MT (R$/arroba)
# Baseado em histórico de praças da região médio-norte MT
DESAGIO_NOVA_UBIRATA = -8.50  # R$/@ abaixo da média MT


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
def fetch_imea_prices(start: date | None = None) -> None:
    """Busca preços IMEA MT e calcula estimativa Nova Ubiratã."""
    end = date.today()
    if start is None:
        start = end - timedelta(days=14)

    logger.info("Buscando IMEA MT %s → %s", start, end)

    # Tenta buscar boi gordo MT via agrobr.imea
    async def _fetch_imea():
        try:
            from agrobr.imea import indicador
            return await indicador("boi_gordo", inicio=start, fim=end)
        except Exception:
            # Fallback: tenta via noticias_agricolas
            from agrobr.noticias_agricolas import fetch_indicador_page
            return await fetch_indicador_page("boi-gordo")

    try:
        df = _run_async(_fetch_imea())
    except Exception as exc:
        logger.warning("IMEA indisponível, tentando CEPEA SP com deságio MT: %s", exc)
        # Fallback: usa CEPEA SP e aplica deságio para MT
        _fallback_from_cepea_sp(start, end)
        return

    if df is None or df.empty:
        logger.warning("Sem dados IMEA — usando fallback CEPEA SP")
        _fallback_from_cepea_sp(start, end)
        return

    rows = []
    for _, row in df.iterrows():
        row_date = row.get("data") or row.get("date")
        if row_date is None:
            continue
        price = float(row.get("valor") or row.get("price") or 0)
        if price <= 0:
            continue

        date_str = str(row_date.date()) if hasattr(row_date, "date") else str(row_date)

        # Preço referência MT
        rows.append({
            "date": date_str,
            "state": "MT",
            "price_per_arroba": round(price, 2),
            "price_per_kg": round(price / 15 * 0.54, 2),
            "variation_day": float(row.get("variacao_dia") or 0),
            "variation_week": float(row.get("variacao_semana") or 0),
            "source": "IMEA",
        })

        # Estimativa Nova Ubiratã
        nu_price = price + DESAGIO_NOVA_UBIRATA
        rows.append({
            "date": date_str,
            "state": "MT-NUB",  # Nova Ubiratã
            "price_per_arroba": round(nu_price, 2),
            "price_per_kg": round(nu_price / 15 * 0.54, 2),
            "variation_day": float(row.get("variacao_dia") or 0),
            "variation_week": float(row.get("variacao_semana") or 0),
            "source": "IMEA+DESAGIO",
        })

    if rows:
        upsert("spot_prices", rows, ["date", "state"])
        logger.info("Upsert %d registros spot_prices (MT + Nova Ubiratã)", len(rows))


def _fallback_from_cepea_sp(start: date, end: date) -> None:
    """Usa dados SP existentes no Supabase e aplica deságio para MT."""
    from supabase_client import get_client

    client = get_client()
    resp = (client.table("spot_prices")
            .select("date,price_per_arroba,variation_day,variation_week")
            .eq("state", "SP")
            .gte("date", str(start))
            .lte("date", str(end))
            .order("date", desc=False)
            .execute())

    if not resp.data:
        logger.warning("Sem dados SP para calcular fallback MT")
        return

    # Diferencial médio MT vs SP: ~ -R$15/@ (praças do interior)
    DESAGIO_MT_VS_SP = -15.00
    rows = []
    for r in resp.data:
        price_sp = float(r["price_per_arroba"])
        price_mt = price_sp + DESAGIO_MT_VS_SP
        price_nu = price_sp + DESAGIO_MT_VS_SP + DESAGIO_NOVA_UBIRATA

        rows.append({
            "date": r["date"],
            "state": "MT",
            "price_per_arroba": round(price_mt, 2),
            "price_per_kg": round(price_mt / 15 * 0.54, 2),
            "variation_day": float(r.get("variation_day") or 0),
            "variation_week": float(r.get("variation_week") or 0),
            "source": "CEPEA_SP+DESAGIO",
        })
        rows.append({
            "date": r["date"],
            "state": "MT-NUB",
            "price_per_arroba": round(price_nu, 2),
            "price_per_kg": round(price_nu / 15 * 0.54, 2),
            "variation_day": float(r.get("variation_day") or 0),
            "variation_week": float(r.get("variation_week") or 0),
            "source": "CEPEA_SP+DESAGIO",
        })

    if rows:
        upsert("spot_prices", rows, ["date", "state"])
        logger.info("Fallback: upsert %d registros MT + NUB via CEPEA SP", len(rows))
