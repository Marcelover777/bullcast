# BullCast ML v2.0 — Prediction Engine Spec

**Data:** 2026-03-19
**Status:** Draft
**Escopo:** Backend de inteligência (Feature Store → Modelos → Signal → Claude Analyst)
**Fora de escopo:** Frontend, WhatsApp, Telegram, Dashboard

---

## 1. Problem Statement

O sistema de previsão atual usa 3 modelos fracos (XGBoost com 7 features, Prophet univariado, SARIMA com ordem fixa) que ignoram 90% dos dados já coletados. Intervalos de confiança são falsos (`±1.5×MAPE`), pesos do ensemble são estáticos, e o ciclo pecuário é hardcoded (`female_pct = 47.0`). O resultado é uma previsão que subutiliza drasticamente a infraestrutura de coleta de dados existente.

## 2. Success Criteria

| Métrica | Baseline atual | Target v2.0 | Como medir |
|---------|:-:|:-:|------------|
| Features alimentando ML | 7 | 35+ | Contagem no feature store |
| MAPE médio (15d horizon) | Desconhecido (sem backtesting) | < 4% | Backtesting walk-forward 6 meses |
| Directional accuracy (5d) | Desconhecido | > 70% | Backtesting walk-forward 6 meses |
| Calibração intervalos 90% | Não calibrados | 85-95% coverage | Conformal empirical coverage |
| Pesos ensemble | Estáticos | Dinâmicos (atualização semanal) | Meta-learner weights log |
| Ciclo pecuário | Hardcoded | Real IBGE | Verificação manual dados SIDRA |
| Latência pipeline completo | ~5-8 min (estimado) | < 15 min | Log de tempo run_daily.py |

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 1. DATA COLLECTION (existente + novo)        │
│  Fetchers: CEPEA, B3, Macro, News, Climate (existentes)     │
│  + INPE Queimadas, NASA NDVI, IBGE Abate Real, SECEX Export │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                 2. FEATURE STORE (DuckDB)                    │
│  Materializa 35+ features de 14+ tabelas Supabase           │
│  + dados novos (NDVI, focos calor, abate real)               │
│  Output: DataFrame unificado date-indexed                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼───────┐ ┌──▼──────────┐
       │  XGBoost v2 │ │ LightGBM │ │     TFT     │
       │  35+ feat   │ │ 35+ feat │ │  temporal   │
       │  walk-fwd   │ │ walk-fwd │ │  attention  │
       │  recursive  │ │ recursive│ │  multi-hrz  │
       │  multi-step │ │ multi-stp│ │  quantile   │
       └──────┬──────┘ └──┬───────┘ └──┬──────────┘
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────▼──────┐
                    │ Meta-learner│  Neural stacking
                    │  (2-layer   │  pesos dinâmicos
                    │   32 units) │  retreino semanal
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Conformal  │  Prediction intervals
                    │  intervals  │  calibrados (90%)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Signal    │  Composite score
                    │ Generator   │  com magnitude +
                    │    v2.0     │  confiança conformal
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Claude    │  Análise completa
                    │   Analyst   │  com TODOS os dados
                    └─────────────┘
