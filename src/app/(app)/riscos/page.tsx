"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { fetchRiscosData, type RiscosData } from "@/lib/data";
import { mockRiskData } from "@/lib/mock-data";
import { RiveSemaphore } from "@/components/animations/rive-semaphore";
import { RiveGauge } from "@/components/animations/rive-gauge";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Globe,
  Minus,
  CloudRain,
  Thermometer,
  Cloud,
  CheckCircle,
  Ship,
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
};

// All 5 UFs to always display
const ALL_UFS = ["MT", "MS", "GO", "PA", "MG"] as const;

// ═══ Page ═══
export default function RiscosPage() {
  const [data, setData] = useState<RiscosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    fetchRiscosData()
      .then((d) => {
        setData(d);
        if (d.crisisEvents.length > 0 || d.climateAlerts.length > 0 || d.latestSignal) {
          setUsingMock(false);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  // Derive display values
  const hasReal = !usingMock && data;
  const level = hasReal ? circuitToLevel(data.circuitBreakerLevel) : mockRiskData.overallLevel;
  const levelConfig = riskLevelConfig[level];

  // Volatility gauge (0-100)
  const volValue = hasReal
    ? Math.min(100, Math.round(data.volatilityStd * 40))
    : mockRiskData.volatility.value;

  // Crisis keywords
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

  // Price anomaly
  const hasAnomaly = hasReal
    ? data.crisisEvents.some((e) => e.event_type === "price_anomaly")
    : mockRiskData.priceAnomaly.detected;

  // Advice text — prefer latestSignal.recommendation_text
  const advice = hasReal && data.latestSignal?.recommendation_text
    ? data.latestSignal.recommendation_text
    : mockRiskData.advice;

  // China Quota — from export data or mock
  const chinaQuota = {
    usedPercent: mockRiskData.chinaQuota.used,
    total: mockRiskData.chinaQuota.total,
    daysRemaining: mockRiskData.chinaQuota.daysRemaining,
  };
  // If we have real export data, try to derive a percentage
  if (hasReal && data.exportData?.volume_tons) {
    // Annual china quota ~100k tons benchmark, use volume as proxy
    const annualQuota = 100000;
    const used = Number(data.exportData.volume_tons);
    chinaQuota.usedPercent = Math.min(99, Math.round((used / annualQuota) * 100));
  }

  // Climate: build full 5 UF list
  const climateMap = new Map<string, { risk: string; pasture: string | null; temp: number; precip: number }>();
  if (hasReal && data.climateAlerts.length > 0) {
    for (const c of data.climateAlerts) {
      climateMap.set(c.state, {
        risk: c.risk_level || "BAIXO",
        pasture: c.pasture_condition,
        temp: Number(c.temp_avg || 0),
        precip: Number(c.precipitation_mm || 0),
      });
    }
  }

  const climateRows = ALL_UFS.map((uf) => {
    const real = climateMap.get(uf);
    if (real) {
      const riskNorm = real.risk.toUpperCase();
      const droughtLevel = riskNorm === "ALTO" || riskNorm === "CRITICO" ? "alert"
        : riskNorm === "MEDIO" || riskNorm === "MODERADO" ? "warning"
        : riskNorm === "ATENCAO" ? "watch"
        : "none";
      return {
        state: uf,
        stateFull: STATE_NAMES[uf] || uf,
        drought: droughtLevel as "none" | "watch" | "warning" | "alert",
        temp: real.temp,
        precip: real.precip,
        pasture: real.pasture,
        isReal: true,
      };
    }
    // No data for this UF — default to "normal"
    return {
      state: uf,
      stateFull: STATE_NAMES[uf] || uf,
      drought: "none" as const,
      temp: 0,
      precip: 0,
      pasture: null,
      isReal: false,
    };
  });

  // Sort: alerts first, then warnings, then normal
  const droughtOrder = { alert: 0, warning: 1, watch: 2, none: 3 };
  climateRows.sort((a, b) => droughtOrder[a.drought] - droughtOrder[b.drought]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-primary text-lg">Carregando radar de riscos...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
      {/* Badge mock */}
      {usingMock && (
        <div className="bg-hold/10 border border-hold/20 px-3 py-2 text-center">
          <p className="text-[10px] text-hold font-semibold uppercase tracking-wider">
            Dados demonstrativos — conecte o backend para dados reais
          </p>
        </div>
      )}

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-xl text-primary">RISCOS</h1>
          <p className="text-sm text-muted-foreground mt-1">Radar de riscos do mercado</p>
        </div>
        <div className={cn("flex items-center gap-1.5 text-sm font-bold", levelConfig.color)}>
          <ShieldAlert className="w-4 h-4" />
          <span>{levelConfig.label}</span>
        </div>
      </div>

      {/* ═══ 1. COTA CHINA COUNTDOWN ═══ */}
      <ScrollReveal direction="up" delay={0}>
        <section className="border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Ship className="w-4 h-4 text-primary" />
            <h2 className="text-display text-base">Cota China</h2>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-label text-[9px]">COTA TARIFÁRIA PREFERENCIAL (12%)</span>
              <span className="text-sm font-bold tabular-nums text-foreground">{chinaQuota.usedPercent}%</span>
            </div>
            <div className="w-full h-3 bg-muted">
              <div
                className={cn(
                  "h-full transition-all",
                  chinaQuota.usedPercent >= 90 ? "bg-destructive" : chinaQuota.usedPercent >= 70 ? "bg-amber-500" : "bg-primary"
                )}
                style={{ width: `${chinaQuota.usedPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {chinaQuota.usedPercent}% utilizada
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                ~{chinaQuota.daysRemaining} dias restantes
              </span>
            </div>
          </div>

          <div className="bg-secondary/40 p-3 space-y-1.5">
            <p className="text-xs text-foreground">
              <span className="font-semibold">Projeção de esgotamento:</span> Setembro 2026
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quando esgotar: tarifa sobe de 12% para 55%.
              Preço pode subir forte com redirecionamento de embarques.
            </p>
          </div>

          {hasReal && data.exportData && (
            <p className="text-[10px] text-primary">
              Último embarque: {Number(data.exportData.volume_tons).toLocaleString("pt-BR")} ton
              {data.exportData.destination && ` → ${data.exportData.destination}`}
            </p>
          )}
        </section>
      </ScrollReveal>

      {/* ═══ 2. SEMÁFORO GERAL ═══ */}
      <ScrollReveal direction="up" delay={0.05}>
        <div className="flex flex-col items-center gap-4 py-6 bg-card border border-border">
          <RiveSemaphore level={level} />
          <p className="text-sm text-muted-foreground text-center max-w-[280px]">
            Nível geral de risco baseado em volatilidade, eventos de crise, anomalias e clima.
            {hasReal && (
              <span className="block mt-1 text-xs text-primary">Dados em tempo real</span>
            )}
          </p>
        </div>
      </ScrollReveal>

      {/* ═══ 3. INDICADORES DE RISCO ═══ */}
      <ScrollReveal direction="up" delay={0.1}>
        <h2 className="text-display text-base mb-3">Indicadores de Risco</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Volatilidade */}
          <div className="bg-card border border-border p-4 flex flex-col items-center gap-2">
            <RiveGauge
              value={volValue}
              label="Volatilidade"
              state={volValue > 60 ? "bearish" : volValue > 35 ? "neutral" : "bullish"}
              size={120}
            />
            <span className="text-xs text-muted-foreground font-medium">
              {hasReal ? `${data.volatilityStd.toFixed(2)}%` : "Normal"}
            </span>
          </div>

          {/* Anomalia de preço */}
          <div className="bg-card border border-border p-4 flex flex-col items-center justify-center gap-3">
            <AlertTriangle
              className={cn("w-8 h-8", hasAnomaly ? "text-destructive" : "text-primary")}
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

          {/* Eventos NLP */}
          <div className="bg-card border border-border p-4 col-span-2">
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

      {/* ═══ 4. ALERTAS CLIMÁTICOS — 5 UFs ═══ */}
      <ScrollReveal direction="up" delay={0.2}>
        <h2 className="text-display text-base mb-3">Monitor Climático</h2>
        <div className="space-y-2">
          {climateRows.map((climate) => {
            const isAlert = climate.drought === "alert" || climate.drought === "warning";
            const isNormal = climate.drought === "none";

            const borderClass = climate.drought === "alert"
              ? "border-destructive/30"
              : climate.drought === "warning"
                ? "border-amber-500/30"
                : "border-border";

            const iconBg = climate.drought === "alert"
              ? "bg-destructive/10 text-destructive"
              : climate.drought === "warning"
                ? "bg-amber-500/10 text-amber-500"
                : climate.drought === "watch"
                  ? "bg-hold/10 text-hold"
                  : "bg-primary/10 text-primary";

            const statusLabel = climate.drought === "alert"
              ? "Alerta crítico"
              : climate.drought === "warning"
                ? "Atenção"
                : climate.drought === "watch"
                  ? "Monitoramento"
                  : "Normal";

            const WeatherIcon = isAlert ? (climate.pasture === "seco" ? Thermometer : CloudRain)
              : isNormal ? CheckCircle
              : Cloud;

            return (
              <div
                key={climate.state}
                className={cn("bg-card border p-4 flex items-center justify-between", borderClass)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 flex items-center justify-center", iconBg)}>
                    <WeatherIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {climate.state}
                      <span className="text-muted-foreground font-normal ml-1.5 text-xs">
                        {climate.stateFull}
                      </span>
                    </p>
                    <p className={cn(
                      "text-xs mt-0.5",
                      climate.drought === "alert" ? "text-destructive" :
                      climate.drought === "warning" ? "text-amber-500" :
                      "text-muted-foreground"
                    )}>
                      {isNormal ? "\u2705 " : ""}{statusLabel}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {climate.temp > 0 && (
                    <p className="text-xs font-mono text-muted-foreground tabular-nums">
                      {climate.temp.toFixed(0)}°C
                    </p>
                  )}
                  {climate.precip > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                      {climate.precip.toFixed(0)}mm
                    </p>
                  )}
                  {climate.pasture && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                      {climate.pasture}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollReveal>

      {/* ═══ 5. ORIENTAÇÃO PRO PECUARISTA ═══ */}
      <ScrollReveal direction="up" delay={0.3}>
        <section className="bg-card border border-border p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-foreground mb-2">Orientação pro Pecuarista</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{advice}</p>
              {hasReal && data.latestSignal?.trend_text && (
                <p className="text-xs text-primary mt-2">
                  Tendência: {data.latestSignal.trend_text}
                </p>
              )}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══ TIMESTAMP ═══ */}
      <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
        Dados: CEPEA, B3, BCB, IBGE, NASA · Modelo BullCast · Não constitui recomendação de investimento.
      </p>
    </div>
  );
}
