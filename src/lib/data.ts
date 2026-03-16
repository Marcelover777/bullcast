// src/lib/data.ts
// Camada de dados — queries Supabase
// Duas versões: browser (Client Components) e server (Server Components)

import { createSupabaseBrowserClient } from "./supabase";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

export type Signal = "BUY" | "SELL" | "HOLD";

export interface TradeSignal {
  date: string;
  signal: Signal;
  confidence: number;
  price_current: number;
  price_pred_5d: number | null;
  price_pred_15d: number | null;
  price_pred_30d: number | null;
  recommendation_text: string | null;
  explanation_text: string | null;
  trend_text: string | null;
  duration_text: string | null;
  volatility_regime: string | null;
  circuit_breaker_level: string | null;
}

export interface SpotPrice {
  date: string;
  state: string;
  price_per_arroba: number;
  variation_day: number | null;
  variation_week: number | null;
}

export interface FuturesPrice {
  date: string;
  contract_code: string;
  settle_price: number;
  maturity_date: string | null;
  volume: number | null;
}

export interface TechnicalIndicator {
  date: string;
  rsi_14: number | null;
  sma_21: number | null;
  sma_50: number | null;
  bb_upper: number | null;
  bb_mid: number | null;
  bb_lower: number | null;
  macd_hist: number | null;
  atr_14: number | null;
  stoch_k: number | null;
}

export interface FundamentalIndicator {
  date: string;
  basis: number | null;
  cycle_phase: string | null;
  farmer_momentum: number | null;
  farmer_trend: number | null;
  seasonal_avg_pct: number | null;
  trade_ratio_bezerro: number | null;
}

export interface MLPrediction {
  horizon_days: number;
  pred_value: number;
  pred_lower: number;
  pred_upper: number;
  confidence: number;
  model_name: string;
  mape: number;
  directional_accuracy: number;
  feature_importance: Record<string, number> | null;
  created_at: string;
}

export interface CattleCategory {
  date: string;
  category: string;
  weight_min: number | null;
  weight_max: number | null;
  price_per_kg: number | null;
  price_per_head: number | null;
  variation_day: number | null;
  variation_week: number | null;
  state: string;
}

export interface NewsSentiment {
  title: string;
  source: string | null;
  sentiment: string | null;
  impact_score: number;
  impact_text_pt: string | null;
  published_at: string | null;
}

export interface MacroData {
  date: string;
  usd_brl: number | null;
  selic_rate: number | null;
}

export interface ClimateData {
  date: string;
  state: string;
  risk_level: string | null;
  pasture_condition: string | null;
  temp_avg: number | null;
  precipitation_mm: number | null;
}

export interface CrisisEvent {
  detected_at: string;
  event_type: string | null;
  severity: number | null;
  description: string | null;
  circuit_breaker_level: string | null;
}

export interface SlaughterData {
  period: string;
  total_head: number | null;
  female_head: number | null;
  female_percent: number | null;
  state: string;
}

export interface ExportData {
  date: string;
  destination: string | null;
  volume_tons: number | null;
  value_usd: number | null;
}

// ═══════════════════════════════════════════════════════════
// DADOS COMPLETOS DA PÁGINA MERCADO
// ═══════════════════════════════════════════════════════════

export interface MercadoData {
  signal: TradeSignal | null;
  spot: SpotPrice | null;
  futures: FuturesPrice | null;
  technical: TechnicalIndicator | null;
  fundamental: FundamentalIndicator | null;
  macro: MacroData | null;
  climate: ClimateData | null;
  news: NewsSentiment[];
  crisis: CrisisEvent | null;
  slaughter: SlaughterData | null;
  exports: ExportData | null;
  predictionAccuracy: { horizon: number; accuracy: number; total: number }[];
}