```

## 4. Component Specifications

### 4.1 New Fetchers

#### 4.1.1 INPE Queimadas Fetcher
- **Fonte:** `https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/diario/`
- **Formato:** CSV diário, arquivos nomeados `focos_diario_YYYYMMDD.csv`
- **Método de acesso:** HTTP GET no file server (não é REST API). Fetcher constrói URL por data e faz download do CSV. Se o arquivo do dia não existir ainda, tenta dia anterior (delay de publicação ~24h).
- **Granularidade:** Diário por estado
- **Processamento:** Filtrar por estado (SP, MT, GO, MS, MG), agregar COUNT de focos por estado/dia
- **Fallback:** Se file server indisponível, manter último valor conhecido (forward-fill no feature store)
- **Tabela destino:** `fire_hotspots` (nova)
- **Schema:**
  ```sql
  CREATE TABLE fire_hotspots (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    state VARCHAR(2) NOT NULL,
    hotspot_count INTEGER NOT NULL,
    risk_level VARCHAR(10), -- BAIXO/MEDIO/ALTO/CRITICO
    source VARCHAR(20) DEFAULT 'INPE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (date, state)
  );
  ```

#### 4.1.2 NDVI Pasture Index Fetcher
- **Fonte primária:** Google Earth Engine API via `earthengine-api` (acesso direto, sem fila assíncrona)
- **Fonte fallback:** NASA AppEEARS (requer Earthdata Login — submissão async, delay horas)
- **Produto:** MOD13A2 v061 (NDVI 16 dias, 1km resolução)
- **Cobertura:** Regiões pecuárias BR (bounding boxes por estado: SP, MT, GO, MS, MG)
- **Granularidade:** 16 dias por estado (interpolação linear pra dias intermediários)
- **Autenticação:** Service account GEE (JSON key em env var `GEE_SERVICE_ACCOUNT_KEY`). Para AppEEARS: `EARTHDATA_LOGIN` + `EARTHDATA_PASSWORD` em env vars.
- **Cold-start:** Na primeira execução, backfill dos últimos 12 meses de NDVI via GEE batch export. Nos runs diários subsequentes, só busca o composite mais recente.
- **Lag de dados:** MODIS composite tem ~8-16 dias de atraso. Feature store faz forward-fill do último valor disponível.
- **Tabela destino:** `ndvi_pasture` (nova)
- **Schema:**
  ```sql
  CREATE TABLE ndvi_pasture (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    state VARCHAR(2) NOT NULL,
    ndvi_value NUMERIC(6,4), -- -1 a 1 (>0.6 = pastagem saudável)
    ndvi_anomaly NUMERIC(6,4), -- desvio da média histórica
    source VARCHAR(20) DEFAULT 'MODIS',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (date, state)
  );
  ```

#### 4.1.3 IBGE Slaughter Real Data Fetcher
- **Fonte:** API SIDRA IBGE (`https://apisidra.ibge.gov.br/`)
- **Tabela SIDRA:** 1093 (Abate trimestral por tipo e sexo)
- **Granularidade:** Trimestral por estado (lag ~2 meses)
- **Processamento:** Calcular `female_pct` real, interpolar pra diário
- **Tabela destino:** `slaughter_data` (já existe, enriquecer com dados reais)
- **Mudança no `fundamental.py`:** Substituir `female_pct = 47.0` por query real

#### 4.1.4 China Quota Tracker
- **Fonte:** SECEX/Comex Stat API (`https://comexstat.mdic.gov.br/pt/geral`)
- **Dados:** Volume mensal exportado pra China (NCM 0201/0202)
- **Processamento:** Calcular `quota_usage_pct = acumulado_ano / 1_106_000 * 100`
- **Tabela destino:** `china_quota_tracking` (nova)
- **Schema:**
  ```sql
  CREATE TABLE china_quota_tracking (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    month_volume_tons NUMERIC(12,2),
    ytd_volume_tons NUMERIC(12,2),
    quota_total_tons NUMERIC(12,2) NOT NULL,  -- SEM DEFAULT: fetcher DEVE informar explicitamente
    quota_usage_pct NUMERIC(5,2),
    source VARCHAR(20) DEFAULT 'COMEXSTAT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (date)
  );
  -- quota_total_tons vem de env var CHINA_QUOTA_TONS (default 1106000 no código, não no schema)
  -- Quando a cota for renegociada, basta atualizar a env var sem migration
  ```

### 4.2 Feature Store (DuckDB)

#### Arquivo: `backend/feature_store.py`

**Responsabilidade:** Materializar todas as features de todas as fontes num único DataFrame indexado por data, pronto pra consumo dos modelos.

**Design:**
- **Sem DuckDB persistente** — Railway tem filesystem efêmero (perde arquivos a cada deploy). DuckDB é usado como engine de transformação in-memory durante o pipeline, não como store persistente.
- Função `build_features(lookback_days=600) -> pd.DataFrame` que:
  1. Conecta ao Supabase e baixa raw data de todas as tabelas (batch de queries paralelas)
  2. Carrega tudo em DuckDB in-memory (`duckdb.connect(':memory:')`)
  3. Faz feature engineering com SQL (JOINs, window functions, aggregations — mais eficiente que pandas pra 14 tabelas)
  4. Retorna DataFrame com ~35 colunas, indexed por date
- **Otimização:** só busca dados desde `max(lookback_days, last_feature_date)` — feature já computadas para datas antigas não precisam ser recalculadas (mas como não persiste, recomputa tudo a cada run — ok pra 600 rows × 14 tabelas, ~2s total)

**Feature Groups computados:**

