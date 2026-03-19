# backend/tests/test_meta_learner.py
"""Tests for meta-learner (sklearn MLPRegressor)."""
import numpy as np
import pytest


class TestMetaLearner:
    def test_fallback_simple_average(self):
        """Without enough data, use simple average."""
        from ml_models.meta_learner import combine_predictions
        preds = {"xgboost": 310.0, "lightgbm": 312.0, "tft": 315.0}
        result = combine_predictions(preds, model=None)
        expected = (310.0 + 312.0 + 315.0) / 3
        assert result == pytest.approx(expected, abs=0.01)

    def test_trained_model_output(self):
        """Trained meta-learner should produce reasonable output."""
        from ml_models.meta_learner import train_meta_learner, combine_predictions
        np.random.seed(42)

        # Synthetic training data: 100 days of predictions + actuals
        n = 100
        actuals = np.random.normal(310, 10, n)
        xgb_preds = actuals + np.random.normal(0, 3, n)
        lgb_preds = actuals + np.random.normal(0, 4, n)
        tft_preds = actuals + np.random.normal(0, 2, n)  # TFT is best

        model = train_meta_learner(xgb_preds, lgb_preds, tft_preds, actuals)
        assert model is not None

        preds = {"xgboost": 310.0, "lightgbm": 312.0, "tft": 315.0}
        result = combine_predictions(preds, model=model)
        assert 300 < result < 325  # reasonable range

    def test_extracts_model_weights(self):
        """Should report approximate model contribution."""
        from ml_models.meta_learner import train_meta_learner, get_model_weights
        np.random.seed(42)
        n = 100
        actuals = np.random.normal(310, 10, n)
        xgb_preds = actuals + np.random.normal(0, 3, n)
        lgb_preds = actuals + np.random.normal(0, 4, n)
        tft_preds = actuals + np.random.normal(0, 2, n)

        model = train_meta_learner(xgb_preds, lgb_preds, tft_preds, actuals)
        weights = get_model_weights(model)
        assert "xgboost" in weights
        assert "lightgbm" in weights
        assert "tft" in weights
        assert sum(weights.values()) == pytest.approx(1.0, abs=0.01)
