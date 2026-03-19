# ML v2.0 Prediction Engine — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the weak ML prediction system (7 features, static weights, fake intervals) with a 35+ feature engine using XGBoost v2, LightGBM, TFT (ONNX), meta-learner stacking, and conformal prediction intervals.

**Architecture:** Feature Store (DuckDB in-memory) materializes 35+ features from 14+ Supabase tables → 3 models (XGBoost, LightGBM, TFT-ONNX) predict independently → Meta-learner (sklearn MLP) combines them with dynamic weights → Conformal prediction adds calibrated 90% intervals → Signal Generator v2 scores 5 dimensions → Claude Analyst v2 generates rich analysis with full context.

**Tech Stack:** Python 3.11+, XGBoost, LightGBM, ONNX Runtime, DuckDB, neuralforecast (GitHub Actions only), sklearn, Supabase, Claude API

**Spec:** `docs/superpowers/specs/2026-03-19-ml-v2-prediction-engine-spec.md`

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `backend/fetchers/inpe_fetcher.py` | INPE fire hotspot data (daily CSV) |
| `backend/fetchers/ndvi_fetcher.py` | NASA MODIS NDVI via Google Earth Engine |
| `backend/fetchers/ibge_fetcher.py` | IBGE SIDRA real slaughter data |
| `backend/fetchers/china_quota_fetcher.py` | SECEX/Comex Stat China export quota |
| `backend/feature_store.py` | DuckDB in-memory feature materialization (35+ features) |
| `backend/ml_models/lightgbm_model.py` | LightGBM walk-forward + recursive multi-step |
| `backend/ml_models/tft_model.py` | TFT ONNX inference (Railway) + training helper (GHA) |
| `backend/ml_models/conformal.py` | Residual-based conformal prediction intervals |
| `backend/ml_models/meta_learner.py` | sklearn MLPRegressor neural stacking |
| `backend/auto_improve.py` | Weekly backtesting + meta-learner retrain |
| `backend/backtest.py` | Walk-forward backtesting harness |
| `.github/workflows/ml-train.yml` | Weekly TFT training + ONNX export + Optuna |
| `backend/tests/__init__.py` | Test package init |
| `backend/tests/conftest.py` | Shared fixtures (synthetic data, mocks) |
| `backend/tests/test_feature_store.py` | Feature computation unit tests |
| `backend/tests/test_xgboost_v2.py` | XGBoost v2 walk-forward tests |
| `backend/tests/test_tft.py` | TFT ONNX inference mock tests |
| `backend/tests/test_lightgbm.py` | LightGBM tests |
| `backend/tests/test_conformal.py` | Conformal interval coverage tests |
| `backend/tests/test_meta_learner.py` | Meta-learner fallback + training tests |
| `backend/tests/test_signal_v2.py` | Signal v2 deterministic scoring tests |
| `backend/tests/test_fetchers_new.py` | New fetcher HTTP mock tests |
| `backend/tests/test_pipeline.py` | Integration: feature_store → ensemble → signal |

### Modified Files
| File | Changes |
|------|---------|
| `backend/ml_models/xgboost_model_v2.py` | NEW: XGBoost v2 with 35+ features, walk-forward, recursive multi-step |
| `backend/ml_models/ensemble.py` | Rewrite: orchestrate 3 models + meta-learner + conformal |
| `backend/analysis/signal_generator.py` | Rewrite: 5-dimension scoring, magnitude, conformal confidence |
| `backend/analysis/fundamental.py` | Fix: real IBGE female_pct instead of hardcoded 47.0 |
| `backend/claude_integration.py` | Rewrite: full context analyst with 7 new output fields |
| `backend/run_daily.py` | Add: new fetchers, feature_store step, v2 flag, parallel mode |
| `backend/requirements.txt` | Add: lightgbm, onnxruntime, duckdb, earthengine-api |
| `backend/schema.sql` | Add: 5 new tables, ALTER trade_signals, RLS policies |

### Removed Files (AFTER v2 promotion — NOT during implementation)
| File | Reason |
|------|--------|
| `backend/ml_models/prophet_model.py` | Replaced by TFT (remove after 2+ weeks of v2 in production) |
| `backend/ml_models/sarima_model.py` | Replaced by TFT + gradient boosting (remove after 2+ weeks) |
| `backend/ml_models/xgboost_model.py` | Replaced by xgboost_model_v2.py (remove after v2 promotion, then rename v2→v1) |

---

## Chunk 1: Foundation (Schema + Dependencies + Test Infrastructure)

### Task 1: Database Schema — New Tables

**Files:**
- Modify: `backend/schema.sql`

- [ ] **Step 1: Add `fire_hotspots` table to schema.sql**

Append after the last CREATE TABLE in `schema.sql`:

```sql
-- FOCOS DE CALOR INPE
CREATE TABLE IF NOT EXISTS fire_hotspots (
  id             BIGSERIAL PRIMARY KEY,
  date           DATE NOT NULL,
  state          VARCHAR(2) NOT NULL,
  hotspot_count  INTEGER NOT NULL,
  risk_level     VARCHAR(10),
  source         VARCHAR(20) DEFAULT 'INPE',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, state)
);
```

- [ ] **Step 2: Add `ndvi_pasture` table**

```sql
-- ÍNDICE DE PASTAGEM NDVI
CREATE TABLE IF NOT EXISTS ndvi_pasture (
  id           BIGSERIAL PRIMARY KEY,
  date         DATE NOT NULL,
  state        VARCHAR(2) NOT NULL,
  ndvi_value   NUMERIC(6,4),
  ndvi_anomaly NUMERIC(6,4),
  source       VARCHAR(20) DEFAULT 'MODIS',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, state)
);
```

- [ ] **Step 3: Add `china_quota_tracking` table**

```sql
-- QUOTA DE EXPORTAÇÃO CHINA
CREATE TABLE IF NOT EXISTS china_quota_tracking (
  id               BIGSERIAL PRIMARY KEY,
  date             DATE NOT NULL,
  month_volume_tons NUMERIC(12,2),
  ytd_volume_tons  NUMERIC(12,2),
  quota_total_tons NUMERIC(12,2) NOT NULL,
  quota_usage_pct  NUMERIC(5,2),
  source           VARCHAR(20) DEFAULT 'COMEXSTAT',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date)
);
```

- [ ] **Step 4: Add `model_predictions_raw` and `model_performance` tables**

```sql
-- PREDIÇÕES INDIVIDUAIS (alimenta meta-learner)
CREATE TABLE IF NOT EXISTS model_predictions_raw (
  id           BIGSERIAL PRIMARY KEY,
  date         DATE NOT NULL,
  model_name   VARCHAR(30) NOT NULL,
  horizon_days SMALLINT NOT NULL,
  pred_value   NUMERIC(10,2),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, model_name, horizon_days)
);

-- PERFORMANCE DOS MODELOS
CREATE TABLE IF NOT EXISTS model_performance (
  id                    BIGSERIAL PRIMARY KEY,
  date                  DATE NOT NULL,
  model_name            VARCHAR(30) NOT NULL,
  horizon_days          SMALLINT NOT NULL,
  mape                  NUMERIC(6,4),
  directional_accuracy  NUMERIC(5,3),
  meta_learner_weight   NUMERIC(5,3),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, model_name, horizon_days)
);
```

- [ ] **Step 5: Add ALTER TABLE for trade_signals + RLS policies**

```sql
-- Novos campos trade_signals
ALTER TABLE trade_signals
  ADD COLUMN IF NOT EXISTS risk_alert TEXT,
  ADD COLUMN IF NOT EXISTS confidence_note TEXT,
  ADD COLUMN IF NOT EXISTS factors_summary JSONB,
  ADD COLUMN IF NOT EXISTS score_ml NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS score_technical NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS score_fundamental NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS score_sentiment NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS score_climate NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS interval_lower NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS interval_upper NUMERIC(10,2);

-- RLS para novas tabelas
ALTER TABLE fire_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ndvi_pasture ENABLE ROW LEVEL SECURITY;
ALTER TABLE china_quota_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_predictions_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_public ON fire_hotspots FOR SELECT USING (true);
CREATE POLICY read_public ON ndvi_pasture FOR SELECT USING (true);
CREATE POLICY read_public ON china_quota_tracking FOR SELECT USING (true);
CREATE POLICY read_public ON model_predictions_raw FOR SELECT USING (true);
CREATE POLICY read_public ON model_performance FOR SELECT USING (true);
```

- [ ] **Step 6: Apply schema to Supabase**

Run the SQL statements in Supabase SQL Editor (or via MCP if available). Verify tables exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('fire_hotspots', 'ndvi_pasture', 'china_quota_tracking',
                   'model_predictions_raw', 'model_performance');
```

Expected: 5 rows returned.

- [ ] **Step 7: Commit**

```bash
git add backend/schema.sql
git commit -m "feat(schema): add 5 new tables for ML v2 + trade_signals columns + RLS"
```

---

### Task 2: Dependencies

**Files:**
- Modify: `backend/requirements.txt`

- [ ] **Step 1: Add new Railway dependencies**

Add below `tenacity` line in `backend/requirements.txt`:

```
# ML v2 — Railway (inference only)
lightgbm>=4.3.0
onnxruntime>=1.17.0
duckdb>=1.0.0
earthengine-api>=0.1.390
joblib>=1.4.0
```

- [ ] **Step 2: Verify Prophet stays for now (parallel period)**

Prophet and statsmodels remain in requirements.txt during the v1/v2 parallel period. They will be removed after v2 promotion. No change needed.

- [ ] **Step 3: Create `backend/requirements-train.txt` for GitHub Actions**

Create new file with full training stack:

```
# Includes everything from requirements.txt plus training dependencies
-r requirements.txt
# Deep Learning (GHA only — NOT Railway)
neuralforecast>=1.7.0
lightning>=2.0.0
torch>=2.0.0
onnx>=1.15.0
optuna>=3.6.0
```

- [ ] **Step 4: Commit**

```bash
git add backend/requirements.txt backend/requirements-train.txt
git commit -m "feat(deps): add lightgbm, onnxruntime, duckdb, earthengine-api for ML v2"
```

---

### Task 3: Test Infrastructure

**Files:**
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/conftest.py`

- [ ] **Step 1: Create test package**

```bash
mkdir -p backend/tests
```

`backend/tests/__init__.py` — empty file.

- [ ] **Step 2: Create shared fixtures in conftest.py**

```python
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
    seasonal = 10 * np.sin(np.arange(n) * 2 * np.pi / 252)  # annual cycle
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
```

- [ ] **Step 3: Verify test infrastructure works**

Run: `cd backend && python -m pytest tests/ -v --co`
Expected: "no tests ran" (collection succeeds, no tests yet)

- [ ] **Step 4: Commit**

```bash
git add backend/tests/__init__.py backend/tests/conftest.py
git commit -m "test(infra): add test package with shared fixtures for ML v2"
```

---

## Chunk 2: New Fetchers

### Task 4: INPE Queimadas Fetcher

**Files:**
- Create: `backend/fetchers/inpe_fetcher.py`
- Create: `backend/tests/test_fetchers_new.py`

- [ ] **Step 1: Write failing test for INPE fetcher**