```python
FEATURE_GROUPS = {
    "price_momentum": [
        "price", "lag_1", "lag_5", "lag_15", "lag_30",
        "roll_7", "roll_21", "roll_50",
        "return_1d", "return_5d", "return_15d",
        "seasonal_adj_momentum", "volatility_21d",
    ],
    "technical": [
        "rsi_14", "macd_hist", "bb_width", "bb_position",
        "sma_cross_9_21", "ema_cross_9_21",
    ],
    "fundamental": [
        "basis", "basis_zscore",
        "cycle_phase_encoded", "female_pct_real",
        "seasonal_avg_pct", "trade_ratio_bezerro",
        "supply_pressure",
    ],
    "macro_cross": [
        "usd_brl", "usd_brl_return_5d", "selic_rate",
        "cross_milho_boi", "cross_cambio_boi_corr21d",
    ],
    "sentiment_risk": [
        "sentiment_score_3d", "news_volume_3d",
        "china_risk_score", "crisis_active",
    ],
    "climate_pasture": [
        "ndvi_pasture_mt", "fire_hotspots_total",
        "precip_anomaly", "temp_stress",
    ],
    "futures_market": [
        "futures_term_structure", "futures_volume",
        "countdown_cota_china",
    ],
}
```

**Tratamento de missing data:**
- Features com lag temporal (NDVI 16d, IBGE trimestral): forward-fill
- Features sem dado: imputar com mediana histórica (nunca NaN pro modelo)
- Flag `_missing` binário pra features imputadas (o modelo aprende quando o dado é real vs imputado)

### 4.3 ML Models

#### 4.3.1 XGBoost v2

**Arquivo:** `backend/ml_models/xgboost_model.py` (reescrever)

**Mudanças vs v1:**
- **Features:** Recebe DataFrame do feature_store (35+ cols) em vez de build_features() interno
- **Walk-forward real:** Expanding window com re-treino a cada fold (mínimo 5 folds)
  ```
  Fold 1: train[0:300]   test[300:330]
  Fold 2: train[0:330]   test[330:360]
  Fold 3: train[0:360]   test[360:390]
  ...
  ```
- **Multi-step prediction:** Recursive strategy — prevê t+1, adiciona ao input, prevê t+2, etc.
- **Hyperparameters:** Optuna tuning semanal (no job de auto-melhoria), default sensato:
  ```python
  {
      "n_estimators": 800,
      "max_depth": 6,
      "learning_rate": 0.03,
      "subsample": 0.8,
      "colsample_bytree": 0.7,
      "reg_alpha": 0.1,
      "reg_lambda": 1.0,
      "min_child_weight": 5,
  }
  ```
- **Output:** `dict` com `pred_values` (array por step), `feature_importance`, `mape`, `directional_accuracy`

#### 4.3.2 LightGBM

**Arquivo:** `backend/ml_models/lightgbm_model.py` (novo)

**Design:** Espelho do XGBoost v2 mas com LightGBM:
- Mesmas features, mesmo walk-forward, mesmo multi-step
- Parâmetros:
  ```python
  {
      "n_estimators": 800,
      "max_depth": -1,  # unlimited (LightGBM lida melhor com depth)
      "learning_rate": 0.03,
      "num_leaves": 63,
      "subsample": 0.8,
      "colsample_bytree": 0.7,
      "min_child_samples": 20,
      "reg_alpha": 0.1,
      "reg_lambda": 1.0,
  }
  ```
- Vantagem: ~3x mais rápido que XGBoost, bom pra ter duas perspectivas de gradient boosting

#### 4.3.3 Temporal Fusion Transformer (TFT)

**Arquivo:** `backend/ml_models/tft_model.py` (novo)

**Library:** `neuralforecast` (Nixtla) — ativamente mantida, API mais simples que `pytorch-forecasting` (que parou em 0.10.x e nunca lançou 1.0). Nixtla inclui TFT nativo com mesma arquitetura.

**Design:**
- **Time-varying known inputs:** `month`, `week`, `is_entressafra`, `seasonal_avg_pct`, `countdown_cota_china`
- **Time-varying unknown inputs:** Todas as outras features (preço, técnicos, fundamentais, sentimento, clima)
- **Static inputs:** Nenhum (single series — boi gordo SP)
- **Multi-horizon:** Prediz 5, 15, 30 dias em UMA passada (não recursivo)
- **Quantile loss:** Quantis [0.05, 0.25, 0.50, 0.75, 0.95] → intervalos nativos
- **Encoder length:** 60 dias (starting point — avaliar 90 e 120 durante backtesting, ciclo pecuário opera em escala multi-ano)
- **Prediction length:** 30 dias (horizonte máximo)
- **Training:**
  - Walk-forward: treina com dados até T, valida T+1 a T+30, shift e repete
  - Epochs: 50 com early stopping (patience=5)
  - Batch size: 32
  - Learning rate: 0.001 com ReduceLROnPlateau
- **Interpretabilidade:** Extrair attention weights → "O TFT deu mais peso pro câmbio e sentimento de notícias essa semana"

**Deployment Strategy (resolve constraint de RAM):**

