# backend/fetchers/noticias_agricolas_scraper.py
"""
Scraper de preços de boi gordo via Notícias Agrícolas usando Firecrawl API.
Fonte primária — contorna Cloudflare do CEPEA direto.

Extrai:
  - Indicador CEPEA Esalq/B3 (preço referência SP, à vista)
  - Mercado físico por praça/estado (Scot Consultoria) — boi gordo + vaca gorda
"""
import logging
import os
import re
from datetime import date, datetime

import httpx

logger = logging.getLogger(__name__)

FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/scrape"
NA_BOI_URL = "https://www.noticiasagricolas.com.br/cotacoes/boi-gordo"

# Mapeamento prefixo praça → UF (Scot usa "SP Barretos", "MG Triângulo" etc.)
_PREFIX_TO_UF = {
    "sp": "SP", "mg": "MG", "go": "GO", "ms": "MS", "mt": "MT",
    "pr": "PR", "sc": "SC", "rs": "RS", "to": "TO", "ro": "RO",
    "pa": "PA", "ba": "BA", "ma": "MA", "es": "ES", "rj": "RJ",
    "al": "AL", "ac": "AC", "rr": "RR",
}
_CITY_TO_UF = {
    "barretos": "SP", "araçatuba": "SP", "presidente prudente": "SP",
    "triângulo": "MG", "triangulo": "MG", "b.horizonte": "MG",
    "goiânia": "GO", "goiania": "GO",
    "dourados": "MS", "c. grande": "MS", "três lagoas": "MS",
    "cuiabá": "MT", "cuiaba": "MT", "rondonópolis": "MT",
    "noroeste": "PR", "marabá": "PA", "redenção": "PA", "paragominas": "PA",
    "alagoas": "AL", "acre": "AC", "roraima": "RR",
}


def _get_firecrawl_key() -> str:
    key = os.environ.get("FIRECRAWL_API_KEY", "")
    if not key:
        raise RuntimeError("FIRECRAWL_API_KEY não configurada")
    return key


def _parse_price_br(text: str) -> float | None:
    """Converte '346,45' ou '1.234,56' → float. Retorna None se inválido."""
    if not text:
        return None
    cleaned = text.strip().replace("R$", "").replace(" ", "").replace("*", "")
    if "," in cleaned:
        cleaned = cleaned.replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return None


def _parse_variation(text: str) -> float:
    """'-0,04' ou '+1.5%' → float."""
    if not text:
        return 0.0
    cleaned = text.strip().replace("%", "").replace(",", ".").replace("+", "")
    try:
        return round(float(cleaned), 4)
    except (ValueError, TypeError):
        return 0.0


def _detect_uf(praca: str) -> str | None:
    """Detecta UF a partir do nome da praça. Retorna None se não identificar."""
    p = praca.lower().strip().replace("*", "")
    # Match direto por prefixo "SP Barretos" → SP
    for prefix, uf in _PREFIX_TO_UF.items():
        if p.startswith(prefix + " ") or p == prefix:
            return uf
    # Match por nome de cidade/região
    for city, uf in _CITY_TO_UF.items():
        if city in p:
            return uf
    return None


def _parse_date_br(text: str) -> date | None:
    """Converte '16/03/2026' → date."""
    m = re.search(r"(\d{2})/(\d{2})/(\d{4})", text)
    if m:
        return date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
    return None


def scrape_prices() -> dict:
    """
    Scrapa preços de boi gordo do Notícias Agrícolas via Firecrawl.

    Returns:
        dict com chaves:
          - spot_prices: list[dict] para upsert em spot_prices
          - raw_markdown: str com o markdown extraído (para debug)
    """
    api_key = _get_firecrawl_key()

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
                "waitFor": 3000,
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

    spot_rows = _parse_all_prices(markdown)

    return {
        "spot_prices": spot_rows,
        "raw_markdown": markdown,
    }


