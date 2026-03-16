# backend/analysis/fundamental.py
"""
Calcula indicadores fundamentalistas:
  - Basis (futuro 1o vcto - spot SP)
  - Fase do ciclo pecuário (% fêmeas)
  - Sazonalidade histórica por mês
  - Relações de troca (boi/bezerro, boi/milho)
"""
import logging
from datetime import date

import pandas as pd

from supabase_client import get_client, upsert

logger = logging.getLogger(__name__)

# Sazonalidade histórica média (% variação mensal, baseado em dados CEPEA 2010-2024)
SEASONAL_AVG = {
    1: -1.2, 2: -0.8, 3: 0.5, 4: 1.2, 5: 2.1,
    6: 3.4, 7: 4.2, 8: 4.8, 9: 5.1, 10: 2.3,
    11: 0.8, 12: -0.5,
}


def compute_fundamental_indicators() -> None:
    client = get_client()
    today = date.today()

    # 1. Basis
    spot_resp = (client.table("spot_prices")
                 .select("price_per_arroba")
                 .eq("state", "SP")
                 .order("date", desc=True)
                 .limit(1)
                 .execute())
    spot_price = float(spot_resp.data[0]["price_per_arroba"]) if spot_resp.data else 0

    fut_resp = (client.table("futures_prices")
                .select("settle_price")
                .order("maturity_date", desc=False)
                .order("date", desc=True)
                .limit(1)
                .execute())
    fut_price = float(fut_resp.data[0]["settle_price"]) if fut_resp.data else 0

    basis = round(fut_price - spot_price, 2)

    # 2. Ciclo pecuário (mock até dados IBGE disponíveis)
    # % fêmeas em ~47% = retenção = RETENCAO
    female_pct = 47.0
    if female_pct > 52:
        cycle_phase = "LIQUIDACAO"
    elif female_pct < 48:
        cycle_phase = "RETENCAO"
    else:
        cycle_phase = "NEUTRO"

    # 3. Sazonalidade
    seasonal_avg_pct = SEASONAL_AVG.get(today.month, 0)

    # 4. Relações de troca
    cat_resp = (client.table("cattle_categories")
                .select("category,price_per_kg,weight_min,weight_max")
                .in_("category", ["Boi Gordo", "Bezerro"])
                .order("date", desc=True)
                .limit(4)
                .execute())

    boi_price = next((r["price_per_kg"] * ((r["weight_min"] + r["weight_max"]) / 2)
                      for r in cat_resp.data if r["category"] == "Boi Gordo"), 0)
    bez_price = next((r["price_per_kg"] * ((r["weight_min"] + r["weight_max"]) / 2)
                      for r in cat_resp.data if r["category"] == "Bezerro"), 1)

    trade_ratio_bezerro = round(boi_price / bez_price, 3) if bez_price else 0
    trade_ratio_milho = round(spot_price / 72.5, 3)  # R$72.50/sc milho ref.

    row = {
        "date": str(today),
        "basis": basis,
        "cycle_phase": cycle_phase,
        "female_percent_smooth": female_pct,
        "seasonal_avg_pct": seasonal_avg_pct,
        "trade_ratio_bezerro": trade_ratio_bezerro,
        "trade_ratio_milho": trade_ratio_milho,
    }

    upsert("fundamental_indicators", [row], ["date"])
    logger.info(
        "Fundamental: basis=%.2f ciclo=%s sazonal=%.1f%% troca_bez=%.2f",
        basis, cycle_phase, seasonal_avg_pct, trade_ratio_bezerro,
    )