O TFT com PyTorch NÃO cabe no Railway free tier (512MB). A stack existente já consome ~200-300MB. Solução: **split training vs inference**.

| Ambiente | O que roda | RAM |
|----------|-----------|-----|
| **GitHub Actions** (CI gratuito) | Treino TFT + Optuna tuning + meta-learner retreino | 7GB disponível |
| **Railway** (cron diário) | Inferência com modelo ONNX serializado | ~50MB adicional |

**Fluxo:**
1. GitHub Actions workflow semanal (ou on-demand):
   - Clona repo, instala PyTorch + neuralforecast
   - Baixa dados do Supabase, treina TFT walk-forward
   - Exporta modelo pra ONNX: `torch.onnx.export()` (~5-10MB)
   - Upload do ONNX pra Supabase Storage (bucket `models/`)
   - Também retreina meta-learner e faz Optuna tuning dos gradient boosters
2. Railway cron diário:
   - Baixa ONNX do Supabase Storage
   - Inferência via `onnxruntime` (~20MB RAM, sem PyTorch)
   - XGBoost + LightGBM treinam direto no Railway (leves, cabem na RAM)

**Dependências Railway (sem PyTorch):**
```
onnxruntime>=1.17.0  # ~20MB, inference-only
```

**Dependências GitHub Actions (treino completo):**
```
neuralforecast>=1.7.0
lightning>=2.0.0
torch>=2.0.0
onnx>=1.15.0
```

#### 4.3.4 Interface Comum

Todos os modelos implementam:
```python
class ModelResult(TypedDict):
    model_name: str
    horizon_days: int
    pred_final: float            # point forecast no horizonte final (ex: preço em t+15)
    mape: float                  # MAPE do walk-forward validation
    directional_accuracy: float  # % acertos de direção no validation
    feature_importance: dict[str, float]  # top features (vazio pra TFT ONNX)

def train_and_predict(df: pd.DataFrame, horizon: int) -> ModelResult | None:
    """Interface comum. df = output do feature_store."""
    ...
```

**Nota sobre `pred_values` vs `pred_final`:**
- Internamente, modelos multi-step (TFT) produzem array de valores por step. Isso fica em memória durante o pipeline.
- O que vai pro Supabase (`ml_predictions`) é apenas `pred_final` (= valor no último step do horizonte), mantendo compatibilidade com o schema existente (`pred_value NUMERIC(10,2)`).
- O `pred_lower` e `pred_upper` não vêm mais dos modelos individuais — vêm do conformal prediction (seção 4.4) aplicado sobre o ensemble final. Removidos da interface do modelo.

**Schema `ml_predictions` — sem mudança estrutural:**
O schema atual já atende. O campo `pred_value` recebe `pred_final`. Os campos `pred_lower`/`pred_upper` serão preenchidos pelo conformal prediction após o ensemble, não por cada modelo individual.

### 4.4 Conformal Prediction (Intervalos Calibrados)

**Arquivo:** `backend/ml_models/conformal.py` (novo)

**Abordagem:** Conformal prediction baseado em resíduos, aplicado SOMENTE sobre o output final do ensemble (não por modelo individual). Isso é mais simples, mais robusto, e não depende de cada modelo implementar interface scikit-learn.

**Por que não usar `MapieTimeSeriesRegressor` diretamente:**
- `MapieTimeSeriesRegressor` exige que o modelo implemente `fit`/`predict` sklearn. O TFT (ONNX) não implementa.
- Wrapping individual de cada modelo geraria 3 intervalos que depois precisariam ser combinados — complexidade desnecessária.
- A abordagem de resíduos do ensemble é mais simples e igualmente válida estatisticamente.

**Design:**
1. Durante o pipeline diário, após o meta-learner produzir o point forecast do ensemble, armazenar `(date, prediction, actual)` na tabela `model_performance`.
2. Com 90+ dias de histórico, calcular os resíduos: `residuals = actual - prediction`.
3. Aplicar conformal interval: `[pred + q_lower, pred + q_upper]` onde `q_lower = quantile(residuals, alpha/2)` e `q_upper = quantile(residuals, 1-alpha/2)`. Como `residuals = actual - prediction`, q_lower é tipicamente negativo e q_upper positivo, gerando `pred + q_lower < pred < pred + q_upper`.

```python
import numpy as np

def calibrate_interval(
    residuals: np.ndarray,  # histórico: actual - prediction (90+ pontos)
    new_prediction: float,
    alpha: float = 0.1,     # 90% coverage
) -> tuple[float, float]:
    """Conformal interval sobre resíduos do ensemble."""
    q_lower = np.quantile(residuals, alpha / 2)
    q_upper = np.quantile(residuals, 1 - alpha / 2)
    return (
        round(new_prediction + q_lower, 2),
        round(new_prediction + q_upper, 2),
    )
```

