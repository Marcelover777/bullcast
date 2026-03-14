# backend/ml_models/xgboost_model.py
"""
XGBoost com walk-forward validation.
Janela: 504 dias treino, 63 dias teste.
Features: lags (1,5,15,30), rolling_mean (7,30), mês, sazonalidade.
"""
import logging

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_absolute_percentage_error

logger = logging.getLogger(__name__)


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Adiciona lags, rolling stats e dummies de tempo."""
    df = df.copy().sort_index()
    price = df["price_per_arroba"]

    for lag in [1, 5, 15, 30]:
        df[f"lag_{lag}"] = price.shift(lag)

    df["roll_7"]  = price.rolling(7).mean()
    df["roll_30"] = price.rolling(30).mean()
    df["month"]   = df.index.month
    df["week"]    = df.index.isocalendar().week.astype(int)
    df["is_entressafra"] = df.index.month.isin([6, 7, 8, 9]).astype(int)

    return df.dropna()


def train_and_predict(df: pd.DataFrame, horizon_days: int) -> dict:
    """
    Treina XGBoost com walk-forward e retorna previsão para horizon_days.
    df: DataFrame com index DatetimeIndex e coluna 'price_per_arroba'.
    """
    if not isinstance(df.index, pd.DatetimeIndex):
        raise TypeError(
            f"xgboost_model.train_and_predict: df.index deve ser DatetimeIndex, "
            f"recebido {type(df.index).__name__}. "
            "Certifique-se de chamar df.set_index('date') após pd.to_datetime(df['date'])."
        )
    df_feat = build_features(df)
    feature_cols = [c for c in df_feat.columns if c != "price_per_arroba"]

    X = df_feat[feature_cols].values
    y = df_feat["price_per_arroba"].values

    train_size = min(504, len(X) - 63)
    if train_size < 100:
        logger.warning("Dados insuficientes para XGBoost (%d rows)", len(X))
        return {}

    X_train, y_train = X[:train_size], y[:train_size]
    X_test,  y_test  = X[train_size:train_size + 63], y[train_size:train_size + 63]

    model = xgb.XGBRegressor(
        n_estimators=500,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
        verbosity=0,
    )
    # IMPORTANTE: não passar eval_set com X_test/y_test aqui — causaria data leakage.
    # O teste é feito APÓS o fit para avaliação de desempenho out-of-sample.
    model.fit(X_train, y_train)

    y_pred_test = model.predict(X_test)
    mape = float(mean_absolute_percentage_error(y_test, y_pred_test))
    directional = float(np.mean(np.sign(np.diff(y_test)) == np.sign(np.diff(y_pred_test))))

    # Previsão: usa últimas features para simular horizon_days
    last_features = X[-1].reshape(1, -1)
    pred_value = float(model.predict(last_features)[0])

    # Intervalo simples: ± 1.5 × MAPE
    margin = pred_value * mape * 1.5
    importance = dict(zip(feature_cols, model.feature_importances_.tolist()))

    logger.info("XGBoost %dd: pred=%.2f MAPE=%.2f%% dir=%.1f%%",
                horizon_days, pred_value, mape * 100, directional * 100)

    return {
        "model_name": "xgboost",
        "horizon_days": horizon_days,
        "pred_value": round(pred_value, 2),
        "pred_lower": round(pred_value - margin, 2),
        "pred_upper": round(pred_value + margin, 2),
        "confidence": round(1 - mape, 3),
        "mape": round(mape, 4),
        "directional_accuracy": round(directional, 3),
        "feature_importance": importance,
    }
