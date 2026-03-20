# backend/backtest.py
"""
Walk-forward backtesting harness.
Compares v1 vs v2 ensemble over historical data.
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
from ml_models import xgboost_model_v2 as xgboost_model, lightgbm_model
from ml_models.meta_learner import combine_predictions

logger = logging.getLogger(__name__)


def backtest_v2(df: pd.DataFrame, test_days: int = 60) -> dict:
    """Run walk-forward backtest on v2 ensemble."""
    n = len(df)
    train_end = n - test_days

    results = {"dates": [], "actuals": [], "preds_xgb": [],
               "preds_lgb": [], "preds_ensemble": []}

    for i in range(train_end, n - 15, 5):  # step every 5 days
        train_df = df.iloc[:i]
        actual_15d = df["price"].iloc[min(i + 15, n - 1)]

        xgb = xgboost_model.train_and_predict(train_df, 15)
        lgb = lightgbm_model.train_and_predict(train_df, 15)

        if xgb and lgb:
            preds = {"xgboost": xgb["pred_final"], "lightgbm": lgb["pred_final"]}
            ensemble = combine_predictions(preds, model=None)  # simple avg

            results["dates"].append(df.index[i])
            results["actuals"].append(actual_15d)
            results["preds_xgb"].append(xgb["pred_final"])
            results["preds_lgb"].append(lgb["pred_final"])
            results["preds_ensemble"].append(ensemble)

    actuals = np.array(results["actuals"])
    ensemble_preds = np.array(results["preds_ensemble"])

    mape = np.mean(np.abs((actuals - ensemble_preds) / actuals)) * 100
    dir_acc = np.mean(np.sign(np.diff(ensemble_preds)) ==
                      np.sign(np.diff(actuals))) if len(actuals) > 1 else 0

    return {
        "mape_15d": round(mape, 2),
        "directional_accuracy": round(dir_acc * 100, 1),
        "n_predictions": len(results["dates"]),
        "period": f"{results['dates'][0]} → {results['dates'][-1]}" if results["dates"] else "N/A",
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO,
                       format="%(asctime)s %(levelname)s — %(message)s")

    parser = argparse.ArgumentParser(description="BullCast ML v2 Backtester")
    parser.add_argument("--days", type=int, default=180, help="Lookback days")
    args = parser.parse_args()

    logger.info("Building features...")
    df = build_features(lookback_days=args.days + 200)

    logger.info("Running backtest...")
    metrics = backtest_v2(df, test_days=min(60, len(df) // 4))

    logger.info("═══ Backtest Results ═══")
    for k, v in metrics.items():
        logger.info("  %s: %s", k, v)