**Cold-start (primeiros 90 dias):**
- Sem resíduos suficientes, usar intervalo heurístico dos quantis do TFT [0.05, 0.95] como stopgap
- Quando 90+ resíduos disponíveis, conformal assume automaticamente

**Validação:**
- Medir empirical coverage semanalmente no `auto_improve.py`
- Se coverage < 85% ou > 95%, re-calibrar com janela de resíduos mais curta/longa
- Log coverage no `model_performance`

**TFT quantiles como complemento (não substituto):**
- O TFT nativo produz quantis [0.05, 0.50, 0.95] — estes ficam disponíveis como "intervalos do TFT" pro Claude Analyst interpretar, mas o intervalo OFICIAL pro Seu Antônio é o conformal do ensemble.

### 4.5 Meta-learner (Neural Stacking)

**Arquivo:** `backend/ml_models/meta_learner.py` (novo)

**Design:**
- `sklearn.neural_network.MLPRegressor` (sem PyTorch — roda direto no Railway, 0MB adicional):
  ```
  Input (9): [xgb_pred, lgb_pred, tft_pred, xgb_mape_30d, lgb_mape_30d,
              tft_mape_30d, xgb_dir_acc, lgb_dir_acc, tft_dir_acc]
  → hidden_layer_sizes=(32, 16)
  → activation='relu'
  → max_iter=500
  → output: weighted prediction
  ```
- **Por que sklearn e não PyTorch:** O meta-learner precisa rodar no Railway semanalmente (`auto_improve.py`). PyTorch não está no Railway (só no GitHub Actions). sklearn já é dependência existente — custo zero.
- **Treino:** Dados dos últimos 90 dias de `model_predictions_raw` (previsão de cada modelo vs preço real)
- **Retreino:** Semanal (job domingo no Railway)
- **Fallback:** Se não tiver dados suficientes pra treinar (< 90 dias), usa média simples dos 3 modelos
- **Persistência:** Serializa com `joblib.dump()` e salva em Supabase Storage (`models/meta_learner.joblib`) — Railway tem filesystem efêmero

**Pesos interpretativos:**
- Extrair gradient-based feature importance pra saber qual modelo está dominando
- Log: "Semana 12: TFT=45%, XGBoost=35%, LightGBM=20%"

### 4.6 Signal Generator v2

**Arquivo:** `backend/analysis/signal_generator.py` (reescrever)

**Mudanças vs v1:**

1. **Composite score com magnitude:**
   ```python
   # v1: score binário (pred > current → bullish)
   # v2: score proporcional à magnitude esperada, clamped [0, 100]
   expected_return = (pred_15d - current) / current
   ml_score = min(100, max(0, 50 + expected_return * confidence * 200))
   ```

2. **Technical score expandido:**
   - Não só farmer_trend, mas RSI zones + MACD crossover + BB squeeze detection
   - Score: média ponderada de 5 indicadores em vez de 1

3. **Fundamental score desmocado:**
   - `female_pct` real do IBGE (slaughter_data)
   - `supply_pressure` composite (female% × export × slaughter_trend)
   - `china_risk_score` (quota usage + tariff news)

4. **Confiança do conformal interval:**
   - `confidence` do sinal agora vem do conformal interval width
   - Intervalo estreito = alta confiança, largo = baixa

5. **Novos pesos (calibráveis):**
   ```python
   WEIGHTS = {
       "ml": 0.40,        # Previsão quantitativa
       "technical": 0.20,  # Indicadores técnicos (ampliado)
       "fundamental": 0.20, # Fundamentos (desmocado)
       "sentiment": 0.10,  # Notícias + China risk
       "climate": 0.10,    # Clima + pastagem (NOVO)
   }
   ```

### 4.7 Claude Analyst

**Arquivo:** `backend/claude_integration.py` (reescrever)

**Mudanças vs v1:**

**v1:** Claude recebe sinal + preço + previsão → formata 4 frases curtas.
**v2:** Claude recebe TUDO e faz análise real.

