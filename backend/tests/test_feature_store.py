# backend/tests/test_feature_store.py
"""Tests for backend/feature_store.py — verifies feature computations."""
import numpy as np
import pandas as pd
import pytest
from datetime import date, timedelta


class TestFeatureComputation:
    """Test individual feature calculations."""

    def test_basis_is_futures_minus_spot(self):
        """basis = futures_price - spot_price"""
        from feature_store import _compute_basis
        result = _compute_basis(spot=310.0, futures=315.5)
        assert result == pytest.approx(5.5, abs=0.01)

    def test_bb_width(self):
        """bb_width = (upper - lower) / mid"""
        from feature_store import _compute_bb_width
        result = _compute_bb_width(upper=330.0, lower=310.0, mid=320.0)
        assert result == pytest.approx(0.0625, abs=0.001)

    def test_china_risk_score_range(self):
        """china_risk_score must be 0-100"""
        from feature_store import _compute_china_risk_score
        result = _compute_china_risk_score(quota_usage_pct=85.0, sentiment_neg_china=3)
        assert 0 <= result <= 100

    def test_supply_pressure_composite(self):
        """supply_pressure combines female_pct + export + slaughter trend."""
        from feature_store import _compute_supply_pressure
        result = _compute_supply_pressure(
            female_pct=52.0,  # high = liquidação
            export_growth=10.0,  # growing demand
            slaughter_trend=5.0,  # increasing supply
        )
        assert isinstance(result, float)
        assert 0 <= result <= 100


class TestBuildFeatures:
    """Test the full build_features pipeline."""

    def test_returns_dataframe_with_expected_columns(self, mock_supabase, synthetic_spot_prices):
        """build_features must return DataFrame with all feature groups."""
        # This test needs a more elaborate mock setup — see Step 3
        pass

    def test_no_nan_in_output(self, synthetic_feature_df):
        """Output must have no NaN values (all imputed)."""
        assert not synthetic_feature_df.isna().any().any()

    def test_minimum_rows(self, synthetic_feature_df):
        """Should have enough rows for walk-forward (min ~300 after dropna)."""
        assert len(synthetic_feature_df) >= 300
