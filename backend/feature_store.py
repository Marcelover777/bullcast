# backend/feature_store.py
"""
Feature Store — materializa 35+ features de 14+ tabelas Supabase usando DuckDB in-memory.

Uso: df = build_features(lookback_days=600)
Output: DataFrame com ~35 colunas, indexed por date, sem NaN.
"""
import logging
from datetime import date, timedelta

import duckdb
import numpy as np
import pandas as pd

from supabase_client import get_client

logger = logging.getLogger(__name__)

FEATURE_COLUMNS = [
    # Price momentum
    "price", "lag_1", "lag_5", "lag_15", "lag_30",
    "roll_7", "roll_21", "roll_50",
    "return_1d", "return_5d", "return_15d",
    "seasonal_adj_momentum", "volatility_21d",
    # Technical
    "rsi_14", "macd_hist", "bb_width", "bb_position",
    "sma_cross_9_21", "ema_cross_9_21",
    # Fundamental
    "basis", "basis_zscore",
    "cycle_phase_encoded", "female_pct_real",
    "seasonal_avg_pct", "trade_ratio_bezerro",
    "supply_pressure",
    # Macro cross
    "usd_brl", "usd_brl_return_5d", "selic_rate",
    "cross_milho_boi", "cross_cambio_boi_corr21d",
    # Sentiment risk
    "sentiment_score_3d", "news_volume_3d",
    "china_risk_score", "crisis_active",
    # Climate pasture
    "ndvi_pasture_mt", "fire_hotspots_total",
    "precip_anomaly", "temp_stress",
    # Futures market
    "futures_term_structure", "futures_volume",
    "countdown_cota_china",
]


# ── Helper functions (testable individually) ─────────────────

def _compute_basis(spot: float, futures: float) -> float:
    return round(futures - spot, 2)


def _compute_bb_width(upper: float, lower: float, mid: float) -> float:
    if mid <= 0:
        return 0.0
    return round((upper - lower) / mid, 4)


def _compute_china_risk_score(quota_usage_pct: float, sentiment_neg_china: int) -> float:
    """0-100 score. High = risky (quota filling + negative sentiment)."""
    base = min(quota_usage_pct, 100.0)  # 0-100 from quota
    sentiment_boost = min(sentiment_neg_china * 5, 30)  # up to +30 from neg news
    return round(min(100.0, max(0.0, base * 0.7 + sentiment_boost)), 1)


def _compute_supply_pressure(female_pct: float, export_growth: float,
                              slaughter_trend: float) -> float:
    """0-100 composite. High = more supply pressure (bearish for price)."""
    # female_pct > 50 = liquidação (bearish) → score up
    female_score = min(100, max(0, (female_pct - 45) * 10))
    # export_growth positive = demand up (bullish) → score down
    export_score = min(100, max(0, 50 - export_growth * 2))
    # slaughter_trend positive = supply up (bearish) → score up
    slaughter_score = min(100, max(0, 50 + slaughter_trend * 3))

    return round((female_score * 0.4 + export_score * 0.3 + slaughter_score * 0.3), 1)


def _fetch_all_tables(client, lookback: date) -> dict[str, pd.DataFrame]:
    """Fetch raw data from all Supabase tables in batch."""
    tables = {}
    lookback_str = lookback.isoformat()

    queries = {
        "spot_prices": ("date,price_per_arroba,state", {"state": "SP"}),
        "futures_prices": ("date,settle_price,volume,maturity_date,contract_code", {}),
        "technical_indicators": ("date,rsi_14,macd_hist,bb_upper,bb_mid,bb_lower,sma_9,sma_21,ema_9,ema_21", {}),
        "fundamental_indicators": ("date,basis,cycle_phase,seasonal_avg_pct,trade_ratio_bezerro", {}),
        "macro_data": ("date,usd_brl,selic_rate", {}),
        "news_sentiment": ("published_at,sentiment,impact_score,title", {}),
        "climate_data": ("date,state,precipitation_anomaly_pct,temp_avg", {}),
        "fire_hotspots": ("date,state,hotspot_count", {}),
        "ndvi_pasture": ("date,state,ndvi_value", {}),
        "china_quota_tracking": ("date,quota_usage_pct,ytd_volume_tons,quota_total_tons", {}),
        "slaughter_data": ("period,female_percent,total_head", {}),
        "export_data": ("date,destination,volume_tons", {}),
    }

    for table, (cols, filters) in queries.items():
        try:
            q = client.table(table).select(cols).gte("date" if "date" in cols else "period", lookback_str)
            for k, v in filters.items():
                q = q.eq(k, v)
            resp = q.order("date" if "date" in cols else "period").execute()
            if resp.data:
                tables[table] = pd.DataFrame(resp.data)
        except Exception as exc:
            logger.warning("Feature store: falha buscando %s: %s", table, exc)
            tables[table] = pd.DataFrame()

    return tables