**Input pro Claude:**
```python
analyst_context = {
    # Preço e previsão
    "price_current": 315.50,
    "predictions": {"5d": 318.20, "15d": 325.40, "30d": 321.10},
    "confidence_interval_90": {"15d": [312.30, 338.50]},
    "signal": "BUY",
    "signal_confidence": 0.78,

    # O que pesou na decisão
    "top_features_tft": {"usd_brl": 0.23, "sentiment_3d": 0.18, "basis": 0.15},
    "meta_learner_weights": {"tft": 0.45, "xgboost": 0.35, "lightgbm": 0.20},

    # Contexto completo
    "technical_summary": {"rsi": 42, "macd": "bullish_cross", "bb": "squeeze"},
    "fundamental_summary": {"cycle": "RETENCAO", "basis": 5.20, "female_pct": 46.8},
    "macro": {"usd_brl": 5.82, "usd_change_5d": "+2.1%", "selic": 14.25},
    "sentiment": {"score_3d": 0.65, "top_news": "China aumenta importação de carne bovina"},
    "climate": {"ndvi_mt": 0.58, "fire_hotspots": 23, "precip_anomaly": "-15%"},
    "china": {"quota_usage": "67%", "risk_score": 45},

    # Histórico de acertos
    "model_accuracy_30d": {"mape_15d": 2.8, "directional_5d": "73%"},
}
```

**Prompt v2:**
```
Você é o analista-chefe do BullCast, sistema de inteligência pecuária.
Seu público é o Seu Antônio, pecuarista de 50+ anos que quer respostas diretas.

Analise TODOS os dados abaixo e gere uma análise completa em PT-BR simples.
NÃO use jargão financeiro. Fale como se estivesse na porteira da fazenda.

[analyst_context JSON]

Gere JSON com:
{
  "recommendation_text": "frase direta do que fazer (max 80 chars)",
  "explanation_text": "2-3 frases explicando POR QUÊ, citando fatores concretos (max 300 chars)",
  "trend_text": "o que esperar nas próximas semanas (max 100 chars)",
  "duration_text": "quanto tempo esse cenário deve durar (max 80 chars)",
  "risk_alert": "principal risco a ficar de olho (max 100 chars)" ou null,
  "confidence_note": "frase sobre o quanto confiar nessa previsão (max 100 chars)",
  "factors_summary": ["fator 1 que pesou", "fator 2", "fator 3"] (max 3, max 60 chars cada)
}
```

**Modelo:** `claude-opus-4-6` (mantém o modelo atual — custo é ~$0.01/dia pra 600 tokens, qualidade justifica)
**Fallback:** `claude-sonnet-4-5-20250514` se Opus falhar
**Max tokens:** 600

## 5. Data Flow — Pipeline Diário Completo

```
15:00 BRT — Railway Cron dispara run_daily.py

1. FETCHERS (existentes + novos)
   ├─ CEPEA spot (Firecrawl → agrobr → B3 fallback)
   ├─ CEPEA categorias
   ├─ B3 futuros
   ├─ IMEA MT
   ├─ Macro BCB
   ├─ Notícias RSS
   ├─ Clima NASA
   ├─ Previsão tempo
   ├─ INPE Queimadas (NOVO)
   ├─ NDVI MODIS (NOVO — a cada 16 dias, cache nos outros)
   ├─ IBGE Abate (NOVO — trimestral, cache nos outros)
   └─ SECEX China export (NOVO — mensal)

2. FEATURE ENGINEERING
   ├─ technical.py (indicadores técnicos)
   ├─ fundamental.py (basis, ciclo REAL, sazonalidade)
   ├─ farmer_scores.py (velocímetros)
   ├─ climate_analyzer.py (risco climático)
   ├─ sentiment.py (Claude Haiku NLP)
   └─ feature_store.py (NOVO — materializa 35+ features no DuckDB)

3. ML ENSEMBLE
   ├─ xgboost_model.py (v2 — 35+ features, walk-forward)
   ├─ lightgbm_model.py (NOVO — 35+ features, walk-forward)
   ├─ tft_model.py (NOVO — TFT multi-horizon, quantile)
   ├─ conformal.py (NOVO — intervalos conformal calibrados)
   └─ meta_learner.py (NOVO — neural stacking, pesos dinâmicos)

4. SIGNAL
   └─ signal_generator.py (v2 — 5 dimensões, magnitude, confiança conformal)

5. BLACK SWAN
   └─ black_swan_detector.py (existente, sem mudanças)

6. CLAUDE ANALYST
   └─ claude_integration.py (v2 — análise completa com todos os dados)
```

## 6. Job de Auto-melhoria Semanal

**Arquivo:** `backend/auto_improve.py` (novo)
**Trigger:** Railway Cron domingo 10:00 BRT (`0 13 * * 0` — BRT é sempre UTC-3, sem horário de verão desde 2019)

