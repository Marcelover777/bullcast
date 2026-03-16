"use client";

import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { mockTechnicalIndicators, mockTechnicalRating } from "@/lib/mock-data";
import { RiveGauge } from "@/components/animations/rive-gauge";
import { Activity } from "lucide-react";

const SIGNAL_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  COMPRA: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30",
  },
  VENDA: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/30",
  },
  NEUTRO: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/30",
  },
};

const OVERALL_MAP: Record<string, { gaugeValue: number; state: "bullish" | "bearish" | "neutral" }> = {
  "COMPRA FORTE": { gaugeValue: 90, state: "bullish" },
  COMPRA: { gaugeValue: 70, state: "bullish" },
  NEUTRO: { gaugeValue: 50, state: "neutral" },
  VENDA: { gaugeValue: 30, state: "bearish" },
  "VENDA FORTE": { gaugeValue: 10, state: "bearish" },
};

function SignalBadge({ signal }: { signal: "COMPRA" | "VENDA" | "NEUTRO" }) {
  const style = SIGNAL_STYLES[signal] ?? SIGNAL_STYLES.NEUTRO;
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-micro font-bold",
        style.bg,
        style.text,
        style.border
      )}
    >
      {signal}
    </span>
  );
}

function SummaryBar({
  label,
  counts,
}: {
  label: string;
  counts: { buy: number; sell: number; neutral: number };
}) {
  const total = counts.buy + counts.sell + counts.neutral;
  return (
    <div className="space-y-1.5">
      <span className="text-micro text-muted-foreground">{label}</span>
      <div className="flex h-1.5 w-full overflow-hidden bg-muted">
        {counts.buy > 0 && (
          <div
            className="bg-primary transition-all"
            style={{ width: `${(counts.buy / total) * 100}%` }}
          />
        )}
        {counts.neutral > 0 && (
          <div
            className="bg-warning transition-all"
            style={{ width: `${(counts.neutral / total) * 100}%` }}
          />
        )}
        {counts.sell > 0 && (
          <div
            className="bg-destructive transition-all"
            style={{ width: `${(counts.sell / total) * 100}%` }}
          />
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-primary">{counts.buy} Compra</span>
        <span className="font-mono text-xs text-warning">{counts.neutral} Neutro</span>
        <span className="font-mono text-xs text-destructive">{counts.sell} Venda</span>
      </div>
    </div>
  );
}

export function TechnicalRating() {
  const { overall, oscillators, movingAverages } = mockTechnicalRating;
  const overallInfo = OVERALL_MAP[overall] ?? OVERALL_MAP.NEUTRO;

  const oscillatorIndicators = mockTechnicalIndicators.filter(
    (i) => i.category === "oscillator"
  );
  const maIndicators = mockTechnicalIndicators.filter(
    (i) => i.category === "moving_average"
  );

  return (
    <div className="space-y-5 border border-border bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity size={14} className="text-muted-foreground" />
        <h3 className="font-editorial text-base tracking-tight">
          Analise Tecnica
        </h3>
      </div>

      {/* Consolidated gauge */}
      <div className="flex flex-col items-center border border-border bg-secondary/30 p-4">
        <RiveGauge
          value={overallInfo.gaugeValue}
          label="Rating Consolidado"
          state={overallInfo.state}
          size={160}
        />
        <span
          className={cn(
            "mt-2 inline-flex items-center border px-3 py-1 font-editorial text-sm font-bold tracking-tight",
            overallInfo.state === "bullish"
              ? "border-primary/30 bg-primary/10 text-primary"
              : overallInfo.state === "bearish"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-warning/30 bg-warning/10 text-warning"
          )}
        >
          {overall}
        </span>
      </div>

      {/* Summary bars */}
      <div className="grid grid-cols-2 gap-4">
        <SummaryBar label="Osciladores" counts={oscillators} />
        <SummaryBar label="Medias Moveis" counts={movingAverages} />
      </div>

      {/* Oscillators grid */}
      <div className="space-y-2">
        <h4 className="text-micro text-muted-foreground">Osciladores</h4>
        <div className="divide-y divide-border border border-border">
          {oscillatorIndicators.map((ind) => (
            <div
              key={ind.name}
              className="flex items-center justify-between px-3 py-2"
            >
              <span className="text-xs text-foreground">{ind.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatBRL(ind.value, ind.value < 10 ? 2 : 1)}
                </span>
                <SignalBadge signal={ind.signal} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Moving Averages grid */}
      <div className="space-y-2">
        <h4 className="text-micro text-muted-foreground">Medias Moveis</h4>
        <div className="divide-y divide-border border border-border">
          {maIndicators.map((ind) => (
            <div
              key={ind.name}
              className="flex items-center justify-between px-3 py-2"
            >
              <span className="text-xs text-foreground">{ind.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  R$ {formatBRL(ind.value)}
                </span>
                <SignalBadge signal={ind.signal} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
