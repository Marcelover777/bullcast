# backend/ml_models/ensemble.py
"""
Ensemble v2 — orchestrates 3 models + meta-learner + conformal prediction.
Supports v1/v2 parallel mode via USE_ML_V2 env var.
"""
import logging
import os
from datetime import date, datetime, timedelta

import numpy as np
import pandas as pd

from . import xgboost_model_v2, lightgbm_model, tft_model
from . import xgboost_model as xgboost_model_v1  # v1 kept for parallel period
from .meta_learner import combine_predictions, load_from_supabase as load_meta_learner
from .conformal import get_interval
from supabase_client import get_client, insert, upsert

logger = logging.getLogger(__name__)

HORIZONS = [5, 15, 30]


def _get_residuals(client, horizon: int) -> np.ndarray | None:
    """Fetch historical residuals for conformal prediction."""
    try:
        resp = (client.table("model_performance")
                .select("date,mape")
                .eq("model_name", "v2_ensemble")
                .eq("horizon_days", horizon)
                .order("date", desc=True)
                .limit(200)
                .execute())
        if not resp.data or len(resp.data) < 90:
            return None

        # Reconstruct residuals from ensemble predictions vs actuals
        pred_resp = (client.table("model_predictions_raw")
                     .select("date,pred_value")
                     .eq("model_name", "v2_ensemble")
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
            # Compare prediction on date D with actual on date D + horizon days
            pred_date = datetime.strptime(d, "%Y-%m-%d").date()
            actual_date = str(pred_date + timedelta(days=horizon))
            if actual_date in actuals:
                residuals.append(actuals[actual_date] - pred)

        return np.array(residuals) if len(residuals) >= 90 else None
    except Exception as exc:
        logger.warning("Erro buscando residuals: %s", exc)
        return None


def run_ensemble_v2(df: pd.DataFrame) -> list[dict]:
    """
    Run v2 ensemble: 3 models → meta-learner → conformal.
    Returns list of prediction rows per horizon.
    """
    client = get_client()
    meta_model = load_meta_learner()
    today_str = str(date.today())
    rows = []
    raw_predictions = []

    for horizon in HORIZONS:
        model_preds = {}
        model_results = {}

        # Run each model
        for name, module in [("xgboost", xgboost_model_v2),
                              ("lightgbm", lightgbm_model),
                              ("tft", tft_model)]:
            try:
                result = module.train_and_predict(df, horizon)
                if result:
                    model_preds[name] = result["pred_final"]
                    model_results[name] = result
                    # Store individual predictions
                    raw_predictions.append({
                        "date": today_str,
                        "model_name": f"v2_{name}",
                        "horizon_days": horizon,
                        "pred_value": result["pred_final"],
                    })
            except Exception as exc:
                logger.error("Modelo %s %dd falhou: %s", name, horizon, exc)

        if not model_preds:
            logger.error("Nenhum modelo v2 retornou para horizon=%d", horizon)
            continue

        # Meta-learner combination
        mapes = {k: v["mape"] for k, v in model_results.items()}
        dir_accs = {k: v["directional_accuracy"] for k, v in model_results.items()}
        ensemble_pred = combine_predictions(model_preds, meta_model, mapes, dir_accs)

        # Conformal interval
        residuals = _get_residuals(client, horizon)
        tft_result = model_results.get("tft", {})
        tft_q05 = tft_result.get("_quantile_05", 0)
        tft_q95 = tft_result.get("_quantile_95", 0)
        interval_lower, interval_upper = get_interval(
            residuals, ensemble_pred, tft_q05, tft_q95
        )

        # Store ensemble prediction
        raw_predictions.append({
            "date": today_str,
            "model_name": "v2_ensemble",
            "horizon_days": horizon,
            "pred_value": ensemble_pred,
        })

        # Average metrics from available models
        avg_mape = np.mean([r["mape"] for r in model_results.values()])
        avg_dir = np.mean([r["directional_accuracy"] for r in model_results.values()])

        rows.append({
            "horizon_days": horizon,
            "pred_value": ensemble_pred,
            "pred_lower": interval_lower,
            "pred_upper": interval_upper,
            "confidence": round(1 - avg_mape / 100, 3),
            "model_name": "ensemble_v2",
            "mape": round(avg_mape, 4),
            "directional_accuracy": round(avg_dir, 3),
            "feature_importance": model_results.get("xgboost", {}).get("feature_importance", {}),
        })

        logger.info("Ensemble v2 %dd: pred=%.2f [%.2f, %.2f] MAPE=%.2f%%",
                     horizon, ensemble_pred, interval_lower, interval_upper, avg_mape)

    # Persist raw predictions (for meta-learner training)
    if raw_predictions:
        upsert("model_predictions_raw", raw_predictions, ["date", "model_name", "horizon_days"])

    # Persist ensemble predictions (for signal generator)
    if rows:
        insert("ml_predictions", rows)
        logger.info("Inseridos %d registros ml_predictions (v2)", len(rows))

    return rows


def run_ensemble() -> None:
    """
    Main entry point. Runs v2 if USE_ML_V2=true, otherwise v1.
    During parallel period, runs both.
    """
    use_v2 = os.environ.get("USE_ML_V2", "false").lower() == "true"
    parallel = os.environ.get("ML_PARALLEL_MODE", "false").lower() == "true"

    if parallel:
        # Run v1 for production signal + v2 for comparison
        logger.info("Modo paralelo: rodando v1 + v2")
        _run_v1_ensemble()

        try:
            from feature_store import build_features
            df = build_features()
            run_ensemble_v2(df)
        except Exception as exc:
            logger.error("Ensemble v2 (paralelo) falhou: %s", exc)

    elif use_v2:
        from feature_store import build_features
        df = build_features()
        run_ensemble_v2(df)

    else:
        _run_v1_ensemble()


def _run_v1_ensemble() -> None:
    """Original v1 ensemble — kept for parallel period.
    Uses xgboost_model_v1 (the ORIGINAL file, not v2) + prophet + sarima.
    """
    from . import prophet_model, sarima_model

    client = get_client()
    resp = (client.table("spot_prices")
            .select("date,price_per_arroba")
            .eq("state", "SP")
            .order("date", desc=False)
            .limit(600)
            .execute())

    if not resp.data or len(resp.data) < 60:
        logger.error("Histórico insuficiente para ML v1 (%d rows)", len(resp.data or []))
        return

    df = pd.DataFrame(resp.data)
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").sort_index()

    WEIGHTS = {"xgboost": 0.5, "prophet": 0.3, "sarima": 0.2}
    rows = []

    for horizon in HORIZONS:
        results = {}
        total_weight = 0.0
        weighted_pred = 0.0
        weighted_lower = 0.0
        weighted_upper = 0.0

        for name, module, w in [
            ("xgboost", xgboost_model_v1, WEIGHTS["xgboost"]),
            ("prophet", prophet_model, WEIGHTS["prophet"]),
            ("sarima", sarima_model, WEIGHTS["sarima"]),
        ]:
            try:
                result = module.train_and_predict(df, horizon)
                if result:
                    results[name] = result
                    weighted_pred += result["pred_value"] * w
                    weighted_lower += result["pred_lower"] * w
                    weighted_upper += result["pred_upper"] * w
                    total_weight += w
            except Exception as exc:
                logger.error("v1 %s %dd falhou: %s", name, horizon, exc)

        if total_weight == 0:
            continue

        pred_value = round(weighted_pred / total_weight, 2)
        pred_lower = round(weighted_lower / total_weight, 2)
        pred_upper = round(weighted_upper / total_weight, 2)
        mapes = [r["mape"] for r in results.values()]
        avg_mape = round(sum(mapes) / len(mapes), 4)

        rows.append({
            "horizon_days": horizon,
            "pred_value": pred_value,
            "pred_lower": pred_lower,
            "pred_upper": pred_upper,
            "confidence": round(1 - avg_mape, 3),
            "model_name": "ensemble",
            "mape": avg_mape,
            "directional_accuracy": round(
                sum(r.get("directional_accuracy", 0) for r in results.values()) / len(results), 3
            ),
            "feature_importance": results.get("xgboost", {}).get("feature_importance", {}),
        })

    if rows:
        insert("ml_predictions", rows)
        logger.info("Inseridos %d registros ml_predictions (v1)", len(rows))
