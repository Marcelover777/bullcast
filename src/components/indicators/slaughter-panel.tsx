"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ArrowUp, ArrowDown, Minus, Beef } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockSlaughterData } from "@/lib/mock-data";
import { PremiumTooltip, premiumAxisConfig, premiumGridConfig } from "@/components/charts/premium-tooltip";


// Historical average for comparison
const HISTORICAL_AVG_TOTAL = 790000;

export function SlaughterPanel() {
  const latest = mockSlaughterData[mockSlaughterData.length - 1];
  const previous = mockSlaughterData.length > 1
    ? mockSlaughterData[mockSlaughterData.length - 2]
    : null;

  const isAboveAvg = (latest?.total ?? 0) > HISTORICAL_AVG_TOTAL;
  const weeklyTotalChange = latest && previous
    ? latest.total - previous.total
    : 0;

  // State-level data from the latest week (for horizontal bars)
  const stateData = useMemo(() => {
    if (!latest) return [];
    const sorted = [...latest.states].sort((a, b) => b.total - a.total);
    const maxVal = sorted[0]?.total ?? 1;
    return sorted.map((s) => ({
      ...s,
      pct: (s.total / maxVal) * 100,
    }));
  }, [latest]);

  // State-level comparison with previous week
  const prevStatesMap = useMemo(() => {
    if (!previous) return new Map<string, number>();
    return new Map(previous.states.map((s) => [s.state, s.total]));
  }, [previous]);

  return (
    <div className="space-y-4 border border-border bg-background p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Beef size={14} className="text-muted-foreground" />
            <h3 className="font-editorial text-base tracking-tight">
              Abate Semanal
            </h3>
          </div>
          <p className="text-micro text-muted-foreground">
            Volume e % femeas por estado
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center border px-2.5 py-1 text-micro font-bold",
            isAboveAvg
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-primary/30 bg-primary/10 text-primary"
          )}
        >
          {isAboveAvg ? "Acima da Media" : "Abaixo da Media"}
        </span>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-border bg-secondary/30 p-3 space-y-1">
          <span className="text-micro text-muted-foreground">Total Semana</span>
          <div className="font-mono text-sm font-bold tabular-nums">
            {(latest?.total ?? 0).toLocaleString("pt-BR")}
          </div>
        </div>
        <div className="border border-border bg-secondary/30 p-3 space-y-1">
          <span className="text-micro text-muted-foreground">% Femeas</span>
          <div className="font-mono text-sm font-bold tabular-nums">
            {(latest?.femalePercent ?? 0).toFixed(1)}%
          </div>
        </div>
        <div className="border border-border bg-secondary/30 p-3 space-y-1">
          <span className="text-micro text-muted-foreground">vs Semana Ant.</span>
          <div className="flex items-center gap-1">
            {weeklyTotalChange > 0 ? (
              <ArrowUp size={12} className="text-destructive" />
            ) : weeklyTotalChange < 0 ? (
              <ArrowDown size={12} className="text-primary" />
            ) : (
              <Minus size={12} className="text-muted-foreground" />
            )}
            <span
              className={cn(
                "font-mono text-sm font-bold tabular-nums",
                weeklyTotalChange > 0
                  ? "text-destructive"
                  : weeklyTotalChange < 0
                    ? "text-primary"
                    : "text-muted-foreground"
              )}
            >
              {weeklyTotalChange > 0 ? "+" : ""}
              {weeklyTotalChange.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
      </div>

      {/* Weekly trend chart */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={mockSlaughterData}
            margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
          >
            <CartesianGrid {...premiumGridConfig} />
            <XAxis
              dataKey="week"
              {...premiumAxisConfig}
            />
            <YAxis
              yAxisId="total"
              {...premiumAxisConfig}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="pct"
              orientation="right"
              {...premiumAxisConfig}
              tickFormatter={(v: number) => `${v}%`}
              domain={[30, 45]}
            />
            <Tooltip content={<PremiumTooltip prefix="" valueFormatter={(v: number) => v > 100 ? v.toLocaleString("pt-BR") : `${v.toFixed(1)}%`} />} />
            <Bar
              yAxisId="total"
              dataKey="total"
              fill="var(--color-primary)"
              fillOpacity={0.6}
              barSize={24}
            />
            <Line
              yAxisId="pct"
              type="monotone"
              dataKey="femalePercent"
              stroke="var(--color-bear)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "var(--color-bear)", stroke: "var(--color-background)", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* State-level horizontal bars */}
      <div className="space-y-2">
        <h4 className="text-micro text-muted-foreground">Abates por Estado</h4>
        <div className="divide-y divide-border border border-border">
          {stateData.map((s) => {
            const prevTotal = prevStatesMap.get(s.state) ?? 0;
            const diff = s.total - prevTotal;
            return (
              <div key={s.state} className="flex items-center gap-3 px-3 py-2">
                <span className="w-8 text-xs font-semibold text-foreground">
                  {s.state}
                </span>
                <div className="flex-1">
                  <div className="h-2 w-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary/60 transition-all"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
                <span className="w-16 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {(s.total / 1000).toFixed(0)}k
                </span>
                <div className="w-14 text-right">
                  {diff !== 0 && previous && (
                    <span
                      className={cn(
                        "font-mono text-[10px] tabular-nums",
                        diff > 0 ? "text-destructive" : "text-primary"
                      )}
                    >
                      {diff > 0 ? "+" : ""}
                      {(diff / 1000).toFixed(0)}k
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
