-- BULLCAST Schema PostgreSQL (Supabase)
-- Executar no SQL Editor do Supabase

-- 1. PREÇOS SPOT CEPEA
CREATE TABLE IF NOT EXISTS spot_prices (
  id               BIGSERIAL PRIMARY KEY,
  date             DATE NOT NULL,
  state            VARCHAR(2) NOT NULL DEFAULT 'SP',
  price_per_arroba NUMERIC(10,2) NOT NULL,
  price_per_kg     NUMERIC(10,4),
  variation_day    NUMERIC(6,4),
  variation_week   NUMERIC(6,4),
  source           VARCHAR(50) DEFAULT 'CEPEA',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, state)
);

-- 2. FUTUROS B3 (BGI)
CREATE TABLE IF NOT EXISTS futures_prices (
  id             BIGSERIAL PRIMARY KEY,
  date           DATE NOT NULL,
  contract_code  VARCHAR(10) NOT NULL,
  maturity_date  DATE,
  settle_price   NUMERIC(10,2) NOT NULL,
  open_interest  INTEGER,
  volume         INTEGER,
  source         VARCHAR(50) DEFAULT 'B3',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, contract_code)
);

-- 3. PREÇOS POR CATEGORIA DE ANIMAL
CREATE TABLE IF NOT EXISTS cattle_categories (
  id              BIGSERIAL PRIMARY KEY,
  date            DATE NOT NULL,
  category        VARCHAR(30) NOT NULL,
  weight_min      INTEGER,
  weight_max      INTEGER,
  price_per_kg    NUMERIC(10,4),
  price_per_head  NUMERIC(10,2),
  variation_day   NUMERIC(6,4),
  variation_week  NUMERIC(6,4),
  state           VARCHAR(2) DEFAULT 'SP',
  source          VARCHAR(50) DEFAULT 'CEPEA',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, category, state)
);

-- 4. ABATES IBGE
CREATE TABLE IF NOT EXISTS slaughter_data (
  id              BIGSERIAL PRIMARY KEY,
  period          DATE NOT NULL,
  total_head      INTEGER,
  female_head     INTEGER,
  female_percent  NUMERIC(5,2),
  state           VARCHAR(2) DEFAULT 'BR',
  source          VARCHAR(50) DEFAULT 'IBGE',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (period, state)
);

-- 5. EXPORTAÇÕES
CREATE TABLE IF NOT EXISTS export_data (
  id           BIGSERIAL PRIMARY KEY,
  date         DATE NOT NULL,
  destination  VARCHAR(50),
  volume_tons  NUMERIC(12,2),
  value_usd    NUMERIC(15,2),
  source       VARCHAR(50) DEFAULT 'SECEX',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, destination)
);

