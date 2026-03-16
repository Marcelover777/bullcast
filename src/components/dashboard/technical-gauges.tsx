"use client";

import { cn } from "@/lib/utils";
import { RiveGauge } from "@/components/animations/rive-gauge";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

interface GaugeConfig {
  label: string;
  value: number;
  state: "bullish" | "bearish" | "neutral";
  counts: { buy: number; neutral: number; sell: number };
}

const GAUGES: GaugeConfig[] = [
  {
    label: "Escalas de Abate",
    value: 72,
    state: "bullish",
    counts: { buy: 8, neutral: 2, sell: 1 },
  },
  {
    label: "Retencao de Femeas",
    value: 65,
    state: "bullish",
    counts: { buy: 6, neutral: 3, sell: 2 },
  },
  {
    label: "Demanda Externa",
    value: 58,
    state: "neutral",
    counts: { buy: 5, neutral: 4, sell: 3 },
  },
];

function GaugeCountRow({
  counts,
}: {
  counts: { buy: number; neutral: number; sell: number };
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex flex-col items-center">
        <span className="font-mono text-sm font-bold tabular-nums text-primary">
          {counts.buy}
        </span>
        <span className="text-micro uppercase tracking-widest text-muted-foreground">
          Alta
        </span>
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex flex-col items-center">
        <span className="font-mono text-sm font-bold tabular-nums text-warning">
          {counts.neutral}
        </span>
        <span className="text-micro uppercase tracking-widest text-muted-foreground">
          Neutro
        </span>
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex flex-col items-center">
        <span className="font-mono text-sm font-bold tabular-nums text-destructive">
          {counts.sell}
        </span>
        <span className="text-micro uppercase tracking-widest text-muted-foreground">
          Baixa
        </span>
      </div>
    </div>
  );
}

export function TechnicalGauges({ className }: { className?: string }) {
  return (
    <ScrollReveal direction="up" delay={0.15}>
      <section className={cn("border border-border bg-background p-4 space-y-5", className)}>
        <h2 className="font-editorial text-lg tracking-tight">
          Termometro do Mercado
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {GAUGES.map((gauge) => (
            <div
              key={gauge.label}
              className="flex flex-col items-center gap-3 border border-border bg-secondary/40 p-4"
            >
              <RiveGauge
                value={gauge.value}
                label={gauge.label}
                state={gauge.state}
                size={130}
              />
              <GaugeCountRow counts={gauge.counts} />
            </div>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
