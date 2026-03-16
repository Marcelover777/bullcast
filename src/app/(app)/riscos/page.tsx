"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { fetchRiscosData, type RiscosData } from "@/lib/data";
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
  Loader2,
} from "lucide-react";

// ─── Map circuit breaker to risk level ──────────────────────────
function circuitToLevel(cb: string): "low" | "medium" | "high" {
  if (cb === "VERMELHO" || cb === "LARANJA") return "high";
  if (cb === "AMARELO") return "medium";
  return "low";
}

const riskLevelConfig = {
  low: { color: "text-primary", bg: "bg-primary/10", label: "Baixo" },
  medium: { color: "text-amber-500", bg: "bg-amber-500/10", label: "Moderado" },
  high: { color: "text-destructive", bg: "bg-destructive/10", label: "Alto" },
};

const STATE_NAMES: Record<string, string> = {
  SP: "São Paulo",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  GO: "Goiás",
  MG: "Minas Gerais",
  PA: "Pará",
  "MT-NUB": "Nova Ubiratã (MT)",
};

// ═══════════════════════════════════════════════════════════════════
// RISK RADAR PAGE — Real Supabase data + mock fallback
// ═══════════════════════════════════════════════════════════════════
export default function RiscosPage() {
  const [data, setData] = useState<RiscosData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiscosData()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  // Derive display values from real data or fallback to mock
  const hasReal = data && (data.crisisEvents.length > 0 || data.climateAlerts.length > 0 || data.latestSignal);
  const level = hasReal ? circuitToLevel(data.circuitBreakerLevel) : mockRiskData.overallLevel;
  const levelConfig = riskLevelConfig[level];

  // Volatility as 0-100 gauge value
  const volValue = hasReal
    ? Math.min(100, Math.round(data.volatilityStd * 40))
    : mockRiskData.volatility.value;

  // Crisis keywords from real events
  const crisisKeywords = hasReal && data.crisisEvents.length > 0
    ? (() => {
        const kwMap: Record<string, number> = {};
        for (const ev of data.crisisEvents) {
          const type = ev.event_type || "outro";
          kwMap[type] = (kwMap[type] || 0) + 1;
        }
        return Object.entries(kwMap).map(([keyword, mentions]) => ({
          keyword,
          mentions,
          trend: "neutral" as const,
        }));
      })()
    : mockRiskData.crisisKeywords;

  // Climate alerts
  const climateAlerts = hasReal && data.climateAlerts.length > 0
    ? data.climateAlerts.map((c) => ({
        state: c.state,
        stateFull: STATE_NAMES[c.state] || c.state,
        temperature: c.temp_avg || 0,
        precipitation: c.precipitation_mm || 0,
        ndvi: 0,
        drought: (c.risk_level === "high" ? "alert" : c.risk_level === "medium" ? "warning" : "none") as "none" | "watch" | "warning" | "alert",
        condition: (c.pasture_condition === "seco" ? "seco" : c.pasture_condition === "chuvoso" ? "chuvoso" : "normal") as "normal" | "seco" | "chuvoso",
      }))
    : mockClimateData;

  // Price anomaly from crisis events
  const hasAnomaly = hasReal
    ? data.crisisEvents.some((e) => e.event_type === "price_anomaly")
    : mockRiskData.priceAnomaly.detected;

  // Advice text
  const advice = hasReal && data.latestSignal?.explanation_text
    ? data.latestSignal.explanation_text
    : mockRiskData.advice;

  return (
    <PageTransition>
      {/* Header */}
      <header className="sticky top-0 z-40 nav-glass">
        <div className="max-w-md mx-auto px-5 h-14 flex items-center justify-between">
          <h1 className="text-lg font-heading font-bold text-foreground">Radar de Riscos</h1>
          <div className={cn("flex items-center gap-1.5 text-sm font-bold", levelConfig.color)}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>{levelConfig.label}</span>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-5 pt-5 pb-8 space-y-6">
        {/* Overall Risk Semaphore */}
        <ScrollReveal>
          <div className="flex flex-col items-center gap-4 py-6 bg-card border border-border/50 card-premium">
            <RiveSemaphore level={level} />
            <p className="text-sm text-muted-foreground text-center max-w-[280px]">
              Nivel geral de risco baseado em volatilidade, NLP de crise, anomalias e clima.
              {hasReal && (
                <span className="block mt-1 text-xs text-primary">● Dados em tempo real</span>
              )}
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
                value={volValue}
                label="Volatilidade"
                state={volValue > 60 ? "bearish" : volValue > 35 ? "neutral" : "bullish"}
                size={120}
              />
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground font-medium">
                  {hasReal ? `${data.volatilityStd.toFixed(2)}%` : "Tendencia"}
                </span>
              </div>
            </div>

            {/* Price Anomaly */}
            <div className="bg-card border border-border/50 p-4 flex flex-col items-center justify-center gap-3 card-premium">
              <AlertTriangle
                className={cn(
                  "w-8 h-8",
                  hasAnomaly ? "text-destructive" : "text-primary"
                )}
              />
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">
                  {hasAnomaly ? "Anomalia Detectada" : "Normal"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Circuit Breaker:{" "}
                  <span className="font-mono font-bold">
                    {hasReal ? data.circuitBreakerLevel : "VERDE"}
                  </span>
                </p>
              </div>
            </div>

            {/* Crisis Keywords NLP */}
            <div className="bg-card border border-border/50 p-4 col-span-2 card-premium">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">Eventos de Crise</h3>
              </div>
              {crisisKeywords.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {crisisKeywords.slice(0, 6).map((kw) => (
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
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum evento de crise ativo</p>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Climate Alerts */}
        <ScrollReveal delay={0.3}>
          <h2 className="text-base font-heading font-bold text-foreground mb-3">Alertas Climaticos</h2>
          <div className="space-y-2">
            {climateAlerts
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
                    <p className="text-xs font-mono text-muted-foreground">
                      {climate.temperature > 0 ? `${climate.temperature}°C` : ""}
                    </p>
                    {climate.precipitation > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">{climate.precipitation}mm</p>
                    )}
                  </div>
                </div>
              ))}

            {climateAlerts.filter((c) => c.drought === "none").length > 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                {climateAlerts.filter((c) => c.drought === "none").length} estados sem alertas climaticos
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
                <p className="text-sm text-muted-foreground leading-relaxed">{advice}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
