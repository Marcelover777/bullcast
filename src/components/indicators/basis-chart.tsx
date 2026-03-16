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

interface BasisTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}

function BasisTooltipContent({ active, payload, label }: BasisTooltipProps) {
  if (!active || !payload?.length) return null;

  const physical = payload.find((p) => p.dataKey === "physical");
  const futures = payload.find((p) => p.dataKey === "futures");
  const basis = payload.find((p) => p.dataKey === "basis");

  return (
    <div className="border border-border bg-background p-3 shadow-lg">
      <p className="text-micro text-muted-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {physical && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 bg-blue-500" />
              <span className="text-xs text-muted-foreground">Fisico</span>
            </div>
            <span className="font-mono text-xs font-semibold tabular-nums">
              R$ {formatBRL(physical.value)}
            </span>
          </div>
        )}
        {futures && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 bg-emerald-500" />
              <span className="text-xs text-muted-foreground">Futuro</span>
            </div>
            <span className="font-mono text-xs font-semibold tabular-nums">
              R$ {formatBRL(futures.value)}
            </span>
          </div>
        )}
        {basis && (
          <div className="flex items-center justify-between gap-4 border-t border-border pt-1 mt-1">
            <span className="text-xs text-muted-foreground">Basis</span>
            <span
              className={cn(
                "font-mono text-xs font-bold tabular-nums",
                basis.value >= 0 ? "text-primary" : "text-destructive"
              )}
            >
              R$ {formatBRL(basis.value)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

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
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="price"
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              domain={["dataMin - 2", "dataMax + 2"]}
            />
            <YAxis yAxisId="basis" orientation="right" hide />
            <Tooltip content={<BasisTooltipContent />} />
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
              fillOpacity={0.15}
              stroke="none"
            />
            {/* Physical line */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="physical"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
            />
            {/* Futures line */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="futures"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
