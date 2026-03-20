# backend/ml_models/tft_train.py
"""
TFT training script — runs ONLY in GitHub Actions (7GB RAM).
Trains with neuralforecast, exports to ONNX, uploads to Supabase Storage.
"""
import logging
import tempfile
import os

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def train_and_export_onnx(df: pd.DataFrame) -> None:
    """Train TFT with neuralforecast and export ONNX to Supabase Storage."""
    from neuralforecast import NeuralForecast
    from neuralforecast.models import TFT

    # Prepare data in neuralforecast format
    nf_df = df.reset_index()
    nf_df = nf_df.rename(columns={"date": "ds", "price": "y"})
    nf_df["unique_id"] = "boi_gordo_sp"

    # Feature columns (exclude target)
    futr_cols = [c for c in df.columns if c != "price"]

    model = TFT(
        h=30,  # prediction length
        input_size=60,  # encoder length
        hidden_size=64,
        n_head=4,
        learning_rate=0.001,
        max_steps=500,
        early_stop_patience_steps=5,
        batch_size=32,
        loss="QuantileLoss",
        quantiles=[0.05, 0.25, 0.50, 0.75, 0.95],
        futr_exog_list=futr_cols,
        scaler_type="standard",
        random_seed=42,
    )

    nf = NeuralForecast(models=[model], freq="B")
    nf.fit(nf_df)

    # Export to ONNX
    onnx_path = tempfile.mktemp(suffix=".onnx")
    try:
        # neuralforecast doesn't have native ONNX export,
        # so we use torch.onnx.export on the underlying model
        import torch
        import onnx

        pytorch_model = model.model
        # Create dummy input matching expected shape
        dummy = torch.randn(1, 60, len(futr_cols) + 1).float()
        torch.onnx.export(
            pytorch_model, dummy, onnx_path,
            input_names=["input"],
            output_names=["output"],
            dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
        )

        # Upload to Supabase Storage
        from supabase_client import get_client
        client = get_client()
        with open(onnx_path, "rb") as f:
            client.storage.from_("models").upload(
                "tft_model.onnx", f.read(),
                file_options={"upsert": "true"}
            )
        logger.info("TFT ONNX uploaded to Supabase Storage")
    finally:
        if os.path.exists(onnx_path):
            os.unlink(onnx_path)
