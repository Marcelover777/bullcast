# backend/analysis/technical.py
"""
Calcula indicadores técnicos usando o pacote 'ta' sobre histórico spot_prices.
Salva em technical_indicators.
"""
import logging

import pandas as pd
import ta

from supabase_client import get_client, upsert

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
    close = df["price_per_arroba"].astype(float)

    # NOTA: ATR e Stochastic requerem High/Low/Close — CEPEA só publica preço de fechamento.
    # Portanto atr_14, stoch_k, stoch_d ficarão NULL no banco (campos reservados para futuro).

    # RSI-14
    rsi_14 = ta.momentum.RSIIndicator(close=close, window=14).rsi()

    # MACD (12/26/9)
    macd_obj = ta.trend.MACD(close=close, window_slow=26, window_fast=12, window_sign=9)
    macd_line   = macd_obj.macd()
    macd_signal = macd_obj.macd_signal()
    macd_hist   = macd_obj.macd_diff()

    # Bollinger Bands (20, 2σ)
    bb_obj  = ta.volatility.BollingerBands(close=close, window=20, window_dev=2)
    bb_upper = bb_obj.bollinger_hband()
    bb_mid   = bb_obj.bollinger_mavg()
    bb_lower = bb_obj.bollinger_lband()

    # SMAs
    sma_9   = ta.trend.SMAIndicator(close=close, window=9).sma_indicator()
    sma_21  = ta.trend.SMAIndicator(close=close, window=21).sma_indicator()
    sma_50  = ta.trend.SMAIndicator(close=close, window=50).sma_indicator()
    sma_200 = ta.trend.SMAIndicator(close=close, window=200).sma_indicator()

    # EMAs
    ema_9  = ta.trend.EMAIndicator(close=close, window=9).ema_indicator()
    ema_21 = ta.trend.EMAIndicator(close=close, window=21).ema_indicator()

    df_result = pd.DataFrame({
        "rsi_14":      rsi_14,
        "macd_line":   macd_line,
        "macd_signal": macd_signal,
        "macd_hist":   macd_hist,
        "bb_upper":    bb_upper,
        "bb_mid":      bb_mid,
        "bb_lower":    bb_lower,
        "sma_9":       sma_9,
        "sma_21":      sma_21,
        "sma_50":      sma_50,
        "sma_200":     sma_200,
        "ema_9":       ema_9,
        "ema_21":      ema_21,
    }, index=close.index)

    rows = []
    for idx, row in df_result.dropna().iterrows():
        rows.append({
            "date":        str(idx.date()),
            "rsi_14":      round(float(row["rsi_14"]),      2),
            "macd_line":   round(float(row["macd_line"]),   4),
            "macd_signal": round(float(row["macd_signal"]), 4),
            "macd_hist":   round(float(row["macd_hist"]),   4),
            "bb_upper":    round(float(row["bb_upper"]),    2),
            "bb_mid":      round(float(row["bb_mid"]),      2),
            "bb_lower":    round(float(row["bb_lower"]),    2),
            "sma_9":       round(float(row["sma_9"]),       2),
            "sma_21":      round(float(row["sma_21"]),      2),
            "sma_50":      round(float(row["sma_50"]),      2),
            "sma_200":     round(float(row["sma_200"]),     2),
            "ema_9":       round(float(row["ema_9"]),       2),
            "ema_21":      round(float(row["ema_21"]),      2),
            # atr_14, stoch_k, stoch_d omitidos: requerem OHLC, indisponível no CEPEA
        })

    if rows:
        upsert("technical_indicators", rows, ["date"])
        logger.info("Upsert %d registros technical_indicators", len(rows))
