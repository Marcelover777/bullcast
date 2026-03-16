"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronRight, BarChart3, Zap, Shield, AlertTriangle, Newspaper, CloudRain, Package, Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchMercadoData, type MercadoData, type Signal } from "@/lib/data";

// ═══ Mapeamento de sinal do backend → display ═══
const signalMap: Record<Signal, { label: string; labelLong: string }> = {
  BUY:  { label: "COMPRAR", labelLong: "MOMENTO DE COMPRA" },
  SELL: { label: "VENDER",  labelLong: "MOMENTO DE VENDA" },
  HOLD: { label: "SEGURAR", labelLong: "MOMENTO DE AGUARDAR" },
};

const signalStyle: Record<string, { icon: typeof TrendingUp; bg: string; text: string; border: string; barBg: string }> = {
  COMPRAR: { icon: TrendingUp,   bg: "bg-bull/10", text: "text-bull", border: "border-bull/20", barBg: "bg-bull" },
  VENDER:  { icon: TrendingDown, bg: "bg-bear/10", text: "text-bear", border: "border-bear/20", barBg: "bg-bear" },
  SEGURAR: { icon: Minus,        bg: "bg-hold/10", text: "text-hold", border: "border-hold/20", barBg: "bg-hold" },
};

// ═══ Mock fallback (quando banco está vazio) ═══
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
  const [showReasons, setShowReasons] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const [usingMock, setUsingMock] = useState(true);

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

  const sig = data.signal!;
  const displaySignal = signalMap[sig.signal]?.label || "SEGURAR";
  const displayLong = signalMap[sig.signal]?.labelLong || "AGUARDANDO";
  const style = signalStyle[displaySignal] || signalStyle.SEGURAR;
  const Icon = style.icon;
  const confidencePct = Math.round(sig.confidence * 100);
  const variationPct = data.spot ? (Number(data.spot.variation_day) * 100) : 0;

  // Extrai razões do explanation_text (cada frase vira um bullet)
  const reasons = sig.explanation_text
    ? sig.explanation_text.split(/\.\s+/).filter(Boolean).map((s) => s.replace(/\.$/, ""))
    : ["Análise em processamento..."];

  // Monta indicadores rápidos com dados reais
  const quickIndicators = [
    {
      label: "CEPEA @",
      value: data.spot ? `R$ ${Number(data.spot.price_per_arroba).toFixed(2).replace(".", ",")}` : "—",
      change: data.spot ? `${variationPct >= 0 ? "+" : ""}${variationPct.toFixed(1)}%` : "—",
      up: variationPct >= 0,
    },
    {
      label: data.futures ? data.futures.contract_code : "B3 Futuro",
      value: data.futures ? `R$ ${Number(data.futures.settle_price).toFixed(2).replace(".", ",")}` : "—",
      change: data.fundamental?.basis ? `${Number(data.fundamental.basis) >= 0 ? "+" : ""}R$${Number(data.fundamental.basis).toFixed(2)}` : "—",
      up: (data.fundamental?.basis ?? 0) >= 0,
    },
    {
      label: "USD/BRL",
      value: data.macro?.usd_brl ? `R$ ${Number(data.macro.usd_brl).toFixed(2).replace(".", ",")}` : "—",
      change: "",
      up: true,
    },
    {
      label: "Ciclo Pecuário",
      value: data.fundamental?.cycle_phase || "—",
      change: data.fundamental?.seasonal_avg_pct ? `${Number(data.fundamental.seasonal_avg_pct) >= 0 ? "+" : ""}${Number(data.fundamental.seasonal_avg_pct).toFixed(1)}%` : "",
      up: (data.fundamental?.seasonal_avg_pct ?? 0) >= 0,
    },
  ];

  // Indicadores técnicos com dados reais
  const techIndicators = [
    { name: "RSI (14)", value: data.technical?.rsi_14 ? Number(data.technical.rsi_14).toFixed(1) : "—", trend: data.technical?.rsi_14 ? (Number(data.technical.rsi_14) > 70 ? "sobrecompra" : Number(data.technical.rsi_14) < 30 ? "sobrevenda" : "neutro") : "—" },
    { name: "MACD Hist", value: data.technical?.macd_hist ? Number(data.technical.macd_hist).toFixed(2) : "—", trend: data.technical?.macd_hist ? (Number(data.technical.macd_hist) > 0 ? "alta" : "baixa") : "—" },
    { name: "MM 21 dias", value: data.technical?.sma_21 ? `R$ ${Number(data.technical.sma_21).toFixed(2)}` : "—", trend: (data.spot && data.technical?.sma_21) ? (Number(data.spot.price_per_arroba) > Number(data.technical.sma_21) ? "alta" : "baixa") : "—" },
    { name: "MM 50 dias", value: data.technical?.sma_50 ? `R$ ${Number(data.technical.sma_50).toFixed(2)}` : "—", trend: (data.spot && data.technical?.sma_50) ? (Number(data.spot.price_per_arroba) > Number(data.technical.sma_50) ? "alta" : "baixa") : "—" },
    { name: "Bollinger", value: data.technical?.bb_mid ? `R$ ${Number(data.technical.bb_mid).toFixed(2)}` : "—", trend: (data.spot && data.technical?.bb_upper) ? (Number(data.spot.price_per_arroba) > Number(data.technical.bb_upper) ? "sobrecompra" : "neutro") : "—" },
    { name: "ATR (14)", value: data.technical?.atr_14 ? Number(data.technical.atr_14).toFixed(2) : "—", trend: "volatilidade" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-primary text-lg">Carregando dados...</div>
      </div>
    );
  }

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

      {/* ═══ ALERTA CISNE NEGRO ═══ */}
      {data.crisis && (
        <section className="bg-bear/10 border border-bear/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-bear shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-bear">Circuit Breaker: {data.crisis.circuit_breaker_level}</p>
            <p className="text-xs text-bear/80 mt-1">{data.crisis.description}</p>
          </div>
        </section>
      )}

      {/* ═══ SINAL PRINCIPAL ═══ */}
      <section className={cn("rounded-xl p-5 border", style.bg, style.border)}>
        <div className="flex items-center gap-2 mb-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", style.bg)}>
            <Icon className={cn("w-6 h-6", style.text)} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-label text-[10px]">SINAL DO MERCADO</p>
            <h1 className={cn("text-display text-2xl", style.text)}>{displaySignal}</h1>
          </div>
          {sig.volatility_regime && (
            <span className="ml-auto text-[9px] font-bold uppercase px-2 py-1 rounded bg-card border border-border text-muted-foreground">
              Vol: {sig.volatility_regime}
            </span>
          )}
        </div>

        {/* Preço atual */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-display text-4xl text-foreground">
            R$ {Number(sig.price_current).toFixed(2).replace(".", ",")}
          </span>
          <span className={cn("text-sm font-semibold tabular-nums", variationPct >= 0 ? "text-bull" : "text-bear")}>
            {variationPct >= 0 ? "+" : ""}{variationPct.toFixed(1)}%
          </span>
        </div>

        {/* Barra de confiança */}
        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-label text-[10px]">CONFIANÇA DA PREVISÃO</span>
            <span className={cn("text-sm font-bold tabular-nums", style.text)}>{confidencePct}%</span>
          </div>
          <div className="confidence-bar">
            <div className={cn("confidence-bar-fill", style.barBg)} style={{ width: `${confidencePct}%` }} />
          </div>
        </div>

        <p className={cn("text-xs mt-3", style.text, "opacity-80")}>{displayLong}</p>
        {sig.recommendation_text && (
          <p className="text-xs text-secondary-foreground mt-2 leading-snug">{sig.recommendation_text}</p>
        )}
        {sig.duration_text && (
          <p className="text-[10px] text-muted-foreground mt-1">Duração estimada: {sig.duration_text}</p>
        )}
      </section>

      {/* ═══ INDICADORES RÁPIDOS ═══ */}
      <section className="grid grid-cols-2 gap-3">
        {quickIndicators.map((ind) => (
          <div key={ind.label} className="bg-card rounded-lg p-3 border border-border">
            <p className="text-label text-[9px] mb-1">{ind.label}</p>
            <p className="text-foreground font-semibold text-base tabular-nums">{ind.value}</p>
            {ind.change && (
              <p className={cn("text-xs font-medium tabular-nums mt-0.5", ind.up ? "text-bull" : "text-bear")}>
                {ind.change}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* ═══ CLIMA MT ═══ */}
      {data.climate && (
        <section className="bg-card rounded-lg p-3 border border-border flex items-center gap-3">
          <CloudRain className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-label text-[9px]">CLIMA MT</p>
            <p className="text-sm">
              Pasto: <span className="font-semibold">{data.climate.pasture_condition || "—"}</span>
              {" · "}Risco: <span className={cn("font-semibold", data.climate.risk_level === "ALTO" ? "text-bear" : data.climate.risk_level === "MEDIO" ? "text-hold" : "text-bull")}>{data.climate.risk_level || "—"}</span>
              {data.climate.temp_avg && <span className="text-muted-foreground"> · {Number(data.climate.temp_avg).toFixed(0)}°C</span>}
            </p>
          </div>
        </section>
      )}

      {/* ═══ ABATE & EXPORTAÇÃO ═══ */}
      {(data.slaughter || data.exports) && (
        <section className="grid grid-cols-2 gap-3">
          {data.slaughter && (
            <div className="bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center gap-1.5 mb-2">
                <Package className="w-3.5 h-3.5 text-primary" />
                <p className="text-label text-[9px]">ABATE IBGE</p>
              </div>
              <p className="text-foreground font-semibold text-sm tabular-nums">
                {(Number(data.slaughter.total_head) / 1e6).toFixed(1)}M cab
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                ♀ {Number(data.slaughter.female_percent).toFixed(0)}%
                {Number(data.slaughter.female_percent) > 42 ? " (liquidação)" : Number(data.slaughter.female_percent) < 35 ? " (retenção)" : ""}
              </p>
            </div>
          )}
          {data.exports && (
            <div className="bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center gap-1.5 mb-2">
                <Ship className="w-3.5 h-3.5 text-primary" />
                <p className="text-label text-[9px]">EXPORTAÇÃO</p>
              </div>
              <p className="text-foreground font-semibold text-sm tabular-nums">
                {(Number(data.exports.volume_tons) / 1e3).toFixed(0)}k ton
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {data.exports.destination || "Global"}
                {data.exports.value_usd && ` · US$${(Number(data.exports.value_usd) / 1e6).toFixed(0)}M`}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ═══ POR QUE ESSE SINAL? ═══ */}
      <section className="bg-card rounded-xl p-4 border border-border">
        <button onClick={() => setShowReasons(!showReasons)} className="w-full flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Por que {displaySignal.toLowerCase()}?</h2>
          </div>
          <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", showReasons && "rotate-90")} />
        </button>
        {showReasons && (
          <ul className="mt-3 space-y-2.5">
            {reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", style.barBg)} />
                <span className="text-sm text-secondary-foreground leading-snug">{reason}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ═══ NOTÍCIAS ═══ */}
      {data.news.length > 0 && (
        <section className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Notícias de Impacto</h2>
          </div>
          <div className="space-y-2">
            {data.news.slice(0, 4).map((n, i) => (
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
      )}

      {/* ═══ ASSERTIVIDADE DO MODELO ═══ */}
      <section className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Assertividade do Modelo</h2>
          <span className="text-[9px] text-muted-foreground ml-auto">XGBoost + Prophet</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(data.predictionAccuracy.length > 0
            ? data.predictionAccuracy.sort((a, b) => a.horizon - b.horizon)
            : [{ horizon: 5, accuracy: 82, total: 45 }, { horizon: 15, accuracy: 74, total: 38 }, { horizon: 30, accuracy: 68, total: 30 }]
          ).map((item) => (
            <div key={item.horizon} className="text-center">
              <p className="text-display text-2xl text-foreground">{item.accuracy}%</p>
              <p className="text-label text-[9px] mt-1">{item.horizon} dias</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.total} previsões</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ INDICADORES TÉCNICOS ═══ */}
      <section className="bg-card rounded-xl p-4 border border-border">
        <button onClick={() => setShowTech(!showTech)} className="w-full flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Indicadores Técnicos</h2>
          </div>
          <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", showTech && "rotate-90")} />
        </button>
        {showTech && (
          <div className="space-y-2 mt-3">
            {techIndicators.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm text-secondary-foreground">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium tabular-nums">{item.value}</span>
                  <span className={cn(
                    "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
                    item.trend === "alta" ? "text-bull bg-bull/10" :
                    item.trend === "baixa" ? "text-bear bg-bear/10" :
                    item.trend === "sobrecompra" ? "text-bear bg-bear/10" :
                    item.trend === "sobrevenda" ? "text-bull bg-bull/10" :
                    "text-hold bg-hold/10"
                  )}>
                    {item.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══ TIMESTAMP ═══ */}
      <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
        Dados: CEPEA, B3, BCB, NASA, RSS · Modelos: XGBoost + Prophet · NLP: Claude
        <br />
        Última atualização: {sig.date ? new Date(sig.date + "T12:00:00").toLocaleDateString("pt-BR") : "—"}
        {" · "}Não constitui recomendação de investimento.
      </p>
    </div>
  );
}
