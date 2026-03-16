# backend/analysis/climate_analyzer.py
"""
Calcula risco climático por UF baseado em desvio de precipitação.
"""
import logging
from datetime import date, timedelta

import pandas as pd

from supabase_client import get_client, upsert

logger = logging.getLogger(__name__)

# Precipitação média histórica por UF por mês (mm) — estimativa agro
HISTORICAL_PRECIP = {
    "MT": {1:280,2:240,3:210,4:110,5:50,6:8,7:5,8:15,9:55,10:140,11:200,12:260},
    "MS": {1:220,2:180,3:160,4:90,5:55,6:25,7:20,8:30,9:65,10:120,11:170,12:200},
    "GO": {1:240,2:200,3:180,4:100,5:45,6:10,7:5,8:10,9:45,10:130,11:185,12:220},
    "PA": {1:350,2:380,3:400,4:350,5:280,6:180,7:130,8:100,9:90,10:120,11:200,12:300},
    "MG": {1:190,2:160,3:140,4:80,5:40,6:15,7:10,8:15,9:45,10:100,11:150,12:180},
}


def compute_climate_risk() -> None:
    client = get_client()
    today = date.today()
    month = today.month
    start_30 = today - timedelta(days=30)

    resp = (client.table("climate_data")
            .select("state,precipitation_mm,date")
            .gte("date", str(start_30))
            .execute())

    if not resp.data:
        logger.warning("Sem dados climate_data para calcular risco")
        return

    df = pd.DataFrame(resp.data)
    updates = []

    for state, group in df.groupby("state"):
        total_prec = float(group["precipitation_mm"].sum())
        hist_prec  = HISTORICAL_PRECIP.get(state, {}).get(month, 100) * 1.0  # 1 mês

        anomaly_pct = round((total_prec - hist_prec) / hist_prec * 100, 1) if hist_prec else 0

        if anomaly_pct < -40:
            risk = "high"
            pasture = "dry"
        elif anomaly_pct < -20:
            risk = "medium"
            pasture = "regular"
        elif anomaly_pct > 50:
            risk = "medium"
            pasture = "waterlogged"
        else:
            risk = "low"
            pasture = "good"

        # Atualiza todos os registros desse estado no período
        for _, row in group.iterrows():
            updates.append({
                "date": str(row["date"]),
                "state": state,
                "precipitation_anomaly_pct": anomaly_pct,
                "risk_level": risk,
                "pasture_condition": pasture,
            })

    if updates:
        upsert("climate_data", updates, ["date", "state"])
        logger.info("Atualizado risco climático para %d registros", len(updates))
