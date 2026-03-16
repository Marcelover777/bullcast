"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatBRL, formatConfidence } from "@/lib/format";
import { mockAreaChartData, mockRecommendation } from "@/lib/mock-data";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border border-border bg-background px-3 py-2 shadow-lg">
      <p className="text-micro uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-sm font-bold tabular-nums">
        R$ {formatBRL(payload[0].value)}
      </p>
    </div>
  );
}

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
                  <stop offset="0%" stopColor="#92C020" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#92C020" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "var(--color-muted-foreground)",
                  fontFamily: "var(--font-mono)",
                }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[yMin, yMax]}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "var(--color-muted-foreground)",
                  fontFamily: "var(--font-mono)",
                }}
                tickFormatter={(v: number) => formatBRL(v, 0)}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "var(--color-border)", strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#92C020"
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#92C020",
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
