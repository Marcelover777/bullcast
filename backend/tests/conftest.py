# backend/tests/conftest.py
"""Shared fixtures for ML v2 tests."""
import numpy as np
import pandas as pd
import pytest
from datetime import date, timedelta


@pytest.fixture
def synthetic_spot_prices():
    """600 days of synthetic spot prices with trend + seasonality + noise."""
    np.random.seed(42)
    n = 600
    dates = pd.date_range(end=date.today(), periods=n, freq="B")
    trend = np.linspace(280, 320, n)
    seasonal = 10 * np.sin(np.arange(n) * 2 * np.pi / 252)
    noise = np.random.normal(0, 3, n)
    prices = trend + seasonal + noise

    return pd.DataFrame({
        "date": dates,
        "price_per_arroba": np.round(prices, 2),
        "state": "SP",
    }).set_index("date")


@pytest.fixture
def synthetic_feature_df(synthetic_spot_prices):
    """DataFrame with 35+ features built from synthetic data."""
    df = synthetic_spot_prices.copy()
    p = df["price_per_arroba"]

    # Price momentum
    df["price"] = p
    for lag in [1, 5, 15, 30]:
        df[f"lag_{lag}"] = p.shift(lag)
    for w in [7, 21, 50]:
        df[f"roll_{w}"] = p.rolling(w).mean()
    for d in [1, 5, 15]:
        df[f"return_{d}d"] = p.pct_change(d)
    df["seasonal_adj_momentum"] = p.pct_change(21) - p.pct_change(252).rolling(21).mean()
    df["volatility_21d"] = p.pct_change().rolling(21).std()

    # Technical (synthetic)
    np.random.seed(42)
    df["rsi_14"] = 50 + np.random.normal(0, 15, len(df))
    df["macd_hist"] = np.random.normal(0, 2, len(df))
    df["bb_width"] = np.abs(np.random.normal(10, 3, len(df)))
    df["bb_position"] = np.random.uniform(0, 1, len(df))
    df["sma_cross_9_21"] = np.random.choice([0, 1], len(df))
    df["ema_cross_9_21"] = np.random.choice([0, 1], len(df))

    # Fundamental
    df["basis"] = np.random.normal(3, 5, len(df))
    df["basis_zscore"] = np.random.normal(0, 1, len(df))
    df["cycle_phase_encoded"] = np.random.choice([0, 1, 2], len(df))
    df["female_pct_real"] = np.random.normal(47, 3, len(df))
    df["seasonal_avg_pct"] = np.random.normal(2, 3, len(df))
    df["trade_ratio_bezerro"] = np.random.normal(1.5, 0.3, len(df))
    df["supply_pressure"] = np.random.normal(50, 15, len(df))

    # Macro cross
    df["usd_brl"] = np.random.normal(5.5, 0.5, len(df))
    df["usd_brl_return_5d"] = np.random.normal(0, 0.02, len(df))
    df["selic_rate"] = 13.75
    df["cross_milho_boi"] = np.random.normal(4.5, 0.5, len(df))
    df["cross_cambio_boi_corr21d"] = np.random.normal(0.3, 0.2, len(df))

    # Sentiment risk
    df["sentiment_score_3d"] = np.random.uniform(0, 1, len(df))
    df["news_volume_3d"] = np.random.randint(0, 20, len(df))
    df["china_risk_score"] = np.random.uniform(0, 100, len(df))
    df["crisis_active"] = 0

    # Climate pasture
    df["ndvi_pasture_mt"] = np.random.normal(0.65, 0.1, len(df))
    df["fire_hotspots_total"] = np.random.randint(0, 100, len(df))
    df["precip_anomaly"] = np.random.normal(0, 20, len(df))
    df["temp_stress"] = np.random.uniform(0, 1, len(df))

    # Futures market
    df["futures_term_structure"] = np.random.normal(0, 3, len(df))
    df["futures_volume"] = np.random.randint(1000, 10000, len(df))
    df["countdown_cota_china"] = np.random.randint(0, 365, len(df))

    # Drop the original price_per_arroba to avoid confusion
    df = df.drop(columns=["price_per_arroba"])

    return df.dropna()


@pytest.fixture
def mock_supabase(monkeypatch):
    """Patches supabase_client.get_client to return a mock."""
    from unittest.mock import MagicMock
    mock_client = MagicMock()
    monkeypatch.setattr("supabase_client.get_client", lambda: mock_client)
    monkeypatch.setattr("supabase_client.upsert", lambda *a, **kw: None)
    monkeypatch.setattr("supabase_client.insert", lambda *a, **kw: None)
    return mock_client
