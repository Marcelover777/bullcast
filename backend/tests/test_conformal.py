# backend/tests/test_conformal.py
"""Tests for conformal prediction intervals."""
import numpy as np
import pytest

class TestConformalPrediction:
    def test_calibrate_interval_covers_prediction(self):
        """Interval must contain the prediction point."""
        from ml_models.conformal import calibrate_interval
        residuals = np.random.normal(0, 5, 200)
        lower, upper = calibrate_interval(residuals, 300.0, alpha=0.1)
        assert lower < 300.0
        assert upper > 300.0

    def test_coverage_at_90_percent(self):
        """Empirical coverage should be ~90% on synthetic data."""
        from ml_models.conformal import calibrate_interval
        np.random.seed(42)
        n_cal = 200
        n_test = 1000
        true_noise = np.random.normal(0, 5, n_cal + n_test)

        # Calibration residuals
        cal_residuals = true_noise[:n_cal]

        covered = 0
        for i in range(n_test):
            pred = 300.0
            actual = pred + true_noise[n_cal + i]
            lower, upper = calibrate_interval(cal_residuals, pred, alpha=0.1)
            if lower <= actual <= upper:
                covered += 1

        coverage = covered / n_test
        assert 0.85 <= coverage <= 0.95, f"Coverage {coverage:.2%} outside [85%, 95%]"

    def test_cold_start_fallback(self):
        """With < 90 residuals, should use TFT quantiles."""
        from ml_models.conformal import get_interval
        short_residuals = np.random.normal(0, 3, 30)  # too few
        tft_q05 = 290.0
        tft_q95 = 310.0

        lower, upper = get_interval(
            residuals=short_residuals,
            prediction=300.0,
            tft_quantile_05=tft_q05,
            tft_quantile_95=tft_q95,
        )
        assert lower == tft_q05
        assert upper == tft_q95
