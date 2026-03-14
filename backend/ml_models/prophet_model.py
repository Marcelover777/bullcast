# backend/ml_models/prophet_model.py
"""
Prophet com sazonalidade anual customizada para boi gordo BR.
"""
import logging
import warnings

import numpy as np
import pandas as pd
from prophet import Prophet
from sklearn.metrics import mean_absolute_percentage_error

warnings.filterwarnings("ignore")
logger = logging.getLogger(__name__)

# Feriados agro BR (entressafra é tratada como sazonalidade, não feriado)
BR_HOLIDAYS = pd.DataFrame({
    "holiday": ["carnaval", "natal", "reveillon"] * 5,
    "ds": pd.to_datetime([
        "2022-02-28", "2022-12-25", "2022-12-31",
        "2023-02-21", "2023-12-25", "2023-12-31",
        "2024-02-12", "2024-12-25", "2024-12-31",
        "2025-03-03", "2025-12-25", "2025-12-31",
        "2026-02-16", "2026-12-25", "2026-12-31",
    ]),
    "lower_window": [-1, -1, -1] * 5,
    "upper_window": [1, 1, 1] * 5,
})


def train_and_predict(df: pd.DataFrame, horizon_days: int) -> dict:
    """df com index DatetimeIndex e coluna 'price_per_arroba'."""
    if not isinstance(df.index, pd.DatetimeIndex):
        raise TypeError(
            f"prophet_model.train_and_predict: df.index deve ser DatetimeIndex, "
            f"recebido {type(df.index).__name__}. "
            "O ensemble deve chamar df.set_index('date') antes de passar para os modelos."
        )
    df_reset = df.reset_index()
    # O index DatetimeIndex vira coluna com nome 'date' (nome do index no ensemble.py)
    date_col = "date" if "date" in df_reset.columns else df_reset.columns[0]
    df_prophet = df_reset[[date_col, "price_per_arroba"]].rename(
        columns={date_col: "ds", "price_per_arroba": "y"}
    )
    df_prophet["ds"] = pd.to_datetime(df_prophet["ds"])

    if len(df_prophet) < 60:
        logger.warning("Dados insuficientes para Prophet (%d rows)", len(df_prophet))
        return {}

    train = df_prophet.iloc[:-30]
    test  = df_prophet.iloc[-30:]

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        holidays=BR_HOLIDAYS,
        changepoint_prior_scale=0.05,
        seasonality_prior_scale=10,
    )
    model.add_seasonality(name="entressafra", period=365.25, fourier_order=5)
    model.fit(train)

    # Teste
    test_forecast = model.predict(test[["ds"]])
    mape = float(mean_absolute_percentage_error(test["y"], test_forecast["yhat"]))
    directional = float(np.mean(
        np.sign(test["y"].diff().dropna().values) ==
        np.sign(test_forecast["yhat"].diff().dropna().values)
    ))

    # Previsão futura
    future = model.make_future_dataframe(periods=horizon_days)
    forecast = model.predict(future)
    future_row = forecast.iloc[-1]

    pred_value = float(future_row["yhat"])
    pred_lower = float(future_row["yhat_lower"])
    pred_upper = float(future_row["yhat_upper"])

    logger.info("Prophet %dd: pred=%.2f MAPE=%.2f%%",
                horizon_days, pred_value, mape * 100)

    return {
        "model_name": "prophet",
        "horizon_days": horizon_days,
        "pred_value": round(pred_value, 2),
        "pred_lower": round(pred_lower, 2),
        "pred_upper": round(pred_upper, 2),
        "confidence": round(1 - mape, 3),
        "mape": round(mape, 4),
        "directional_accuracy": round(directional, 3),
        "feature_importance": {},
    }
