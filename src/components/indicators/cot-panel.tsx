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
  Legend,
  ReferenceLine,
} from "recharts";
import { ArrowUp, ArrowDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockCOTData } from "@/lib/mock-data";
import { PremiumTooltip, premiumAxisConfig, premiumGridConfig } from "@/components/charts/premium-tooltip";


export function COTPanel() {
  const chartData = useMemo(
    () =>
      mockCOTData.map((d) => ({
        week: d.week,
        hedgersNet: d.hedgersLong - d.hedgersShort,
        speculatorsNet: d.speculatorsLong - d.speculatorsShort,
        netPosition: d.netPosition,
      })),
    []
  );

  const latest = chartData[chartData.length - 1];
  const previous = chartData[chartData.length - 2];
  const weeklyChange = latest && previous
    ? latest.netPosition - previous.netPosition
    : 0;
  const isWeeklyUp = weeklyChange >= 0;

  return (
    <div className="space-y-4 border border-border bg-background p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-muted-foreground" />
            <h3 className="font-editorial text-base tracking-tight">
              Posicionamento B3 (COT)
            </h3>
          </div>
          <p className="text-micro text-muted-foreground">
            Hedgers vs Especuladores -- Posicao Liquida
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-border bg-secondary/30 p-3 space-y-1">
          <span className="text-micro text-muted-foreground">Hedgers</span>
          <div className="font-mono text-sm font-bold tabular-nums text-blue-500">
            {latest ? (latest.hedgersNet > 0 ? "+" : "") : ""}
            {latest?.hedgersNet.toLocaleString("pt-BR") ?? "0"}
          </div>
        </div>
        <div className="border border-border bg-secondary/30 p-3 space-y-1">
          <span className="text-micro text-muted-foreground">Especuladores</span>
          <div className="font-mono text-sm font-bold tabular-nums text-orange-500">
            {latest ? (latest.speculatorsNet > 0 ? "+" : "") : ""}
            {latest?.speculatorsNet.toLocaleString("pt-BR") ?? "0"}
          </div>
        </div>
        <div className="border border-border bg-secondary/30 p-3 space-y-1">
          <span className="text-micro text-muted-foreground">Variacao Semanal</span>
          <div className="flex items-center gap-1">
            {isWeeklyUp ? (
              <ArrowUp size={14} className="text-primary" />
            ) : (
              <ArrowDown size={14} className="text-destructive" />
            )}
            <span
              className={cn(
                "font-mono text-sm font-bold tabular-nums",
                isWeeklyUp ? "text-primary" : "text-destructive"
              )}
            >
              {isWeeklyUp ? "+" : ""}
              {weeklyChange.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
          >
            <CartesianGrid {...premiumGridConfig} />
            <XAxis
              dataKey="week"
              {...premiumAxisConfig}
            />
            <YAxis
              {...premiumAxisConfig}
              tickFormatter={(v: number) =>
                `${(v / 1000).toFixed(0)}k`
              }
            />
            <Tooltip content={<PremiumTooltip prefix="" valueFormatter={(v: number) => v.toLocaleString("pt-BR")} />} />
            <Legend
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  hedgersNet: "Hedgers",
                  speculatorsNet: "Especuladores",
                  netPosition: "Pos. Liquida",
                };
                return (
                  <span className="text-micro text-muted-foreground">
                    {labels[value] ?? value}
                  </span>
                );
              }}
            />
            <ReferenceLine
              y={0}
              stroke="var(--color-muted-foreground)"
              strokeDasharray="3 3"
              opacity={0.4}
            />
            {/* Hedgers bars */}
            <Bar
              dataKey="hedgersNet"
              fill="var(--color-primary)"
              fillOpacity={0.7}
              barSize={16}
              name="hedgersNet"
            />
            {/* Speculators bars */}
            <Bar
              dataKey="speculatorsNet"
              fill="var(--color-bear)"
              fillOpacity={0.7}
              barSize={16}
              name="speculatorsNet"
            />
            {/* Net position line overlay */}
            <Line
              type="monotone"
              dataKey="netPosition"
              stroke="var(--color-foreground)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "var(--color-foreground)", stroke: "var(--color-background)", strokeWidth: 2 }}
              name="netPosition"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Explanation */}
      <div className="border-t border-border pt-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Hedgers</strong> (produtores/frigorificos)
          protegem precos reais. <strong className="text-foreground">Especuladores</strong>{" "}
          (fundos) buscam lucro direcional. Quando especuladores estao muito vendidos,
          pode haver reversao de alta.
        </p>
      </div>
    </div>
  );
}
