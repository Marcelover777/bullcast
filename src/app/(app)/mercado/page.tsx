"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Minus, ChevronRight, ChevronDown,
  AlertTriangle, Newspaper, CloudRain, Package, Ship, DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchMercadoData, type MercadoData, type Signal } from "@/lib/data";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { RiveGauge } from "@/components/animations/rive-gauge";
import { SeasonalCalendar } from "@/components/dashboard/seasonal-calendar";
import { ForwardCurve } from "@/components/dashboard/forward-curve";
import { ClimateCard } from "@/components/dashboard/climate-card";
import { NewsPanel } from "@/components/dashboard/news-panel";
import { CycleCard } from "@/components/dashboard/cycle-card";

// ═══ Signal mapping ═══
const signalMap: Record<Signal, { label: string; emoji: string; actionText: string; actionColor: string }> = {
  BUY:  { label: "COMPRAR", emoji: "\u{1F7E2}", actionText: "MOMENTO BOM PRA COMPRAR", actionColor: "bg-bull/10 border-bull/20" },
  SELL: { label: "VENDER",  emoji: "\u{1F534}", actionText: "CONSIDERE VENDER", actionColor: "bg-bear/10 border-bear/20" },
  HOLD: { label: "SEGURAR", emoji: "\u{1F7E1}", actionText: "MELHOR ESPERAR", actionColor: "bg-hold/10 border-hold/20" },
};

const signalStyle: Record<string, { icon: typeof TrendingUp; bg: string; text: string; border: string; barBg: string }> = {
  COMPRAR: { icon: TrendingUp,   bg: "bg-bull/10", text: "text-bull", border: "border-bull/20", barBg: "bg-bull" },
  VENDER:  { icon: TrendingDown, bg: "bg-bear/10", text: "text-bear", border: "border-bear/20", barBg: "bg-bear" },
  SEGURAR: { icon: Minus,        bg: "bg-hold/10", text: "text-hold", border: "border-hold/20", barBg: "bg-hold" },
};

// ═══ Confidence label (NOT percentage) ═══
function confidenceLabel(pct: number): { text: string; color: string } {
  if (pct >= 75) return { text: "Alta", color: "text-bull" };
  if (pct >= 50) return { text: "Média", color: "text-hold" };
  return { text: "Baixa", color: "text-bear" };
}

// ═══ Gauge direction helper ═══
function computeRumoDoPreco(tech: MercadoData["technical"], spot: MercadoData["spot"]): { value: number; state: "bullish" | "bearish" | "neutral"; alta: number; baixa: number; neutro: number } {
  if (!tech || !spot) return { value: 50, state: "neutral", alta: 0, baixa: 0, neutro: 1 };

  const price = Number(spot.price_per_arroba);
  let alta = 0, baixa = 0, neutro = 0;

  // RSI
  const rsi = Number(tech.rsi_14 || 50);
  if (rsi > 55) alta++; else if (rsi < 45) baixa++; else neutro++;

  // MACD
  const macd = Number(tech.macd_hist || 0);
  if (macd > 0) alta++; else if (macd < 0) baixa++; else neutro++;

  // SMA 21
  if (tech.sma_21) { if (price > Number(tech.sma_21)) alta++; else baixa++; }
  // SMA 50
  if (tech.sma_50) { if (price > Number(tech.sma_50)) alta++; else baixa++; }
  // Bollinger
  if (tech.bb_upper && tech.bb_lower) {
    if (price > Number(tech.bb_upper)) baixa++; // sobrecompra → reversão
    else if (price < Number(tech.bb_lower)) alta++; // sobrevenda → reversão
    else neutro++;
  }
  // Stoch K
  if (tech.stoch_k) {
    const sk = Number(tech.stoch_k);
    if (sk > 80) baixa++; else if (sk < 20) alta++; else neutro++;
  }

  const total = alta + baixa + neutro;
  const value = total > 0 ? Math.round((alta / total) * 100) : 50;
  const state = alta > baixa ? "bullish" : alta < baixa ? "bearish" : "neutral";
  return { value, state, alta, baixa, neutro };
}

