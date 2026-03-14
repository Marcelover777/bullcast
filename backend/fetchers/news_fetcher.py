# backend/fetchers/news_fetcher.py
"""
RSS feeds: CNA, Agrolink, Canal Rural.
Filtra por keywords agro. Sem duplicatas (unique por URL).
"""
import hashlib
import logging
import xml.etree.ElementTree as ET
from datetime import datetime

import httpx

from ..supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

FEEDS = [
    "https://www.cnabrasil.org.br/feed",
    "https://www.agrolink.com.br/rss/noticias",
    "https://www.canalrural.com.br/rss/noticias",
]

AGRO_KEYWORDS = [
    "boi", "arroba", "gado", "pecuária", "cepea", "b3", "bgi",
    "abate", "exportação", "china", "frigorifico", "confinamento",
    "seca", "pastagem", "aftosa", "embargo", "câmbio",
]


@with_retry
def fetch_news() -> None:
    logger.info("Buscando notícias RSS (%d feeds)", len(FEEDS))
    rows = []

    with httpx.Client(timeout=30) as client:
        for url in FEEDS:
            try:
                resp = client.get(url, follow_redirects=True)
                resp.raise_for_status()
                root = ET.fromstring(resp.text)

                for item in root.findall(".//item"):
                    title = item.findtext("title", "").strip()
                    link  = item.findtext("link", "").strip()
                    pub   = item.findtext("pubDate", "")
                    desc  = item.findtext("description", "").strip()

                    # Filtro por relevância agro
                    text_lower = (title + " " + desc).lower()
                    if not any(kw in text_lower for kw in AGRO_KEYWORDS):
                        continue

                    try:
                        pub_dt = datetime.strptime(pub, "%a, %d %b %Y %H:%M:%S %z")
                    except (ValueError, TypeError):
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
