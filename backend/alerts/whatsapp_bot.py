# backend/alerts/whatsapp_bot.py
"""
WhatsApp integration via Evolution API (self-hosted).
Fallback: envia via Telegram se WhatsApp não estiver configurado.

Env vars necessárias:
  EVOLUTION_API_URL   = https://seu-servidor.com  (sem /message/...)
  EVOLUTION_API_KEY   = sua-api-key
  EVOLUTION_INSTANCE  = bullcast  (nome da instância)
  WHATSAPP_NUMBERS    = 5511999999999,5511888888888  (destinatários, separados por vírgula)
"""
import logging
import os

import httpx

logger = logging.getLogger(__name__)

EVOLUTION_API_URL = os.environ.get("EVOLUTION_API_URL", "")
EVOLUTION_API_KEY = os.environ.get("EVOLUTION_API_KEY", "")
EVOLUTION_INSTANCE = os.environ.get("EVOLUTION_INSTANCE", "bullcast")
WHATSAPP_NUMBERS = os.environ.get("WHATSAPP_NUMBERS", "")


def _get_numbers() -> list[str]:
    """Retorna lista de números WhatsApp configurados."""
    raw = os.environ.get("WHATSAPP_NUMBERS", WHATSAPP_NUMBERS)
    if not raw:
        return []
    return [n.strip() for n in raw.split(",") if n.strip()]


def _is_configured() -> bool:
    url = os.environ.get("EVOLUTION_API_URL", EVOLUTION_API_URL)
    key = os.environ.get("EVOLUTION_API_KEY", EVOLUTION_API_KEY)
    nums = _get_numbers()
    return bool(url and key and nums)


def send_whatsapp(text: str) -> None:
    """Envia mensagem para todos os números configurados via Evolution API."""
    url = os.environ.get("EVOLUTION_API_URL", EVOLUTION_API_URL)
    key = os.environ.get("EVOLUTION_API_KEY", EVOLUTION_API_KEY)
    instance = os.environ.get("EVOLUTION_INSTANCE", EVOLUTION_INSTANCE)
    numbers = _get_numbers()

    if not url or not key or not numbers:
        logger.warning("WhatsApp não configurado — tentando Telegram como fallback")
        _fallback_telegram(text)
        return

    endpoint = f"{url.rstrip('/')}/message/sendText/{instance}"
    headers = {"apikey": key, "Content-Type": "application/json"}

    for number in numbers:
        try:
            with httpx.Client(timeout=15) as client:
                resp = client.post(endpoint, headers=headers, json={
                    "number": number,
                    "text": text[:4096],
                })
                resp.raise_for_status()
            logger.info("WhatsApp enviado para %s (%d chars)", number[-4:], len(text))
        except Exception as exc:
            logger.error("WhatsApp falhou para %s: %s", number[-4:], exc)


def _fallback_telegram(text: str) -> None:
    """Tenta enviar via Telegram se WhatsApp não estiver disponível."""
    try:
        from alerts.telegram_bot import send
        send(text)
    except Exception as exc:
        logger.error("Fallback Telegram também falhou: %s", exc)


def send_daily_signal(signal: str, price: float, pred_15d: float,
                      recommendation: str, explanation: str,
                      vol_regime: str, circuit_level: str) -> None:
    """Envia resumo diário formatado para WhatsApp."""
    emoji = {"BUY": "🟢", "SELL": "🔴", "HOLD": "🟡"}.get(signal, "⚪")
    cb_emoji = {"VERDE": "🟢", "AMARELO": "🟡", "LARANJA": "🟠", "VERMELHO": "🔴"}.get(circuit_level, "⚪")

    signal_pt = {"BUY": "COMPRAR", "SELL": "VENDER", "HOLD": "SEGURAR"}.get(signal, signal)

    text = f"""🐂 *BullCast — Sinal Diário*

{emoji} *{signal_pt}* | {recommendation}

💰 *Preço hoje:* R$ {price:.2f}/@
📈 *Previsão 15d:* R$ {pred_15d:.2f}/@

📊 {explanation}

🌡️ Volatilidade: *{vol_regime}*
{cb_emoji} Status: *{circuit_level}*

_Atualizado às 15h BRT_
─────────────────
🔗 bullcast.vercel.app""".strip()

    send_whatsapp(text)


def send_crisis_alert(description: str, circuit_level: str) -> None:
    """Envia alerta de crise urgente via WhatsApp."""
    text = f"""⚠️ *ALERTA BULLCAST — {circuit_level}*

{description}

🛑 Sinal alterado para *SEGURAR*
Evite decisões grandes até estabilizar.

🔗 bullcast.vercel.app/riscos""".strip()

    send_whatsapp(text)


def send_weekly_summary(
    price: float,
    variation_week: float,
    pred_5d: float,
    pred_15d: float,
    pred_30d: float,
    circuit_level: str,
    climate_alert: str | None = None,
) -> None:
    """Resumo semanal (enviado domingo à noite ou segunda de manhã)."""
    arrow = "📈" if variation_week > 0 else "📉" if variation_week < 0 else "➡️"

    text = f"""📋 *BullCast — Resumo Semanal*

💰 Preço atual: *R$ {price:.2f}/@*
{arrow} Variação semana: *{variation_week:+.1f}%*

📊 *Previsões:*
  • 5 dias: R$ {pred_5d:.2f}/@
  • 15 dias: R$ {pred_15d:.2f}/@
  • 30 dias: R$ {pred_30d:.2f}/@

🌡️ Status mercado: *{circuit_level}*"""

    if climate_alert:
        text += f"\n\n🌧️ *Clima:* {climate_alert}"

    text += "\n\n🔗 bullcast.vercel.app"

    send_whatsapp(text)
