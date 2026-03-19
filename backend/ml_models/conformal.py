# backend/ml_models/conformal.py
"""
Conformal Prediction — residual-based intervals on ensemble output.
90% coverage target. Cold-start fallback: TFT quantiles.
"""
import logging

import numpy as np

logger = logging.getLogger(__name__)

MIN_RESIDUALS = 90  # minimum calibration set size


def calibrate_interval(
    residuals: np.ndarray,
    new_prediction: float,
    alpha: float = 0.1,
) -> tuple[float, float]:
    """
    Conformal interval from residuals (actual - prediction).
    q_lower typically negative, q_upper typically positive.
    Returns (pred + q_lower, pred + q_upper).
    """
    q_lower = np.quantile(residuals, alpha / 2)
    q_upper = np.quantile(residuals, 1 - alpha / 2)
    return (
        round(new_prediction + q_lower, 2),
        round(new_prediction + q_upper, 2),
    )


def get_interval(
    residuals: np.ndarray | None,
    prediction: float,
    tft_quantile_05: float = 0.0,
    tft_quantile_95: float = 0.0,
    alpha: float = 0.1,
) -> tuple[float, float]:
    """
    Get prediction interval. Uses conformal if enough residuals,
    otherwise falls back to TFT quantiles.
    """
    if residuals is not None and len(residuals) >= MIN_RESIDUALS:
        return calibrate_interval(residuals, prediction, alpha)

    # Cold-start: use TFT quantiles
    if tft_quantile_05 != 0 and tft_quantile_95 != 0:
        logger.info("Conformal cold-start: usando quantis TFT")
        return (round(tft_quantile_05, 2), round(tft_quantile_95, 2))

    # Last resort: ±3% heuristic
    margin = prediction * 0.03
    return (round(prediction - margin, 2), round(prediction + margin, 2))
