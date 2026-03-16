# backend/fetchers/news_fetcher.py
"""
RSS feeds: Canal Rural, Agrolink, Notícias Agrícolas.
Filtra por keywords agro. Sem duplicatas (unique por URL).
"""
import hashlib
import logging
import xml.etree.ElementTree as ET
from datetime import datetime

import httpx

from supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

FEEDS = [
    "https://www.canalrural.com.br/feed/",
    "https://www.agrolink.com.br/rss/noticias.xml",
    "https://feeds.feedburner.com/NoticiasAgricolas",
]

AGRO_KEYWORDS = [
    "boi", "arroba", "gado", "pecuária", "pecuaria", "cepea", "b3", "bgi",
    "abate", "exportação", "exportacao", "china", "frigorifico", "frigorífico",
    "confinamento", "seca", "pastagem", "aftosa", "embargo", "câmbio", "cambio",
    "nelore", "angus", "rebanho", "bezerro", "novilho", "vaca",
]


@with_retry
def fetch_news() -> None:
    logger.info("Buscando notícias RSS (%d feeds)", len(FEEDS))
    rows = []

    headers = {
        "User-Agent": "BullCast/1.0 (news aggregator; +https://bullcast.app)",
    }

    with httpx.Client(timeout=30, headers=headers, follow_redirects=True) as client:
        for url in FEEDS:
            try:
                resp = client.get(url)
                resp.raise_for_status()
                root = ET.fromstring(resp.text)

                # Suporta RSS 2.0 (<item>) e Atom (<entry>)
                items = root.findall(".//item")
                if not items:
                    ns = {"atom": "http://www.w3.org/2005/Atom"}
                    items = root.findall(".//atom:entry", ns)

                for item in items:
                    title = (item.findtext("title") or "").strip()
                    link = (item.findtext("link") or "").strip()
                    pub = item.findtext("pubDate") or item.findtext("published") or ""
                    desc = (item.findtext("description") or item.findtext("summary") or "").strip()

                    if not title or not link:
                        continue

                    # Filtro por relevância agro
                    text_lower = (title + " " + desc).lower()
                    if not any(kw in text_lower for kw in AGRO_KEYWORDS):
                        continue

                    # Parse date
                    pub_dt = None
                    for fmt in [
                        "%a, %d %b %Y %H:%M:%S %z",
                        "%a, %d %b %Y %H:%M:%S %Z",
                        "%Y-%m-%dT%H:%M:%S%z",
                        "%Y-%m-%dT%H:%M:%SZ",
                    ]:
                        try:
                            pub_dt = datetime.strptime(pub.strip(), fmt)
                            break
                        except (ValueError, TypeError):
                            continue
                    if pub_dt is None:
                        pub_dt = datetime.utcnow()

                    rows.append({
                        "published_at": pub_dt.isoformat(),
                        "title": title[:500],
                        "url": link[:1000],
                        "source": url.split("/")[2],
                        "summary": desc[:1000],
                        "sentiment": "NEU",
                        "confidence": 0.0,
                        "impact_score": 0,
                    })
            except Exception as exc:
                logger.error("Erro feed %s: %s", url, exc)

    if rows:
        upsert("news_sentiment", rows, ["url"])
        logger.info("Upsert %d notícias", len(rows))
    else:
        logger.warning("Nenhuma notícia RSS coletada")
