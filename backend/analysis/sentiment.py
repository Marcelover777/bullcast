# backend/analysis/sentiment.py
"""
Classifica notícias com FinBERT-PT-BR e calcula impact_score.
Modelo: 'lucas-leme/FinBERT-PT-BR' (HuggingFace)
"""
import logging

from transformers import pipeline

from ..supabase_client import get_client, upsert

logger = logging.getLogger(__name__)

# Keywords com peso no impact_score
IMPACT_KEYWORDS = {
    "china": 3, "cota": 3, "tarifa": 3, "embargo": 5,
    "aftosa": 5, "greve": 4, "férias coletivas": 4, "guerra": 4,
    "cepea": 2, "b3": 2, "bgi": 2, "arroba": 1,
    "exportação": 2, "frigorífico": 2, "abate": 1,
    "seca": 2, "pastagem": 2, "estiagem": 2,
}

_classifier = None


def get_classifier():
    global _classifier
    if _classifier is None:
        logger.info("Carregando FinBERT-PT-BR...")
        _classifier = pipeline(
            "text-classification",
            model="lucas-leme/FinBERT-PT-BR",
            device=-1,  # CPU
        )
    return _classifier


def compute_impact_score(text: str) -> int:
    """Soma pesos das keywords encontradas no texto."""
    text_lower = text.lower()
    score = sum(weight for kw, weight in IMPACT_KEYWORDS.items() if kw in text_lower)
    return min(score, 5)


def classify_news() -> None:
    """Busca notícias sem sentimento e classifica."""
    client = get_client()
    clf = get_classifier()

    # Filtra notícias não processadas: sentiment="NEU" é o valor inicial (news_fetcher).
    # Após processamento (FinBERT ou fallback), sentiment muda para POS/NEG/NEU com conf > 0.
    # Não filtrar por confidence==0.0 — o fallback escreve conf=0.5 em NEU, bloqueando reprocesso.
    resp = (client.table("news_sentiment")
            .select("id,title,summary")
            .eq("sentiment", "NEU")
            .eq("confidence", 0.0)  # 0.0 = ainda não processado (inicial); fallback usa 0.5
            .limit(20)
            .execute())

    if not resp.data:
        logger.info("Nenhuma notícia nova para classificar")
        return

    clf_instance = clf

    for news in resp.data:
        text = f"{news['title']}. {news.get('summary', '')}"[:512]
        try:
            result = clf_instance(text)[0]
            label = result["label"].upper()  # POS/NEG/NEU
            conf  = round(float(result["score"]), 3)
        except Exception as exc:
            logger.error("FinBERT falhou para news %s: %s", news["id"], exc)
            label, conf = "NEU", 0.5

        impact = compute_impact_score(text)

        client.table("news_sentiment").update({
            "sentiment": label,
            "confidence": conf,
            "impact_score": impact,
        }).eq("id", news["id"]).execute()

    logger.info("Classificadas %d notícias", len(resp.data))
