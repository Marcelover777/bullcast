# backend/analysis/sentiment.py
"""
Classifica notícias usando Claude Haiku API e calcula impact_score.
Substituiu FinBERT-PT-BR (torch ~2.5GB RAM) para rodar no Railway sem OOM.
"""
import json
import logging
import re

from supabase_client import get_client

logger = logging.getLogger(__name__)

# Keywords com peso no impact_score
IMPACT_KEYWORDS = {
    "china": 3, "cota": 3, "tarifa": 3, "embargo": 5,
    "aftosa": 5, "greve": 4, "férias coletivas": 4, "guerra": 4,
    "cepea": 2, "b3": 2, "bgi": 2, "arroba": 1,
    "exportação": 2, "frigorífico": 2, "abate": 1,
    "seca": 2, "pastagem": 2, "estiagem": 2,
}

_SENTIMENT_PROMPT = """Classifique o sentimento desta notícia para o mercado de boi gordo brasileiro.
Responda APENAS com JSON puro (sem markdown):
{{"label": "POS" ou "NEG" ou "NEU", "score": 0.0 a 1.0}}

Notícia: {text}"""


def _classify_with_claude(text: str) -> tuple[str, float]:
    """Classifica sentimento via Claude Haiku (leve, rápido, barato)."""
    from claude_integration import get_claude
    try:
        msg = get_claude().messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=50,
            messages=[{"role": "user", "content": _SENTIMENT_PROMPT.format(text=text[:500])}],
        )
        raw = msg.content[0].text
        # Extrai JSON puro (Claude pode retornar ```json ... ```)
        m = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw)
        if m:
            raw = m.group(1).strip()
        else:
            m2 = re.search(r"\{[\s\S]*\}", raw)
            if m2:
                raw = m2.group(0)
        result = json.loads(raw)
        label = result["label"].upper()
        if label not in ("POS", "NEG", "NEU"):
            label = "NEU"
        return label, round(float(result["score"]), 3)
    except Exception as exc:
        logger.error("Claude sentiment falhou: %s", exc)
        return "NEU", 0.5


def compute_impact_score(text: str) -> int:
    """Soma pesos das keywords encontradas no texto."""
    text_lower = text.lower()
    score = sum(weight for kw, weight in IMPACT_KEYWORDS.items() if kw in text_lower)
    return min(score, 5)


def classify_news() -> None:
    """Busca notícias sem sentimento e classifica via Claude Haiku."""
    client = get_client()

    resp = (client.table("news_sentiment")
            .select("id,title,summary")
            .eq("sentiment", "NEU")
            .eq("confidence", 0.0)
            .limit(20)
            .execute())

    if not resp.data:
        logger.info("Nenhuma notícia nova para classificar")
        return

    for news in resp.data:
        text = f"{news['title']}. {news.get('summary', '')}"[:512]
        label, conf = _classify_with_claude(text)
        impact = compute_impact_score(text)

        client.table("news_sentiment").update({
            "sentiment": label,
            "confidence": conf,
            "impact_score": impact,
        }).eq("id", news["id"]).execute()

    logger.info("Classificadas %d notícias via Claude Haiku", len(resp.data))
