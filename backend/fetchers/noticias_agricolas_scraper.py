# backend/fetchers/noticias_agricolas_scraper.py
"""
Scraper de preços de boi gordo via Notícias Agrícolas usando Firecrawl API.
Fonte alternativa ao CEPEA direto (Cloudflare-blocked).

Extrai:
  - Indicador CEPEA Esalq/B3 (preço referência SP)
  - Mercado físico por praça/estado (Scot Consultoria)
  - Indicadores Datagro por estado
"""
import json
import logging
import os
import re
from datetime import date, datetime

import httpx

logger = logging.getLogger(__name__)

FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/scrape"
NA_BOI_URL = "https://www.noticiasagricolas.com.br/cotacoes/boi-gordo"

# Mapeamento praça → estado
PRACA_TO_STATE = {
    "barretos": "SP", "araçatuba": "SP", "araçatuba": "SP", "presidente prudente": "SP",
    "são josé do rio preto": "SP", "sp": "SP", "são paulo": "SP",
    "triângulo": "MG", "triangulo": "MG", "mg": "MG", "minas gerais": "MG",
    "goiânia": "GO", "goiania": "GO", "go": "GO", "goiás": "GO",
    "dourados": "MS", "campo grande": "MS", "ms": "MS", "mato grosso do sul": "MS",
    "cuiabá": "MT", "cuiaba": "MT", "rondonópolis": "MT", "mt": "MT", "mato grosso": "MT",
    "noroeste": "PR", "pr": "PR", "paraná": "PR", "parana": "PR",
    "tocantins": "TO", "to": "TO",
    "rondônia": "RO", "ro": "RO",
    "pará": "PA", "pa": "PA",
    "bahia": "BA", "ba": "BA",
}


def _get_firecrawl_key() -> str:
    key = os.environ.get("FIRECRAWL_API_KEY", "")
    if not key:
        raise RuntimeError("FIRECRAWL_API_KEY não configurada")
    return key


def _parse_price(text: str) -> float | None:
    """Extrai valor numérico de string tipo '346,45' ou '346.45'."""
    if not text:
        return None
    cleaned = text.strip().replace("R$", "").replace(" ", "")
    # Formato BR: 1.234,56 → 1234.56
    if "," in cleaned:
        cleaned = cleaned.replace(".", "").replace(",", ".")
    try:
        val = float(cleaned)
        # Sanity check: preço de boi gordo fica entre 100 e 900 R$/@
        return val if 50 < val < 1000 else None
    except (ValueError, TypeError):
        return None


def _parse_variation(text: str) -> float:
    """Extrai variação percentual de string tipo '-0,04%' ou '+1.5'."""
    if not text:
        return 0.0
    cleaned = text.strip().replace("%", "").replace(",", ".").replace("+", "")
    try:
        return round(float(cleaned), 4)
    except (ValueError, TypeError):
        return 0.0


def _detect_state(praca: str) -> str:
    """Detecta o estado a partir do nome da praça."""
    praca_lower = praca.lower().strip()
    # Tenta match direto por prefixo de estado (ex: "SP Barretos")
    for prefix in ("sp", "mg", "go", "ms", "mt", "pr", "to", "ro", "pa", "ba"):
        if praca_lower.startswith(prefix + " ") or praca_lower == prefix:
            return prefix.upper()
    # Tenta match por nome de cidade/região
    for key, state in PRACA_TO_STATE.items():
        if key in praca_lower:
            return state
    return "SP"  # default


def scrape_prices() -> dict:
    """
    Scrapa preços de boi gordo do Notícias Agrícolas via Firecrawl.

    Returns:
        dict com chaves:
          - spot_prices: list[dict] para upsert em spot_prices
          - category_prices: list[dict] para upsert em cattle_categories (se disponível)
          - raw_markdown: str com o markdown extraído (para debug)
    """
    api_key = _get_firecrawl_key()
    today = date.today()

    logger.info("Scraping Notícias Agrícolas via Firecrawl: %s", NA_BOI_URL)

    with httpx.Client(timeout=60) as client:
        resp = client.post(
            FIRECRAWL_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "url": NA_BOI_URL,
                "formats": ["markdown"],
                "onlyMainContent": True,
                "waitFor": 3000,  # espera JS carregar tabelas
            },
        )
        resp.raise_for_status()
        result = resp.json()

    if not result.get("success"):
        raise RuntimeError(f"Firecrawl falhou: {result.get('error', 'unknown')}")

    markdown = result.get("data", {}).get("markdown", "")
    if not markdown:
        raise RuntimeError("Firecrawl retornou markdown vazio")

    logger.info("Firecrawl OK — %d chars de markdown", len(markdown))

    # Parse o markdown para extrair preços
    spot_rows = _parse_spot_prices(markdown, today)

    return {
        "spot_prices": spot_rows,
        "raw_markdown": markdown,
    }


