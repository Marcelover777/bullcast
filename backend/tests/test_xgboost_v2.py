# backend/tests/test_xgboost_v2.py
"""Tests for XGBoost v2 with walk-forward validation."""
import pytest


class TestXGBoostV2:
    def test_returns_model_result(self, synthetic_feature_df):
        from ml_models.xgboost_model_v2 import train_and_predict
        result = train_and_predict(synthetic_feature_df, horizon=15)
        assert result is not None
        assert "pred_final" in result
        assert "mape" in result
        assert "directional_accuracy" in result
        assert "feature_importance" in result
        assert result["model_name"] == "xgboost"
        assert result["horizon_days"] == 15

    def test_pred_is_reasonable(self, synthetic_feature_df):
        """Prediction should be within 20% of last price."""
        from ml_models.xgboost_model_v2 import train_and_predict
        result = train_and_predict(synthetic_feature_df, horizon=5)
        last_price = synthetic_feature_df["price"].iloc[-1]
        assert result["pred_final"] > last_price * 0.8
        assert result["pred_final"] < last_price * 1.2

    def test_walk_forward_min_folds(self, synthetic_feature_df):
        """Walk-forward must use at least 5 folds."""
        from ml_models.xgboost_model_v2 import _walk_forward_validate
        metrics = _walk_forward_validate(synthetic_feature_df, horizon=15, min_folds=5, fold_size=20)
        assert len(metrics["fold_mapes"]) >= 5

    def test_handles_all_horizons(self, synthetic_feature_df):
        """Must work for 5, 15, and 30 day horizons."""
        from ml_models.xgboost_model_v2 import train_and_predict
        for h in [5, 15, 30]:
            result = train_and_predict(synthetic_feature_df, horizon=h)
            assert result is not None
            assert result["horizon_days"] == h
