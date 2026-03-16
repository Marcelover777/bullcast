"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronRight, BarChart3, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type Signal = "COMPRAR" | "VENDER" | "SEGURAR";

const mockSignal: { signal: Signal; confidence: number; price: number; change: number; reasons: string[] } = {
  signal: "COMPRAR",
  confidence: 78,
  price: 311.45,
  change: 2.3,
  reasons: [
    "CEPEA @ acumulou alta de 3.2% em 7 dias",
    "Oferta de boi gordo em queda nas principais praças",
    "B3 futuro (out/25) com prêmio de +R$8 vs. físico",
    "Sazonalidade favorável — entressafra se aproxima",
  ],
};

const indicators = [
  { label: "CEPEA/B3", value: "R$ 311,45", change: "+2.3%", up: true },
  { label: "B3 Futuro Out", value: "R$ 319,80", change: "+1.8%", up: true },
  { label: "Arroba MT", value: "R$ 295,00", change: "-0.5%", up: false },
  { label: "Oferta", value: "Baixa", change: "↓ 12%", up: true },
];

const signalConfig = {
  COMPRAR: { color: "bull", icon: TrendingUp, bg: "bg-bull/10", text: "text-bull", border: "border-bull/20", label: "MOMENTO DE COMPRA" },
  VENDER: { color: "bear", icon: TrendingDown, bg: "bg-bear/10", text: "text-bear", border: "border-bear/20", label: "MOMENTO DE VENDA" },
  SEGURAR: { color: "hold", icon: Minus, bg: "bg-hold/10", text: "text-hold", border: "border-hold/20", label: "MOMENTO DE AGUARDAR" },
};

export default function MercadoPage() {
  const [showDetails, setShowDetails] = useState(false);
  const config = signalConfig[mockSignal.signal];
  const SignalIcon = config.icon;

  return (
    <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
      {/* ═══ SINAL PRINCIPAL ═══ */}
      <section className={cn("rounded-xl p-5 border", config.bg, config.border)}>
        <div className="flex items-center gap-2 mb-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bg)}>
            <SignalIcon className={cn("w-6 h-6", config.text)} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-label text-[10px]">SINAL DO MERCADO</p>
            <h1 className={cn("text-display text-2xl", config.text)}>{mockSignal.signal}</h1>
          </div>
        </div>

        {/* Preço atual */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-display text-4xl text-foreground">
            R$ {mockSignal.price.toFixed(2).replace(".", ",")}
          </span>
          <span className={cn("text-sm font-semibold tabular-nums", mockSignal.change >= 0 ? "text-bull" : "text-bear")}>
            {mockSignal.change >= 0 ? "+" : ""}{mockSignal.change}%
          </span>
        </div>

        {/* Barra de confiança */}
        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-label text-[10px]">CONFIANÇA DA PREVISÃO</span>
            <span className={cn("text-sm font-bold tabular-nums", config.text)}>{mockSignal.confidence}%</span>
          </div>
          <div className="confidence-bar">
            <div
              className={cn("confidence-bar-fill", config.text === "text-bull" ? "bg-bull" : config.text === "text-bear" ? "bg-bear" : "bg-hold")}
              style={{ width: `${mockSignal.confidence}%` }}
            />
          </div>
        </div>

        <p className={cn("text-xs mt-3", config.text, "opacity-80")}>{config.label}</p>
      </section>

      {/* ═══ INDICADORES RÁPIDOS ═══ */}
      <section className="grid grid-cols-2 gap-3">
        {indicators.map((ind) => (
          <div key={ind.label} className="bg-card rounded-lg p-3 border border-border">
            <p className="text-label text-[9px] mb-1">{ind.label}</p>
            <p className="text-foreground font-semibold text-base tabular-nums">{ind.value}</p>
            <p className={cn("text-xs font-medium tabular-nums mt-0.5", ind.up ? "text-bull" : "text-bear")}>
              {ind.change}
            </p>
          </div>
        ))}
      </section>

      {/* ═══ POR QUE ESSE SINAL? ═══ */}
      <section className="bg-card rounded-xl p-4 border border-border">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Por que {mockSignal.signal.toLowerCase()}?</h2>
          </div>
          <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", showDetails && "rotate-90")} />
        </button>

        {showDetails && (
          <ul className="mt-3 space-y-2.5">
            {mockSignal.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", config.text === "text-bull" ? "bg-bull" : config.text === "text-bear" ? "bg-bear" : "bg-hold")} />
                <span className="text-sm text-secondary-foreground leading-snug">{reason}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ═══ ASSERTIVIDADE ═══ */}
      <section className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Assertividade do Modelo</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { period: "7 dias", accuracy: 82, total: 45 },
            { period: "15 dias", accuracy: 74, total: 38 },
            { period: "30 dias", accuracy: 68, total: 30 },
          ].map((item) => (
            <div key={item.period} className="text-center">
              <p className="text-display text-2xl text-foreground">{item.accuracy}%</p>
              <p className="text-label text-[9px] mt-1">{item.period}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.total} previsões</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ INDICADORES TÉCNICOS ═══ */}
      <section className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Indicadores Técnicos</h2>
        </div>
        <div className="space-y-2">
          {[
            { name: "CEPEA @ (SP)", value: "R$ 311,45", trend: "alta" },
            { name: "B3 Futuro (Out/25)", value: "R$ 319,80", trend: "alta" },
            { name: "Basis B3-Físico", value: "+R$ 8,35", trend: "alta" },
            { name: "MM 21 dias", value: "R$ 304,20", trend: "alta" },
            { name: "IFR (14)", value: "62.5", trend: "neutro" },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <span className="text-sm text-secondary-foreground">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium tabular-nums">{item.value}</span>
                <span className={cn(
                  "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
                  item.trend === "alta" ? "text-bull bg-bull/10" :
                  item.trend === "baixa" ? "text-bear bg-bear/10" :
                  "text-hold bg-hold/10"
                )}>
                  {item.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
