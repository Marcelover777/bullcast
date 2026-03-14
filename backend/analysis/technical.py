# backend/analysis/technical.py
"""
Calcula indicadores técnicos usando pandas-ta sobre histórico spot_prices.
Salva em technical_indicators.
"""
import logging

import pandas as pd
import pandas_ta as ta

from ..supabase_client import get_client, upsert

logger = logging.getLogger(__name__)


def compute_technical_indicators() -> None:
    """Busca histórico spot SP, calcula indicadores, faz upsert."""
    client = get_client()

    resp = (client.table("spot_prices")
            .select("date,price_per_arroba")
            .eq("state", "SP")
            .order("date", desc=False)
            .limit(300)
            .execute())

    if not resp.data:
        logger.warning("Sem dados spot para calcular indicadores")
        return

    df = pd.DataFrame(resp.data)
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").sort_index()
    close = df["price_per_arroba"].rename("close")

    # Calcula via pandas-ta
    # NOTA: ATR e Stochastic requerem High/Low/Close — CEPEA só publica preço de fechamento.
    # Portanto atr_14, stoch_k, stoch_d ficarão NULL no banco (campos reservados para futuro).
    df_ta = pd.DataFrame({"close": close})
    df_ta.ta.rsi(length=14, append=True)
    df_ta.ta.macd(fast=12, slow=26, signal=9, append=True)
    df_ta.ta.bbands(length=20, std=2, append=True)
    df_ta.ta.sma(length=9, append=True)
    df_ta.ta.sma(length=21, append=True)
    df_ta.ta.sma(length=50, append=True)
    df_ta.ta.sma(length=200, append=True)
    df_ta.ta.ema(length=9, append=True)
    df_ta.ta.ema(length=21, append=True)

    rows = []
    for idx, row in df_ta.dropna().iterrows():
        rows.append({
            "date": str(idx.date()),
            "rsi_14":      round(float(row.get("RSI_14", 0) or 0), 2),
            "macd_line":   round(float(row.get("MACD_12_26_9", 0) or 0), 4),
            "macd_signal": round(float(row.get("MACDs_12_26_9", 0) or 0), 4),
            "macd_hist":   round(float(row.get("MACDh_12_26_9", 0) or 0), 4),
            "bb_upper":    round(float(row.get("BBU_20_2.0", 0) or 0), 2),
            "bb_mid":      round(float(row.get("BBM_20_2.0", 0) or 0), 2),
            "bb_lower":    round(float(row.get("BBL_20_2.0", 0) or 0), 2),
            "sma_9":       round(float(row.get("SMA_9", 0) or 0), 2),
            "sma_21":      round(float(row.get("SMA_21", 0) or 0), 2),
            "sma_50":      round(float(row.get("SMA_50", 0) or 0), 2),
            "sma_200":     round(float(row.get("SMA_200", 0) or 0), 2),
            "ema_9":       round(float(row.get("EMA_9", 0) or 0), 2),
            "ema_21":      round(float(row.get("EMA_21", 0) or 0), 2),
            # atr_14, stoch_k, stoch_d omitidos: requerem OHLC, indisponível no CEPEA
        })

    if rows:
        upsert("technical_indicators", rows, ["date"])
        logger.info("Upsert %d registros technical_indicators", len(rows))
