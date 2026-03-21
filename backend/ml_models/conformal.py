# backend/ml_models/conformal.py
"""
Conformal Prediction — residual-based intervals.
90% coverage target. Cold-start fallback: ±3% heuristic.
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
    alpha: float = 0.1,
) -> tuple[float, float]:
    """
    Get prediction interval. Uses conformal if enough residuals,
    otherwise ±3% heuristic.
    """
    if residuals is not None and len(residuals) >= MIN_RESIDUALS:
        return calibrate_interval(residuals, prediction, alpha)

    # Cold-start: ±3% heuristic
    margin = prediction * 0.03
    return (round(prediction - margin, 2), round(prediction + margin, 2))
