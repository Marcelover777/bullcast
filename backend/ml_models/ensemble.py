# backend/ml_models/ensemble.py
"""
Ensemble — XGBoost + conformal prediction intervals.
"""
import logging
from datetime import date, datetime, timedelta

import numpy as np
import pandas as pd

from . import xgboost_model_v2
from .conformal import get_interval
from supabase_client import get_client, insert, upsert

logger = logging.getLogger(__name__)

HORIZONS = [5, 15, 30]


def _get_residuals(client, horizon: int) -> np.ndarray | None:
    """Fetch historical residuals for conformal prediction."""
    try:
        pred_resp = (client.table("model_predictions_raw")
                     .select("date,pred_value")
                     .eq("model_name", "xgboost")
                     .eq("horizon_days", horizon)
                     .order("date", desc=True)
                     .limit(200)
                     .execute())
        spot_resp = (client.table("spot_prices")
                     .select("date,price_per_arroba")
                     .eq("state", "SP")
                     .order("date", desc=True)
                     .limit(200)
                     .execute())

        if not pred_resp.data or not spot_resp.data:
            return None

        preds = {r["date"]: float(r["pred_value"]) for r in pred_resp.data}
        actuals = {r["date"]: float(r["price_per_arroba"]) for r in spot_resp.data}

        residuals = []
        for d, pred in preds.items():
            pred_date = datetime.strptime(d, "%Y-%m-%d").date()
            actual_date = str(pred_date + timedelta(days=horizon))
            if actual_date in actuals:
                residuals.append(actuals[actual_date] - pred)

        return np.array(residuals) if len(residuals) >= 90 else None
    except Exception as exc:
        logger.warning("Erro buscando residuals: %s", exc)
        return None


def run_ensemble(df: pd.DataFrame) -> list[dict]:
    """
    Run XGBoost for each horizon + conformal intervals.
    Returns list of prediction rows.
    """
    client = get_client()
    today_str = str(date.today())
    rows = []
    raw_predictions = []

    for horizon in HORIZONS:
        try:
            result = xgboost_model_v2.train_and_predict(df, horizon)
        except Exception as exc:
            logger.error("XGBoost %dd falhou: %s", horizon, exc)
            continue

        if not result:
            logger.error("XGBoost nao retornou para horizon=%d", horizon)
            continue

        pred = result["pred_final"]

        # Store raw prediction
        raw_predictions.append({
            "date": today_str,
            "model_name": "xgboost",
            "horizon_days": horizon,
            "pred_value": pred,
        })

        # Conformal interval
        residuals = _get_residuals(client, horizon)
        interval_lower, interval_upper = get_interval(residuals, pred)

        rows.append({
            "horizon_days": horizon,
            "pred_value": pred,
            "pred_lower": interval_lower,
            "pred_upper": interval_upper,
            "confidence": round(1 - result["mape"] / 100, 3),
            "model_name": "xgboost",
            "mape": round(result["mape"], 4),
            "directional_accuracy": round(result["directional_accuracy"], 3),
            "feature_importance": result.get("feature_importance", {}),
        })

        logger.info("XGBoost %dd: pred=%.2f [%.2f, %.2f] MAPE=%.2f%%",
                     horizon, pred, interval_lower, interval_upper, result["mape"])

    # Persist
    if raw_predictions:
        upsert("model_predictions_raw", raw_predictions, ["date", "model_name", "horizon_days"])
    if rows:
        insert("ml_predictions", rows)
        logger.info("Inseridos %d registros ml_predictions", len(rows))

    return rows


def run_pipeline() -> None:
    """Main entry point — builds features and runs ensemble."""
    from feature_store import build_features
    df = build_features()
    run_ensemble(df)
