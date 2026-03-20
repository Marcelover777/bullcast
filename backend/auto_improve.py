# backend/auto_improve.py
"""
Weekly auto-improvement job — backtesting + meta-learner retrain + monitoring.
Runs Sunday 10:00 BRT via Railway Cron (0 13 * * 0).
"""
import logging
from datetime import date, timedelta

import numpy as np

from supabase_client import get_client, upsert
from ml_models.meta_learner import (
    train_meta_learner, save_to_supabase, get_model_weights,
)

logger = logging.getLogger(__name__)


def run_auto_improve():
    """Weekly backtesting + meta-learner retrain."""
    logger.info("═══ Auto-improve started — %s ═══", date.today())
    client = get_client()
    errors = []

    # 1. Fetch predictions vs actuals
    try:
        cutoff = (date.today() - timedelta(days=90)).isoformat()

        raw_resp = (client.table("model_predictions_raw")
                    .select("date,model_name,horizon_days,pred_value")
                    .gte("date", cutoff)
                    .order("date")
                    .execute())

        spot_resp = (client.table("spot_prices")
                     .select("date,price_per_arroba")
                     .eq("state", "SP")
                     .gte("date", cutoff)
                     .order("date")
                     .execute())

        if not raw_resp.data or not spot_resp.data:
            logger.warning("Auto-improve: dados insuficientes")
            return
    except Exception as exc:
        logger.error("Auto-improve fetch falhou: %s", exc)
        return

    actuals = {r["date"]: float(r["price_per_arroba"]) for r in spot_resp.data}

    # 2. Calculate per-model metrics
    model_preds = {}
    for row in raw_resp.data:
        key = (row["model_name"], row["horizon_days"])
        if key not in model_preds:
            model_preds[key] = []
        model_preds[key].append({
            "date": row["date"],
            "pred": float(row["pred_value"]),
            "actual": actuals.get(row["date"]),
        })

    perf_rows = []
    for (model_name, horizon), entries in model_preds.items():
        valid = [e for e in entries if e["actual"] is not None]
        if not valid:
            continue

        preds = np.array([e["pred"] for e in valid])
        acts = np.array([e["actual"] for e in valid])

        mape = float(np.mean(np.abs((acts - preds) / acts)) * 100)
        dir_acc = float(np.mean(np.sign(np.diff(preds)) == np.sign(np.diff(acts)))) if len(acts) > 1 else 0.5

        perf_rows.append({
            "date": str(date.today()),
            "model_name": model_name,
            "horizon_days": horizon,
            "mape": round(mape, 4),
            "directional_accuracy": round(dir_acc, 3),
            "meta_learner_weight": 0,
        })

        logger.info("Model %s %dd: MAPE=%.2f%% DirAcc=%.1f%%",
                     model_name, horizon, mape, dir_acc * 100)

    # 3. Retrain meta-learner
    try:
        # Group by date for horizon 15
        dates_data = {}
        for row in raw_resp.data:
            if row["horizon_days"] != 15:
                continue
            d = row["date"]
            if d not in dates_data:
                dates_data[d] = {}
            dates_data[d][row["model_name"]] = float(row["pred_value"])

        # Filter dates with all 3 models + actual
        xgb_preds, lgb_preds, tft_preds, act_vals = [], [], [], []
        for d, preds in dates_data.items():
            if d not in actuals:
                continue
            xgb = preds.get("v2_xgboost")
            lgb = preds.get("v2_lightgbm")
            tft = preds.get("v2_tft")
            if all(v is not None for v in [xgb, lgb, tft]):
                xgb_preds.append(xgb)
                lgb_preds.append(lgb)
                tft_preds.append(tft)
                act_vals.append(actuals[d])

        if len(act_vals) >= 90:  # spec requires 90 days minimum
            model = train_meta_learner(
                np.array(xgb_preds), np.array(lgb_preds),
                np.array(tft_preds), np.array(act_vals),
            )
            save_to_supabase(model)
            weights = get_model_weights(model)
            logger.info("Meta-learner retreinado: %s", weights)

            # Update weights in performance rows
            for row in perf_rows:
                name = row["model_name"].replace("v2_", "")
                row["meta_learner_weight"] = weights.get(name, 0)
        else:
            logger.warning("Meta-learner: apenas %d amostras (min 90)", len(act_vals))
    except Exception as exc:
        logger.error("Meta-learner retrain falhou: %s", exc)
        errors.append(f"MetaLearner: {exc}")

    # 4. Persist performance
    if perf_rows:
        upsert("model_performance", perf_rows, ["date", "model_name", "horizon_days"])

    # 5. Alert if accuracy degraded
    for row in perf_rows:
        if row["mape"] > 10:
            logger.warning("⚠️ %s %dd MAPE=%.1f%% — acima do threshold",
                          row["model_name"], row["horizon_days"], row["mape"])

    if errors:
        logger.warning("Auto-improve com %d erros: %s", len(errors), errors)
    else:
        logger.info("═══ Auto-improve concluído ═══")


if __name__ == "__main__":
    import sys
    sys.path.insert(0, ".")
    logging.basicConfig(level=logging.INFO,
                       format="%(asctime)s %(levelname)s %(name)s — %(message)s")
    run_auto_improve()
