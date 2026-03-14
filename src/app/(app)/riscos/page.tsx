"use client";

import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";
import { mockRiskData, mockClimateData } from "@/lib/mock-data";
import { RiveSemaphore } from "@/components/animations/rive-semaphore";
import { RiveGauge } from "@/components/animations/rive-gauge";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { PageTransition } from "@/components/motion/page-transition";
import { GSAPCounter } from "@/components/animations/gsap-counter";
import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Globe,
  Minus,
  CloudRain,
  Thermometer,
  Leaf,
} from "lucide-react";

// ─── Animation Variants ─────────────────────────────────────────
const riskLevelConfig = {
  low: { color: "text-primary", bg: "bg-primary/10", label: "Baixo" },
  medium: { color: "text-amber-500", bg: "bg-amber-500/10", label: "Moderado" },
  high: { color: "text-destructive", bg: "bg-destructive/10", label: "Alto" },
};

// ═══════════════════════════════════════════════════════════════════
// RISK RADAR PAGE
// ═══════════════════════════════════════════════════════════════════
export default function RiscosPage() {
  const risk = mockRiskData;
  const levelConfig = riskLevelConfig[risk.overallLevel];

  return (
    <PageTransition>
      {/* Header */}
      <header className="sticky top-0 z-40 nav-glass">
        <div className="max-w-md mx-auto px-5 h-14 flex items-center justify-between">
          <h1 className="text-lg font-heading font-bold text-foreground">Radar de Riscos</h1>
          <div className={cn("flex items-center gap-1.5 text-sm font-bold", levelConfig.color)}>
            <ShieldAlert className="w-4 h-4" />
            <span>{levelConfig.label}</span>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-5 pt-5 pb-8 space-y-6">
        {/* Overall Risk Semaphore */}
        <ScrollReveal>
          <div className="flex flex-col items-center gap-4 py-6 bg-card border border-border/50 card-premium">
            <RiveSemaphore level={risk.overallLevel} />
            <p className="text-sm text-muted-foreground text-center max-w-[280px]">
              Nivel geral de risco do mercado baseado em volatilidade, NLP de crise, anomalias e clima.
            </p>
          </div>
        </ScrollReveal>

        {/* Risk Cards Grid */}
        <ScrollReveal delay={0.1}>
          <h2 className="text-base font-heading font-bold text-foreground mb-3">Indicadores de Risco</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Volatility Gauge */}
            <div className="bg-card border border-border/50 p-4 flex flex-col items-center gap-2 card-premium">
              <RiveGauge
                value={risk.volatility.value}
                label="Volatilidade"
                state={risk.volatility.value > 60 ? "bearish" : risk.volatility.value > 35 ? "neutral" : "bullish"}
                size={120}
              />
              <div className="flex items-center gap-1 text-xs">
                {risk.volatility.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-destructive" />
                ) : risk.volatility.trend === "down" ? (
                  <TrendingDown className="w-3 h-3 text-primary" />
                ) : (
                  <Minus className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="text-muted-foreground font-medium">Tendencia</span>
              </div>
            </div>

            {/* Price Anomaly */}
            <div className="bg-card border border-border/50 p-4 flex flex-col items-center justify-center gap-3 card-premium">
              <AlertTriangle
                className={cn(
                  "w-8 h-8",
                  risk.priceAnomaly.detected ? "text-destructive" : "text-primary"
                )}
              />
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">
                  {risk.priceAnomaly.detected ? "Anomalia Detectada" : "Normal"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Z-Score:{" "}
                  <span className="font-mono font-bold">{risk.priceAnomaly.zScore.toFixed(1)}</span>
                </p>
              </div>
            </div>

            {/* Crisis Keywords NLP */}
            <div className="bg-card border border-border/50 p-4 col-span-2 card-premium">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">Palavras de Crise (NLP)</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {risk.crisisKeywords.map((kw) => (
                  <div
                    key={kw.keyword}
                    className="flex items-center justify-between bg-secondary/40 px-3 py-2"
                  >
                    <span className="text-sm text-foreground font-medium capitalize">{kw.keyword}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-foreground">{kw.mentions}</span>
                      {kw.trend === "up" ? (
                        <TrendingUp className="w-3 h-3 text-destructive" />
                      ) : kw.trend === "down" ? (
                        <TrendingDown className="w-3 h-3 text-primary" />
                      ) : (
                        <Minus className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* China Quota Progress */}
        <ScrollReveal delay={0.2}>
          <div className="bg-card border border-border/50 p-5 card-premium">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">Cota China</h3>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {risk.chinaQuota.daysRemaining} dias restantes
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-secondary/60 overflow-hidden mb-3">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 transition-all duration-1000",
                  risk.chinaQuota.used / risk.chinaQuota.total > 0.8
                    ? "bg-destructive"
                    : risk.chinaQuota.used / risk.chinaQuota.total > 0.6
                      ? "bg-amber-500"
                      : "bg-primary"
                )}
                style={{ width: `${(risk.chinaQuota.used / risk.chinaQuota.total) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <GSAPCounter
                  value={risk.chinaQuota.used}
                  suffix=""
                  decimals={0}
                  className="text-2xl font-bold text-foreground"
                />
                <span className="text-sm text-muted-foreground font-medium">
                  / {risk.chinaQuota.total} mil ton
                </span>
              </div>
              <span className="text-sm font-mono font-bold text-foreground">
                {Math.round((risk.chinaQuota.used / risk.chinaQuota.total) * 100)}%
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Climate Alerts */}
        <ScrollReveal delay={0.3}>
          <h2 className="text-base font-heading font-bold text-foreground mb-3">Alertas Climaticos</h2>
          <div className="space-y-2">
            {mockClimateData
              .filter((c) => c.drought !== "none")
              .map((climate) => (
                <div
                  key={climate.state}
                  className={cn(
                    "bg-card border p-4 flex items-center justify-between card-premium",
                    climate.drought === "alert"
                      ? "border-destructive/30"
                      : climate.drought === "warning"
                        ? "border-amber-500/30"
                        : "border-border/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 flex items-center justify-center",
                        climate.drought === "alert"
                          ? "bg-destructive/10 text-destructive"
                          : climate.drought === "warning"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {climate.condition === "seco" ? (
                        <Thermometer className="w-5 h-5" />
                      ) : (
                        <CloudRain className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{climate.stateFull}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {climate.drought === "alert"
                          ? "Alerta critico"
                          : climate.drought === "warning"
                            ? "Atencao"
                            : "Monitoramento"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <Leaf className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-mono text-muted-foreground">
                        NDVI {climate.ndvi.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{climate.temperature}C</p>
                  </div>
                </div>
              ))}

            {mockClimateData.filter((c) => c.drought === "none").length > 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                {mockClimateData.filter((c) => c.drought === "none").length} estados sem alertas climaticos
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* Advisory Text */}
        <ScrollReveal delay={0.4}>
          <div className="bg-card border border-border/50 p-5 card-premium">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">Orientacao pro Pecuarista</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{risk.advice}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