// ═══ Mock fallback ═══
const MOCK: MercadoData = {
  signal: { date: new Date().toISOString().slice(0, 10), signal: "BUY", confidence: 0.78, price_current: 311.45, price_pred_5d: 315.80, price_pred_15d: 318.40, price_pred_30d: 316.20, recommendation_text: "Cenário favorável para compra — demanda aquecida e oferta restrita.", explanation_text: "CEPEA acumulou alta de 3.2% em 7 dias. Oferta de boi gordo em queda nas praças. B3 futuro com prêmio crescente. Entressafra se aproxima.", trend_text: "Alta moderada nos próximos 15 dias", duration_text: "7-15 dias", volatility_regime: "MEDIO", circuit_breaker_level: "VERDE" },
  spot: { date: new Date().toISOString().slice(0, 10), state: "SP", price_per_arroba: 311.45, variation_day: 0.023, variation_week: 0.032 },
  futures: { date: new Date().toISOString().slice(0, 10), contract_code: "BGIV25", settle_price: 319.80, maturity_date: "2025-10-31", volume: 12500 },
  technical: { date: new Date().toISOString().slice(0, 10), rsi_14: 62.5, sma_21: 304.20, sma_50: 298.50, bb_upper: 320.00, bb_mid: 308.00, bb_lower: 296.00, macd_hist: 1.45, atr_14: 4.20, stoch_k: 71.3 },
  fundamental: { date: new Date().toISOString().slice(0, 10), basis: 8.35, cycle_phase: "RETENCAO", farmer_momentum: 68, farmer_trend: 72, seasonal_avg_pct: 2.1, trade_ratio_bezerro: 1.85 },
  macro: { date: new Date().toISOString().slice(0, 10), usd_brl: 5.12, selic_rate: 10.50 },
  climate: { date: new Date().toISOString().slice(0, 10), state: "MT", risk_level: "BAIXO", pasture_condition: "BOM", temp_avg: 32.5, precipitation_mm: 12 },
  news: [
    { title: "China mantém importações estáveis de carne bovina", source: "Reuters", sentiment: "POS", impact_score: 4, impact_text_pt: "Suporte ao preço", published_at: new Date().toISOString() },
    { title: "Milho recua 3% e alivia custo do confinamento", source: "Valor", sentiment: "POS", impact_score: 3, impact_text_pt: "Margem de confinamento melhora", published_at: new Date().toISOString() },
    { title: "Embarques de carne bovina batem recorde mensal", source: "Globo Rural", sentiment: "POS", impact_score: 4, impact_text_pt: "Demanda externa forte", published_at: new Date().toISOString() },
  ],
  crisis: null,
  slaughter: { period: new Date().toISOString().slice(0, 10), total_head: 2850000, female_head: 1140000, female_percent: 40.0, state: "BR" },
  exports: { date: new Date().toISOString().slice(0, 10), destination: "China", volume_tons: 185000, value_usd: 925000000 },
  predictionAccuracy: [
    { horizon: 5, accuracy: 82, total: 45 },
    { horizon: 15, accuracy: 74, total: 38 },
    { horizon: 30, accuracy: 68, total: 30 },
  ],
};

