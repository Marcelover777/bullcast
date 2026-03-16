"use client";

import { cn } from "@/lib/utils";
import { mockCycleData } from "@/lib/mock-data";
import { RiveTrend } from "@/components/animations/rive-trend";

interface CycleCardProps {
  className?: string;
}

const trendDirection: Record<string, "up" | "down" | "sideways"> = {
  declining: "down",
  rising: "up",
  stable: "sideways",
};

const trendLabel: Record<string, string> = {
  declining: "Em queda",
  rising: "Em alta",
  stable: "Estavel",
};

const seasonalityConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  safra: { label: "Safra", color: "text-primary", bg: "bg-primary/10" },
  entressafra: {
    label: "Entressafra",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  transicao: {
    label: "Transicao",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

export function CycleCard({ className }: CycleCardProps) {
  const data = mockCycleData;
  const direction = trendDirection[data.trend] ?? "sideways";
  const season = seasonalityConfig[data.seasonality] ?? seasonalityConfig.transicao;

  // Female slaughter gauge: 38% out of a 50% max (above 50% = heavy liquidation)
  const gaugePercent = Math.min((data.femaleSlaughterPercent / 50) * 100, 100);

  const femaleColor =
    data.femaleSlaughterPercent >= 45
      ? "bg-destructive"
      : data.femaleSlaughterPercent >= 40
        ? "bg-warning"
        : "bg-primary";

  return (
    <div className={cn("border border-border bg-card p-6", className)}>
      {/* Header */}
      <h2 className="font-editorial text-lg tracking-tight mb-5">
        Ciclo Pecuario
      </h2>

      {/* Phase name */}
      <div className="mb-4">
        <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight block">
          {data.phase}
        </span>
      </div>

      {/* Explanation */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        {data.explanation}
      </p>

      {/* Female slaughter % */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-micro uppercase tracking-widest text-muted-foreground">
            Abate de Femeas
          </span>
          <span className="font-mono text-sm font-bold tabular-nums">
            {data.femaleSlaughterPercent.toFixed(1)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-muted relative">
          <div
            className={cn("h-full transition-all", femaleColor)}
            style={{ width: `${gaugePercent}%` }}
          />
          {/* Reference marks */}
          <div
            className="absolute top-0 h-full w-px bg-border"
            style={{ left: "50%" }}
          />
          <div
            className="absolute top-0 h-full w-px bg-border"
            style={{ left: "80%" }}
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between mt-1">
          <span className="text-micro text-muted-foreground font-mono">0%</span>
          <span className="text-micro text-muted-foreground font-mono">25%</span>
          <span className="text-micro text-muted-foreground font-mono">50%</span>
        </div>
      </div>

      {/* Bottom row: Trend + Seasonality */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        {/* Trend */}
        <div className="flex items-center gap-2">
          <span className="text-micro uppercase tracking-widest text-muted-foreground">
            Tendencia
          </span>
          <RiveTrend
            direction={direction}
            size={24}
            label={trendLabel[data.trend]}
          />
        </div>

        {/* Seasonality badge */}
        <div
          className={cn(
            "py-1 px-3 text-micro uppercase tracking-widest font-bold",
            season.bg,
            season.color
          )}
        >
          {season.label}
        </div>
      </div>
    </div>
  );
}
