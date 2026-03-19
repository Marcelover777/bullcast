# backend/ml_models/lightgbm_model.py
"""
LightGBM — mirrors XGBoost v2 interface.
Same features, walk-forward, recursive multi-step. ~3x faster training.
"""
import logging

import lightgbm as lgb
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

DEFAULT_PARAMS = {
    "n_estimators": 800,
    "max_depth": -1,
    "learning_rate": 0.03,
    "num_leaves": 63,
    "subsample": 0.8,
    "colsample_bytree": 0.7,
    "min_child_samples": 20,
    "reg_alpha": 0.1,
    "reg_lambda": 1.0,
    "objective": "regression",
    "verbosity": -1,
}

TARGET_COL = "price"


def _walk_forward_validate(df: pd.DataFrame, horizon: int,
                            fold_size: int = 30) -> dict:
    features = [c for c in df.columns if c != TARGET_COL]
    n = len(df)
    min_train = min(max(200, n // 2), n - fold_size * 3)

    fold_mapes = []
    fold_dirs = []

    for fold_start in range(min_train, n - fold_size, fold_size):
        fold_end = min(fold_start + fold_size, n)
        train = df.iloc[:fold_start]
        test = df.iloc[fold_start:fold_end]

        model = lgb.LGBMRegressor(**DEFAULT_PARAMS)
        model.fit(train[features], train[TARGET_COL],
                  eval_set=[(test[features].iloc[:10], test[TARGET_COL].iloc[:10])],
                  callbacks=[lgb.log_evaluation(0)])

        preds = model.predict(test[features])
        y_test = test[TARGET_COL].values
        mape = np.mean(np.abs((y_test - preds) / y_test)) * 100
        dir_acc = np.mean(np.sign(np.diff(preds[:horizon])) ==
                          np.sign(np.diff(y_test[:horizon]))) if len(y_test) > 1 else 0.5

        fold_mapes.append(mape)
        fold_dirs.append(dir_acc)

    return {
        "avg_mape": np.mean(fold_mapes) if fold_mapes else 99.0,
        "avg_directional": np.mean(fold_dirs) if fold_dirs else 0.5,
    }


def _recursive_predict(model, last_row: np.ndarray, horizon: int,
                        feature_names: list[str]) -> list[float]:
    """Recursive multi-step: predict t+1, update lag_1, predict t+2, etc."""
    preds = []
    current = last_row.copy()
    lag1_idx = feature_names.index("lag_1") if "lag_1" in feature_names else None

    for _ in range(horizon):
        pred = float(model.predict(current.reshape(1, -1))[0])
        preds.append(pred)
        if lag1_idx is not None:
            current[lag1_idx] = pred

    return preds


def train_and_predict(df: pd.DataFrame, horizon: int) -> dict | None:
    if len(df) < 100:
        logger.warning("LightGBM: dados insuficientes (%d rows)", len(df))
        return None

    features = [c for c in df.columns if c != TARGET_COL]
    wf = _walk_forward_validate(df, horizon)

    model = lgb.LGBMRegressor(**DEFAULT_PARAMS)
    model.fit(df[features], df[TARGET_COL], callbacks=[lgb.log_evaluation(0)])

    preds = _recursive_predict(model, df[features].values[-1], horizon, features)

    importance = dict(zip(features, model.feature_importances_))
    top_features = dict(sorted(importance.items(), key=lambda x: -x[1])[:10])

    return {
        "model_name": "lightgbm",
        "horizon_days": horizon,
        "pred_final": round(preds[-1], 2),
        "mape": round(wf["avg_mape"], 4),
        "directional_accuracy": round(wf["avg_directional"], 3),
        "feature_importance": top_features,
    }
