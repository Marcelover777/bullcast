# backend/tests/test_tft.py
"""Tests for TFT ONNX inference wrapper."""
import sys
import types
import numpy as np
import pytest
from unittest.mock import patch, MagicMock


class TestTFTInference:
    def test_returns_none_when_onnx_unavailable(self, synthetic_feature_df, mock_supabase):
        """Should return None gracefully if ONNX model not in Supabase."""
        with patch("ml_models.tft_model._download_onnx", return_value=None):
            from ml_models.tft_model import train_and_predict
            result = train_and_predict(synthetic_feature_df, horizon=15)
            assert result is None

    def test_returns_model_result_with_mock_onnx(self, synthetic_feature_df, mock_supabase):
        """With mocked ONNX session, should return valid ModelResult."""
        mock_session = MagicMock()
        # TFT output: (1, 30, 5) — 30 steps, 5 quantiles
        fake_output = np.random.normal(310, 5, (1, 30, 5)).astype(np.float32)
        mock_session.run.return_value = [fake_output]
        mock_session.get_inputs.return_value = [MagicMock(name="input")]

        # Create a fake onnxruntime module since it's not installed in test env
        mock_ort = types.ModuleType("onnxruntime")
        mock_ort.InferenceSession = MagicMock(return_value=mock_session)
        sys.modules["onnxruntime"] = mock_ort

        try:
            with patch("ml_models.tft_model._download_onnx", return_value="/tmp/fake.onnx"):
                with patch("os.path.exists", return_value=True):
                    with patch("os.unlink"):
                        from ml_models.tft_model import train_and_predict
                        result = train_and_predict(synthetic_feature_df, horizon=15)

            assert result is not None
            assert result["model_name"] == "tft"
            assert result["horizon_days"] == 15
            assert isinstance(result["pred_final"], float)
            assert "_quantile_05" in result
            assert "_quantile_95" in result
        finally:
            del sys.modules["onnxruntime"]