**Steps:**
1. Buscar previsões dos últimos 7 dias (cada modelo individual armazenado em `model_predictions_raw`) + preços reais do Supabase
2. Calcular MAPE e directional accuracy POR MODELO (XGBoost, LightGBM, TFT) — compara predição individual vs preço real
3. Retreinar meta-learner com últimos 90 dias de dados: input = [pred_xgb, pred_lgb, pred_tft, mape_xgb_30d, ...], target = preço real. Isso é treino supervisionado puro, sem circularidade — o meta-learner aprende a combinar os modelos, não a si mesmo.
4. Salvar pesos atualizados em Supabase Storage (`models/meta_learner.joblib`) — não em disco Railway (efêmero)
5. Log métricas no Supabase (`model_performance` table) + conformal coverage check
6. Se accuracy cai > 20% vs média 30d → alerta pro admin via log (delivery layer fora de escopo)

**Nota sobre Optuna:** Hyperparameter tuning dos gradient boosters (XGBoost/LightGBM) roda no GitHub Actions junto com o treino TFT (semanal). Não roda no Railway — consumiria 30-60min de compute e spike de RAM.

**Nova tabela para predições individuais (alimenta meta-learner):**
```sql
CREATE TABLE model_predictions_raw (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  model_name VARCHAR(30) NOT NULL,
  horizon_days SMALLINT NOT NULL,
  pred_value NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, model_name, horizon_days)
);
```

**Schema:**
```sql
CREATE TABLE model_performance (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  model_name VARCHAR(30) NOT NULL,
  horizon_days SMALLINT NOT NULL,
  mape NUMERIC(6,4),
  directional_accuracy NUMERIC(5,3),
  meta_learner_weight NUMERIC(5,3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, model_name, horizon_days)
);
```

## 7. New Dependencies

**Railway (cron diário — inference only):**
```
# Gradient Boosting
lightgbm>=4.3.0

# TFT Inference (sem PyTorch)
onnxruntime>=1.17.0

# Feature Store (in-memory)
duckdb>=1.0.0

# Data Sources
earthengine-api>=0.1.390   # Google Earth Engine (NDVI)
```

**GitHub Actions (treino semanal — full stack):**
```
# Deep Learning
neuralforecast>=1.7.0
lightning>=2.0.0
torch>=2.0.0
onnx>=1.15.0

# Hyperparameter Tuning
optuna>=3.6.0

# Tudo do Railway +
lightgbm>=4.3.0
duckdb>=1.0.0
```

**Estimated RAM (Railway):**
- Stack existente (pandas, numpy, sklearn, xgboost, supabase, httpx, anthropic): ~250MB
- LightGBM: ~10MB
- ONNX Runtime: ~20MB
- DuckDB in-memory: ~30MB
- **Total Railway:** ~310MB (cabe em 512MB com margem)

**Estimated RAM (GitHub Actions):**
- PyTorch + neuralforecast + lightning: ~400MB
- Tudo mais: ~200MB
- **Total GHA:** ~600MB (cabe nos 7GB disponíveis)

## 8. Files Modified vs Created

### Modified (rewrite):
- `backend/ml_models/xgboost_model.py` — XGBoost v2 com 35+ features
- `backend/ml_models/ensemble.py` — Novo orquestrador com meta-learner
- `backend/analysis/signal_generator.py` — Signal v2 com 5 dimensões
- `backend/analysis/fundamental.py` — Desmock ciclo pecuário
- `backend/claude_integration.py` — Claude Analyst v2
- `backend/run_daily.py` — Integrar novos steps
- `backend/requirements.txt` — Novas dependências
- `backend/schema.sql` — Novas tabelas

### Created (new):
- `backend/feature_store.py` — DuckDB feature store
- `backend/ml_models/lightgbm_model.py` — LightGBM
- `backend/ml_models/tft_model.py` — Temporal Fusion Transformer
- `backend/ml_models/conformal.py` — Conformal prediction (residual-based)
- `backend/ml_models/meta_learner.py` — Neural stacking
- `backend/fetchers/inpe_fetcher.py` — INPE Queimadas
- `backend/fetchers/ndvi_fetcher.py` — NASA MODIS NDVI
- `backend/fetchers/ibge_fetcher.py` — IBGE abate real
- `backend/fetchers/china_quota_fetcher.py` — SECEX quota tracking
- `backend/auto_improve.py` — Job semanal de auto-melhoria

### Removed:
- `backend/ml_models/prophet_model.py` — Substituído por TFT
- `backend/ml_models/sarima_model.py` — Substituído por TFT + gradient boosting

## 9. Risk Assessment

