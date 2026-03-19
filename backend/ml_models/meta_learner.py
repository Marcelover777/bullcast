# backend/ml_models/meta_learner.py
"""
Meta-learner — sklearn MLPRegressor neural stacking.
Combines XGBoost + LightGBM + TFT with dynamic learned weights.
Serialized with joblib, stored in Supabase Storage.
"""
import logging
import tempfile
import os

import numpy as np
import joblib
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

SUPABASE_BUCKET = "models"
META_LEARNER_KEY = "meta_learner.joblib"


def train_meta_learner(
    xgb_preds: np.ndarray,
    lgb_preds: np.ndarray,
    tft_preds: np.ndarray,
    actuals: np.ndarray,
    xgb_mape_30d: float = 0.0,
    lgb_mape_30d: float = 0.0,
    tft_mape_30d: float = 0.0,
    xgb_dir_acc: float = 0.5,
    lgb_dir_acc: float = 0.5,
    tft_dir_acc: float = 0.5,
) -> MLPRegressor:
    """Train meta-learner on individual model predictions vs actuals."""
    n = len(actuals)
    X = np.column_stack([
        xgb_preds, lgb_preds, tft_preds,
        np.full(n, xgb_mape_30d), np.full(n, lgb_mape_30d), np.full(n, tft_mape_30d),
        np.full(n, xgb_dir_acc), np.full(n, lgb_dir_acc), np.full(n, tft_dir_acc),
    ])

    model = MLPRegressor(
        hidden_layer_sizes=(32, 16),
        activation="relu",
        max_iter=500,
        random_state=42,
        early_stopping=True,
        validation_fraction=0.1,
    )
    model.fit(X, actuals)
    return model


def combine_predictions(
    preds: dict[str, float],
    model: MLPRegressor | None = None,
    mapes: dict[str, float] | None = None,
    dir_accs: dict[str, float] | None = None,
) -> float:
    """Combine model predictions. Falls back to simple average if no trained model."""
    if model is None:
        # Simple average fallback
        values = list(preds.values())
        return round(sum(values) / len(values), 2)

    mapes = mapes or {}
    dir_accs = dir_accs or {}

    X = np.array([[
        preds.get("xgboost", 0), preds.get("lightgbm", 0), preds.get("tft", 0),
        mapes.get("xgboost", 0), mapes.get("lightgbm", 0), mapes.get("tft", 0),
        dir_accs.get("xgboost", 0.5), dir_accs.get("lightgbm", 0.5), dir_accs.get("tft", 0.5),
    ]])

    return round(float(model.predict(X)[0]), 2)


def get_model_weights(model: MLPRegressor) -> dict[str, float]:
    """Extract approximate model contribution weights from MLP layer 1 weights."""
    # First layer weights: (9, 32) — first 3 rows correspond to model predictions
    w = np.abs(model.coefs_[0][:3])  # (3, 32)
    importance = w.sum(axis=1)  # (3,)
    total = importance.sum()
    if total == 0:
        return {"xgboost": 0.33, "lightgbm": 0.33, "tft": 0.34}

    normed = importance / total
    return {
        "xgboost": round(float(normed[0]), 3),
        "lightgbm": round(float(normed[1]), 3),
        "tft": round(float(normed[2]), 3),
    }


def save_to_supabase(model: MLPRegressor) -> None:
    """Save trained meta-learner to Supabase Storage."""
    from supabase_client import get_client
    tmp = tempfile.NamedTemporaryFile(suffix=".joblib", delete=False)
    try:
        joblib.dump(model, tmp.name)
        tmp.close()
        with open(tmp.name, "rb") as f:
            client = get_client()
            client.storage.from_(SUPABASE_BUCKET).upload(
                META_LEARNER_KEY, f.read(),
                file_options={"upsert": "true"}
            )
        logger.info("Meta-learner salvo em Supabase Storage")
    finally:
        os.unlink(tmp.name)


def load_from_supabase() -> MLPRegressor | None:
    """Load trained meta-learner from Supabase Storage."""
    from supabase_client import get_client
    try:
        client = get_client()
        data = client.storage.from_(SUPABASE_BUCKET).download(META_LEARNER_KEY)
        tmp = tempfile.NamedTemporaryFile(suffix=".joblib", delete=False)
        tmp.write(data)
        tmp.close()
        model = joblib.load(tmp.name)
        os.unlink(tmp.name)
        return model
    except Exception as exc:
        logger.warning("Meta-learner não disponível: %s", exc)
        return None
