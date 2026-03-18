"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL, formatPrice } from "@/lib/format";
import { mockPredictionBands } from "@/lib/mock-data";
import { GSAPCounter } from "@/components/animations/gsap-counter";
import { PremiumTooltip, premiumAxisConfig, premiumGridConfig } from "@/components/charts/premium-tooltip";


export function PredictionPanel() {
  // Calculate confidence and bands
  const { confidencePct, lowerBound, upperBound } = useMemo(() => {
    const pointsWithActual = mockPredictionBands.filter(
      (p) => p.actual !== undefined
    );
    const withinBands = pointsWithActual.filter(
      (p) => p.actual! >= p.lower && p.actual! <= p.upper
    );
    const confidence =
      pointsWithActual.length > 0
        ? (withinBands.length / pointsWithActual.length) * 100
        : 0;

    const lastPoint = mockPredictionBands[mockPredictionBands.length - 1];
    return {
      confidencePct: Math.round(confidence * 10) / 10,
      lowerBound: lastPoint?.lower ?? 0,
      upperBound: lastPoint?.upper ?? 0,
    };
  }, []);

  // Prepare data with a "range" field for the band area
  const chartData = useMemo(
    () =>
      mockPredictionBands.map((d) => ({
        ...d,
        range: [d.lower, d.upper],
      })),
    []
  );

  return (
    <div className="space-y-4 border border-border bg-background p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-muted-foreground" />
            <h3 className="font-editorial text-base tracking-tight">
              Faixa de Confianca
            </h3>
          </div>
          <p className="text-micro text-muted-foreground">
            Previsao com bandas de confianca -- 30 dias
          </p>
        </div>
      </div>

      {/* Confidence score */}
      <div className="flex items-center gap-6 border border-border bg-secondary/30 p-4">
        <div className="space-y-1">
          <span className="text-micro text-muted-foreground">Confianca do Modelo</span>
          <div className="flex items-baseline gap-1">
            <GSAPCounter
              value={confidencePct}
              suffix="%"
              decimals={1}
              className="text-3xl font-bold text-primary"
            />
          </div>
        </div>
        <div className="h-12 w-px bg-border" />
        <div className="space-y-1">
          <span className="text-micro text-muted-foreground">Faixa Prevista</span>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            <span className="font-mono text-sm tabular-nums">
              {formatPrice(lowerBound)} - {formatPrice(upperBound)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
          >
            <defs>
              <filter id="predictionGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="var(--color-primary)" floodOpacity="0.2" />
              </filter>
            </defs>
            <CartesianGrid {...premiumGridConfig} />
            <XAxis
              dataKey="date"
              {...premiumAxisConfig}
            />
            <YAxis
              {...premiumAxisConfig}
              domain={["dataMin - 3", "dataMax + 3"]}
            />
            <Tooltip content={<PremiumTooltip />} />

            {/* Upper band */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="var(--color-primary)"
              fillOpacity={0.1}
            />
            {/* Lower band -- subtractive trick: fill background over it */}
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="var(--color-background)"
              fillOpacity={1}
            />

            {/* Predicted line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 5, fill: "var(--color-primary)", stroke: "var(--color-background)", strokeWidth: 2 }}
              filter="url(#predictionGlow)"
            />

            {/* Actual prices as dots */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--color-foreground)"
              strokeWidth={0}
              dot={{
                r: 3,
                fill: "var(--color-foreground)",
                stroke: "var(--color-background)",
                strokeWidth: 1,
              }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 border-t border-dashed border-primary" />
          <span className="text-micro text-muted-foreground">Previsao</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 bg-foreground" />
          <span className="text-micro text-muted-foreground">Real</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 bg-primary/15" />
          <span className="text-micro text-muted-foreground">Banda</span>
        </div>
      </div>

      {/* Explanation */}
      <div className="border-t border-border pt-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          O modelo preve que o preco ficara entre{" "}
          <strong className="font-mono text-foreground">
            {formatPrice(lowerBound)}
          </strong>{" "}
          e{" "}
          <strong className="font-mono text-foreground">
            {formatPrice(upperBound)}
          </strong>{" "}
          nos proximos 30 dias, com{" "}
          <strong className={cn("font-mono", confidencePct >= 80 ? "text-primary" : "text-warning")}>
            {confidencePct}%
          </strong>{" "}
          de confianca historica.
        </p>
      </div>
    </div>
  );
}
