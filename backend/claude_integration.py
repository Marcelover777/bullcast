# backend/claude_integration.py
"""
Usa Claude API para gerar textos em PT-BR para o pecuarista.
"""
import logging
import os

import re

import anthropic

logger = logging.getLogger(__name__)


def _extract_json(text: str) -> str:
    """Extrai JSON puro da resposta Claude, removendo markdown fences."""
    # Remove ```json ... ``` ou ``` ... ```
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if m:
        return m.group(1).strip()
    # Tenta encontrar { ... } direto
    m = re.search(r"\{[\s\S]*\}", text)
    if m:
        return m.group(0)
    return text.strip()

_client = None


def get_claude():
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _client


PROMPT_SINAL = """
Você é um consultor pecuário que fala com fazendeiros brasileiros.
Dado o sinal de mercado abaixo, gere 4 textos CURTOS em PT-BR simples:

Sinal: {signal}
Confiança: {confidence_pct}%
Preço hoje (CEPEA SP): R$ {price}/arroba
Previsão 15 dias: R$ {pred_15d}/arroba
Ciclo pecuário: {cycle_phase}
Sazonalidade mês atual: {seasonal}
Volatilidade: {volatility}

Gere um JSON com esses campos (sem markdown, só JSON puro):
{{
  "recommendation_text": "frase direta: MOMENTO BOM PRA VENDER / COMPRAR / ESPERAR (max 80 chars)",
  "explanation_text": "2-3 frases explicando POR QUE, mencionando 1-2 fatores concretos (max 200 chars)",
  "trend_text": "O preço deve... (max 80 chars)",
  "duration_text": "Esse movimento deve durar... (max 60 chars)"
}}
"""

PROMPT_IMPACTO = """
Você é um consultor pecuário.
Explique em 1 frase simples (max 100 chars) o impacto dessa notícia no preço do boi gordo:
Título: {title}
Sentimento: {sentiment}

Responda só a frase, sem markdown.
"""


def generate_signal_texts(signal: str, confidence: float, price: float,
                          pred_15d: float, cycle_phase: str,
                          seasonal_pct: float, volatility: str) -> dict:
    import json
    prompt = PROMPT_SINAL.format(
        signal=signal,
        confidence_pct=round(confidence * 100),
        price=price,
        pred_15d=pred_15d,
        cycle_phase=cycle_phase,
        seasonal=f"{seasonal_pct:+.1f}%",
        volatility=volatility,
    )

    try:
        msg = get_claude().messages.create(
            model="claude-opus-4-6",
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}],
        )
        return json.loads(_extract_json(msg.content[0].text))
    except Exception as exc:
        logger.error("Claude API falhou para sinal: %s", exc)
        return {
            "recommendation_text": f"{'MOMENTO BOM PRA VENDER' if signal=='SELL' else 'MOMENTO BOM PRA COMPRAR' if signal=='BUY' else 'MELHOR ESPERAR'}",
            "explanation_text": "Análise temporariamente indisponível.",
            "trend_text": "Tendência em análise.",
            "duration_text": "Prazo em análise.",
        }


PROMPT_ANALYST_V2 = """
Você é o analista-chefe do BullCast, sistema de inteligência pecuária.
Seu público é o Seu Antônio, pecuarista de 50+ anos que quer respostas diretas.

Analise TODOS os dados abaixo e gere uma análise completa em PT-BR simples.
NÃO use jargão financeiro. Fale como se estivesse na porteira da fazenda.

{context_json}

Gere JSON com:
{{
  "recommendation_text": "frase direta do que fazer (max 80 chars)",
  "explanation_text": "2-3 frases explicando POR QUÊ, citando fatores concretos (max 300 chars)",
  "trend_text": "o que esperar nas próximas semanas (max 100 chars)",
  "duration_text": "quanto tempo esse cenário deve durar (max 80 chars)",
  "risk_alert": "principal risco a ficar de olho (max 100 chars)" ou null,
  "confidence_note": "frase sobre o quanto confiar nessa previsão (max 100 chars)",
  "factors_summary": ["fator 1 que pesou", "fator 2", "fator 3"]
}}
"""


def generate_signal_texts_v2(analyst_context: dict) -> dict:
    """Claude Analyst v2 — full context analysis."""
    import json
    context_json = json.dumps(analyst_context, ensure_ascii=False, default=str)
    prompt = PROMPT_ANALYST_V2.format(context_json=context_json)

    # Try Opus, fallback to Sonnet
    for model in ["claude-opus-4-6", "claude-sonnet-4-5-20250514"]:
        try:
            msg = get_claude().messages.create(
                model=model,
                max_tokens=600,
                messages=[{"role": "user", "content": prompt}],
            )
            result = json.loads(_extract_json(msg.content[0].text))
            # Ensure all fields present
            defaults = {
                "recommendation_text": "Análise em andamento.",
                "explanation_text": "", "trend_text": "", "duration_text": "",
                "risk_alert": None, "confidence_note": "",
                "factors_summary": [],
            }
            return {**defaults, **result}
        except Exception as exc:
            logger.error("Claude %s falhou: %s", model, exc)
            continue

    return {
        "recommendation_text": "Análise temporariamente indisponível.",
        "explanation_text": "", "trend_text": "", "duration_text": "",
        "risk_alert": None, "confidence_note": "",
        "factors_summary": [],
    }


def generate_news_impact(title: str, sentiment: str) -> str:
    prompt = PROMPT_IMPACTO.format(title=title[:200], sentiment=sentiment)
    try:
        msg = get_claude().messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=100,
            messages=[{"role": "user", "content": prompt}],
        )
        return msg.content[0].text.strip()
    except Exception as exc:
        logger.error("Claude API falhou para notícia: %s", exc)
        return "Impacto em análise."