export async function fetchMercadoData(): Promise<MercadoData> {
  const sb = createSupabaseBrowserClient();

  const [
    signalRes,
    spotRes,
    futuresRes,
    techRes,
    fundRes,
    macroRes,
    climateRes,
    newsRes,
    crisisRes,
    histRes,
    slaughterRes,
    exportRes,
  ] = await Promise.allSettled([
    sb.from("trade_signals").select("*").order("date", { ascending: false }).limit(1).single(),
    sb.from("spot_prices").select("date,state,price_per_arroba,variation_day,variation_week").eq("state", "SP").order("date", { ascending: false }).limit(1).single(),
    sb.from("futures_prices").select("date,contract_code,settle_price,maturity_date,volume").order("date", { ascending: false }).limit(1).single(),
    sb.from("technical_indicators").select("date,rsi_14,sma_21,sma_50,bb_upper,bb_mid,bb_lower,macd_hist,atr_14,stoch_k").order("date", { ascending: false }).limit(1).single(),
    sb.from("fundamental_indicators").select("date,basis,cycle_phase,farmer_momentum,farmer_trend,seasonal_avg_pct,trade_ratio_bezerro").order("date", { ascending: false }).limit(1).single(),
    sb.from("macro_data").select("date,usd_brl,selic_rate").order("date", { ascending: false }).limit(1).single(),
    sb.from("climate_data").select("date,state,risk_level,pasture_condition,temp_avg,precipitation_mm").eq("state", "MT").order("date", { ascending: false }).limit(1).single(),
    sb.from("news_sentiment").select("title,source,sentiment,impact_score,impact_text_pt,published_at").gte("impact_score", 2).order("published_at", { ascending: false }).limit(5),
    sb.from("crisis_events").select("detected_at,event_type,severity,description,circuit_breaker_level").is("resolved_at", null).order("detected_at", { ascending: false }).limit(1).single(),
    sb.from("ml_predictions").select("horizon_days,directional_accuracy").eq("model_name", "ensemble").order("created_at", { ascending: false }).limit(90),
    sb.from("slaughter_data").select("period,total_head,female_head,female_percent,state").order("period", { ascending: false }).limit(1).single(),
    sb.from("export_data").select("date,destination,volume_tons,value_usd").order("date", { ascending: false }).limit(1).single(),
  ]);

  const extract = <T>(r: PromiseSettledResult<{ data: T; error: unknown }>): T | null => {
    if (r.status === "rejected") return null;
    if (r.value.error) return null;
    return r.value.data;
  };

  // Calcula acurácia agrupada por horizonte
  const histData = extract<{ horizon_days: number; directional_accuracy: number }[]>(histRes as never) || [];
  const byHorizon: Record<number, { total: number; accSum: number }> = {};
  for (const row of histData) {
    const h = row.horizon_days;
    if (!byHorizon[h]) byHorizon[h] = { total: 0, accSum: 0 };
    byHorizon[h].total += 1;
    byHorizon[h].accSum += Number(row.directional_accuracy || 0);
  }
  const predictionAccuracy = Object.entries(byHorizon).map(([h, v]) => ({
    horizon: Number(h),
    total: v.total,
    accuracy: Math.round((v.accSum / v.total) * 100),
  }));

  return {
    signal: extract<TradeSignal>(signalRes as never),
    spot: extract<SpotPrice>(spotRes as never),
    futures: extract<FuturesPrice>(futuresRes as never),
    technical: extract<TechnicalIndicator>(techRes as never),
    fundamental: extract<FundamentalIndicator>(fundRes as never),
    macro: extract<MacroData>(macroRes as never),
    climate: extract<ClimateData>(climateRes as never),
    news: extract<NewsSentiment[]>(newsRes as never) || [],
    crisis: extract<CrisisEvent>(crisisRes as never),
    slaughter: extract<SlaughterData>(slaughterRes as never),
    exports: extract<ExportData>(exportRes as never),
    predictionAccuracy,
  };
}

// ═══════════════════════════════════════════════════════════
// DADOS DA PÁGINA PREVISÃO
// ═══════════════════════════════════════════════════════════

export interface PrevisaoData {
  predictions: MLPrediction[];
  currentPrice: number | null;
  predictionAccuracy: { horizon: number; accuracy: number; total: number }[];
}

export async function fetchPrevisaoData(): Promise<PrevisaoData> {
  const sb = createSupabaseBrowserClient();

  const [predRes, spotRes, histRes] = await Promise.allSettled([
    sb.from("ml_predictions").select("*").eq("model_name", "ensemble").order("created_at", { ascending: false }).limit(3),
    sb.from("spot_prices").select("price_per_arroba").eq("state", "SP").order("date", { ascending: false }).limit(1).single(),
    sb.from("ml_predictions").select("horizon_days,directional_accuracy").eq("model_name", "ensemble").order("created_at", { ascending: false }).limit(90),
  ]);

  const extract = <T>(r: PromiseSettledResult<{ data: T; error: unknown }>): T | null => {
    if (r.status === "rejected") return null;
    if (r.value.error) return null;
    return r.value.data;
  };

  const histData = extract<{ horizon_days: number; directional_accuracy: number }[]>(histRes as never) || [];
  const byHorizon: Record<number, { total: number; accSum: number }> = {};
  for (const row of histData) {
    const h = row.horizon_days;
    if (!byHorizon[h]) byHorizon[h] = { total: 0, accSum: 0 };
    byHorizon[h].total += 1;
    byHorizon[h].accSum += Number(row.directional_accuracy || 0);
  }

  return {
    predictions: extract<MLPrediction[]>(predRes as never) || [],
    currentPrice: extract<{ price_per_arroba: number }>(spotRes as never)?.price_per_arroba ?? null,
    predictionAccuracy: Object.entries(byHorizon).map(([h, v]) => ({
      horizon: Number(h),
      total: v.total,
      accuracy: Math.round((v.accSum / v.total) * 100),
    })),
  };
}

// ═══════════════════════════════════════════════════════════
// DADOS DA PÁGINA REGIONAL
// ═══════════════════════════════════════════════════════════

export async function fetchRegionalData(state = "MT"): Promise<CattleCategory[]> {
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb
    .from("cattle_categories")
    .select("*")
    .eq("state", state)
    .order("date", { ascending: false })
    .limit(30);
  if (error) { console.error("fetchRegionalData:", error); return []; }
  if (!data || data.length === 0) return [];
  // Apenas o dia mais recente
  const latestDate = data[0].date;
  return data.filter((d) => d.date === latestDate);
}

