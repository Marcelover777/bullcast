# backend/ml_models/ensemble.py
"""
Ensemble ponderado: 0.5×XGBoost + 0.3×Prophet + 0.2×SARIMA
Fallback: média simples se algum modelo falhar.
"""
import logging
from datetime import date

import pandas as pd

from . import xgboost_model, prophet_model
from ..supabase_client import get_client, insert

logger = logging.getLogger(__name__)

WEIGHTS = {"xgboost": 0.5, "prophet": 0.3}


def run_ensemble() -> None:
    """Executa os modelos e salva previsões no Supabase."""
    client = get_client()

    # Busca histórico spot SP
    resp = (client.table("spot_prices")
            .select("date,price_per_arroba")
            .eq("state", "SP")
            .order("date", desc=False)
            .limit(600)
            .execute())

    if not resp.data or len(resp.data) < 60:
        logger.error("Histórico insuficiente para ML (%d rows)", len(resp.data or []))
        return

    df = pd.DataFrame(resp.data)
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").sort_index()

    rows = []
    for horizon in [5, 15, 30]:
        results = {}
        total_weight = 0.0
        weighted_pred = 0.0
        weighted_lower = 0.0
        weighted_upper = 0.0

        try:
            xgb_result = xgboost_model.train_and_predict(df, horizon)
            if xgb_result:
                results["xgboost"] = xgb_result
                w = WEIGHTS["xgboost"]
                weighted_pred  += xgb_result["pred_value"] * w
                weighted_lower += xgb_result["pred_lower"] * w
                weighted_upper += xgb_result["pred_upper"] * w
                total_weight += w
        except Exception as exc:
            logger.error("XGBoost %dd falhou: %s", horizon, exc)

        try:
            prop_result = prophet_model.train_and_predict(df, horizon)
            if prop_result:
                results["prophet"] = prop_result
                w = WEIGHTS["prophet"]
                weighted_pred  += prop_result["pred_value"] * w
                weighted_lower += prop_result["pred_lower"] * w
                weighted_upper += prop_result["pred_upper"] * w
                total_weight += w
        except Exception as exc:
            logger.error("Prophet %dd falhou: %s", horizon, exc)

        if total_weight == 0:
            logger.error("Nenhum modelo retornou para horizon=%d", horizon)
            continue

        # Normaliza pelo peso total efetivo
        pred_value = round(weighted_pred  / total_weight, 2)
        pred_lower = round(weighted_lower / total_weight, 2)
        pred_upper = round(weighted_upper / total_weight, 2)

        # Média de MAPE dos modelos disponíveis
        mapes = [r["mape"] for r in results.values()]
        avg_mape = round(sum(mapes) / len(mapes), 4)
        confidence = round(1 - avg_mape, 3)

        # Feature importance do XGBoost (se disponível)
        feat_importance = results.get("xgboost", {}).get("feature_importance", {})

        rows.append({
            "horizon_days":          horizon,
            "pred_value":            pred_value,
            "pred_lower":            pred_lower,
            "pred_upper":            pred_upper,
            "confidence":            confidence,
            "model_name":            "ensemble",
            "mape":                  avg_mape,
            "directional_accuracy":  round(
                sum(r.get("directional_accuracy", 0) for r in results.values()) / len(results), 3
            ),
            "feature_importance":    feat_importance,
        })

        logger.info("Ensemble %dd: pred=%.2f [%.2f, %.2f] confiança=%.1f%%",
                    horizon, pred_value, pred_lower, pred_upper, confidence * 100)

    if rows:
        # insert() puro — ml_predictions não tem UNIQUE, cada run diário cria nova série.
        # Usar insert(), nunca upsert() com lista vazia de conflict_columns.
        insert("ml_predictions", rows)
        logger.info("Inseridos %d registros ml_predictions", len(rows))
