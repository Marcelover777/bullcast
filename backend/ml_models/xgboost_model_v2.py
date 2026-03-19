# backend/ml_models/xgboost_model_v2.py
"""
XGBoost v2 — 35+ features, walk-forward validation, recursive multi-step prediction.
"""
import logging

import numpy as np
import pandas as pd
import xgboost as xgb

logger = logging.getLogger(__name__)

DEFAULT_PARAMS = {
    "n_estimators": 800,
    "max_depth": 6,
    "learning_rate": 0.03,
    "subsample": 0.8,
    "colsample_bytree": 0.7,
    "reg_alpha": 0.1,
    "reg_lambda": 1.0,
    "min_child_weight": 5,
    "objective": "reg:squarederror",
    "verbosity": 0,
}

TARGET_COL = "price"


def _walk_forward_validate(df: pd.DataFrame, horizon: int,
                            min_folds: int = 5, fold_size: int = 30) -> dict:
    """Expanding window walk-forward. Returns fold metrics."""
    features = [c for c in df.columns if c != TARGET_COL]
    n = len(df)
    min_train = min(max(200, n // 2), n - fold_size * min_folds)

    fold_mapes = []
    fold_dirs = []

    for fold_start in range(min_train, n - fold_size, fold_size):
        fold_end = min(fold_start + fold_size, n)
        train = df.iloc[:fold_start]
        test = df.iloc[fold_start:fold_end]

        X_train = train[features].values
        y_train = train[TARGET_COL].values
        X_test = test[features].values
        y_test = test[TARGET_COL].values

        model = xgb.XGBRegressor(**DEFAULT_PARAMS)
        model.fit(X_train, y_train, eval_set=[(X_test[:min(10, len(X_test)), :],
                  y_test[:min(10, len(y_test))])], verbose=False)

        preds = model.predict(X_test)
        mape = np.mean(np.abs((y_test - preds) / y_test)) * 100
        direction_correct = np.mean(np.sign(np.diff(preds[:horizon])) ==
                                     np.sign(np.diff(y_test[:horizon]))) if len(y_test) > 1 else 0.5

        fold_mapes.append(mape)
        fold_dirs.append(direction_correct)

    return {
        "fold_mapes": fold_mapes,
        "avg_mape": np.mean(fold_mapes) if fold_mapes else 99.0,
        "avg_directional": np.mean(fold_dirs) if fold_dirs else 0.5,
    }


def _recursive_predict(model, last_row: np.ndarray, horizon: int,
                        feature_names: list[str]) -> list[float]:
    """Recursive multi-step: predict t+1, update lag_1, predict t+2, etc."""
    preds = []
    current = last_row.copy()

    # Only update lag columns (TARGET_COL 'price' is excluded from features)
    lag_indices = {}
    for lag in [1, 5, 15, 30]:
        name = f"lag_{lag}"
        if name in feature_names:
            lag_indices[lag] = feature_names.index(name)

    for step in range(horizon):
        pred = float(model.predict(current.reshape(1, -1))[0])
        preds.append(pred)

        # Update lag_1 with latest prediction for next step
        if 1 in lag_indices:
            current[lag_indices[1]] = pred

    return preds


def train_and_predict(df: pd.DataFrame, horizon: int) -> dict | None:
    """
    Train XGBoost on full df, predict recursively for horizon days.
    Returns ModelResult dict.
    """
    if len(df) < 100:
        logger.warning("XGBoost: dados insuficientes (%d rows)", len(df))
        return None

    features = [c for c in df.columns if c != TARGET_COL]
    X = df[features].values
    y = df[TARGET_COL].values

    # Walk-forward validation for metrics
    wf = _walk_forward_validate(df, horizon)

    # Train on full data
    model = xgb.XGBRegressor(**DEFAULT_PARAMS)
    model.fit(X, y, verbose=False)

    # Recursive prediction
    last_row = X[-1]
    preds = _recursive_predict(model, last_row, horizon, features)

    # Feature importance
    importance = dict(zip(features, model.feature_importances_))
    top_features = dict(sorted(importance.items(), key=lambda x: -x[1])[:10])

    return {
        "model_name": "xgboost",
        "horizon_days": horizon,
        "pred_final": round(preds[-1], 2),
        "mape": round(wf["avg_mape"], 4),
        "directional_accuracy": round(wf["avg_directional"], 3),
        "feature_importance": top_features,
    }