export default function MercadoPage() {
  const [data, setData] = useState<MercadoData>(MOCK);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);
  const [showClimateExpanded, setShowClimateExpanded] = useState(false);

  useEffect(() => {
    fetchMercadoData()
      .then((d) => {
        if (d.signal) {
          setData(d);
          setUsingMock(false);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-primary text-lg">Carregando dados...</div>
      </div>
    );
  }

  const sig = data.signal!;
  const displaySignal = signalMap[sig.signal]?.label || "SEGURAR";
  const style = signalStyle[displaySignal] || signalStyle.SEGURAR;
  const variationPct = data.spot ? (Number(data.spot.variation_day) * 100) : 0;
  const variationWeekPct = data.spot?.variation_week ? (Number(data.spot.variation_week) * 100) : 0;
  const confidencePct = Math.round(sig.confidence * 100);
  const confLabel = confidenceLabel(confidencePct);

  // Yesterday price calc
  const currentPrice = data.spot ? Number(data.spot.price_per_arroba) : Number(sig.price_current);
  const yesterdayPrice = currentPrice / (1 + (Number(data.spot?.variation_day || 0)));
  const weekAgoPrice = currentPrice / (1 + (Number(data.spot?.variation_week || 0)));

  // Prediction range for 15d
  const pred15d = sig.price_pred_15d ? Number(sig.price_pred_15d) : null;
  const predRange = pred15d ? Math.round(pred15d * 0.025) : null; // ~2.5% range estimate

  // Reasons from explanation_text
  const reasons = sig.explanation_text
    ? sig.explanation_text.split(/\.\s+/).filter(Boolean).map((s) => s.replace(/\.$/, ""))
    : ["Análise em processamento..."];

  // Gauges
  const momentumValue = data.fundamental?.farmer_momentum ? Number(data.fundamental.farmer_momentum) : 68;
  const trendValue = data.fundamental?.farmer_trend ? Number(data.fundamental.farmer_trend) : 72;
  const rumo = computeRumoDoPreco(data.technical, data.spot);

  // Margin indicators
  const basisValue = data.fundamental?.basis ? Number(data.fundamental.basis) : 0;

  return (
    <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
      {/* ═══ BADGE DE DADOS ═══ */}
      {usingMock && (
        <div className="bg-hold/10 border border-hold/20 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-hold font-semibold uppercase tracking-wider">
            Dados demonstrativos — conecte o backend para dados reais
          </p>
        </div>
      )}

      {/* ═══ 1. ALERT BANNER (condicional) ═══ */}
      {data.crisis && (
        <ScrollReveal direction="up" delay={0}>
          <section className="bg-bear/10 border-2 border-bear/30 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-bear shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-bear">
                Alerta: {data.crisis.circuit_breaker_level}
              </p>
              <p className="text-xs text-bear/80 mt-1">{data.crisis.description}</p>
              {data.crisis.event_type && (
                <span className="text-[9px] bg-bear/20 text-bear px-1.5 py-0.5 uppercase font-bold mt-2 inline-block">
                  {data.crisis.event_type}
                </span>
              )}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ═══ 2. HERO PRICE ═══ */}
      <ScrollReveal direction="up" delay={0}>
        <section className="py-2">
          <p className="text-label text-[9px] mb-2">BOI GORDO · CEPEA/B3 · SP</p>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-mono font-bold tabular-nums text-foreground">
              R$ <AnimatedNumber value={currentPrice} decimals={2} />
            </span>
            <div className="flex items-center gap-1">
              <span className={cn("text-sm", variationPct >= 0 ? "text-bull" : "text-bear")}>
                {variationPct >= 0 ? "▲" : "▼"}
              </span>
              <span className={cn("text-sm font-bold tabular-nums", variationPct >= 0 ? "text-bull" : "text-bear")}>
                {variationPct >= 0 ? "+" : ""}{variationPct.toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Ontem: R$ {yesterdayPrice.toFixed(2).replace(".", ",")}
            {" · "}Semana: {variationWeekPct >= 0 ? "+" : ""}{variationWeekPct.toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Atualizado {sig.date ? new Date(sig.date + "T15:04:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" }) : "hoje"}
          </p>
        </section>
      </ScrollReveal>

      {/* ═══ 3. TREND FORECAST ═══ */}
      <ScrollReveal direction="up" delay={0.05}>
        <section className={cn("p-5 border", style.bg, style.border)}>
          <div className="flex items-center gap-3 mb-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", style.bg)}>
              <style.icon className={cn("w-6 h-6", style.text)} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-label text-[9px]">PREVISÃO 15 DIAS</p>
              <p className={cn("text-display text-lg leading-tight", style.text)}>
                {sig.trend_text || `O preço deve ${displaySignal === "COMPRAR" ? "SUBIR" : displaySignal === "VENDER" ? "CAIR" : "ESTABILIZAR"} nos próximos 15 dias`}
              </p>
            </div>
          </div>

          {pred15d && predRange && (
            <p className="text-sm text-secondary-foreground mb-2">
              Entre <span className="font-bold tabular-nums">R$ {(pred15d - predRange).toFixed(2).replace(".", ",")}</span> e{" "}
              <span className="font-bold tabular-nums">R$ {(pred15d + predRange).toFixed(2).replace(".", ",")}</span> por arroba
            </p>
          )}

          {sig.duration_text && (
            <p className="text-xs text-muted-foreground mb-3">
              Esse movimento deve durar {sig.duration_text}
            </p>
          )}

          {/* Barra de confiança com texto */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-label text-[9px]">CONFIANÇA</span>
              <span className={cn("text-sm font-bold", confLabel.color)}>{confLabel.text}</span>
            </div>
            <div className="confidence-bar">
              <div className={cn("confidence-bar-fill", style.barBg)} style={{ width: `${confidencePct}%` }} />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══ 4. ACTION CARD ═══ */}
      <ScrollReveal direction="up" delay={0.1}>
        <section className={cn("p-5 border", signalMap[sig.signal].actionColor)}>
          <p className="text-label text-[9px] mb-2">HORA DE COMPRAR OU VENDER?</p>
          <p className="text-display text-xl mb-3">
            {signalMap[sig.signal].emoji} {signalMap[sig.signal].actionText}
          </p>
          {sig.recommendation_text && (
            <p className="text-sm text-secondary-foreground leading-relaxed mb-3">
              {sig.recommendation_text}
            </p>
          )}
          {reasons.length > 0 && (
            <ul className="space-y-1.5">
              {reasons.slice(0, 3).map((reason, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", style.barBg)} />
                  <span className="text-xs text-secondary-foreground leading-snug">{reason}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </ScrollReveal>

      {/* ═══ 5. FARMER GAUGES ═══ */}
      <ScrollReveal direction="up" delay={0.15}>
        <section className="border border-border bg-card p-4 space-y-4">
          <h2 className="text-display text-base">Termômetro do Mercado</h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-2 border border-border bg-secondary/40 p-3">
              <RiveGauge
                value={momentumValue}
                label="Força do Momento"
                state={momentumValue >= 60 ? "bullish" : momentumValue <= 40 ? "bearish" : "neutral"}
                size={100}
              />
            </div>
            <div className="flex flex-col items-center gap-2 border border-border bg-secondary/40 p-3">
              <RiveGauge
                value={trendValue}
                label="Tendência Geral"
                state={trendValue >= 60 ? "bullish" : trendValue <= 40 ? "bearish" : "neutral"}
                size={100}
              />
            </div>
            <div className="flex flex-col items-center gap-2 border border-border bg-secondary/40 p-3">
              <RiveGauge
                value={rumo.value}
                label="Rumo do Preço"
                state={rumo.state}
                size={100}
              />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            <span className="text-bull font-bold">{rumo.alta}</span> indicadores apontam ALTA
            {" · "}<span className="text-bear font-bold">{rumo.baixa}</span> apontam BAIXA
            {" · "}<span className="text-hold font-bold">{rumo.neutro}</span> neutros
          </p>
        </section>
      </ScrollReveal>

      {/* ═══ 6. MARGIN PANEL — Números do Pecuarista ═══ */}
      <ScrollReveal direction="up" delay={0.2}>
        <section className="border border-border bg-card p-4 space-y-3">
          <h2 className="text-display text-base">Seus Números</h2>

          <div className="grid grid-cols-2 gap-3">
            {/* Arroba CEPEA */}
            <div className="border border-border p-3">
              <p className="text-label text-[9px] mb-1">ARROBA CEPEA</p>
              <p className="font-mono text-xl font-bold tabular-nums">
                {data.spot ? `R$ ${Number(data.spot.price_per_arroba).toFixed(2).replace(".", ",")}` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">R$/@</p>
            </div>

            {/* Futuro B3 */}
            <div className="border border-border p-3">
              <p className="text-label text-[9px] mb-1">FUTURO B3</p>
              <p className="font-mono text-xl font-bold tabular-nums">
                {data.futures ? `R$ ${Number(data.futures.settle_price).toFixed(2).replace(".", ",")}` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {data.futures?.contract_code || "—"}
              </p>
            </div>

            {/* Câmbio */}
            <div className="border border-border p-3">
              <p className="text-label text-[9px] mb-1">CÂMBIO</p>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xl font-bold tabular-nums">
                  {data.macro?.usd_brl ? Number(data.macro.usd_brl).toFixed(2).replace(".", ",") : "—"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">BRL/USD</p>
            </div>

            {/* Basis */}
            <div className="border border-border p-3">
              <p className="text-label text-[9px] mb-1">BASE MT→SP</p>
              <p className={cn("font-mono text-xl font-bold tabular-nums", basisValue >= 0 ? "text-bull" : "text-bear")}>
                {basisValue >= 0 ? "+" : ""}R$ {basisValue.toFixed(2).replace(".", ",")}
              </p>
              <p className="text-[10px] text-muted-foreground">Diferença físico vs futuro</p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══ 7. SEASONAL CALENDAR ═══ */}
      <ScrollReveal direction="up" delay={0.25}>
        <SeasonalCalendar />
      </ScrollReveal>

      {/* ═══ 8. FORWARD CURVE ═══ */}
      <ScrollReveal direction="up" delay={0.3}>
        <ForwardCurve />
      </ScrollReveal>

      {/* ═══ 9. CLIMATE CARD ═══ */}
      <ScrollReveal direction="up" delay={0.35}>
        <section className="space-y-3">
          {/* Mini card MT (sempre visível) */}
          {data.climate && (
            <div className="bg-card border border-border p-3 flex items-center gap-3">
              <CloudRain className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-label text-[9px]">CLIMA MT</p>
                <p className="text-sm">
                  Pasto: <span className="font-semibold">{data.climate.pasture_condition || "—"}</span>
                  {" · "}Risco: <span className={cn("font-semibold", data.climate.risk_level === "ALTO" ? "text-bear" : data.climate.risk_level === "MEDIO" ? "text-hold" : "text-bull")}>{data.climate.risk_level || "—"}</span>
                  {data.climate.temp_avg && <span className="text-muted-foreground"> · {Number(data.climate.temp_avg).toFixed(0)}°C</span>}
                </p>
              </div>
              <button
                onClick={() => setShowClimateExpanded(!showClimateExpanded)}
                className="p-1 cursor-pointer"
              >
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showClimateExpanded && "rotate-180")} />
              </button>
            </div>
          )}

          {/* Card completo expandido (5 UFs) */}
          {showClimateExpanded && <ClimateCard />}
        </section>
      </ScrollReveal>

      {/* ═══ 10. NEWS PANEL ═══ */}
      <ScrollReveal direction="up" delay={0.4}>
        <section className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="w-4 h-4 text-primary" />
            <h2 className="text-display text-base">Notícias de Impacto</h2>
          </div>
          <div className="space-y-2">
            {(data.news.length > 0 ? data.news : MOCK.news).slice(0, 5).map((n, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
                <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0",
                  n.sentiment === "POS" ? "bg-bull" : n.sentiment === "NEG" ? "bg-bear" : "bg-hold"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug truncate">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {n.source} · Impacto: {n.impact_score}/5
                    {n.impact_text_pt && ` · ${n.impact_text_pt}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ═══ 11. CYCLE CARD ═══ */}
      <ScrollReveal direction="up" delay={0.45}>
        <CycleCard />
      </ScrollReveal>

      {/* ═══ ABATE & EXPORTAÇÃO ═══ */}
      {(data.slaughter || data.exports) && (
        <ScrollReveal direction="up" delay={0.5}>
          <section className="grid grid-cols-2 gap-3">
            {data.slaughter && (
              <div className="bg-card border border-border p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Package className="w-3.5 h-3.5 text-primary" />
                  <p className="text-label text-[9px]">ABATE IBGE</p>
                </div>
                <p className="text-foreground font-semibold text-sm tabular-nums">
                  {(Number(data.slaughter.total_head) / 1e6).toFixed(1)}M cabeças
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Fêmeas: {Number(data.slaughter.female_percent).toFixed(0)}%
                  {Number(data.slaughter.female_percent) > 42 ? " (liquidação)" : Number(data.slaughter.female_percent) < 35 ? " (retenção)" : ""}
                </p>
              </div>
            )}
            {data.exports && (
              <div className="bg-card border border-border p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Ship className="w-3.5 h-3.5 text-primary" />
                  <p className="text-label text-[9px]">EXPORTAÇÃO</p>
                </div>
                <p className="text-foreground font-semibold text-sm tabular-nums">
                  {(Number(data.exports.volume_tons) / 1e3).toFixed(0)}k toneladas
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {data.exports.destination || "Global"}
                  {data.exports.value_usd && ` · US$ ${(Number(data.exports.value_usd) / 1e6).toFixed(0)}M`}
                </p>
              </div>
            )}
          </section>
        </ScrollReveal>
      )}

      {/* ═══ TIMESTAMP ═══ */}
      <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
        Dados: CEPEA, B3, BCB, NASA, RSS · Modelo: XGBoost + Prophet · NLP: Claude
        <br />
        Última atualização: {sig.date ? new Date(sig.date + "T12:00:00").toLocaleDateString("pt-BR") : "—"}
        {" · "}Não constitui recomendação de investimento.
      </p>
    </div>
  );
}