def _parse_all_prices(markdown: str) -> list[dict]:
    """
    Extrai preços do markdown estruturado do Notícias Agrícolas.

    Estratégia:
      1. Divide por seções (##)
      2. Para cada seção, identifica o tipo (Indicador CEPEA, Scot, etc.)
      3. Parseia a tabela correspondente
    """
    rows = []
    best_by_state: dict[str, dict] = {}  # UF → melhor row (prioridade: CEPEA > Scot)

    sections = re.split(r"\n## ", markdown)

    for section in sections:
        section_lower = section.lower()

        # ── Indicador CEPEA Esalq/B3 (preço referência SP) ──
        if "indicador" in section_lower and ("esalq" in section_lower or "cepea" in section_lower) and "bezerro" not in section_lower:
            row = _parse_indicador_cepea(section)
            if row:
                best_by_state["SP"] = row  # CEPEA sempre tem prioridade

        # ── Mercado Físico - Scot Consultoria ──
        elif "scot" in section_lower and "mercado" in section_lower:
            scot_rows = _parse_scot_table(section)
            for r in scot_rows:
                uf = r["state"]
                if uf not in best_by_state:  # não sobrescreve CEPEA
                    best_by_state[uf] = r

    rows = list(best_by_state.values())

    if not rows:
        logger.warning("Parser regex não encontrou preços — markdown pode ter mudado de formato")

    return rows


def _parse_indicador_cepea(section: str) -> dict | None:
    """Parseia seção do Indicador CEPEA Esalq/B3."""
    # Procura data na tabela
    ref_date = None
    price = None
    variation = 0.0

    for line in section.split("\n"):
        if "|" not in line or "---" in line:
            continue
        cells = [c.strip() for c in line.split("|") if c.strip()]
        if len(cells) < 2:
            continue

        # Header line (Data | à vista R$ | Variação)
        if any(h in cells[0].lower() for h in ("data", "contrato")):
            continue
        # "Ver histórico" line
        if "ver hist" in cells[0].lower() or "atualizado" in cells[0].lower():
            # Tenta extrair data do "Atualizado em: DD/MM/YYYY"
            d = _parse_date_br(line)
            if d and ref_date is None:
                ref_date = d
            continue

        # Data line: DD/MM/YYYY | preço | variação
        d = _parse_date_br(cells[0])
        if d:
            ref_date = d
            if len(cells) >= 2:
                p = _parse_price_br(cells[1])
                if p and 100 < p < 900:  # sanity: preço por arroba
                    price = p
            if len(cells) >= 3:
                variation = _parse_variation(cells[2])

    if price is None or ref_date is None:
        return None

    return {
        "date": str(ref_date),
        "state": "SP",
        "price_per_arroba": price,
        "price_per_kg": round(price / 15 * 0.54, 2),
        "variation_day": variation,
        "variation_week": 0.0,
        "source": "CEPEA_NA",
    }


def _parse_scot_table(section: str) -> list[dict]:
    """Parseia tabela Scot Consultoria: Município | Boi Gordo à vista | ... | Vaca Gorda."""
    rows = []
    ref_date = None

    # Tenta achar data de atualização
    d = _parse_date_br(section)
    if d:
        ref_date = d
    else:
        ref_date = date.today()

    # Identifica colunas pelo header
    boi_col = None
    vaca_col = None
    lines = section.split("\n")

    for line in lines:
        if "|" not in line or "---" in line:
            continue
        cells = [c.strip() for c in line.split("|") if c.strip()]
        if len(cells) < 2:
            continue

        # Header detection
        header_line = " ".join(c.lower() for c in cells)
        if "munic" in header_line or ("boi gordo" in header_line and "vista" in header_line):
            # Map column indices
            for i, cell in enumerate(cells):
                cl = cell.lower()
                if "boi gordo" in cl and "vista" in cl:
                    boi_col = i
                elif "vaca" in cl and "vista" in cl:
                    vaca_col = i
            continue

        # Skip metadata lines
        if "ver hist" in cells[0].lower() or "atualizado" in cells[0].lower() or "preços brutos" in cells[0].lower():
            continue

        praca = cells[0]
        uf = _detect_uf(praca)
        if uf is None:
            continue

        # Boi Gordo à vista
        col_idx = boi_col if boi_col is not None else 1
        if col_idx < len(cells):
            price = _parse_price_br(cells[col_idx])
            # RS é em kg, não arroba — converte (1@ ≈ 15kg)
            if price is not None:
                if uf == "RS" and price < 50:
                    price = round(price * 15, 2)  # kg → arroba

                if 100 < price < 900:
                    rows.append({
                        "date": str(ref_date),
                        "state": uf,
                        "price_per_arroba": price,
                        "price_per_kg": round(price / 15 * 0.54, 2),
                        "variation_day": 0.0,
                        "variation_week": 0.0,
                        "source": "SCOT_NA",
                    })

    # Deduplica por estado — pega primeiro (geralmente capital / praça principal)
    seen = set()
    unique = []
    for r in rows:
        if r["state"] not in seen:
            seen.add(r["state"])
            unique.append(r)

    return unique