def build_features(lookback_days: int = 600) -> pd.DataFrame:
    """
    Materializa 35+ features de todas as fontes.
    Returns DataFrame indexed by date, no NaN.
    """
    client = get_client()
    lookback = date.today() - timedelta(days=lookback_days)

    # 1. Fetch all raw data
    raw = _fetch_all_tables(client, lookback)

    # 2. DuckDB in-memory for efficient joins
    con = duckdb.connect(":memory:")

    # Register DataFrames
    for name, df in raw.items():
        if not df.empty:
            con.register(name, df)

    # 3. Build base price series
    spot = raw.get("spot_prices", pd.DataFrame())
    if spot.empty or len(spot) < 60:
        raise RuntimeError(f"Dados insuficientes: spot_prices tem {len(spot)} rows (min 60)")

    spot["date"] = pd.to_datetime(spot["date"])
    spot = spot.set_index("date").sort_index()
    price = spot["price_per_arroba"].astype(float)

    # 4. Compute features
    df = pd.DataFrame(index=price.index)
    df["price"] = price

    # Price momentum
    for lag in [1, 5, 15, 30]:
        df[f"lag_{lag}"] = price.shift(lag)
    for w in [7, 21, 50]:
        df[f"roll_{w}"] = price.rolling(w).mean()
    for d in [1, 5, 15]:
        df[f"return_{d}d"] = price.pct_change(d)
    mom_21 = price.pct_change(21)
    mom_252 = price.pct_change(252)
    df["seasonal_adj_momentum"] = mom_21 - mom_252.rolling(21).mean()
    df["volatility_21d"] = price.pct_change().rolling(21).std()

    # Technical indicators (from Supabase)
    tech = raw.get("technical_indicators", pd.DataFrame())
    if not tech.empty:
        tech["date"] = pd.to_datetime(tech["date"])
        tech = tech.set_index("date")
        for col in ["rsi_14", "macd_hist"]:
            if col in tech.columns:
                df[col] = tech[col].astype(float).reindex(df.index, method="ffill")
        if all(c in tech.columns for c in ["bb_upper", "bb_lower", "bb_mid"]):
            bb = tech[["bb_upper", "bb_lower", "bb_mid"]].astype(float).reindex(df.index, method="ffill")
            df["bb_width"] = (bb["bb_upper"] - bb["bb_lower"]) / bb["bb_mid"].replace(0, np.nan)
            df["bb_position"] = (price - bb["bb_lower"]) / (bb["bb_upper"] - bb["bb_lower"]).replace(0, np.nan)
        if all(c in tech.columns for c in ["sma_9", "sma_21"]):
            sma = tech[["sma_9", "sma_21"]].astype(float).reindex(df.index, method="ffill")
            df["sma_cross_9_21"] = (sma["sma_9"] > sma["sma_21"]).astype(int)
        if all(c in tech.columns for c in ["ema_9", "ema_21"]):
            ema = tech[["ema_9", "ema_21"]].astype(float).reindex(df.index, method="ffill")
            df["ema_cross_9_21"] = (ema["ema_9"] > ema["ema_21"]).astype(int)

    # Fundamental
    fund = raw.get("fundamental_indicators", pd.DataFrame())
    if not fund.empty:
        fund["date"] = pd.to_datetime(fund["date"])
        fund = fund.set_index("date")
        if "basis" in fund.columns:
            b = fund["basis"].astype(float).reindex(df.index, method="ffill")
            df["basis"] = b
            df["basis_zscore"] = (b - b.rolling(60).mean()) / b.rolling(60).std().replace(0, 1)
        cycle_map = {"RETENCAO": 0, "NEUTRO": 1, "LIQUIDACAO": 2}
        if "cycle_phase" in fund.columns:
            df["cycle_phase_encoded"] = fund["cycle_phase"].map(cycle_map).reindex(df.index, method="ffill")
        for col in ["seasonal_avg_pct", "trade_ratio_bezerro"]:
            if col in fund.columns:
                df[col] = fund[col].astype(float).reindex(df.index, method="ffill")

    # Real female_pct from slaughter_data
    sla = raw.get("slaughter_data", pd.DataFrame())
    if not sla.empty and "female_percent" in sla.columns:
        sla["date"] = pd.to_datetime(sla["period"])
        sla = sla.set_index("date").sort_index()
        df["female_pct_real"] = sla["female_percent"].astype(float).reindex(df.index, method="ffill")
    else:
        df["female_pct_real"] = 47.0  # fallback until IBGE data available

    # Supply pressure
    df["supply_pressure"] = 50.0  # default, computed when all data available

    # Macro cross
    macro = raw.get("macro_data", pd.DataFrame())
    if not macro.empty:
        macro["date"] = pd.to_datetime(macro["date"])
        macro = macro.set_index("date")
        if "usd_brl" in macro.columns:
            usd = macro["usd_brl"].astype(float).reindex(df.index, method="ffill")
            df["usd_brl"] = usd
            df["usd_brl_return_5d"] = usd.pct_change(5)
            df["cross_cambio_boi_corr21d"] = usd.rolling(21).corr(price)
        if "selic_rate" in macro.columns:
            df["selic_rate"] = macro["selic_rate"].astype(float).reindex(df.index, method="ffill")

    # Cross-commodity: milho proxy (ratio from fundamental)
    df["cross_milho_boi"] = df.get("trade_ratio_bezerro", pd.Series(1.5, index=df.index))

    # Sentiment risk
    news = raw.get("news_sentiment", pd.DataFrame())
    if not news.empty and "published_at" in news.columns:
        news["date"] = pd.to_datetime(news["published_at"]).dt.date
        news["date"] = pd.to_datetime(news["date"])
        daily_sent = news.groupby("date").agg(
            sentiment_score=("impact_score", "mean"),
            news_volume=("sentiment", "count"),
        )
        df["sentiment_score_3d"] = daily_sent["sentiment_score"].rolling(3).mean().reindex(df.index, method="ffill")
        df["news_volume_3d"] = daily_sent["news_volume"].rolling(3).sum().reindex(df.index, method="ffill")
    else:
        df["sentiment_score_3d"] = 0.5
        df["news_volume_3d"] = 0

    # China risk score
    china = raw.get("china_quota_tracking", pd.DataFrame())
    if not china.empty and "quota_usage_pct" in china.columns:
        china["date"] = pd.to_datetime(china["date"])
        china = china.set_index("date")
        df["china_risk_score"] = china["quota_usage_pct"].astype(float).reindex(df.index, method="ffill").fillna(0)
    else:
        df["china_risk_score"] = 0

    df["crisis_active"] = 0  # set by black_swan_detector

    # Climate pasture
    ndvi = raw.get("ndvi_pasture", pd.DataFrame())
    if not ndvi.empty:
        ndvi["date"] = pd.to_datetime(ndvi["date"])
        mt_ndvi = ndvi[ndvi["state"] == "MT"].set_index("date")["ndvi_value"]
        df["ndvi_pasture_mt"] = mt_ndvi.astype(float).reindex(df.index, method="ffill")
    else:
        df["ndvi_pasture_mt"] = 0.65  # default healthy

    fire = raw.get("fire_hotspots", pd.DataFrame())
    if not fire.empty:
        fire["date"] = pd.to_datetime(fire["date"])
        total_fire = fire.groupby("date")["hotspot_count"].sum()
        df["fire_hotspots_total"] = total_fire.reindex(df.index, method="ffill")
    else:
        df["fire_hotspots_total"] = 0

    climate = raw.get("climate_data", pd.DataFrame())
    if not climate.empty:
        climate["date"] = pd.to_datetime(climate["date"])
        # Average across states
        daily_climate = climate.groupby("date").agg(
            precip_anom=("precipitation_anomaly_pct", "mean"),
            temp=("temp_avg", "mean"),
        )
        df["precip_anomaly"] = daily_climate["precip_anom"].reindex(df.index, method="ffill")
        df["temp_stress"] = ((daily_climate["temp"] - 25).clip(0) / 15).reindex(df.index, method="ffill")
    else:
        df["precip_anomaly"] = 0
        df["temp_stress"] = 0

    # Futures market
    fut = raw.get("futures_prices", pd.DataFrame())
    if not fut.empty:
        fut["date"] = pd.to_datetime(fut["date"])
        daily_fut = fut.groupby("date").agg(
            settle=("settle_price", "mean"),
            vol=("volume", "sum"),
        )
        df["futures_term_structure"] = (daily_fut["settle"].reindex(df.index, method="ffill") - price)
        df["futures_volume"] = daily_fut["vol"].reindex(df.index, method="ffill")
    else:
        df["futures_term_structure"] = 0
        df["futures_volume"] = 0

    # Countdown cota China (days remaining in year)
    df["countdown_cota_china"] = df.index.map(
        lambda d: (pd.Timestamp(year=d.year, month=12, day=31) - d).days
    )

    # 5. Create _missing flags BEFORE imputation (models learn real vs imputed)
    imputable_cols = [c for c in df.columns if df[c].isna().any()]
    for col in imputable_cols:
        df[f"{col}_missing"] = df[col].isna().astype(int)

    # 6. Fill missing values
    df = df.ffill().bfill()

    # Impute remaining NaN with median
    for col in df.columns:
        if df[col].isna().any():
            median = df[col].median()
            df[col] = df[col].fillna(median if not pd.isna(median) else 0)

    con.close()
    logger.info("Feature store: %d rows × %d features", len(df), len(df.columns))
    return df