-- 6. MACRO
CREATE TABLE IF NOT EXISTS macro_data (
  id          BIGSERIAL PRIMARY KEY,
  date        DATE NOT NULL UNIQUE,
  usd_brl     NUMERIC(8,4),
  selic_rate  NUMERIC(6,4),
  ipca_month  NUMERIC(6,4),
  source      VARCHAR(50) DEFAULT 'BCB',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INDICADORES TÉCNICOS
CREATE TABLE IF NOT EXISTS technical_indicators (
  id          BIGSERIAL PRIMARY KEY,
  date        DATE NOT NULL UNIQUE,
  rsi_14      NUMERIC(6,2),
  macd_line   NUMERIC(8,4),
  macd_signal NUMERIC(8,4),
  macd_hist   NUMERIC(8,4),
  bb_upper    NUMERIC(10,2),
  bb_mid      NUMERIC(10,2),
  bb_lower    NUMERIC(10,2),
  sma_9       NUMERIC(10,2),
  sma_21      NUMERIC(10,2),
  sma_50      NUMERIC(10,2),
  sma_200     NUMERIC(10,2),
  ema_9       NUMERIC(10,2),
  ema_21      NUMERIC(10,2),
  atr_14      NUMERIC(8,4),
  stoch_k     NUMERIC(6,2),
  stoch_d     NUMERIC(6,2),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INDICADORES FUNDAMENTALISTAS
CREATE TABLE IF NOT EXISTS fundamental_indicators (
  id                   BIGSERIAL PRIMARY KEY,
  date                 DATE NOT NULL UNIQUE,
  basis                NUMERIC(8,2),
  cycle_phase          VARCHAR(20),
  female_percent_smooth NUMERIC(5,2),
  farmer_momentum      NUMERIC(5,1),
  farmer_trend         NUMERIC(5,1),
  farmer_direction     NUMERIC(5,1),
  bullish_count        SMALLINT,
  bearish_count        SMALLINT,
  neutral_count        SMALLINT,
  seasonal_avg_pct     NUMERIC(6,3),
  trade_ratio_bezerro  NUMERIC(6,3),
  trade_ratio_milho    NUMERIC(6,3),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CLIMA POR UF
CREATE TABLE IF NOT EXISTS climate_data (
  id                       BIGSERIAL PRIMARY KEY,
  date                     DATE NOT NULL,
  state                    VARCHAR(2) NOT NULL,
  precipitation_mm         NUMERIC(8,2),
  temp_avg                 NUMERIC(5,2),
  temp_max                 NUMERIC(5,2),
  precipitation_anomaly_pct NUMERIC(6,2),
  risk_level               VARCHAR(10),
  pasture_condition        VARCHAR(20),
  source                   VARCHAR(50) DEFAULT 'NASA_POWER',
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, state)
);

-- 10. PREVISÃO CLIMÁTICA (Open-Meteo 7d)
CREATE TABLE IF NOT EXISTS weather_forecast (
  id                  BIGSERIAL PRIMARY KEY,
  date                DATE NOT NULL,
  state               VARCHAR(10) NOT NULL,
  location_name       VARCHAR(50),
  forecast_type       VARCHAR(10) DEFAULT '7d',
  temp_max            NUMERIC(5,2),
  temp_min            NUMERIC(5,2),
  temp_avg            NUMERIC(5,2),
  precipitation_mm    NUMERIC(8,2) DEFAULT 0,
  precipitation_prob  NUMERIC(5,2),
  wind_max_kmh        NUMERIC(6,2),
  humidity_avg        NUMERIC(5,2),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, state)
);

CREATE INDEX IF NOT EXISTS idx_weather_forecast_date ON weather_forecast(date DESC);
CREATE INDEX IF NOT EXISTS idx_weather_forecast_state ON weather_forecast(state, date DESC);

ALTER TABLE weather_forecast ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_public ON weather_forecast FOR SELECT USING (true);

-- 11. PREVISÕES ML
CREATE TABLE IF NOT EXISTS ml_predictions (
  id                  BIGSERIAL PRIMARY KEY,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  horizon_days        SMALLINT NOT NULL,
  pred_value          NUMERIC(10,2),
  pred_lower          NUMERIC(10,2),
  pred_upper          NUMERIC(10,2),
  confidence          NUMERIC(5,3),
  model_name          VARCHAR(30),
  mape                NUMERIC(6,4),
  directional_accuracy NUMERIC(5,3),
  feature_importance  JSONB
);

-- 11. NOTÍCIAS CLASSIFICADAS
CREATE TABLE IF NOT EXISTS news_sentiment (
  id              BIGSERIAL PRIMARY KEY,
  published_at    TIMESTAMPTZ,
  title           TEXT NOT NULL,
  url             TEXT UNIQUE,
  source          VARCHAR(50),
  summary         TEXT,
  sentiment       VARCHAR(10),
  confidence      NUMERIC(5,3),
  impact_score    SMALLINT DEFAULT 0,
  impact_text_pt  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SINAIS CONSOLIDADOS
CREATE TABLE IF NOT EXISTS trade_signals (
  id                  BIGSERIAL PRIMARY KEY,
  date                DATE NOT NULL UNIQUE,
  signal              VARCHAR(10) NOT NULL,
  confidence          NUMERIC(5,3),
  price_current       NUMERIC(10,2),
  price_pred_5d       NUMERIC(10,2),
  price_pred_15d      NUMERIC(10,2),
  price_pred_30d      NUMERIC(10,2),
  recommendation_text TEXT,
  explanation_text    TEXT,
  trend_text          TEXT,
  duration_text       TEXT,
  volatility_regime   VARCHAR(20),
  circuit_breaker_level VARCHAR(10),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 13. EVENTOS CISNE NEGRO
CREATE TABLE IF NOT EXISTS crisis_events (
  id                    BIGSERIAL PRIMARY KEY,
  detected_at           TIMESTAMPTZ DEFAULT NOW(),
  event_type            VARCHAR(30),
  severity              SMALLINT,
  description           TEXT,
  keywords_matched      TEXT[],
  circuit_breaker_level VARCHAR(10),
  resolved_at           TIMESTAMPTZ
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_spot_prices_date ON spot_prices(date DESC);
CREATE INDEX IF NOT EXISTS idx_spot_prices_state ON spot_prices(state, date DESC);
CREATE INDEX IF NOT EXISTS idx_futures_date ON futures_prices(date DESC);
CREATE INDEX IF NOT EXISTS idx_cattle_date ON cattle_categories(date DESC);
CREATE INDEX IF NOT EXISTS idx_climate_state ON climate_data(state, date DESC);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_sentiment(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_impact ON news_sentiment(impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_signals_date ON trade_signals(date DESC);

-- ROW LEVEL SECURITY
ALTER TABLE spot_prices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE futures_prices    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cattle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE slaughter_data    ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_data       ENABLE ROW LEVEL SECURITY;
ALTER TABLE macro_data        ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundamental_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE climate_data      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sentiment    ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_signals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_events     ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE LEITURA PÚBLICA
CREATE POLICY read_public ON spot_prices FOR SELECT USING (true);
CREATE POLICY read_public ON futures_prices FOR SELECT USING (true);
CREATE POLICY read_public ON cattle_categories FOR SELECT USING (true);
CREATE POLICY read_public ON slaughter_data FOR SELECT USING (true);
CREATE POLICY read_public ON export_data FOR SELECT USING (true);
CREATE POLICY read_public ON macro_data FOR SELECT USING (true);
CREATE POLICY read_public ON technical_indicators FOR SELECT USING (true);
CREATE POLICY read_public ON fundamental_indicators FOR SELECT USING (true);
CREATE POLICY read_public ON climate_data FOR SELECT USING (true);
CREATE POLICY read_public ON ml_predictions FOR SELECT USING (true);
CREATE POLICY read_public ON news_sentiment FOR SELECT USING (true);
CREATE POLICY read_public ON trade_signals FOR SELECT USING (true);
CREATE POLICY read_public ON crisis_events FOR SELECT USING (true);

-- VIEW: Dashboard Latest
CREATE OR REPLACE VIEW dashboard_latest AS
SELECT
  sp.date,
  sp.price_per_arroba,
  sp.variation_day,
  sp.variation_week,
  m.usd_brl,
  fi.basis,
  fi.cycle_phase,
  fi.farmer_momentum,
  fi.farmer_trend,
  fi.farmer_direction,
  fi.bullish_count,
  fi.bearish_count,
  fi.neutral_count,
  fi.seasonal_avg_pct,
  fi.trade_ratio_bezerro,
  ts.signal,
  ts.confidence,
  ts.recommendation_text,
  ts.explanation_text,
  ts.trend_text,
  ts.duration_text,
  ts.volatility_regime,
  ts.circuit_breaker_level,
  ts.price_pred_5d,
  ts.price_pred_15d,
  ts.price_pred_30d
FROM spot_prices sp
LEFT JOIN macro_data m ON m.date = sp.date
LEFT JOIN fundamental_indicators fi ON fi.date = sp.date
LEFT JOIN trade_signals ts ON ts.date = sp.date
WHERE sp.state = 'SP'
ORDER BY sp.date DESC
LIMIT 1;
