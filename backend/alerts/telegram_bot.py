# backend/alerts/telegram_bot.py
import logging
import os

import httpx

logger = logging.getLogger(__name__)

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
CHAT_ID   = os.environ.get("TELEGRAM_CHAT_ID", "")
# API_URL construído lazy em send() — evita URL inválida se env var não está definida no import.


def _api_url() -> str:
    """URL lazy — lê BOT_TOKEN no momento do envio, não no import do módulo."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN", BOT_TOKEN)
    return f"https://api.telegram.org/bot{token}/sendMessage"


def send(text: str, parse_mode: str = "Markdown") -> None:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", BOT_TOKEN)
    chat  = os.environ.get("TELEGRAM_CHAT_ID", CHAT_ID)
    if not token or not chat:
        logger.warning("Telegram não configurado — mensagem não enviada")
        return
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.post(_api_url(), json={
                "chat_id": chat,
                "text": text[:4096],
                "parse_mode": parse_mode,
            })
            resp.raise_for_status()
        logger.info("Telegram: mensagem enviada (%d chars)", len(text))
    except Exception as exc:
        logger.error("Telegram falhou: %s", exc)


def send_daily_signal(signal: str, price: float, pred_15d: float,
                      recommendation: str, explanation: str,
                      vol_regime: str, circuit_level: str) -> None:
    emoji = {"BUY": "🟢", "SELL": "🔴", "HOLD": "🟡"}.get(signal, "⚪")
    cb_emoji = {"VERDE": "🟢", "AMARELO": "🟡", "LARANJA": "🟠", "VERMELHO": "🔴"}.get(circuit_level, "⚪")

    text = f"""
🐂 *BullCast — Sinal Diário*

{emoji} *{signal}* | {recommendation}

💰 *Preço hoje:* R$ {price:.2f}/@
📈 *Previsão 15d:* R$ {pred_15d:.2f}/@

📊 {explanation}

🌡️ Volatilidade: *{vol_regime}*
{cb_emoji} Status mercado: *{circuit_level}*

_Atualizado hoje às 15h BRT_
""".strip()
    send(text)


def send_crisis_alert(description: str, circuit_level: str) -> None:
    text = f"""
⚠️ *ALERTA BULLCAST — {circuit_level}*

{description}

🛑 Sinal alterado para *HOLD*
Evite decisões grandes até o mercado se estabilizar.
""".strip()
    send(text)
