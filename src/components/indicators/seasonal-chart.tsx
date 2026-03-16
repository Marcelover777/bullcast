"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { mockSeasonalData } from "@/lib/mock-data";

const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function getCurrentMonthIndex(): number {
  const now = new Date();
  return now.getMonth(); // 0-based
}

interface SeasonalTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}

function SeasonalTooltipContent({ active, payload, label }: SeasonalTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border bg-background p-3 shadow-lg">
      <p className="text-micro text-muted-foreground mb-2">{label}</p>
      {payload.map((entry) => {
        const labels: Record<string, string> = {
          current: "2026 (Atual)",
          average5y: "Media 5 Anos",
          previous: "2025",
        };
        return (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground">
                {labels[entry.dataKey] ?? entry.dataKey}
              </span>
            </div>
            <span className="font-mono text-xs font-semibold tabular-nums">
              R$ {formatBRL(entry.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function SeasonalChart() {
  const currentMonthIdx = getCurrentMonthIndex();
  const currentMonth = MONTHS[currentMonthIdx];

  const chartData = useMemo(
    () =>
      mockSeasonalData.map((d) => ({
        ...d,
        current: d.current === 0 ? undefined : d.current,
      })),
    []
  );

  const currentVal = mockSeasonalData[currentMonthIdx]?.current ?? 0;
  const avg5yVal = mockSeasonalData[currentMonthIdx]?.average5y ?? 0;
  const isAboveAverage = currentVal > avg5yVal;

  return (
    <div className="space-y-4 border border-border bg-background p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-muted-foreground" />
            <h3 className="font-editorial text-base tracking-tight">
              Sazonalidade de Precos
            </h3>
          </div>
          <p className="text-micro text-muted-foreground">
            Boi Gordo (R$/@) -- Comparativo Mensal
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center border px-2.5 py-1 text-micro font-bold",
            isAboveAverage
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
        >
          {isAboveAverage ? "Acima da Media Sazonal" : "Abaixo da Media Sazonal"}
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-primary" />
          <span className="text-micro text-muted-foreground">2026</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 border-t border-dashed border-muted-foreground" />
          <span className="text-micro text-muted-foreground">Media 5a</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-muted-foreground/40" />
          <span className="text-micro text-muted-foreground">2025</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}`}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip content={<SeasonalTooltipContent />} />
            <ReferenceLine
              x={currentMonth}
              stroke="var(--color-primary)"
              strokeDasharray="4 4"
              strokeWidth={1}
              opacity={0.6}
              label={{
                value: "Hoje",
                position: "top",
                fill: "var(--color-primary)",
                fontSize: 10,
              }}
            />
            {/* Previous year -- thin, subdued */}
            <Line
              type="monotone"
              dataKey="previous"
              stroke="var(--color-muted-foreground)"
              strokeWidth={1}
              strokeOpacity={0.4}
              dot={false}
              connectNulls
            />
            {/* 5y average -- dashed */}
            <Line
              type="monotone"
              dataKey="average5y"
              stroke="var(--color-muted-foreground)"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              connectNulls
            />
            {/* Current year -- bold primary */}
            <Line
              type="monotone"
              dataKey="current"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              dot={(props: Record<string, unknown>) => {
                const { cx, cy, payload } = props as {
                  cx: number;
                  cy: number;
                  payload: { month: string };
                };
                if (payload?.month === currentMonth) {
                  return (
                    <circle
                      key={`dot-${payload.month}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="var(--color-primary)"
                      stroke="var(--color-background)"
                      strokeWidth={2}
                    />
                  );
                }
                return <circle key={`dot-${payload?.month}`} r={0} cx={cx} cy={cy} />;
              }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current month summary */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-micro text-muted-foreground">
          {currentMonth}/2026 vs Media 5 Anos
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold tabular-nums">
            R$ {formatBRL(currentVal)}
          </span>
          <span className="text-micro text-muted-foreground">vs</span>
          <span className="font-mono text-sm tabular-nums text-muted-foreground">
            R$ {formatBRL(avg5yVal)}
          </span>
          <span
            className={cn(
              "font-mono text-xs font-semibold",
              isAboveAverage ? "text-primary" : "text-destructive"
            )}
          >
            ({isAboveAverage ? "+" : ""}
            {formatBRL(currentVal - avg5yVal)})
          </span>
        </div>
      </div>
    </div>
  );
}
