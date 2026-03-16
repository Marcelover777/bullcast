# backend/ml_models/sarima_model.py
"""
SARIMA (Seasonal ARIMA) para previsão de preço do boi gordo.
Captura sazonalidade e autocorrelação que XGBoost não modela bem.
Peso no ensemble: 0.2 (20%)
"""
import logging
from datetime import timedelta

import numpy as np
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX

logger = logging.getLogger(__name__)

# SARIMA(1,1,1)(1,1,1,252) — 252 dias úteis = 1 ano
# Simplificado para (1,1,1)(1,0,0,21) — 21 dias úteis = 1 mês
SARIMA_ORDER = (1, 1, 1)
SEASONAL_ORDER = (1, 0, 0, 21)  # Sazonalidade mensal (21 dias úteis)


def train_and_predict(df: pd.DataFrame, horizon: int) -> dict | None:
    """
    Treina SARIMA e retorna previsão.
    df: DataFrame com index=date, coluna 'price_per_arroba'.
    horizon: dias úteis para prever (5, 15, 30).
    """
    if len(df) < 120:
        logger.warning("SARIMA: dados insuficientes (%d < 120)", len(df))
        return None

    series = df["price_per_arroba"].astype(float).dropna()
    if len(series) < 120:
        return None

    # Divisão treino/teste
    test_size = min(30, len(series) // 5)
    train = series[:-test_size]
    test = series[-test_size:]

    try:
        model = SARIMAX(
            train,
            order=SARIMA_ORDER,
            seasonal_order=SEASONAL_ORDER,
            enforce_stationarity=False,
            enforce_invertibility=False,
        )
        fitted = model.fit(disp=False, maxiter=200)

        # Previsão out-of-sample (teste)
        test_forecast = fitted.get_forecast(steps=test_size)
        test_pred = test_forecast.predicted_mean.values

        # Métricas no período de teste
        test_values = test.values[:len(test_pred)]
        mape = float(np.mean(np.abs((test_values - test_pred) / test_values)))
        mape = min(mape, 0.5)  # Cap em 50%

        # Acurácia direcional
        actual_dir = np.sign(np.diff(test_values))
        pred_dir = np.sign(np.diff(test_pred[:len(test_values)]))
        min_len = min(len(actual_dir), len(pred_dir))
        if min_len > 0:
            dir_acc = float(np.mean(actual_dir[:min_len] == pred_dir[:min_len]))
        else:
            dir_acc = 0.5

        # Re-treina com todos os dados e prevê horizon passos
        full_model = SARIMAX(
            series,
            order=SARIMA_ORDER,
            seasonal_order=SEASONAL_ORDER,
            enforce_stationarity=False,
            enforce_invertibility=False,
        )
        full_fitted = full_model.fit(disp=False, maxiter=200)

        forecast = full_fitted.get_forecast(steps=horizon)
        pred_mean = forecast.predicted_mean.values
        conf_int = forecast.conf_int(alpha=0.1)  # 90% intervalo

        pred_value = float(pred_mean[-1])
        pred_lower = float(conf_int.iloc[-1, 0])
        pred_upper = float(conf_int.iloc[-1, 1])

        logger.info("SARIMA %dd: pred=%.2f [%.2f, %.2f] MAPE=%.2f%% DirAcc=%.1f%%",
                    horizon, pred_value, pred_lower, pred_upper, mape * 100, dir_acc * 100)

        return {
            "pred_value": round(pred_value, 2),
            "pred_lower": round(pred_lower, 2),
            "pred_upper": round(pred_upper, 2),
            "mape": round(mape, 4),
            "directional_accuracy": round(dir_acc, 3),
            "feature_importance": {},  # SARIMA não tem feature importance
        }

    except Exception as exc:
        logger.error("SARIMA %dd falhou: %s", horizon, exc)
        return None
