"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL, formatPercent } from "@/lib/format";
import { mockPrices } from "@/lib/mock-data";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

function MiniSparkline({
  data,
  isPositive,
}: {
  data: number[];
  isPositive: boolean;
}) {
  const chartData = data.map((v, i) => ({ i, v }));
  const color = isPositive ? "#92C020" : "#DC2626";

  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${isPositive})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QuotesBlock() {
  const filteredPrices = mockPrices.filter(
    (p) => p.indicator !== "boi_gordo"
  );

  return (
    <ScrollReveal direction="up" delay={0.1}>
      <section className="border border-border bg-background p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-lg tracking-tight">
            Outras Pracas
          </h2>
          <Link
            href="/mercado"
            className="flex items-center gap-1 text-micro uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver tudo
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Price cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {filteredPrices.map((price) => {
            const isPositive = price.changePercent >= 0;
            return (
              <div
                key={price.indicator}
                className="flex items-center justify-between border border-border bg-secondary/40 p-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-micro uppercase tracking-widest text-muted-foreground">
                    {price.label}
                  </span>
                  <span className="font-mono text-lg font-bold tabular-nums">
                    {formatBRL(price.value)}
                    {price.unit && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {price.unit}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "inline-flex w-fit items-center gap-1 px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums",
                      isPositive
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {formatPercent(price.changePercent)}
                  </span>
                </div>
                <MiniSparkline
                  data={price.sparkline}
                  isPositive={isPositive}
                />
              </div>
            );
          })}
        </div>
      </section>
    </ScrollReveal>
  );
}
