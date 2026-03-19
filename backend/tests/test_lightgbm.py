# backend/tests/test_lightgbm.py
"""Tests for LightGBM model — mirrors XGBoost tests."""
import pytest


class TestLightGBM:
    def test_returns_model_result(self, synthetic_feature_df):
        from ml_models.lightgbm_model import train_and_predict
        result = train_and_predict(synthetic_feature_df, horizon=15)
        assert result is not None
        assert result["model_name"] == "lightgbm"
        assert "pred_final" in result
        assert "mape" in result

    def test_pred_is_reasonable(self, synthetic_feature_df):
        from ml_models.lightgbm_model import train_and_predict
        result = train_and_predict(synthetic_feature_df, horizon=5)
        last_price = synthetic_feature_df["price"].iloc[-1]
        assert result["pred_final"] > last_price * 0.8
        assert result["pred_final"] < last_price * 1.2