| Risco | Probabilidade | Impacto | Mitigação |
|-------|:---:|:---:|-----------|
| Railway RAM insuficiente pra PyTorch | Alta | Alto | Treinar TFT localmente, deploy só inferência |
| APIs externas (INPE, MODIS) instáveis | Média | Baixo | Cache + forward-fill + fallback sem a feature |
| TFT overfitting com pouco dado | Média | Médio | Early stopping, regularização, walk-forward rigoroso |
| IBGE dados com lag 2 meses | Certa | Baixo | Interpolação + forward-fill, atualiza quando disponível |
| Meta-learner sem dados iniciais | Certa no início | Baixo | Fallback: média simples até 90 dias de dados |
| Pipeline lento (>15min) | Baixa | Médio | Paralelizar modelos com concurrent.futures |

## 10. Migration & Rollback Strategy

### Transição v1 → v2

**Fase Paralela (2-4 semanas):**
- O pipeline v1 (XGBoost + Prophet + SARIMA, pesos estáticos) continua rodando normalmente e gerando o sinal de produção.
- O pipeline v2 roda em paralelo, salvando previsões na tabela `model_predictions_raw` com `model_name` prefixado `v2_` (ex: `v2_xgboost`, `v2_lightgbm`, `v2_tft`, `v2_ensemble`).
- Nenhuma mudança no sinal entregue ao usuário durante essa fase.

**Critérios de promoção:**
- v2 ensemble tem MAPE ≤ v1 ensemble por 14 dias consecutivos
- v2 directional accuracy ≥ v1 por 14 dias consecutivos
- Conformal interval coverage entre 85-95%

**Switchover:**
- Quando critérios atingidos, `run_daily.py` passa a usar v2 como fonte do sinal.
- Prophet e SARIMA ficam no código (mas não são chamados) por mais 2 semanas como safety net.
- Após 2 semanas sem incidentes, remover `prophet_model.py` e `sarima_model.py`.

**Rollback:**
- Se v2 falhar (erro, RAM, timeout), `run_daily.py` cai automaticamente pro v1 via try/except.
- Flag `USE_ML_V2=true/false` em env var pra switch instantâneo sem deploy.

## 11. Updated Schema — `trade_signals`

Novos campos para suportar Claude Analyst v2 e Signal Generator v2:

```sql
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
```

**RLS e políticas para TODAS as novas tabelas:**
```sql
-- RLS
ALTER TABLE fire_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ndvi_pasture ENABLE ROW LEVEL SECURITY;
ALTER TABLE china_quota_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_predictions_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_performance ENABLE ROW LEVEL SECURITY;

-- Leitura pública (anon key)
CREATE POLICY read_public ON fire_hotspots FOR SELECT USING (true);
CREATE POLICY read_public ON ndvi_pasture FOR SELECT USING (true);
CREATE POLICY read_public ON china_quota_tracking FOR SELECT USING (true);
CREATE POLICY read_public ON model_predictions_raw FOR SELECT USING (true);
CREATE POLICY read_public ON model_performance FOR SELECT USING (true);
```

**Atualizar view `dashboard_latest`:** Incluir os novos campos no SELECT (implementação no plano).

## 12. Testing Strategy

### Unit Tests
- `test_feature_store.py` — Fixtures com dados conhecidos, verificar que cada feature é calculada corretamente (ex: `basis = futures - spot`, `bb_width = (upper - lower) / mid`)
- `test_xgboost_v2.py` — Walk-forward com dataset sintético, verificar que MAPE e directional accuracy são calculados corretamente
- `test_lightgbm.py` — Espelho do XGBoost
- `test_conformal.py` — Dados com distribuição conhecida, verificar coverage empírico
- `test_signal_v2.py` — Scores determinísticos com inputs fixos, verificar clamping [0,100]

### Integration Tests
- `test_pipeline.py` — Mock Supabase com fixtures, rodar pipeline completo de feature_store → modelos → ensemble → signal → Claude (mock)
- `test_fetchers_new.py` — Mock HTTP responses pra INPE, GEE, IBGE, SECEX. Verificar parsing e upsert.

### Backtesting Harness
- `backend/backtest.py` — Script standalone que roda walk-forward completo em dados históricos (6+ meses), calcula métricas, compara v1 vs v2. Pode ser usado como pytest fixture também.
- Executado no GitHub Actions como CI check antes de merge.

### Mock Strategy
- APIs externas: `unittest.mock.patch` em httpx/supabase calls
- Supabase: fixture JSON files em `tests/fixtures/`
- Claude API: mock response com JSON fixo

## 13. Out of Scope (v2.0)

- Frontend / Dashboard
- WhatsApp / Telegram alerts
- Previsão multi-state (MT, GO, MS) — futuro v2.1
- Reinforcement Learning pra otimização de ação
- FinBERT fine-tune com dados agro
- LangChain/LangGraph agent orchestration
- Real-time intraday monitoring
