# backend/fetchers/cepea_fetcher.py
"""
Busca preços CEPEA — estratégia multi-fonte:
  1. Notícias Agrícolas (via Firecrawl) — fonte primária (contorna Cloudflare)
  2. agrobr async API — fallback se Firecrawl indisponível
  3. B3 settle price — último fallback

Categorias: bezerro, vaca gorda (quando disponível no NA)
"""
import asyncio
import logging
from datetime import date, timedelta

import pandas as pd

from supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

# agrobr v1.0 usa nomes de produto, não estado.
PRODUCTS_BY_STATE = {
    "SP": "boi_gordo",
}

CATEGORIES = [
    ("boi_gordo",   "Boi Gordo",   450, 540),
    ("vaca",        "Vaca Gorda",  380, 450),
    ("bezerro",     "Bezerro",     180, 240),
]


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
def fetch_spot_prices(start: date | None = None) -> None:
    """Ingere preços spot — tenta Notícias Agrícolas primeiro, agrobr depois, B3 por último."""
    end = date.today()
    if start is None:
        start = end - timedelta(days=7)

    # ── Fonte 1: Notícias Agrícolas via Firecrawl ──
    try:
        from fetchers.noticias_agricolas_scraper import scrape_prices
        result = scrape_prices()
        rows = result.get("spot_prices", [])
        if rows:
            upsert("spot_prices", rows, ["date", "state"])
            logger.info("✓ Notícias Agrícolas: upsert %d registros spot_prices", len(rows))
            return
        logger.warning("Notícias Agrícolas retornou 0 preços — tentando agrobr")
    except Exception as exc:
        logger.warning("Notícias Agrícolas falhou: %s — tentando agrobr", exc)

    # ── Fonte 2: agrobr (CEPEA direto) ──
    try:
        _fetch_via_agrobr(start, end)
        return
    except Exception as exc:
        logger.warning("agrobr CEPEA falhou: %s — tentando fallback B3", exc)

    # ── Fonte 3: B3 settle → spot fallback ──
    _fallback_b3_to_spot(end)


def _fetch_via_agrobr(start: date, end: date) -> None:
    """Busca via agrobr (CEPEA API) — pode dar 403 se Cloudflare bloquear."""
    logger.info("Buscando spot CEPEA via agrobr %s → %s", start, end)

    async def _fetch():
        from agrobr.cepea import indicador
        return await indicador("boi_gordo", inicio=start, fim=end)

    df = _run_async(_fetch())

    if df is None or df.empty:
        raise RuntimeError("Sem dados CEPEA boi_gordo para o período")

    rows = []
    for _, row in df.iterrows():
        row_date = row.get("data") or row.get("date")
        if row_date is None:
            continue
        price = float(row.get("valor") or row.get("price") or row.get("ajuste_atual") or 0)
        if price <= 0:
            continue

        date_str = str(row_date.date()) if hasattr(row_date, "date") else str(row_date)
        rows.append({
            "date": date_str,
            "state": "SP",
            "price_per_arroba": price,
            "price_per_kg": round(price / 15 * 0.54, 2),
            "variation_day": float(row.get("variacao_dia") or row.get("variation_day") or 0),
            "variation_week": float(row.get("variacao_semana") or row.get("variation_week") or 0),
            "source": "CEPEA",
        })

    if rows:
        upsert("spot_prices", rows, ["date", "state"])
        logger.info("✓ agrobr CEPEA: upsert %d registros spot_prices", len(rows))
    else:
        raise RuntimeError("agrobr retornou dados mas nenhum row válido")


@with_retry
def fetch_category_prices(start: date | None = None) -> None:
    """Ingere preços por categoria de animal."""
    end = date.today()
    if start is None:
        start = end - timedelta(days=7)

    logger.info("Buscando categorias CEPEA %s → %s", start, end)
    rows = []

    for slug, label, w_min, w_max in CATEGORIES:
        async def _fetch(s=slug):
            from agrobr.cepea import indicador
            return await indicador(s, inicio=start, fim=end)

        try:
            df = _run_async(_fetch())
        except Exception as exc:
            logger.error("Erro CEPEA categoria %s: %s", label, exc)
            continue

        if df is None or df.empty:
            continue

        for _, row in df.iterrows():
            row_date = row.get("data") or row.get("date")
            if row_date is None:
                continue
            price = float(row.get("valor") or row.get("price") or 0)
            if price <= 0:
                continue

            date_str = str(row_date.date()) if hasattr(row_date, "date") else str(row_date)
            weight_mid = (w_min + w_max) / 2
            price_kg = price / 15  # arroba → kg (aprox)
            rows.append({
                "date": date_str,
                "category": label,
                "weight_min": w_min,
                "weight_max": w_max,
                "price_per_kg": round(price_kg, 2),
                "price_per_head": round(price_kg * weight_mid, 2),
                "variation_day": float(row.get("variacao_dia") or row.get("variation_day") or 0),
                "variation_week": float(row.get("variacao_semana") or row.get("variation_week") or 0),
                "state": "SP",
                "source": "CEPEA",
            })

    if rows:
        upsert("cattle_categories", rows, ["date", "category", "state"])
        logger.info("Upsert %d registros cattle_categories", len(rows))


def _fallback_b3_to_spot(ref_date: date) -> None:
    """Fallback: usa preço B3 do contrato mais próximo como proxy do spot.
    O ajuste diário BGI 1º vencimento é ~99% correlacionado ao CEPEA spot."""
    from supabase_client import get_client, upsert as _upsert
    try:
        client = get_client()
        resp = (client.table("futures_prices")
                .select("date,settle_price")
                .order("date", desc=True)
                .order("maturity_date", desc=False)  # contrato mais próximo
                .limit(1)
                .execute())

        if not resp.data:
            logger.warning("Fallback B3: sem dados em futures_prices")
            return

        row = resp.data[0]
        price = float(row["settle_price"])
        _upsert("spot_prices", [{
            "date": row["date"],
            "state": "SP",
            "price_per_arroba": price,
            "price_per_kg": round(price / 15 * 0.54, 2),
            "variation_day": 0,
            "variation_week": 0,
            "source": "B3_FALLBACK",
        }], ["date", "state"])
        logger.info("Fallback B3→spot: R$ %.2f/@ em %s", price, row["date"])
    except Exception as exc:
        logger.error("Fallback B3 falhou: %s", exc)
