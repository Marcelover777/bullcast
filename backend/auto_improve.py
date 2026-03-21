# backend/auto_improve.py
"""
Weekly auto-improvement — backtesting + performance monitoring.
Runs Sunday 10:00 BRT via Railway Cron (0 13 * * 0).
"""
import logging
from datetime import date, timedelta

import numpy as np

from supabase_client import get_client, upsert

logger = logging.getLogger(__name__)


def run_auto_improve():
    """Weekly backtesting + performance tracking."""
    logger.info("=== Auto-improve started — %s ===", date.today())
    client = get_client()

    # 1. Fetch predictions vs actuals (90 day window)
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
        })

        logger.info("Model %s %dd: MAPE=%.2f%% DirAcc=%.1f%%",
                     model_name, horizon, mape, dir_acc * 100)

    # 3. Persist performance
    if perf_rows:
        upsert("model_performance", perf_rows, ["date", "model_name", "horizon_days"])

    # 4. Alert if accuracy degraded
    for row in perf_rows:
        if row["mape"] > 10:
            logger.warning("ALERTA: %s %dd MAPE=%.1f%% — acima do threshold",
                          row["model_name"], row["horizon_days"], row["mape"])

    logger.info("=== Auto-improve concluido ===")


if __name__ == "__main__":
    import sys
    sys.path.insert(0, ".")
    logging.basicConfig(level=logging.INFO,
                       format="%(asctime)s %(levelname)s %(name)s — %(message)s")
    run_auto_improve()
