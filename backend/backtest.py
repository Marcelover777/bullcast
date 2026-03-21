# backend/backtest.py
"""
Walk-forward backtesting harness.
Evaluates XGBoost predictions over historical data.
Usage: python backtest.py [--days 180]
"""
import argparse
import logging
import sys
from datetime import date, timedelta

import numpy as np
import pandas as pd

sys.path.insert(0, ".")

from feature_store import build_features
from ml_models import xgboost_model_v2

logger = logging.getLogger(__name__)


def backtest(df: pd.DataFrame, test_days: int = 60) -> dict:
    """Run walk-forward backtest on XGBoost."""
    n = len(df)
    train_end = n - test_days

    results = {"dates": [], "actuals": [], "preds": []}

    for i in range(train_end, n - 15, 5):  # step every 5 days
        train_df = df.iloc[:i]
        actual_15d = df["price"].iloc[min(i + 15, n - 1)]

        xgb = xgboost_model_v2.train_and_predict(train_df, 15)
        if xgb:
            results["dates"].append(df.index[i])
            results["actuals"].append(actual_15d)
            results["preds"].append(xgb["pred_final"])

    actuals = np.array(results["actuals"])
    preds = np.array(results["preds"])

    mape = np.mean(np.abs((actuals - preds) / actuals)) * 100
    dir_acc = np.mean(np.sign(np.diff(preds)) ==
                      np.sign(np.diff(actuals))) if len(actuals) > 1 else 0

    return {
        "mape_15d": round(mape, 2),
        "directional_accuracy": round(dir_acc * 100, 1),
        "n_predictions": len(results["dates"]),
        "period": f"{results['dates'][0]} -> {results['dates'][-1]}" if results["dates"] else "N/A",
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO,
                       format="%(asctime)s %(levelname)s — %(message)s")

    parser = argparse.ArgumentParser(description="BullCast Backtester")
    parser.add_argument("--days", type=int, default=180, help="Lookback days")
    args = parser.parse_args()

    logger.info("Building features...")
    df = build_features(lookback_days=args.days + 200)

    logger.info("Running backtest...")
    metrics = backtest(df, test_days=min(60, len(df) // 4))

    logger.info("=== Backtest Results ===")
    for k, v in metrics.items():
        logger.info("  %s: %s", k, v)
