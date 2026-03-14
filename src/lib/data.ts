// src/lib/data.ts
// Server-side data fetching functions (SSR via Supabase)
// Cada função retorna dados reais ou fallback para mock
// DEVE ser chamado apenas de Server Components (não 'use client').

import { createSupabaseServerClient } from "./supabase";

// ── Trade Signal (hero data) ─────────────────────────────
export async function getLatestSignal() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("trade_signals")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

// ── Spot Price ───────────────────────────────────────────
export async function getLatestSpotPrice(state = "SP") {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("spot_prices")
    .select("price_per_arroba,variation_day,variation_week,date")
    .eq("state", state)
    .order("date", { ascending: false })
    .limit(1)
    .single();
  return data;
}

// ── Farmer Scores (velocímetros) ─────────────────────────
export async function getFarmerScores() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("fundamental_indicators")
    .select("farmer_momentum,farmer_trend,farmer_direction,bullish_count,bearish_count,neutral_count")
    .order("date", { ascending: false })
    .limit(1)
    .single();
  return data;
}

// ── B3 Futures ───────────────────────────────────────────
export async function getB3Futures() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("futures_prices")
    .select("contract_code,maturity_date,settle_price")
    .order("date", { ascending: false })
    .order("maturity_date", { ascending: true })
    .limit(8);
  return data ?? [];
}

// ── ML Predictions (apenas ensemble, horizons 5/15/30) ───
export async function getMlPredictions() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("ml_predictions")
    .select("horizon_days,pred_value,pred_lower,pred_upper,confidence")
    .eq("model_name", "ensemble")
    .order("created_at", { ascending: false })
    .limit(3);
  return data ?? [];
}

// ── Climate Data (latest per state, DISTINCT ON via order+limit) ─────────────
// Supabase JS não suporta DISTINCT ON nativo — busca últimos 25 e filtra por estado no cliente.
export async function getClimateData() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("climate_data")
    .select("state,precipitation_mm,temp_avg,precipitation_anomaly_pct,risk_level,pasture_condition,date")
    .in("state", ["MT", "MS", "GO", "PA", "MG"])
    .order("date", { ascending: false })
    .limit(25);

  if (!data) return [];

  // Filtra: pega apenas o registro mais recente por estado
  const byState = new Map<string, typeof data[0]>();
  for (const row of data) {
    if (!byState.has(row.state)) byState.set(row.state, row);
  }
  return Array.from(byState.values());
}

// ── News (latest, high impact) ───────────────────────────
export async function getLatestNews(limit = 5) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("news_sentiment")
    .select("title,url,source,published_at,sentiment,impact_score,impact_text_pt")
    .gte("impact_score", 2)
    .order("published_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

// ── Cattle Categories ────────────────────────────────────
export async function getCattleCategories(state = "SP") {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("cattle_categories")
    .select("category,price_per_kg,price_per_head,variation_day,variation_week,weight_min,weight_max")
    .eq("state", state)
    .order("date", { ascending: false })
    .limit(8);
  return data ?? [];
}

// ── Crisis Status ────────────────────────────────────────
export async function getActiveCrisis() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("crisis_events")
    .select("event_type,severity,description,circuit_breaker_level,detected_at")
    .is("resolved_at", null)
    .order("detected_at", { ascending: false })
    .limit(1)
    .single();
  return data ?? null;
}

// ── Historical Predictions (acurácia) ────────────────────
export async function getHistoricalPredictions() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("ml_predictions")
    .select("created_at,horizon_days,pred_value,directional_accuracy,mape")
    .eq("model_name", "ensemble")
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}