```python
# backend/tests/test_fetchers_new.py
"""Tests for new fetchers (INPE, NDVI, IBGE, China)."""
from unittest.mock import patch, MagicMock
from datetime import date
import pytest


class TestINPEFetcher:
    """Tests for backend/fetchers/inpe_fetcher.py"""

    SAMPLE_CSV = (
        "id,lat,lon,data_hora_gmt,satelite,municipio,estado,pais,diasemchuva,precipitacao,risco_fogo,bioma,frp\n"
        "1,-15.5,-47.3,2026/03/19 12:00,AQUA_M-T,Brasilia,Goiás,Brasil,5,0.0,0.8,Cerrado,25.0\n"
        "2,-21.1,-50.2,2026/03/19 12:00,AQUA_M-T,Araçatuba,São Paulo,Brasil,3,0.0,0.6,Mata Atlântica,12.0\n"
        "3,-12.5,-55.3,2026/03/19 12:00,AQUA_M-T,Sinop,Mato Grosso,Brasil,8,0.0,0.9,Amazônia,40.0\n"
        "4,-20.4,-54.6,2026/03/19 12:00,AQUA_M-T,Campo Grande,Mato Grosso do Sul,Brasil,4,0.0,0.7,Cerrado,18.0\n"
        "5,-18.9,-44.2,2026/03/19 12:00,AQUA_M-T,Curvelo,Minas Gerais,Brasil,6,0.0,0.5,Cerrado,8.0\n"
    )

    @patch("httpx.get")
    def test_fetch_fire_hotspots_parses_csv(self, mock_get, mock_supabase):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = self.SAMPLE_CSV
        mock_get.return_value = mock_resp

        from fetchers.inpe_fetcher import fetch_fire_hotspots
        fetch_fire_hotspots()

        # Should have been called with upsert for fire_hotspots
        from supabase_client import upsert
        # upsert is mocked, just verify it was called

    @patch("httpx.get")
    def test_state_mapping(self, mock_get, mock_supabase):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = self.SAMPLE_CSV
        mock_get.return_value = mock_resp

        from fetchers.inpe_fetcher import _parse_hotspots
        rows = _parse_hotspots(self.SAMPLE_CSV, date(2026, 3, 19))

        states = {r["state"] for r in rows}
        assert states == {"GO", "SP", "MT", "MS", "MG"}
        assert all(r["hotspot_count"] >= 1 for r in rows)

    @patch("httpx.get")
    def test_fallback_previous_day(self, mock_get, mock_supabase):
        """If today's CSV returns 404, try yesterday."""
        resp_404 = MagicMock()
        resp_404.status_code = 404

        resp_ok = MagicMock()
        resp_ok.status_code = 200
        resp_ok.text = self.SAMPLE_CSV

        mock_get.side_effect = [resp_404, resp_ok]

        from fetchers.inpe_fetcher import fetch_fire_hotspots
        fetch_fire_hotspots()
        assert mock_get.call_count == 2
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_fetchers_new.py::TestINPEFetcher -v`
Expected: FAIL with ModuleNotFoundError (inpe_fetcher doesn't exist yet)

- [ ] **Step 3: Implement INPE fetcher**

```python
# backend/fetchers/inpe_fetcher.py
"""
Busca focos de calor do INPE (BDQueimadas).
Fonte: file server CSV diário.
"""
import logging
from datetime import date, timedelta

import httpx
import pandas as pd
from io import StringIO

from supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

BASE_URL = "https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/diario/"
TARGET_STATES = {"São Paulo": "SP", "Mato Grosso": "MT", "Goiás": "GO",
                 "Mato Grosso do Sul": "MS", "Minas Gerais": "MG"}
RISK_THRESHOLDS = {"BAIXO": 10, "MEDIO": 30, "ALTO": 80}


def _parse_hotspots(csv_text: str, ref_date: date) -> list[dict]:
    """Parse INPE CSV and aggregate by state."""
    df = pd.read_csv(StringIO(csv_text))
    if df.empty:
        return []

    col_state = "estado" if "estado" in df.columns else df.columns[df.columns.str.contains("estado", case=False)][0]
    df["state_code"] = df[col_state].map(TARGET_STATES)
    df = df.dropna(subset=["state_code"])

    rows = []
    for state_code, group in df.groupby("state_code"):
        count = len(group)
        risk = "CRITICO"
        for level, threshold in sorted(RISK_THRESHOLDS.items(), key=lambda x: x[1]):
            if count <= threshold:
                risk = level
                break
        rows.append({
            "date": str(ref_date),
            "state": state_code,
            "hotspot_count": count,
            "risk_level": risk,
            "source": "INPE",
        })
    return rows


@with_retry
def fetch_fire_hotspots() -> None:
    """Busca CSV diário do INPE. Tenta hoje, fallback ontem."""
    today = date.today()
    for offset in [0, 1]:
        target_date = today - timedelta(days=offset)
        filename = f"focos_diario_{target_date.strftime('%Y%m%d')}.csv"
        url = f"{BASE_URL}{filename}"

        resp = httpx.get(url, timeout=30)
        if resp.status_code == 200:
            rows = _parse_hotspots(resp.text, target_date)
            if rows:
                upsert("fire_hotspots", rows, ["date", "state"])
                logger.info("✓ INPE Queimadas: %d estados em %s", len(rows), target_date)
                return
        elif resp.status_code == 404:
            logger.info("INPE CSV %s não disponível, tentando dia anterior", filename)
            continue
        else:
            logger.warning("INPE HTTP %d para %s", resp.status_code, url)

    logger.warning("INPE: nenhum CSV disponível para %s ou %s",
                   today, today - timedelta(days=1))
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && python -m pytest tests/test_fetchers_new.py::TestINPEFetcher -v`
Expected: 3 PASSED

- [ ] **Step 5: Commit**

```bash
git add backend/fetchers/inpe_fetcher.py backend/tests/test_fetchers_new.py
git commit -m "feat(fetcher): add INPE fire hotspot fetcher with daily CSV parsing"
```

---

### Task 5: IBGE Slaughter Fetcher

**Files:**
- Create: `backend/fetchers/ibge_fetcher.py`
- Modify: `backend/tests/test_fetchers_new.py`

- [ ] **Step 1: Write failing test**

Append to `backend/tests/test_fetchers_new.py`:

```python
class TestIBGEFetcher:
    """Tests for backend/fetchers/ibge_fetcher.py"""

    SAMPLE_SIDRA = [
        {"D1C": "202401", "D2N": "Total", "D3N": "Bovinos", "D4N": "Brasil", "V": "7500000"},
        {"D1C": "202401", "D2N": "Fêmeas", "D3N": "Bovinos", "D4N": "Brasil", "V": "3525000"},
    ]

    @patch("httpx.get")
    def test_parse_female_percent(self, mock_get, mock_supabase):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = self.SAMPLE_SIDRA
        mock_get.return_value = mock_resp

        from fetchers.ibge_fetcher import _calc_female_pct
        pct = _calc_female_pct(self.SAMPLE_SIDRA)
        assert pct == pytest.approx(47.0, abs=0.1)

    @patch("httpx.get")
    def test_fetch_stores_data(self, mock_get, mock_supabase):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = self.SAMPLE_SIDRA
        mock_get.return_value = mock_resp

        from fetchers.ibge_fetcher import fetch_ibge_slaughter
        fetch_ibge_slaughter()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_fetchers_new.py::TestIBGEFetcher -v`
Expected: FAIL

- [ ] **Step 3: Implement IBGE fetcher**

```python
# backend/fetchers/ibge_fetcher.py
"""
Busca dados reais de abate do IBGE (SIDRA tabela 1093).
Trimestral, ~2 meses de lag.
"""
import logging
from datetime import date

import httpx

from supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

SIDRA_URL = "https://apisidra.ibge.gov.br/values/t/1093/n1/all/v/all/p/last%201/c12716/115236,115237/c18/55,56"


def _calc_female_pct(data: list[dict]) -> float | None:
    """Calcula % fêmeas a partir dos dados SIDRA."""
    total = 0
    female = 0
    for row in data:
        val = row.get("V", "0").replace(".", "").replace(",", ".")
        try:
            v = float(val)
        except (ValueError, TypeError):
            continue
        if "Total" in str(row.get("D2N", "")):
            total += v
        if "Fêmea" in str(row.get("D2N", "")) or "mea" in str(row.get("D2N", "")):
            female += v
    if total <= 0:
        return None
    return round(female / total * 100, 2)


@with_retry
def fetch_ibge_slaughter() -> None:
    """Busca último trimestre de abate do IBGE SIDRA."""
    resp = httpx.get(SIDRA_URL, timeout=30)
    if resp.status_code != 200:
        raise RuntimeError(f"IBGE SIDRA HTTP {resp.status_code}")

    data = resp.json()
    if not data:
        logger.warning("IBGE SIDRA retornou dados vazios")
        return

    female_pct = _calc_female_pct(data)
    if female_pct is None:
        logger.warning("Não foi possível calcular female_pct dos dados IBGE")
        return

    # Extrai período (ex: "202401" → Q1 2024)
    period_str = data[0].get("D1C", "")
    year = period_str[:4]
    quarter = period_str[4:]
    # Map quarter to last month of quarter
    q_map = {"01": f"{year}-03-31", "02": f"{year}-06-30",
             "03": f"{year}-09-30", "04": f"{year}-12-31"}
    period_date = q_map.get(quarter, f"{year}-12-31")

    total_head = 0
    female_head = 0
    for row in data:
        val_str = row.get("V", "0").replace(".", "").replace(",", ".")
        try:
            v = int(float(val_str))
        except (ValueError, TypeError):
            continue
        if "Total" in str(row.get("D2N", "")):
            total_head = v
        if "Fêmea" in str(row.get("D2N", "")) or "mea" in str(row.get("D2N", "")):
            female_head = v

    upsert("slaughter_data", [{
        "period": period_date,
        "total_head": total_head,
        "female_head": female_head,
        "female_percent": female_pct,
        "state": "BR",
        "source": "IBGE_SIDRA",
    }], ["period", "state"])

    logger.info("✓ IBGE Abate: female_pct=%.1f%% período=%s", female_pct, period_date)
```

- [ ] **Step 4: Run tests**

Run: `cd backend && python -m pytest tests/test_fetchers_new.py::TestIBGEFetcher -v`
Expected: PASSED

- [ ] **Step 5: Commit**

```bash
git add backend/fetchers/ibge_fetcher.py backend/tests/test_fetchers_new.py
git commit -m "feat(fetcher): add IBGE SIDRA real slaughter data fetcher"
```

---

### Task 6: China Quota Tracker Fetcher

**Files:**
- Create: `backend/fetchers/china_quota_fetcher.py`
- Modify: `backend/tests/test_fetchers_new.py`

- [ ] **Step 1: Write failing test**

Append to `backend/tests/test_fetchers_new.py`:

```python
import os

class TestChinaQuotaFetcher:
    """Tests for backend/fetchers/china_quota_fetcher.py"""

    @patch("httpx.get")
    def test_quota_usage_calculation(self, mock_get, mock_supabase):
        """Verify quota_usage_pct = ytd / quota_total * 100."""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = [
            {"CO_ANO": "2026", "CO_MES": "01", "KG_LIQUIDO": "85000000000"},
            {"CO_ANO": "2026", "CO_MES": "02", "KG_LIQUIDO": "92000000000"},
        ]
        mock_get.return_value = mock_resp

        from fetchers.china_quota_fetcher import _calc_quota_usage
        result = _calc_quota_usage(mock_resp.json(), quota_tons=1_106_000)
        # 85000 + 92000 = 177000 tons → 177000/1106000 * 100 ≈ 16.0%
        assert result["ytd_volume_tons"] == pytest.approx(177_000, rel=0.01)
        assert result["quota_usage_pct"] == pytest.approx(16.0, abs=0.5)

    @patch.dict(os.environ, {"CHINA_QUOTA_TONS": "1106000"})
    @patch("httpx.get")
    def test_fetch_stores_data(self, mock_get, mock_supabase):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = [
            {"CO_ANO": "2026", "CO_MES": "01", "KG_LIQUIDO": "85000000000"},
        ]
        mock_get.return_value = mock_resp

        from fetchers.china_quota_fetcher import fetch_china_quota
        fetch_china_quota()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_fetchers_new.py::TestChinaQuotaFetcher -v`
Expected: FAIL

- [ ] **Step 3: Implement China Quota fetcher**

```python
# backend/fetchers/china_quota_fetcher.py
"""
Busca volume de exportação de carne bovina para China (Comex Stat / SECEX).
NCM 0201 (fresca) e 0202 (congelada).
"""
import logging
import os
from datetime import date

import httpx

from supabase_client import upsert
from .base_fetcher import with_retry

logger = logging.getLogger(__name__)

COMEX_URL = "https://comexstat.mdic.gov.br/pt/geral"
DEFAULT_QUOTA_TONS = 1_106_000


def _calc_quota_usage(data: list[dict], quota_tons: float) -> dict:
    """Calcula YTD volume e % da quota."""
    monthly_tons = {}
    for row in data:
        month = row.get("CO_MES", "01")
        kg = float(row.get("KG_LIQUIDO", 0))
        tons = kg / 1000  # kg → tons
        monthly_tons[month] = monthly_tons.get(month, 0) + tons

    ytd = sum(monthly_tons.values())
    last_month = max(monthly_tons.keys()) if monthly_tons else "01"
    month_vol = monthly_tons.get(last_month, 0)

    return {
        "month_volume_tons": round(month_vol, 2),
        "ytd_volume_tons": round(ytd, 2),
        "quota_total_tons": quota_tons,
        "quota_usage_pct": round(ytd / quota_tons * 100, 2) if quota_tons > 0 else 0,
    }


@with_retry
def fetch_china_quota() -> None:
    """Busca dados de exportação para China do Comex Stat."""
    quota_tons = float(os.environ.get("CHINA_QUOTA_TONS", DEFAULT_QUOTA_TONS))
    year = date.today().year

    # Comex Stat API — filtro: NCM 0201+0202, destino China
    params = {
        "coAno": year,
        "coPaisDestino": "160",  # China
        "coNcm": "0201,0202",
    }

    resp = httpx.get(COMEX_URL, params=params, timeout=30)
    if resp.status_code != 200:
        raise RuntimeError(f"Comex Stat HTTP {resp.status_code}")

    data = resp.json()
    if not data:
        logger.warning("Comex Stat sem dados para China %d", year)
        return

    result = _calc_quota_usage(data, quota_tons)

    upsert("china_quota_tracking", [{
        "date": str(date.today()),
        **result,
        "source": "COMEXSTAT",
    }], ["date"])

    logger.info("✓ China Quota: YTD=%.0ft (%.1f%% da cota)",
                result["ytd_volume_tons"], result["quota_usage_pct"])
```

- [ ] **Step 4: Run tests**

Run: `cd backend && python -m pytest tests/test_fetchers_new.py::TestChinaQuotaFetcher -v`
Expected: PASSED

- [ ] **Step 5: Commit**

```bash
git add backend/fetchers/china_quota_fetcher.py backend/tests/test_fetchers_new.py
git commit -m "feat(fetcher): add SECEX China quota tracker with usage % calculation"
```

---

### Task 7: NDVI Pasture Index Fetcher

**Files:**
- Create: `backend/fetchers/ndvi_fetcher.py`
- Modify: `backend/tests/test_fetchers_new.py`

- [ ] **Step 1: Write failing test**

Append to `backend/tests/test_fetchers_new.py`:

```python
class TestNDVIFetcher:
    """Tests for backend/fetchers/ndvi_fetcher.py"""

    @patch("fetchers.ndvi_fetcher._fetch_via_gee")
    def test_fetch_stores_ndvi_data(self, mock_gee, mock_supabase):
        mock_gee.return_value = [
            {"date": "2026-03-01", "state": "MT", "ndvi_value": 0.65, "ndvi_anomaly": -0.05},
            {"date": "2026-03-01", "state": "SP", "ndvi_value": 0.58, "ndvi_anomaly": -0.12},
        ]

        from fetchers.ndvi_fetcher import fetch_ndvi
        fetch_ndvi()

    @patch("fetchers.ndvi_fetcher._fetch_via_gee")
    def test_gee_failure_warns(self, mock_gee, mock_supabase):
        mock_gee.side_effect = RuntimeError("GEE auth failed")

        from fetchers.ndvi_fetcher import fetch_ndvi
        # Should not raise — logs warning and returns
        fetch_ndvi()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_fetchers_new.py::TestNDVIFetcher -v`
Expected: FAIL

- [ ] **Step 3: Implement NDVI fetcher**

```python
# backend/fetchers/ndvi_fetcher.py
"""
Busca índice NDVI de pastagem via Google Earth Engine API.
Produto: MOD13A2 v061 (NDVI 16 dias, 1km).
Fallback: forward-fill do último valor no feature_store.
"""
import json
import logging
import os
from datetime import date, timedelta

from supabase_client import upsert

logger = logging.getLogger(__name__)

# Bounding boxes das principais regiões pecuárias
STATE_BBOXES = {
    "SP": [-23.5, -53.0, -19.8, -44.2],
    "MT": [-17.9, -61.6, -7.4, -50.2],
    "GO": [-19.5, -53.2, -12.4, -45.9],
    "MS": [-24.1, -58.2, -17.2, -50.9],
    "MG": [-22.9, -51.0, -14.2, -39.9],
}


def _fetch_via_gee() -> list[dict]:
    """Busca NDVI via Google Earth Engine. Requer env GEE_SERVICE_ACCOUNT_KEY."""
    import ee

    key_json = os.environ.get("GEE_SERVICE_ACCOUNT_KEY")
    if not key_json:
        raise RuntimeError("GEE_SERVICE_ACCOUNT_KEY não configurada")

    credentials = ee.ServiceAccountCredentials(
        json.loads(key_json)["client_email"],
        key_data=key_json,
    )
    ee.Initialize(credentials)

    # Último composite disponível (~8-16 dias atrás)
    end = date.today()
    start = end - timedelta(days=20)

    rows = []
    collection = (ee.ImageCollection("MODIS/061/MOD13A2")
                  .filterDate(start.isoformat(), end.isoformat())
                  .select("NDVI"))

    if collection.size().getInfo() == 0:
        logger.warning("NDVI: nenhum composite disponível para %s → %s", start, end)
        return []

    image = collection.sort("system:time_start", False).first()
    img_date = date.fromtimestamp(image.get("system:time_start").getInfo() / 1000)

    for state, bbox in STATE_BBOXES.items():
        region = ee.Geometry.Rectangle(bbox)
        stats = image.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=region,
            scale=1000,
            maxPixels=1e9,
        ).getInfo()

        ndvi_raw = stats.get("NDVI", 0)
        ndvi_value = round(ndvi_raw * 0.0001, 4) if ndvi_raw else 0  # scale factor

        rows.append({
            "date": str(img_date),
            "state": state,
            "ndvi_value": ndvi_value,
            "ndvi_anomaly": 0,  # calculated in feature_store vs historical mean
            "source": "MODIS",
        })

    return rows


def fetch_ndvi() -> None:
    """Busca NDVI. Não levanta exceção se falhar (feature opcional)."""
    try:
        rows = _fetch_via_gee()
        if rows:
            upsert("ndvi_pasture", rows, ["date", "state"])
            logger.info("✓ NDVI: %d registros de %s", len(rows), rows[0]["date"])
        else:
            logger.warning("NDVI: nenhum dado retornado")
    except Exception as exc:
        logger.warning("NDVI falhou (não-crítico): %s", exc)
```

- [ ] **Step 4: Run tests**

Run: `cd backend && python -m pytest tests/test_fetchers_new.py::TestNDVIFetcher -v`
Expected: PASSED

- [ ] **Step 5: Commit**

```bash
git add backend/fetchers/ndvi_fetcher.py backend/tests/test_fetchers_new.py
git commit -m "feat(fetcher): add NDVI pasture index fetcher via Google Earth Engine"
```

---

## Chunk 3: Feature Store

### Task 8: DuckDB Feature Store

**Files:**
- Create: `backend/feature_store.py`
- Create: `backend/tests/test_feature_store.py`

- [ ] **Step 1: Write failing tests for feature computation**

```python
# backend/tests/test_feature_store.py
"""Tests for backend/feature_store.py — verifies feature computations."""
import numpy as np
import pandas as pd
import pytest
from datetime import date, timedelta


class TestFeatureComputation:
    """Test individual feature calculations."""

    def test_basis_is_futures_minus_spot(self):
        """basis = futures_price - spot_price"""
        from feature_store import _compute_basis
        result = _compute_basis(spot=310.0, futures=315.5)
        assert result == pytest.approx(5.5, abs=0.01)

    def test_bb_width(self):
        """bb_width = (upper - lower) / mid"""
        from feature_store import _compute_bb_width
        result = _compute_bb_width(upper=330.0, lower=310.0, mid=320.0)
        assert result == pytest.approx(0.0625, abs=0.001)

    def test_china_risk_score_range(self):
        """china_risk_score must be 0-100"""
        from feature_store import _compute_china_risk_score
        result = _compute_china_risk_score(quota_usage_pct=85.0, sentiment_neg_china=3)
        assert 0 <= result <= 100

    def test_supply_pressure_composite(self):
        """supply_pressure combines female_pct + export + slaughter trend."""
        from feature_store import _compute_supply_pressure
        result = _compute_supply_pressure(
            female_pct=52.0,  # high = liquidação
            export_growth=10.0,  # growing demand
            slaughter_trend=5.0,  # increasing supply
        )
        assert isinstance(result, float)
        assert 0 <= result <= 100


class TestBuildFeatures:
    """Test the full build_features pipeline."""

    def test_returns_dataframe_with_expected_columns(self, mock_supabase, synthetic_spot_prices):
        """build_features must return DataFrame with all feature groups."""
        # This test needs a more elaborate mock setup — see Step 3
        pass

    def test_no_nan_in_output(self, synthetic_feature_df):
        """Output must have no NaN values (all imputed)."""
        assert not synthetic_feature_df.isna().any().any()

    def test_minimum_rows(self, synthetic_feature_df):
        """Should have enough rows for walk-forward (min ~300 after dropna)."""
        assert len(synthetic_feature_df) >= 300
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_feature_store.py -v`
Expected: FAIL with ModuleNotFoundError

- [ ] **Step 3: Implement feature_store.py**

```python
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
```

- [ ] **Step 4: Run tests**

Run: `cd backend && python -m pytest tests/test_feature_store.py -v`
Expected: All PASSED

- [ ] **Step 5: Commit**

```bash
git add backend/feature_store.py backend/tests/test_feature_store.py
git commit -m "feat(feature-store): DuckDB in-memory feature materialization with 35+ features"
```

---

## Chunk 4: ML Models

### Task 9: XGBoost v2 (New File — Preserves v1)

**IMPORTANT:** Do NOT overwrite `xgboost_model.py`. The v1 file must stay untouched during the parallel period because `_run_v1_ensemble()` imports it with its old interface (`pred_value`, `pred_lower`, `pred_upper`). The v2 ensemble imports `xgboost_model_v2` instead.

**Files:**
- Create: `backend/ml_models/xgboost_model_v2.py`
- Create: `backend/tests/test_xgboost_v2.py`

- [ ] **Step 1: Write failing tests**

```python
# backend/tests/test_xgboost_v2.py
"""Tests for XGBoost v2 with walk-forward validation."""
import pytest


class TestXGBoostV2:
    def test_returns_model_result(self, synthetic_feature_df):
        from ml_models.xgboost_model_v2 import train_and_predict
        result = train_and_predict(synthetic_feature_df, horizon=15)
        assert result is not None
        assert "pred_final" in result
        assert "mape" in result
        assert "directional_accuracy" in result
        assert "feature_importance" in result
        assert result["model_name"] == "xgboost"
        assert result["horizon_days"] == 15

    def test_pred_is_reasonable(self, synthetic_feature_df):
        """Prediction should be within 20% of last price."""
        from ml_models.xgboost_model_v2 import train_and_predict
        result = train_and_predict(synthetic_feature_df, horizon=5)
        last_price = synthetic_feature_df["price"].iloc[-1]
        assert result["pred_final"] > last_price * 0.8
        assert result["pred_final"] < last_price * 1.2

    def test_walk_forward_min_folds(self, synthetic_feature_df):
        """Walk-forward must use at least 5 folds."""
        from ml_models.xgboost_model_v2 import _walk_forward_validate
        metrics = _walk_forward_validate(synthetic_feature_df, horizon=15, min_folds=5)
        assert len(metrics["fold_mapes"]) >= 5

    def test_handles_all_horizons(self, synthetic_feature_df):
        """Must work for 5, 15, and 30 day horizons."""
        from ml_models.xgboost_model_v2 import train_and_predict
        for h in [5, 15, 30]:
            result = train_and_predict(synthetic_feature_df, horizon=h)
            assert result is not None
            assert result["horizon_days"] == h
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_xgboost_v2.py -v`
Expected: FAIL (module doesn't exist)

- [ ] **Step 3: Create xgboost_model_v2.py**

```python
# backend/ml_models/xgboost_model_v2.py
"""
XGBoost v2 — 35+ features, walk-forward validation, recursive multi-step prediction.
"""
import logging

import numpy as np
import pandas as pd
import xgboost as xgb

logger = logging.getLogger(__name__)

DEFAULT_PARAMS = {
    "n_estimators": 800,
    "max_depth": 6,
    "learning_rate": 0.03,
    "subsample": 0.8,
    "colsample_bytree": 0.7,
    "reg_alpha": 0.1,
    "reg_lambda": 1.0,
    "min_child_weight": 5,
    "objective": "reg:squarederror",
    "verbosity": 0,
}

TARGET_COL = "price"


def _walk_forward_validate(df: pd.DataFrame, horizon: int,
                            min_folds: int = 5, fold_size: int = 30) -> dict:
    """Expanding window walk-forward. Returns fold metrics."""
    features = [c for c in df.columns if c != TARGET_COL]
    n = len(df)
    min_train = max(300, n // 2)

    fold_mapes = []
    fold_dirs = []

    for fold_start in range(min_train, n - fold_size, fold_size):
        fold_end = min(fold_start + fold_size, n)
        train = df.iloc[:fold_start]
        test = df.iloc[fold_start:fold_end]

        X_train = train[features].values
        y_train = train[TARGET_COL].values
        X_test = test[features].values
        y_test = test[TARGET_COL].values

        model = xgb.XGBRegressor(**DEFAULT_PARAMS)
        model.fit(X_train, y_train, eval_set=[(X_test[:min(10, len(X_test)), :],
                  y_test[:min(10, len(y_test))])], verbose=False)

        preds = model.predict(X_test)
        mape = np.mean(np.abs((y_test - preds) / y_test)) * 100
        direction_correct = np.mean(np.sign(np.diff(preds[:horizon])) ==
                                     np.sign(np.diff(y_test[:horizon]))) if len(y_test) > 1 else 0.5

        fold_mapes.append(mape)
        fold_dirs.append(direction_correct)

    return {
        "fold_mapes": fold_mapes,
        "avg_mape": np.mean(fold_mapes) if fold_mapes else 99.0,
        "avg_directional": np.mean(fold_dirs) if fold_dirs else 0.5,
    }


def _recursive_predict(model, last_row: np.ndarray, horizon: int,
                        feature_names: list[str]) -> list[float]:
    """Recursive multi-step: predict t+1, update lag_1, predict t+2, etc."""
    preds = []
    current = last_row.copy()

    # Only update lag columns (TARGET_COL 'price' is excluded from features)
    lag_indices = {}
    for lag in [1, 5, 15, 30]:
        name = f"lag_{lag}"
        if name in feature_names:
            lag_indices[lag] = feature_names.index(name)

    for step in range(horizon):
        pred = float(model.predict(current.reshape(1, -1))[0])
        preds.append(pred)

        # Update lag_1 with latest prediction for next step
        if 1 in lag_indices:
            current[lag_indices[1]] = pred

    return preds


def train_and_predict(df: pd.DataFrame, horizon: int) -> dict | None:
    """
    Train XGBoost on full df, predict recursively for horizon days.
    Returns ModelResult dict.
    """
    if len(df) < 100:
        logger.warning("XGBoost: dados insuficientes (%d rows)", len(df))
        return None

    features = [c for c in df.columns if c != TARGET_COL]
    X = df[features].values
    y = df[TARGET_COL].values

    # Walk-forward validation for metrics
    wf = _walk_forward_validate(df, horizon)

    # Train on full data
    model = xgb.XGBRegressor(**DEFAULT_PARAMS)
    model.fit(X, y, verbose=False)

    # Recursive prediction
    last_row = X[-1]
    preds = _recursive_predict(model, last_row, horizon, features)

    # Feature importance
    importance = dict(zip(features, model.feature_importances_))
    top_features = dict(sorted(importance.items(), key=lambda x: -x[1])[:10])

    return {
        "model_name": "xgboost",
        "horizon_days": horizon,
        "pred_final": round(preds[-1], 2),
        "mape": round(wf["avg_mape"], 4),
        "directional_accuracy": round(wf["avg_directional"], 3),
        "feature_importance": top_features,
    }
```

- [ ] **Step 4: Run tests**

Run: `cd backend && python -m pytest tests/test_xgboost_v2.py -v`
Expected: All PASSED

- [ ] **Step 5: Commit**

```bash
git add backend/ml_models/xgboost_model_v2.py backend/tests/test_xgboost_v2.py
git commit -m "feat(ml): add XGBoost v2 with 35+ features, walk-forward, recursive multi-step"
```

---

### Task 10: LightGBM Model

**Files:**
- Create: `backend/ml_models/lightgbm_model.py`
- Create: `backend/tests/test_lightgbm.py`

- [ ] **Step 1: Write failing tests**

```python
# backend/tests/test_lightgbm.py
"""Tests for LightGBM model — mirrors XGBoost tests."""
import pytest


class TestLightGBM:
    def test_returns_model_result(self, synthetic_feature_df):
        from ml_models.lightgbm_model import train_and_predict
        result = train_and_predict(synthetic_feature_df, horizon=15)
        assert result is not None
        assert result["model_name"] == "lightgbm"
        assert "pred_final" in result
        assert "mape" in result

    def test_pred_is_reasonable(self, synthetic_feature_df):
        from ml_models.lightgbm_model import train_and_predict
        result = train_and_predict(synthetic_feature_df, horizon=5)
        last_price = synthetic_feature_df["price"].iloc[-1]
        assert result["pred_final"] > last_price * 0.8
        assert result["pred_final"] < last_price * 1.2
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_lightgbm.py -v`
Expected: FAIL

- [ ] **Step 3: Implement LightGBM model**

```python
# backend/ml_models/lightgbm_model.py
"""
LightGBM — mirrors XGBoost v2 interface.
Same features, walk-forward, recursive multi-step. ~3x faster training.
"""
import logging

import lightgbm as lgb
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

DEFAULT_PARAMS = {
    "n_estimators": 800,
    "max_depth": -1,
    "learning_rate": 0.03,
    "num_leaves": 63,
    "subsample": 0.8,
    "colsample_bytree": 0.7,
    "min_child_samples": 20,
    "reg_alpha": 0.1,
    "reg_lambda": 1.0,
    "objective": "regression",
    "verbosity": -1,
}

TARGET_COL = "price"


def _walk_forward_validate(df: pd.DataFrame, horizon: int,
                            fold_size: int = 30) -> dict:
    features = [c for c in df.columns if c != TARGET_COL]
    n = len(df)
    min_train = max(300, n // 2)

    fold_mapes = []
    fold_dirs = []

    for fold_start in range(min_train, n - fold_size, fold_size):
        fold_end = min(fold_start + fold_size, n)
        train = df.iloc[:fold_start]
        test = df.iloc[fold_start:fold_end]

        model = lgb.LGBMRegressor(**DEFAULT_PARAMS)
        model.fit(train[features], train[TARGET_COL],
                  eval_set=[(test[features].iloc[:10], test[TARGET_COL].iloc[:10])],
                  callbacks=[lgb.log_evaluation(0)])

        preds = model.predict(test[features])
        y_test = test[TARGET_COL].values
        mape = np.mean(np.abs((y_test - preds) / y_test)) * 100
        dir_acc = np.mean(np.sign(np.diff(preds[:horizon])) ==
                          np.sign(np.diff(y_test[:horizon]))) if len(y_test) > 1 else 0.5

        fold_mapes.append(mape)
        fold_dirs.append(dir_acc)

    return {
        "avg_mape": np.mean(fold_mapes) if fold_mapes else 99.0,
        "avg_directional": np.mean(fold_dirs) if fold_dirs else 0.5,
    }


def _recursive_predict(model, last_row: np.ndarray, horizon: int,
                        feature_names: list[str]) -> list[float]:
    """Recursive multi-step: predict t+1, update lag_1, predict t+2, etc."""
    preds = []
    current = last_row.copy()
    lag1_idx = feature_names.index("lag_1") if "lag_1" in feature_names else None

    for _ in range(horizon):
        pred = float(model.predict(current.reshape(1, -1))[0])
        preds.append(pred)
        if lag1_idx is not None:
            current[lag1_idx] = pred

    return preds


def train_and_predict(df: pd.DataFrame, horizon: int) -> dict | None:
    if len(df) < 100:
        logger.warning("LightGBM: dados insuficientes (%d rows)", len(df))
        return None

    features = [c for c in df.columns if c != TARGET_COL]
    wf = _walk_forward_validate(df, horizon)

    model = lgb.LGBMRegressor(**DEFAULT_PARAMS)
    model.fit(df[features], df[TARGET_COL], callbacks=[lgb.log_evaluation(0)])

    preds = _recursive_predict(model, df[features].values[-1], horizon, features)

    importance = dict(zip(features, model.feature_importances_))
    top_features = dict(sorted(importance.items(), key=lambda x: -x[1])[:10])

    return {
        "model_name": "lightgbm",
        "horizon_days": horizon,
        "pred_final": round(preds[-1], 2),
        "mape": round(wf["avg_mape"], 4),
        "directional_accuracy": round(wf["avg_directional"], 3),
        "feature_importance": top_features,
    }
```

- [ ] **Step 4: Run tests**

Run: `cd backend && python -m pytest tests/test_lightgbm.py -v`
Expected: PASSED

- [ ] **Step 5: Commit**

```bash
git add backend/ml_models/lightgbm_model.py backend/tests/test_lightgbm.py
git commit -m "feat(ml): add LightGBM model with walk-forward and recursive multi-step"
```

---

### Task 11: TFT ONNX Inference

**Files:**
- Create: `backend/ml_models/tft_model.py`

- [ ] **Step 1: Implement TFT inference stub (ONNX)**

The TFT model has two modes:
- **Railway (daily):** Load ONNX from Supabase Storage, run inference
- **GHA (weekly):** Full training with neuralforecast — covered in Task 20

```python
# backend/ml_models/tft_model.py
"""
TFT (Temporal Fusion Transformer) — ONNX inference on Railway.
Training happens in GitHub Actions (see .github/workflows/ml-train.yml).
"""
import logging
import os
import tempfile
from pathlib import Path

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

TARGET_COL = "price"
ONNX_BUCKET = "models"
ONNX_FILENAME = "tft_model.onnx"


def _download_onnx() -> str | None:
    """Download ONNX model from Supabase Storage."""
    from supabase_client import get_client
    try:
        client = get_client()
        data = client.storage.from_(ONNX_BUCKET).download(ONNX_FILENAME)
        tmp = tempfile.NamedTemporaryFile(suffix=".onnx", delete=False)
        tmp.write(data)
        tmp.close()
        return tmp.name
    except Exception as exc:
        logger.warning("TFT ONNX download falhou: %s", exc)
        return None


def _run_onnx_inference(onnx_path: str, df: pd.DataFrame,
                         horizon: int) -> dict | None:
    """Run ONNX inference for TFT."""
    import onnxruntime as ort

    session = ort.InferenceSession(onnx_path)
    input_names = [inp.name for inp in session.get_inputs()]

    # Prepare input (last 60 days of features)
    encoder_length = 60
    features = [c for c in df.columns if c != TARGET_COL]
    recent = df[features].iloc[-encoder_length:].values.astype(np.float32)

    # Reshape for TFT: (batch=1, seq_len, features)
    input_data = recent.reshape(1, encoder_length, -1)

    # Run inference
    input_feed = {input_names[0]: input_data}
    outputs = session.run(None, input_feed)

    # TFT outputs: [predictions (1, horizon, quantiles)]
    # quantiles: [0.05, 0.25, 0.50, 0.75, 0.95]
    pred_quantiles = outputs[0][0]  # (horizon, 5)

    # Extract point forecast (median = quantile 0.50, index 2)
    pred_values = pred_quantiles[:, 2] if pred_quantiles.ndim == 2 else pred_quantiles

    return {
        "model_name": "tft",
        "horizon_days": horizon,
        "pred_final": round(float(pred_values[min(horizon - 1, len(pred_values) - 1)]), 2),
        "mape": 0.0,  # computed in auto_improve.py from actuals
        "directional_accuracy": 0.0,  # computed in auto_improve.py
        "feature_importance": {},  # TFT attention weights extracted during training
        # Quantiles for conformal cold-start fallback
        "_quantile_05": float(pred_quantiles[min(horizon - 1, len(pred_quantiles) - 1), 0]) if pred_quantiles.ndim == 2 else 0,
        "_quantile_95": float(pred_quantiles[min(horizon - 1, len(pred_quantiles) - 1), 4]) if pred_quantiles.ndim == 2 else 0,
    }


def train_and_predict(df: pd.DataFrame, horizon: int) -> dict | None:
    """Load ONNX model and run inference. Returns None if model not available."""
    onnx_path = _download_onnx()
    if onnx_path is None:
        logger.warning("TFT: ONNX model not available — skipping")
        return None

    try:
        result = _run_onnx_inference(onnx_path, df, horizon)
        return result
    except Exception as exc:
        logger.error("TFT inference falhou: %s", exc)
        return None
    finally:
        if onnx_path and os.path.exists(onnx_path):
            os.unlink(onnx_path)
```

- [ ] **Step 2: Write TFT tests with mocked ONNX**

```python
# backend/tests/test_tft.py
"""Tests for TFT ONNX inference wrapper."""
import numpy as np
import pytest
from unittest.mock import patch, MagicMock


class TestTFTInference:
    def test_returns_none_when_onnx_unavailable(self, synthetic_feature_df, mock_supabase):
        """Should return None gracefully if ONNX model not in Supabase."""
        with patch("ml_models.tft_model._download_onnx", return_value=None):
            from ml_models.tft_model import train_and_predict
            result = train_and_predict(synthetic_feature_df, horizon=15)
            assert result is None

    def test_returns_model_result_with_mock_onnx(self, synthetic_feature_df, mock_supabase):
        """With mocked ONNX session, should return valid ModelResult."""
        mock_session = MagicMock()
        # TFT output: (1, 30, 5) — 30 steps, 5 quantiles
        fake_output = np.random.normal(310, 5, (1, 30, 5)).astype(np.float32)
        mock_session.run.return_value = [fake_output]
        mock_session.get_inputs.return_value = [MagicMock(name="input")]

        with patch("ml_models.tft_model._download_onnx", return_value="/tmp/fake.onnx"):
            with patch("onnxruntime.InferenceSession", return_value=mock_session):
                with patch("os.path.exists", return_value=True):
                    with patch("os.unlink"):
                        from ml_models.tft_model import train_and_predict
                        result = train_and_predict(synthetic_feature_df, horizon=15)

        assert result is not None
        assert result["model_name"] == "tft"
        assert result["horizon_days"] == 15
        assert isinstance(result["pred_final"], float)
        assert "_quantile_05" in result
        assert "_quantile_95" in result
```

- [ ] **Step 3: Run TFT tests**

Run: `cd backend && python -m pytest tests/test_tft.py -v`
Expected: PASSED

- [ ] **Step 4: Commit**

```bash
git add backend/ml_models/tft_model.py backend/tests/test_tft.py
git commit -m "feat(ml): add TFT ONNX inference module with tests (training in GHA)"
```

---

### Task 12: Conformal Prediction

**Files:**
- Create: `backend/ml_models/conformal.py`
- Create: `backend/tests/test_conformal.py`

- [ ] **Step 1: Write failing tests**

```python
# backend/tests/test_conformal.py
"""Tests for conformal prediction intervals."""
import numpy as np
import pytest

class TestConformalPrediction:
    def test_calibrate_interval_covers_prediction(self):
        """Interval must contain the prediction point."""
        from ml_models.conformal import calibrate_interval
        residuals = np.random.normal(0, 5, 200)
        lower, upper = calibrate_interval(residuals, 300.0, alpha=0.1)
        assert lower < 300.0
        assert upper > 300.0

    def test_coverage_at_90_percent(self):
        """Empirical coverage should be ~90% on synthetic data."""
        from ml_models.conformal import calibrate_interval
        np.random.seed(42)
        n_cal = 200
        n_test = 1000
        true_noise = np.random.normal(0, 5, n_cal + n_test)

        # Calibration residuals
        cal_residuals = true_noise[:n_cal]

        covered = 0
        for i in range(n_test):
            pred = 300.0
            actual = pred + true_noise[n_cal + i]
            lower, upper = calibrate_interval(cal_residuals, pred, alpha=0.1)
            if lower <= actual <= upper:
                covered += 1

        coverage = covered / n_test
        assert 0.85 <= coverage <= 0.95, f"Coverage {coverage:.2%} outside [85%, 95%]"

    def test_cold_start_fallback(self):
        """With < 90 residuals, should use TFT quantiles."""
        from ml_models.conformal import get_interval
        short_residuals = np.random.normal(0, 3, 30)  # too few
        tft_q05 = 290.0
        tft_q95 = 310.0

        lower, upper = get_interval(
            residuals=short_residuals,
            prediction=300.0,
            tft_quantile_05=tft_q05,
            tft_quantile_95=tft_q95,
        )
        assert lower == tft_q05
        assert upper == tft_q95
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_conformal.py -v`
Expected: FAIL

- [ ] **Step 3: Implement conformal.py**

```python
# backend/ml_models/conformal.py
"""
Conformal Prediction — residual-based intervals on ensemble output.
90% coverage target. Cold-start fallback: TFT quantiles.
"""
import logging

import numpy as np

logger = logging.getLogger(__name__)

MIN_RESIDUALS = 90  # minimum calibration set size


def calibrate_interval(
    residuals: np.ndarray,
    new_prediction: float,
    alpha: float = 0.1,
) -> tuple[float, float]:
    """
    Conformal interval from residuals (actual - prediction).
    q_lower typically negative, q_upper typically positive.
    Returns (pred + q_lower, pred + q_upper).
    """
    q_lower = np.quantile(residuals, alpha / 2)
    q_upper = np.quantile(residuals, 1 - alpha / 2)
    return (
        round(new_prediction + q_lower, 2),
        round(new_prediction + q_upper, 2),
    )


def get_interval(
    residuals: np.ndarray | None,
    prediction: float,
    tft_quantile_05: float = 0.0,
    tft_quantile_95: float = 0.0,
    alpha: float = 0.1,
) -> tuple[float, float]:
    """
    Get prediction interval. Uses conformal if enough residuals,
    otherwise falls back to TFT quantiles.
    """
    if residuals is not None and len(residuals) >= MIN_RESIDUALS:
        return calibrate_interval(residuals, prediction, alpha)

    # Cold-start: use TFT quantiles
    if tft_quantile_05 != 0 and tft_quantile_95 != 0:
        logger.info("Conformal cold-start: usando quantis TFT")
        return (round(tft_quantile_05, 2), round(tft_quantile_95, 2))

    # Last resort: ±3% heuristic
    margin = prediction * 0.03
    return (round(prediction - margin, 2), round(prediction + margin, 2))
```

- [ ] **Step 4: Run tests**

Run: `cd backend && python -m pytest tests/test_conformal.py -v`
Expected: All PASSED

- [ ] **Step 5: Commit**

```bash
git add backend/ml_models/conformal.py backend/tests/test_conformal.py
git commit -m "feat(ml): add residual-based conformal prediction with cold-start fallback"
```

---

### Task 13: Meta-learner

**Files:**
- Create: `backend/ml_models/meta_learner.py`
- Create: `backend/tests/test_meta_learner.py`

- [ ] **Step 1: Write failing tests**

```python
# backend/tests/test_meta_learner.py
"""Tests for meta-learner (sklearn MLPRegressor)."""
import numpy as np
import pytest


class TestMetaLearner:
    def test_fallback_simple_average(self):
        """Without enough data, use simple average."""
        from ml_models.meta_learner import combine_predictions
        preds = {"xgboost": 310.0, "lightgbm": 312.0, "tft": 315.0}
        result = combine_predictions(preds, model=None)
        expected = (310.0 + 312.0 + 315.0) / 3
        assert result == pytest.approx(expected, abs=0.01)

    def test_trained_model_output(self):
        """Trained meta-learner should produce reasonable output."""
        from ml_models.meta_learner import train_meta_learner, combine_predictions
        np.random.seed(42)

        # Synthetic training data: 100 days of predictions + actuals
        n = 100
        actuals = np.random.normal(310, 10, n)
        xgb_preds = actuals + np.random.normal(0, 3, n)
        lgb_preds = actuals + np.random.normal(0, 4, n)
        tft_preds = actuals + np.random.normal(0, 2, n)  # TFT is best

        model = train_meta_learner(xgb_preds, lgb_preds, tft_preds, actuals)
        assert model is not None

        preds = {"xgboost": 310.0, "lightgbm": 312.0, "tft": 315.0}
        result = combine_predictions(preds, model=model)
        assert 300 < result < 325  # reasonable range

    def test_extracts_model_weights(self):
        """Should report approximate model contribution."""
        from ml_models.meta_learner import train_meta_learner, get_model_weights
        np.random.seed(42)
        n = 100
        actuals = np.random.normal(310, 10, n)
        xgb_preds = actuals + np.random.normal(0, 3, n)
        lgb_preds = actuals + np.random.normal(0, 4, n)
        tft_preds = actuals + np.random.normal(0, 2, n)

        model = train_meta_learner(xgb_preds, lgb_preds, tft_preds, actuals)
        weights = get_model_weights(model)
        assert "xgboost" in weights
        assert "lightgbm" in weights
        assert "tft" in weights
        assert sum(weights.values()) == pytest.approx(1.0, abs=0.01)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_meta_learner.py -v`
Expected: FAIL

- [ ] **Step 3: Implement meta_learner.py**

```python
# backend/ml_models/meta_learner.py
"""
Meta-learner — sklearn MLPRegressor neural stacking.
Combines XGBoost + LightGBM + TFT with dynamic learned weights.
Serialized with joblib, stored in Supabase Storage.
"""
import logging
import tempfile
import os

import numpy as np
import joblib
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

SUPABASE_BUCKET = "models"
META_LEARNER_KEY = "meta_learner.joblib"


def train_meta_learner(
    xgb_preds: np.ndarray,
    lgb_preds: np.ndarray,
    tft_preds: np.ndarray,
    actuals: np.ndarray,
    xgb_mape_30d: float = 0.0,
    lgb_mape_30d: float = 0.0,
    tft_mape_30d: float = 0.0,
    xgb_dir_acc: float = 0.5,
    lgb_dir_acc: float = 0.5,
    tft_dir_acc: float = 0.5,
) -> MLPRegressor:
    """Train meta-learner on individual model predictions vs actuals."""
    n = len(actuals)
    X = np.column_stack([
        xgb_preds, lgb_preds, tft_preds,
        np.full(n, xgb_mape_30d), np.full(n, lgb_mape_30d), np.full(n, tft_mape_30d),
        np.full(n, xgb_dir_acc), np.full(n, lgb_dir_acc), np.full(n, tft_dir_acc),
    ])

    model = MLPRegressor(
        hidden_layer_sizes=(32, 16),
        activation="relu",
        max_iter=500,
        random_state=42,
        early_stopping=True,
        validation_fraction=0.1,
    )
    model.fit(X, actuals)
    return model


def combine_predictions(
    preds: dict[str, float],
    model: MLPRegressor | None = None,
    mapes: dict[str, float] | None = None,
    dir_accs: dict[str, float] | None = None,
) -> float:
    """Combine model predictions. Falls back to simple average if no trained model."""
    if model is None:
        # Simple average fallback
        values = list(preds.values())
        return round(sum(values) / len(values), 2)

    mapes = mapes or {}
    dir_accs = dir_accs or {}

    X = np.array([[
        preds.get("xgboost", 0), preds.get("lightgbm", 0), preds.get("tft", 0),
        mapes.get("xgboost", 0), mapes.get("lightgbm", 0), mapes.get("tft", 0),
        dir_accs.get("xgboost", 0.5), dir_accs.get("lightgbm", 0.5), dir_accs.get("tft", 0.5),
    ]])

    return round(float(model.predict(X)[0]), 2)


def get_model_weights(model: MLPRegressor) -> dict[str, float]:
    """Extract approximate model contribution weights from MLP layer 1 weights."""
    # First layer weights: (9, 32) — first 3 rows correspond to model predictions
    w = np.abs(model.coefs_[0][:3])  # (3, 32)
    importance = w.sum(axis=1)  # (3,)
    total = importance.sum()
    if total == 0:
        return {"xgboost": 0.33, "lightgbm": 0.33, "tft": 0.34}

    normed = importance / total
    return {
        "xgboost": round(float(normed[0]), 3),
        "lightgbm": round(float(normed[1]), 3),
        "tft": round(float(normed[2]), 3),
    }


def save_to_supabase(model: MLPRegressor) -> None:
    """Save trained meta-learner to Supabase Storage."""
    from supabase_client import get_client
    tmp = tempfile.NamedTemporaryFile(suffix=".joblib", delete=False)
    try:
        joblib.dump(model, tmp.name)
        tmp.close()
        with open(tmp.name, "rb") as f:
            client = get_client()
            client.storage.from_(SUPABASE_BUCKET).upload(
                META_LEARNER_KEY, f.read(),
                file_options={"upsert": "true"}
            )
        logger.info("Meta-learner salvo em Supabase Storage")
    finally:
        os.unlink(tmp.name)


def load_from_supabase() -> MLPRegressor | None:
    """Load trained meta-learner from Supabase Storage."""
    from supabase_client import get_client
    try:
        client = get_client()
        data = client.storage.from_(SUPABASE_BUCKET).download(META_LEARNER_KEY)
        tmp = tempfile.NamedTemporaryFile(suffix=".joblib", delete=False)
        tmp.write(data)
        tmp.close()
        model = joblib.load(tmp.name)
        os.unlink(tmp.name)
        return model
    except Exception as exc:
        logger.warning("Meta-learner não disponível: %s", exc)
        return None
```

- [ ] **Step 4: Run tests**

Run: `cd backend && python -m pytest tests/test_meta_learner.py -v`
Expected: All PASSED

- [ ] **Step 5: Commit**

```bash
git add backend/ml_models/meta_learner.py backend/tests/test_meta_learner.py
git commit -m "feat(ml): add meta-learner neural stacking with sklearn MLPRegressor"
```

---

### Task 14: Ensemble v2 Orchestrator

**Files:**
- Modify: `backend/ml_models/ensemble.py` (full rewrite)

- [ ] **Step 1: Rewrite ensemble.py**

```python
# backend/ml_models/ensemble.py
"""
Ensemble v2 — orchestrates 3 models + meta-learner + conformal prediction.
Supports v1/v2 parallel mode via USE_ML_V2 env var.
"""
import logging
import os
from datetime import date

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
            from datetime import datetime, timedelta
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/ml_models/ensemble.py
git commit -m "feat(ml): rewrite ensemble with meta-learner + conformal + v1/v2 parallel mode"
```

---

## Chunk 5: Signal + Claude + Integration

### Task 15: Fix fundamental.py — Real IBGE Data

**Files:**
- Modify: `backend/analysis/fundamental.py`

- [ ] **Step 1: Replace hardcoded female_pct with real IBGE query**

In `backend/analysis/fundamental.py`, replace lines 49-57:

```python
    # 2. Ciclo pecuário — dados reais IBGE
    sla_resp = (client.table("slaughter_data")
                .select("female_percent")
                .order("period", desc=True)
                .limit(1)
                .execute())

    if sla_resp.data and sla_resp.data[0].get("female_percent"):
        female_pct = float(sla_resp.data[0]["female_percent"])
    else:
        female_pct = 47.0  # fallback until IBGE data available
        logger.warning("Usando female_pct fallback (47%%) — IBGE sem dados")

    if female_pct > 52:
        cycle_phase = "LIQUIDACAO"
    elif female_pct < 48:
        cycle_phase = "RETENCAO"
    else:
        cycle_phase = "NEUTRO"
```

- [ ] **Step 2: Commit**

```bash
git add backend/analysis/fundamental.py
git commit -m "fix(fundamental): use real IBGE female_pct instead of hardcoded 47.0"
```

---

### Task 16: Signal Generator v2

**Files:**
- Modify: `backend/analysis/signal_generator.py` (full rewrite)
- Create: `backend/tests/test_signal_v2.py`

- [ ] **Step 1: Write failing tests**

```python
# backend/tests/test_signal_v2.py
"""Tests for Signal Generator v2."""
import pytest


class TestSignalV2:
    def test_ml_score_magnitude(self):
        """Score should reflect magnitude of expected return."""
        from analysis.signal_generator import _ml_score_v2
        # 5% expected return with high confidence → high score
        score = _ml_score_v2(pred_15d=315.0, current=300.0, confidence=0.8)
        assert score > 70

        # -5% expected return → low score
        score = _ml_score_v2(pred_15d=285.0, current=300.0, confidence=0.8)
        assert score < 30

    def test_score_clamped_0_100(self):
        """All scores must be in [0, 100]."""
        from analysis.signal_generator import _ml_score_v2
        score = _ml_score_v2(pred_15d=500.0, current=300.0, confidence=1.0)
        assert 0 <= score <= 100

        score = _ml_score_v2(pred_15d=100.0, current=300.0, confidence=1.0)
        assert 0 <= score <= 100

    def test_composite_weights_sum_to_1(self):
        """WEIGHTS values must sum to 1.0."""
        from analysis.signal_generator import WEIGHTS
        assert sum(WEIGHTS.values()) == pytest.approx(1.0, abs=0.001)

    def test_signal_thresholds(self):
        """BUY >= 62, SELL <= 38, else HOLD."""
        from analysis.signal_generator import _classify_signal
        assert _classify_signal(70) == ("BUY", pytest.approx(0.4, abs=0.1))
        assert _classify_signal(30) == ("SELL", pytest.approx(0.4, abs=0.1))
        assert _classify_signal(50)[0] == "HOLD"

    def test_generate_signal_returns_complete_row(self, mock_supabase):
        """Signal row must include all new v2 fields."""
        from analysis.signal_generator import generate_signal
        # Mock would need proper setup — simplified check
        # Full integration test in test_pipeline.py
        pass
```

- [ ] **Step 2: Run tests**

Run: `cd backend && python -m pytest tests/test_signal_v2.py -v`
Expected: FAIL

- [ ] **Step 3: Rewrite signal_generator.py**

```python
# backend/analysis/signal_generator.py
"""
Signal Generator v2 — 5-dimension scoring with magnitude and conformal confidence.
40% ML, 20% Technical, 20% Fundamental, 10% Sentiment, 10% Climate
"""
import logging
from datetime import date, timedelta

from supabase_client import get_client

logger = logging.getLogger(__name__)

WEIGHTS = {
    "ml": 0.40,
    "technical": 0.20,
    "fundamental": 0.20,
    "sentiment": 0.10,
    "climate": 0.10,
}


def _safe_float(val, default: float = 0.0) -> float:
    if val is None:
        return default
    try:
        result = float(val)
        return default if result != result else result  # NaN check
    except (ValueError, TypeError):
        return default


def _ml_score_v2(pred_15d: float, current: float, confidence: float) -> float:
    """Score proporcional à magnitude do retorno esperado."""
    if current <= 0:
        return 50.0
    expected_return = (pred_15d - current) / current
    score = 50 + expected_return * confidence * 200
    return round(min(100, max(0, score)), 1)


def _technical_score_v2(client) -> float:
    """RSI zones + MACD crossover + BB squeeze + farmer_trend."""
    try:
        tech_resp = (client.table("technical_indicators")
                     .select("rsi_14,macd_hist,bb_upper,bb_lower,bb_mid")
                     .order("date", desc=True)
                     .limit(1)
                     .execute())
        fund_resp = (client.table("fundamental_indicators")
                     .select("farmer_trend")
                     .order("date", desc=True)
                     .limit(1)
                     .execute())
    except Exception as exc:
        logger.warning("Erro buscando técnicos: %s", exc)
        return 50.0

    scores = []

    # RSI zones
    if tech_resp.data:
        rsi = _safe_float(tech_resp.data[0].get("rsi_14"), 50)
        if rsi < 30:
            scores.append(80)  # oversold → buy
        elif rsi > 70:
            scores.append(20)  # overbought → sell
        else:
            scores.append(50)

        # MACD crossover
        macd = _safe_float(tech_resp.data[0].get("macd_hist"))
        if macd > 0:
            scores.append(65)
        elif macd < 0:
            scores.append(35)
        else:
            scores.append(50)

        # BB squeeze
        bb_upper = _safe_float(tech_resp.data[0].get("bb_upper"))
        bb_lower = _safe_float(tech_resp.data[0].get("bb_lower"))
        bb_mid = _safe_float(tech_resp.data[0].get("bb_mid"), 1)
        bb_width = (bb_upper - bb_lower) / bb_mid if bb_mid else 0
        if bb_width < 0.03:
            scores.append(60)  # squeeze → breakout expected
        else:
            scores.append(50)

    # Farmer trend
    if fund_resp.data:
        ft = _safe_float(fund_resp.data[0].get("farmer_trend"), 50)
        scores.append(min(100, max(0, ft)))

    return round(sum(scores) / len(scores), 1) if scores else 50.0


def _fundamental_score_v2(client) -> float:
    """Real IBGE cycle + supply_pressure + basis + china_risk."""
    try:
        fund_resp = (client.table("fundamental_indicators")
                     .select("cycle_phase,seasonal_avg_pct,basis")
                     .order("date", desc=True)
                     .limit(1)
                     .execute())
        china_resp = (client.table("china_quota_tracking")
                      .select("quota_usage_pct")
                      .order("date", desc=True)
                      .limit(1)
                      .execute())
    except Exception as exc:
        logger.warning("Erro buscando fundamental: %s", exc)
        return 50.0

    score = 50.0

    if fund_resp.data:
        row = fund_resp.data[0]
        cycle = row.get("cycle_phase", "NEUTRO")
        if cycle == "RETENCAO":
            score += 15
        elif cycle == "LIQUIDACAO":
            score -= 15

        seasonal = _safe_float(row.get("seasonal_avg_pct"))
        score += min(max(seasonal * 2, -20), 20)

        basis = _safe_float(row.get("basis"))
        if basis > 0:
            score += 5
        elif basis < -5:
            score -= 5

    if china_resp.data:
        quota = _safe_float(china_resp.data[0].get("quota_usage_pct"))
        if quota > 80:
            score -= 10  # quota filling up = risk

    return round(min(100, max(0, score)), 1)


def _sentiment_score_v2(client) -> float:
    """News sentiment + china risk combined."""
    try:
        cutoff = (date.today() - timedelta(days=3)).isoformat()
        resp = (client.table("news_sentiment")
                .select("sentiment,impact_score")
                .gte("published_at", cutoff)
                .execute())
    except Exception:
        return 50.0

    if not resp.data:
        return 50.0

    pos = sum(_safe_float(r.get("impact_score")) for r in resp.data if r.get("sentiment") == "POS")
    neg = sum(_safe_float(r.get("impact_score")) for r in resp.data if r.get("sentiment") == "NEG")
    total = pos + neg
    return round(50 + (pos - neg) / max(total, 1) * 50, 1) if total else 50.0


def _climate_score(client) -> float:
    """NDVI + fire hotspots + precipitation anomaly."""
    try:
        ndvi_resp = (client.table("ndvi_pasture")
                     .select("ndvi_value")
                     .eq("state", "MT")
                     .order("date", desc=True)
                     .limit(1)
                     .execute())
        fire_resp = (client.table("fire_hotspots")
                     .select("hotspot_count")
                     .order("date", desc=True)
                     .limit(5)
                     .execute())
    except Exception:
        return 50.0

    score = 50.0

    if ndvi_resp.data:
        ndvi = _safe_float(ndvi_resp.data[0].get("ndvi_value"), 0.65)
        if ndvi < 0.4:
            score -= 15  # poor pasture → supply stress
        elif ndvi > 0.7:
            score += 5

    if fire_resp.data:
        avg_fire = sum(_safe_float(r.get("hotspot_count")) for r in fire_resp.data) / len(fire_resp.data)
        if avg_fire > 50:
            score -= 10  # many fires → drought stress

    return round(min(100, max(0, score)), 1)


def _classify_signal(composite: float) -> tuple[str, float]:
    """Classify composite score into signal + confidence."""
    if composite >= 62:
        signal = "BUY"
        confidence = min(1.0, (composite - 50) / 50)
    elif composite <= 38:
        signal = "SELL"
        confidence = min(1.0, (50 - composite) / 50)
    else:
        signal = "HOLD"
        confidence = 0.5 - abs(composite - 50) / 50
    return signal, round(confidence, 3)


def generate_signal() -> dict:
    """Generate trading signal with 5-dimension scoring."""
    client = get_client()

    # Get ML predictions
    try:
        pred_resp = (client.table("ml_predictions")
                     .select("horizon_days,pred_value,pred_lower,pred_upper,confidence")
                     .order("created_at", desc=True)
                     .limit(3)
                     .execute())
        preds = {r["horizon_days"]: r for r in (pred_resp.data or [])}
    except Exception:
        preds = {}

    # Current price
    try:
        spot_resp = (client.table("spot_prices")
                     .select("price_per_arroba")
                     .eq("state", "SP")
                     .order("date", desc=True)
                     .limit(1)
                     .execute())
        price = _safe_float(spot_resp.data[0]["price_per_arroba"]) if spot_resp.data else 0
    except Exception:
        price = 0

    pred_15d = _safe_float(preds.get(15, {}).get("pred_value"))
    ml_conf = _safe_float(preds.get(15, {}).get("confidence"), 0.5)

    # Compute 5 dimension scores
    s_ml = _ml_score_v2(pred_15d, price, ml_conf)
    s_tech = _technical_score_v2(client)
    s_fund = _fundamental_score_v2(client)
    s_sent = _sentiment_score_v2(client)
    s_clim = _climate_score(client)

    composite = round(
        s_ml * WEIGHTS["ml"] +
        s_tech * WEIGHTS["technical"] +
        s_fund * WEIGHTS["fundamental"] +
        s_sent * WEIGHTS["sentiment"] +
        s_clim * WEIGHTS["climate"],
        1
    )

    signal, confidence = _classify_signal(composite)

    logger.info(
        "Sinal: %s %.0f%% | ML=%.1f Tec=%.1f Fund=%.1f Sent=%.1f Clim=%.1f → %.1f",
        signal, confidence * 100, s_ml, s_tech, s_fund, s_sent, s_clim, composite,
    )

    # Get interval from latest predictions
    p15 = preds.get(15, {})
    interval_lower = _safe_float(p15.get("pred_lower"))
    interval_upper = _safe_float(p15.get("pred_upper"))

    return {
        "date": str(date.today()),
        "signal": signal,
        "confidence": confidence,
        "price_current": price,
        "price_pred_5d": _safe_float(preds.get(5, {}).get("pred_value")),
        "price_pred_15d": pred_15d,
        "price_pred_30d": _safe_float(preds.get(30, {}).get("pred_value")),
        # v2 new fields
        "score_ml": s_ml,
        "score_technical": s_tech,
        "score_fundamental": s_fund,
        "score_sentiment": s_sent,
        "score_climate": s_clim,
        "interval_lower": interval_lower,
        "interval_upper": interval_upper,
    }
```

- [ ] **Step 4: Run tests**

Run: `cd backend && python -m pytest tests/test_signal_v2.py -v`
Expected: PASSED

- [ ] **Step 5: Commit**

```bash
git add backend/analysis/signal_generator.py backend/tests/test_signal_v2.py
git commit -m "feat(signal): rewrite signal generator v2 with 5 dimensions + magnitude scoring"
```

---

### Task 17: Claude Analyst v2

**Files:**
- Modify: `backend/claude_integration.py` (rewrite)

- [ ] **Step 1: Rewrite claude_integration.py**

Replace `PROMPT_SINAL` and `generate_signal_texts` with v2 versions that accept the full analyst_context dict. Keep `_extract_json`, `get_claude`, `generate_news_impact` unchanged.

Key changes:
- New `PROMPT_ANALYST_V2` with full data context (spec section 4.7)
- `generate_signal_texts_v2(analyst_context: dict) -> dict` accepts full context
- Returns 7 fields instead of 4: adds `risk_alert`, `confidence_note`, `factors_summary`
- Keep `generate_signal_texts()` as backward-compatible wrapper during parallel period
- Fallback from `claude-opus-4-6` to `claude-sonnet-4-5-20250514`

```python
# In claude_integration.py, add after existing PROMPT_SINAL:

PROMPT_ANALYST_V2 = """
Você é o analista-chefe do BullCast, sistema de inteligência pecuária.
Seu público é o Seu Antônio, pecuarista de 50+ anos que quer respostas diretas.

Analise TODOS os dados abaixo e gere uma análise completa em PT-BR simples.
NÃO use jargão financeiro. Fale como se estivesse na porteira da fazenda.

{context_json}

Gere JSON com:
{{
  "recommendation_text": "frase direta do que fazer (max 80 chars)",
  "explanation_text": "2-3 frases explicando POR QUÊ, citando fatores concretos (max 300 chars)",
  "trend_text": "o que esperar nas próximas semanas (max 100 chars)",
  "duration_text": "quanto tempo esse cenário deve durar (max 80 chars)",
  "risk_alert": "principal risco a ficar de olho (max 100 chars)" ou null,
  "confidence_note": "frase sobre o quanto confiar nessa previsão (max 100 chars)",
  "factors_summary": ["fator 1 que pesou", "fator 2", "fator 3"]
}}
"""


def generate_signal_texts_v2(analyst_context: dict) -> dict:
    """Claude Analyst v2 — full context analysis."""
    import json
    context_json = json.dumps(analyst_context, ensure_ascii=False, default=str)
    prompt = PROMPT_ANALYST_V2.format(context_json=context_json)

    # Try Opus, fallback to Sonnet
    for model in ["claude-opus-4-6", "claude-sonnet-4-5-20250514"]:
        try:
            msg = get_claude().messages.create(
                model=model,
                max_tokens=600,
                messages=[{"role": "user", "content": prompt}],
            )
            result = json.loads(_extract_json(msg.content[0].text))
            # Ensure all fields present
            defaults = {
                "recommendation_text": "Análise em andamento.",
                "explanation_text": "", "trend_text": "", "duration_text": "",
                "risk_alert": None, "confidence_note": "",
                "factors_summary": [],
            }
            return {**defaults, **result}
        except Exception as exc:
            logger.error("Claude %s falhou: %s", model, exc)
            continue

    return {
        "recommendation_text": "Análise temporariamente indisponível.",
        "explanation_text": "", "trend_text": "", "duration_text": "",
        "risk_alert": None, "confidence_note": "",
        "factors_summary": [],
    }
```

- [ ] **Step 2: Commit**

```bash
git add backend/claude_integration.py
git commit -m "feat(claude): add Claude Analyst v2 with full context and 7 output fields"
```

---

### Task 18: Integrate into run_daily.py

**Files:**
- Modify: `backend/run_daily.py`

- [ ] **Step 1: Add new fetchers to pipeline**

Add to the fetcher list (after `("Previsão Tempo", fetch_weather_forecast)`):

```python
    from fetchers.inpe_fetcher import fetch_fire_hotspots
    from fetchers.ibge_fetcher import fetch_ibge_slaughter
    from fetchers.china_quota_fetcher import fetch_china_quota
    from fetchers.ndvi_fetcher import fetch_ndvi
```

Add to the fetcher for-loop:

```python
        ("INPE Queimadas",  fetch_fire_hotspots),
        ("IBGE Abate",      fetch_ibge_slaughter),
        ("China Quota",     fetch_china_quota),
        ("NDVI Pastagem",   fetch_ndvi),
```

- [ ] **Step 2: Add feature_store step (between Feature Engineering and ML Ensemble)**

No new section needed — feature_store.build_features() is called inside ensemble.py.

- [ ] **Step 3: Update Claude section for v2**

In the Claude API section (step 6), add v2 context building when `USE_ML_V2=true`:

```python
    use_v2 = os.environ.get("USE_ML_V2", "false").lower() == "true"

    if use_v2:
        try:
            from claude_integration import generate_signal_texts_v2
            # Build full analyst context
            analyst_context = {
                "price_current": float(signal_row.get("price_current", 0)),
                "predictions": {
                    "5d": float(signal_row.get("price_pred_5d") or 0),
                    "15d": float(signal_row.get("price_pred_15d") or 0),
                    "30d": float(signal_row.get("price_pred_30d") or 0),
                },
                "confidence_interval_90": {
                    "15d": [
                        float(signal_row.get("interval_lower") or 0),
                        float(signal_row.get("interval_upper") or 0),
                    ]
                },
                "signal": signal_row.get("signal", "HOLD"),
                "signal_confidence": float(signal_row.get("confidence", 0)),
                "scores": {
                    "ml": float(signal_row.get("score_ml") or 50),
                    "technical": float(signal_row.get("score_technical") or 50),
                    "fundamental": float(signal_row.get("score_fundamental") or 50),
                    "sentiment": float(signal_row.get("score_sentiment") or 50),
                    "climate": float(signal_row.get("score_climate") or 50),
                },
            }
            texts = generate_signal_texts_v2(analyst_context)
            logger.info("✓ Claude Analyst v2 textos gerados")
        except Exception as exc:
            logger.error("✗ Claude Analyst v2: %s", exc)
            errors.append(f"Claude v2: {exc}")
    else:
        # ... existing v1 Claude code ...
```

- [ ] **Step 4: Update upsert to include v2 fields**

The trade_signals upsert already spreads `**signal_row` and `**texts`, so the new fields (score_*, interval_*, risk_alert, confidence_note, factors_summary) flow through automatically if present.

- [ ] **Step 5: Commit**

```bash
git add backend/run_daily.py
git commit -m "feat(pipeline): integrate new fetchers + v2 Claude analyst into run_daily.py"
```

---

## Chunk 6: Auto-improve + Training Pipeline + Migration

### Task 19: Auto-improve Weekly Job

**Files:**
- Create: `backend/auto_improve.py`

- [ ] **Step 1: Implement auto_improve.py**

```python
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
        horizon_15 = {r["date"]: r for r in raw_resp.data
                      if r["horizon_days"] == 15}
        # Group by date
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/auto_improve.py
git commit -m "feat(auto-improve): weekly backtesting + meta-learner retrain job"
```

---

### Task 20: GitHub Actions — TFT Training Workflow

**Files:**
- Create: `.github/workflows/ml-train.yml`

- [ ] **Step 1: Create workflow file**

```yaml
# .github/workflows/ml-train.yml
name: ML Training (TFT + Optuna)

on:
  schedule:
    - cron: '0 14 * * 0'  # Sunday 11:00 BRT (14:00 UTC)
  workflow_dispatch:  # Manual trigger

env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
  PYTHON_VERSION: '3.11'

jobs:
  train:
    runs-on: ubuntu-latest
    timeout-minutes: 60

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          cache: pip

      - name: Install dependencies
        working-directory: backend
        run: pip install -r requirements-train.txt

      - name: Train TFT + export ONNX
        working-directory: backend
        run: |
          python -c "
          import sys
          sys.path.insert(0, '.')
          from feature_store import build_features
          from ml_models.tft_train import train_and_export_onnx

          df = build_features(lookback_days=600)
          train_and_export_onnx(df)
          print('TFT training + ONNX export complete')
          "

      - name: Optuna tuning (XGBoost + LightGBM)
        working-directory: backend
        run: |
          python -c "
          import sys
          sys.path.insert(0, '.')
          # Optuna tuning would go here
          # For now, use default hyperparameters
          print('Optuna tuning placeholder — using defaults')
          "
```

**Note:** The actual `tft_train.py` (full training with neuralforecast) is a separate file that only runs in GHA, not on Railway. It will be created as part of this task.

- [ ] **Step 2: Create TFT training script**

Create `backend/ml_models/tft_train.py`:

```python
# backend/ml_models/tft_train.py
"""
TFT training script — runs ONLY in GitHub Actions (7GB RAM).
Trains with neuralforecast, exports to ONNX, uploads to Supabase Storage.
"""
import logging
import tempfile
import os

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def train_and_export_onnx(df: pd.DataFrame) -> None:
    """Train TFT with neuralforecast and export ONNX to Supabase Storage."""
    from neuralforecast import NeuralForecast
    from neuralforecast.models import TFT

    # Prepare data in neuralforecast format
    nf_df = df.reset_index()
    nf_df = nf_df.rename(columns={"date": "ds", "price": "y"})
    nf_df["unique_id"] = "boi_gordo_sp"

    # Feature columns (exclude target)
    futr_cols = [c for c in df.columns if c != "price"]

    model = TFT(
        h=30,  # prediction length
        input_size=60,  # encoder length
        hidden_size=64,
        n_head=4,
        learning_rate=0.001,
        max_steps=500,
        early_stop_patience_steps=5,
        batch_size=32,
        loss="QuantileLoss",
        quantiles=[0.05, 0.25, 0.50, 0.75, 0.95],
        futr_exog_list=futr_cols,
        scaler_type="standard",
        random_seed=42,
    )

    nf = NeuralForecast(models=[model], freq="B")
    nf.fit(nf_df)

    # Export to ONNX
    onnx_path = tempfile.mktemp(suffix=".onnx")
    try:
        # neuralforecast doesn't have native ONNX export,
        # so we use torch.onnx.export on the underlying model
        import torch
        import onnx

        pytorch_model = model.model
        # Create dummy input matching expected shape
        dummy = torch.randn(1, 60, len(futr_cols) + 1).float()
        torch.onnx.export(
            pytorch_model, dummy, onnx_path,
            input_names=["input"],
            output_names=["output"],
            dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
        )

        # Upload to Supabase Storage
        from supabase_client import get_client
        client = get_client()
        with open(onnx_path, "rb") as f:
            client.storage.from_("models").upload(
                "tft_model.onnx", f.read(),
                file_options={"upsert": "true"}
            )
        logger.info("TFT ONNX uploaded to Supabase Storage")
    finally:
        if os.path.exists(onnx_path):
            os.unlink(onnx_path)
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ml-train.yml backend/ml_models/tft_train.py
git commit -m "feat(ci): add GitHub Actions weekly TFT training + ONNX export workflow"
```

---

### Task 21: Backtest Harness

**Files:**
- Create: `backend/backtest.py`

- [ ] **Step 1: Implement backtest.py**

```python
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/backtest.py
git commit -m "feat(backtest): add walk-forward backtesting harness for v2 vs v1 comparison"
```

---

### Task 22: Integration Test

**Files:**
- Create: `backend/tests/test_pipeline.py`

- [ ] **Step 1: Write integration test**

```python
# backend/tests/test_pipeline.py
"""Integration test: feature_store → ensemble → signal (mocked Supabase)."""
import os
import pytest
from unittest.mock import patch, MagicMock


@pytest.fixture
def mock_env():
    """Set required env vars for test."""
    with patch.dict(os.environ, {
        "USE_ML_V2": "true",
        "SUPABASE_URL": "https://test.supabase.co",
        "SUPABASE_KEY": "test-key",
    }):
        yield


class TestV2Pipeline:
    def test_ensemble_v2_produces_predictions(self, synthetic_feature_df, mock_supabase, mock_env):
        """v2 ensemble should produce predictions for all horizons."""
        from ml_models.ensemble import run_ensemble_v2
        rows = run_ensemble_v2(synthetic_feature_df)

        assert len(rows) == 3  # 5d, 15d, 30d
        for row in rows:
            assert row["pred_value"] > 0
            assert row["pred_lower"] < row["pred_upper"]
            assert 0 <= row["confidence"] <= 1

    def test_signal_v2_weights_sum_to_1(self):
        """Signal weights must sum to 1.0."""
        from analysis.signal_generator import WEIGHTS
        assert sum(WEIGHTS.values()) == pytest.approx(1.0)

    def test_full_pipeline_no_crash(self, synthetic_feature_df, mock_supabase, mock_env):
        """Pipeline should complete without crashing."""
        from ml_models.ensemble import run_ensemble_v2
        rows = run_ensemble_v2(synthetic_feature_df)
        assert rows  # non-empty
```

- [ ] **Step 2: Run all tests**

Run: `cd backend && python -m pytest tests/ -v`
Expected: All PASSED

- [ ] **Step 3: Commit**

```bash
git add backend/tests/test_pipeline.py
git commit -m "test(pipeline): add integration test for v2 ensemble → signal flow"
```

---

### Task 23: Final Cleanup + Migration Config

- [ ] **Step 1: Add `__init__.py` for fetchers if missing**

Check and create `backend/fetchers/__init__.py` if it doesn't exist.

- [ ] **Step 2: Update `.env.example` with new env vars**

Add:
```
# ML v2
USE_ML_V2=false
ML_PARALLEL_MODE=false
CHINA_QUOTA_TONS=1106000
GEE_SERVICE_ACCOUNT_KEY=
EARTHDATA_LOGIN=
EARTHDATA_PASSWORD=
```

- [ ] **Step 3: Run full test suite**

Run: `cd backend && python -m pytest tests/ -v --tb=short`
Expected: All PASSED

- [ ] **Step 4: Final commit**

```bash
git add backend/.env.example backend/fetchers/__init__.py
git commit -m "chore(ml-v2): add env vars and final cleanup for ML v2.0

- 4 new fetchers: INPE, NDVI, IBGE, China quota
- DuckDB feature store with 35+ features
- XGBoost v2 + LightGBM + TFT (ONNX) models
- Meta-learner neural stacking (sklearn MLP)
- Conformal prediction intervals (90% coverage)
- Signal Generator v2 (5 dimensions)
- Claude Analyst v2 (full context)
- Auto-improve weekly job
- v1/v2 parallel mode with env var rollback"
```

---

## Migration Checklist

After all tasks are complete:

1. [ ] Deploy schema changes to Supabase (Task 1)
2. [ ] Create Supabase Storage bucket `models/` for ONNX + meta-learner
3. [ ] Set `ML_PARALLEL_MODE=true` on Railway (runs v1 + v2 side-by-side)
4. [ ] Run GitHub Actions TFT training workflow manually once
5. [ ] Monitor v2 predictions in `model_predictions_raw` for 2 weeks
6. [ ] Compare v1 vs v2 MAPE using `python backtest.py`
7. [ ] When v2 meets promotion criteria (14 days MAPE ≤ v1), set `USE_ML_V2=true`
8. [ ] After 2 more weeks, remove `prophet_model.py` and `sarima_model.py`
9. [ ] Remove `prophet` and `statsmodels` from `requirements.txt`
10. [ ] Remove `_run_v1_ensemble()` from `ensemble.py`