def _parse_spot_prices(markdown: str, ref_date: date) -> list[dict]:
    """
    Extrai preços spot do markdown do Notícias Agrícolas.
    Usa Claude Haiku para parsing robusto quando regex falha.
    """
    rows = []
    seen_states = set()

    # ── Regex: tabelas markdown com preços ──
    # Padrão: | Praça | Valor | Variação | ...
    table_lines = [l.strip() for l in markdown.split("\n") if "|" in l and "---" not in l]

    for line in table_lines:
        cells = [c.strip() for c in line.split("|") if c.strip()]
        if len(cells) < 2:
            continue

        # Tenta encontrar preço em qualquer célula
        praca = cells[0]
        price = None
        variation = 0.0

        for i, cell in enumerate(cells[1:], 1):
            p = _parse_price(cell)
            if p is not None:
                price = p
                # Próxima célula pode ser variação
                if i + 1 < len(cells):
                    variation = _parse_variation(cells[i + 1])
                break

        if price is None:
            continue

        state = _detect_state(praca)

        # Se já temos esse estado e é o mesmo dia, pega o de maior confiança (CEPEA > Scot > Datagro)
        state_key = f"{ref_date}_{state}"
        if state_key in seen_states:
            # Atualiza apenas se é Esalq/CEPEA (mais confiável)
            if "esalq" not in praca.lower() and "cepea" not in praca.lower() and "indicador" not in praca.lower():
                continue

        seen_states.add(state_key)
        rows.append({
            "date": str(ref_date),
            "state": state,
            "price_per_arroba": price,
            "price_per_kg": round(price / 15 * 0.54, 2),
            "variation_day": variation,
            "variation_week": 0.0,  # não disponível nesta fonte
            "source": "NOTICIAS_AGRICOLAS",
        })

    # Se regex falhou, tenta fallback com Claude
    if not rows:
        rows = _parse_with_claude(markdown, ref_date)

    return rows


def _parse_with_claude(markdown: str, ref_date: date) -> list[dict]:
    """Fallback: usa Claude Haiku para extrair preços do markdown."""
    try:
        from claude_integration import get_claude
    except ImportError:
        logger.warning("Claude integration não disponível para fallback de parsing")
        return []

    prompt = f"""Extraia os preços de boi gordo deste texto. Para cada preço, retorne:
- state: sigla do estado (SP, MG, GO, MS, MT, PR, etc)
- price: valor em R$/arroba (número decimal)
- variation: variação percentual do dia (número decimal, pode ser negativo)

Retorne APENAS JSON puro (sem markdown):
[{{"state": "SP", "price": 346.45, "variation": -0.04}}, ...]

Texto:
{markdown[:3000]}"""

    try:
        msg = get_claude().messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text

        # Remove markdown fences
        m = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw)
        if m:
            raw = m.group(1).strip()
        else:
            m2 = re.search(r"\[[\s\S]*\]", raw)
            if m2:
                raw = m2.group(0)

        items = json.loads(raw)
        rows = []
        for item in items:
            price = float(item.get("price", 0))
            if price <= 0:
                continue
            state = str(item.get("state", "SP")).upper()
            rows.append({
                "date": str(ref_date),
                "state": state,
                "price_per_arroba": price,
                "price_per_kg": round(price / 15 * 0.54, 2),
                "variation_day": float(item.get("variation", 0)),
                "variation_week": 0.0,
                "source": "NOTICIAS_AGRICOLAS",
            })
        logger.info("Claude parsing extraiu %d preços do markdown", len(rows))
        return rows
    except Exception as exc:
        logger.error("Claude parsing falhou: %s", exc)
        return []
