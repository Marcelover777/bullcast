"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, GitCompareArrows } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL, formatPercent } from "@/lib/format";
import { mockBasisData } from "@/lib/mock-data";
import { PremiumTooltip, premiumAxisConfig, premiumGridConfig } from "@/components/charts/premium-tooltip";


export function BasisChart() {
  const latestPoint = mockBasisData[mockBasisData.length - 1];
  const currentBasis = latestPoint?.basis ?? 0;
  const basisPercent = latestPoint
    ? (currentBasis / latestPoint.futures) * 100
    : 0;
  const isPositive = currentBasis >= 0;

  // Prepare chart data with separate positive/negative basis areas
  const chartData = useMemo(
    () =>
      mockBasisData.map((d) => ({
        ...d,
        basisPositive: d.basis >= 0 ? d.basis : 0,
        basisNegative: d.basis < 0 ? d.basis : 0,
      })),
    []
  );

  return (
    <div className="space-y-4 border border-border bg-background p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GitCompareArrows size={14} className="text-muted-foreground" />
            <h3 className="font-editorial text-base tracking-tight">
              Analise de Basis
            </h3>
          </div>
          <p className="text-micro text-muted-foreground">
            Fisico vs Futuro B3 -- Spread
          </p>
        </div>
      </div>

      {/* Current basis highlight */}
      <div className="flex items-center gap-4 border border-border bg-secondary/30 p-3">
        <div className="space-y-0.5">
          <span className="text-micro text-muted-foreground">Basis Atual</span>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-mono text-2xl font-bold tabular-nums",
                isPositive ? "text-primary" : "text-destructive"
              )}
            >
              {isPositive ? "+" : ""}R$ {formatBRL(currentBasis)}
            </span>
            <span
              className={cn(
                "font-mono text-sm tabular-nums",
                isPositive ? "text-primary" : "text-destructive"
              )}
            >
              ({formatPercent(basisPercent)})
            </span>
            {isPositive ? (
              <ArrowUpRight size={16} className="text-primary" />
            ) : (
              <ArrowDownRight size={16} className="text-destructive" />
            )}
          </div>
        </div>
        <div className="ml-auto space-y-0.5 text-right">
          <div className="text-micro text-muted-foreground">Fisico</div>
          <div className="font-mono text-sm tabular-nums">
            R$ {formatBRL(latestPoint?.physical ?? 0)}
          </div>
        </div>
        <div className="space-y-0.5 text-right">
          <div className="text-micro text-muted-foreground">Futuro</div>
          <div className="font-mono text-sm tabular-nums">
            R$ {formatBRL(latestPoint?.futures ?? 0)}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-blue-500" />
          <span className="text-micro text-muted-foreground">Fisico</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-emerald-500" />
          <span className="text-micro text-muted-foreground">Futuro</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 bg-primary/20" />
          <span className="text-micro text-muted-foreground">Basis +</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 bg-destructive/20" />
          <span className="text-micro text-muted-foreground">Basis -</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
          >
            <defs>
              <filter id="basisGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="var(--color-primary)" floodOpacity="0.2" />
              </filter>
            </defs>
            <CartesianGrid {...premiumGridConfig} />
            <XAxis
              dataKey="date"
              {...premiumAxisConfig}
            />
            <YAxis
              yAxisId="price"
              {...premiumAxisConfig}
              domain={["dataMin - 2", "dataMax + 2"]}
            />
            <YAxis yAxisId="basis" orientation="right" hide />
            <Tooltip content={<PremiumTooltip />} />
            <ReferenceLine
              yAxisId="basis"
              y={0}
              stroke="var(--color-muted-foreground)"
              strokeDasharray="3 3"
              opacity={0.4}
            />
            {/* Basis area -- colored by sign */}
            <Area
              yAxisId="basis"
              type="monotone"
              dataKey="basis"
              fill="var(--color-primary)"
              fillOpacity={0.1}
              stroke="none"
            />
            {/* Physical line */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="physical"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "var(--color-primary)", stroke: "var(--color-background)", strokeWidth: 2 }}
              filter="url(#basisGlow)"
            />
            {/* Futures line */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="futures"
              stroke="var(--color-bull)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "var(--color-bull)", stroke: "var(--color-background)", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
