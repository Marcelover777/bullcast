"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatBRL, formatConfidence } from "@/lib/format";
import { mockAreaChartData, mockRecommendation } from "@/lib/mock-data";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import {
  PremiumTooltip,
  premiumAxisConfig,
  premiumGridConfig,
} from "@/components/charts/premium-tooltip";

export function ProjectionChart() {
  const confidence = mockRecommendation.confidence;
  const dataMin = Math.min(...mockAreaChartData.map((d) => d.value));
  const dataMax = Math.max(...mockAreaChartData.map((d) => d.value));
  const yMin = Math.floor(dataMin - 2);
  const yMax = Math.ceil(dataMax + 2);

  return (
    <ScrollReveal direction="up" delay={0.1}>
      <section className="border border-border bg-background p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="font-editorial text-lg tracking-tight">
              Projecao 30 Dias
            </h2>
            <p className="text-micro uppercase tracking-widest text-muted-foreground">
              Boi Gordo &mdash; CEPEA
            </p>
          </div>
          <div className="flex items-center gap-2 border border-border px-3 py-1.5">
            <span className="text-micro uppercase tracking-widest text-muted-foreground">
              Confianca
            </span>
            <span className="font-mono text-sm font-bold tabular-nums text-primary">
              {formatConfidence(confidence)}
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={mockAreaChartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="var(--color-primary)" floodOpacity="0.25" />
                </filter>
              </defs>
              <CartesianGrid {...premiumGridConfig} />
              <XAxis
                dataKey="date"
                {...premiumAxisConfig}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[yMin, yMax]}
                {...premiumAxisConfig}
                tickFormatter={(v: number) => formatBRL(v, 0)}
              />
              <Tooltip
                content={<PremiumTooltip />}
                cursor={{ stroke: "var(--color-border)", strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fill="url(#areaGradient)"
                dot={false}
                filter="url(#lineGlow)"
                activeDot={{
                  r: 5,
                  fill: "var(--color-primary)",
                  stroke: "var(--color-background)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </ScrollReveal>
  );
}