// ═══════════════════════════════════════════════════════════
// DADOS DA PÁGINA RISCOS
// ═══════════════════════════════════════════════════════════

export interface RiscosData {
  circuitBreakerLevel: string;
  volatilityStd: number;
  crisisEvents: CrisisEvent[];
  climateAlerts: ClimateData[];
  latestSignal: TradeSignal | null;
  exportData: ExportData | null;
}

export async function fetchRiscosData(): Promise<RiscosData> {
  const sb = createSupabaseBrowserClient();

  const [signalRes, crisisRes, climateRes, exportRes, spotRes] = await Promise.allSettled([
    sb.from("trade_signals").select("*").order("date", { ascending: false }).limit(1).single(),
    sb.from("crisis_events").select("*").order("detected_at", { ascending: false }).limit(10),
    sb.from("climate_data").select("*").order("date", { ascending: false }).limit(10),
    sb.from("export_data").select("*").order("date", { ascending: false }).limit(1).single(),
    sb.from("spot_prices").select("price_per_arroba").eq("state", "SP").order("date", { ascending: false }).limit(22),
  ]);

  const extract = <T>(r: PromiseSettledResult<{ data: T; error: unknown }>): T | null => {
    if (r.status === "rejected") return null;
    if (r.value.error) return null;
    return r.value.data;
  };

  const signal = extract<TradeSignal>(signalRes as never);
  const crisisAll = extract<CrisisEvent[]>(crisisRes as never) || [];
  const climateAll = extract<ClimateData[]>(climateRes as never) || [];
  const spots = extract<{ price_per_arroba: number }[]>(spotRes as never) || [];

  // Calculate volatility from spot prices
  let volatilityStd = 0;
  if (spots.length >= 5) {
    const prices = spots.map((s) => s.price_per_arroba);
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i - 1] - prices[i]) / prices[i]);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    volatilityStd = Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length);
  }

  // Deduplicate climate by state (latest per state)
  const climateByState: Record<string, ClimateData> = {};
  for (const c of climateAll) {
    if (!climateByState[c.state]) climateByState[c.state] = c;
  }

  return {
    circuitBreakerLevel: signal?.circuit_breaker_level || "VERDE",
    volatilityStd: Math.round(volatilityStd * 10000) / 100,
    crisisEvents: crisisAll,
    climateAlerts: Object.values(climateByState),
    latestSignal: signal,
    exportData: extract<ExportData>(exportRes as never),
  };
}

// ═══════════════════════════════════════════════════════════
// DADOS DA PÁGINA HISTÓRICO
// ═══════════════════════════════════════════════════════════

export interface HistoricoData {
  predictions: MLPrediction[];
  totalPredictions: number;
  accuracyByHorizon: { horizon: number; total: number; avgAccuracy: number }[];
  recentSignals: TradeSignal[];
}

export async function fetchHistoricoData(): Promise<HistoricoData> {
  const sb = createSupabaseBrowserClient();

  const [predRes, signalRes] = await Promise.allSettled([
    sb.from("ml_predictions")
      .select("*")
      .eq("model_name", "ensemble")
      .order("created_at", { ascending: false })
      .limit(90),
    sb.from("trade_signals")
      .select("*")
      .order("date", { ascending: false })
      .limit(20),
  ]);

  const extract = <T>(r: PromiseSettledResult<{ data: T; error: unknown }>): T | null => {
    if (r.status === "rejected") return null;
    if (r.value.error) return null;
    return r.value.data;
  };

  const preds = extract<MLPrediction[]>(predRes as never) || [];
  const signals = extract<TradeSignal[]>(signalRes as never) || [];

  // Group accuracy by horizon
  const byHorizon: Record<number, { total: number; accSum: number }> = {};
  for (const p of preds) {
    const h = p.horizon_days;
    if (!byHorizon[h]) byHorizon[h] = { total: 0, accSum: 0 };
    byHorizon[h].total += 1;
    byHorizon[h].accSum += Number(p.directional_accuracy || 0);
  }

  return {
    predictions: preds,
    totalPredictions: preds.length,
    accuracyByHorizon: Object.entries(byHorizon).map(([h, v]) => ({
      horizon: Number(h),
      total: v.total,
      avgAccuracy: v.total > 0 ? Math.round((v.accSum / v.total) * 1000) / 10 : 0,
    })),
    recentSignals: signals,
  };
}

// ═══════════════════════════════════════════════════════════
// DADOS DA PÁGINA NOTÍCIAS
// ═══════════════════════════════════════════════════════════

export interface NoticiasData {
  news: NewsSentiment[];
  totalCount: number;
}

export async function fetchNoticiasData(): Promise<NoticiasData> {
  const sb = createSupabaseBrowserClient();

  const { data, error } = await sb
    .from("news_sentiment")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("fetchNoticiasData:", error);
    return { news: [], totalCount: 0 };
  }

  return {
    news: data || [],
    totalCount: data?.length || 0,
  };
}
