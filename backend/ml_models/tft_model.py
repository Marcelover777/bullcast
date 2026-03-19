# backend/ml_models/tft_model.py
"""
TFT (Temporal Fusion Transformer) — ONNX inference on Railway.
Training happens in GitHub Actions (see .github/workflows/ml-train.yml).
"""
import logging
import os
import tempfile
from pathlib import Path

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

TARGET_COL = "price"
ONNX_BUCKET = "models"
ONNX_FILENAME = "tft_model.onnx"


def _download_onnx() -> str | None:
    """Download ONNX model from Supabase Storage."""
    from supabase_client import get_client
    try:
        client = get_client()
        data = client.storage.from_(ONNX_BUCKET).download(ONNX_FILENAME)
        tmp = tempfile.NamedTemporaryFile(suffix=".onnx", delete=False)
        tmp.write(data)
        tmp.close()
        return tmp.name
    except Exception as exc:
        logger.warning("TFT ONNX download falhou: %s", exc)
        return None


def _run_onnx_inference(onnx_path: str, df: pd.DataFrame,
                         horizon: int) -> dict | None:
    """Run ONNX inference for TFT."""
    import onnxruntime as ort

    session = ort.InferenceSession(onnx_path)
    input_names = [inp.name for inp in session.get_inputs()]

    # Prepare input (last 60 days of features)
    encoder_length = 60
    features = [c for c in df.columns if c != TARGET_COL]
    recent = df[features].iloc[-encoder_length:].values.astype(np.float32)

    # Reshape for TFT: (batch=1, seq_len, features)
    input_data = recent.reshape(1, encoder_length, -1)

    # Run inference
    input_feed = {input_names[0]: input_data}
    outputs = session.run(None, input_feed)

    # TFT outputs: [predictions (1, horizon, quantiles)]
    # quantiles: [0.05, 0.25, 0.50, 0.75, 0.95]
    pred_quantiles = outputs[0][0]  # (horizon, 5)

    # Extract point forecast (median = quantile 0.50, index 2)
    pred_values = pred_quantiles[:, 2] if pred_quantiles.ndim == 2 else pred_quantiles

    return {
        "model_name": "tft",
        "horizon_days": horizon,
        "pred_final": round(float(pred_values[min(horizon - 1, len(pred_values) - 1)]), 2),
        "mape": 0.0,  # computed in auto_improve.py from actuals
        "directional_accuracy": 0.0,  # computed in auto_improve.py
        "feature_importance": {},  # TFT attention weights extracted during training
        # Quantiles for conformal cold-start fallback
        "_quantile_05": float(pred_quantiles[min(horizon - 1, len(pred_quantiles) - 1), 0]) if pred_quantiles.ndim == 2 else 0,
        "_quantile_95": float(pred_quantiles[min(horizon - 1, len(pred_quantiles) - 1), 4]) if pred_quantiles.ndim == 2 else 0,
    }


def train_and_predict(df: pd.DataFrame, horizon: int) -> dict | None:
    """Load ONNX model and run inference. Returns None if model not available."""
    onnx_path = _download_onnx()
    if onnx_path is None:
        logger.warning("TFT: ONNX model not available — skipping")
        return None

    try:
        result = _run_onnx_inference(onnx_path, df, horizon)
        return result
    except Exception as exc:
        logger.error("TFT inference falhou: %s", exc)
        return None
    finally:
        if onnx_path and os.path.exists(onnx_path):
            os.unlink(onnx_path)
