# backend/tests/test_pipeline.py
"""Integration test: feature_store → ensemble → signal (mocked Supabase)."""
import os
import pytest
from unittest.mock import patch, MagicMock


@pytest.fixture
def mock_env():
    """Set required env vars for test."""
    with patch.dict(os.environ, {
        "SUPABASE_URL": "https://test.supabase.co",
        "SUPABASE_KEY": "test-key",
    }):
        yield


class TestPipeline:
    def test_ensemble_produces_predictions(self, synthetic_feature_df, mock_supabase, mock_env):
        """Ensemble should produce predictions for all horizons."""
        from ml_models.ensemble import run_ensemble
        rows = run_ensemble(synthetic_feature_df)

        assert len(rows) == 3  # 5d, 15d, 30d
        for row in rows:
            assert row["pred_value"] > 0
            assert row["pred_lower"] < row["pred_upper"]
            assert 0 <= row["confidence"] <= 1

    def test_signal_weights_sum_to_1(self):
        """Signal weights must sum to 1.0."""
        from analysis.signal_generator import WEIGHTS
        assert sum(WEIGHTS.values()) == pytest.approx(1.0)

    def test_full_pipeline_no_crash(self, synthetic_feature_df, mock_supabase, mock_env):
        """Pipeline should complete without crashing."""
        from ml_models.ensemble import run_ensemble
        rows = run_ensemble(synthetic_feature_df)
        assert rows  # non-empty
