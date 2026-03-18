"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import {
  Activity,
  Brain,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockModelHealth } from "@/lib/mock-data";
import { GSAPCounter } from "@/components/animations/gsap-counter";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }
> = {
  healthy: {
    label: "MODELO SAUDAVEL",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: CheckCircle2,
  },
  recalibrating: {
    label: "RECALIBRANDO",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    icon: RefreshCw,
  },
  attention: {
    label: "ATENCAO",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: AlertTriangle,
  },
};

function MetricCard({
  label,
  value,
  suffix,
  decimals,
  status,
}: {
  label: string;
  value: number;
  suffix: string;
  decimals: number;
  status: "good" | "warning" | "bad";
}) {
  return (
    <div className="border border-border bg-secondary/30 p-4 space-y-2">
      <span className="text-micro text-muted-foreground">{label}</span>
      <GSAPCounter
        value={value}
        suffix={suffix}
        decimals={decimals}
        className={cn(
          "text-2xl font-bold",
          status === "good"
            ? "text-primary"
            : status === "warning"
              ? "text-warning"
              : "text-destructive"
        )}
      />
    </div>
  );
}

function FeatureBar({
  name,
  importance,
  maxImportance,
}: {
  name: string;
  importance: number;
  maxImportance: number;
}) {
  const pct = (importance / maxImportance) * 100;
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <span className="min-w-0 flex-1 truncate text-xs text-foreground">{name}</span>
      <div className="w-32 h-1.5 bg-muted overflow-hidden">
        <div
          className="h-full bg-primary/70 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {(importance * 100).toFixed(0)}%
      </span>
    </div>
  );
}

export function ModelHealth() {
  const {
    accuracy7d,
    accuracy30d,
    driftScore,
    status,
    topFeatures,
    recentAccuracy,
  } = mockModelHealth;

  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.healthy;
  const StatusIcon = statusConfig.icon;

  // Accuracy 7d status
  const acc7dStatus: "good" | "warning" | "bad" =
    accuracy7d >= 85 ? "good" : accuracy7d >= 70 ? "warning" : "bad";
  // Accuracy 30d status
  const acc30dStatus: "good" | "warning" | "bad" =
    accuracy30d >= 80 ? "good" : accuracy30d >= 65 ? "warning" : "bad";
  // Drift score status (lower is better)
  const driftStatus: "good" | "warning" | "bad" =
    driftScore <= 0.15 ? "good" : driftScore <= 0.3 ? "warning" : "bad";

  const maxImportance = useMemo(
    () => Math.max(...topFeatures.map((f) => f.importance)),
    [topFeatures]
  );

  // Sparkline data
  const sparkData = useMemo(
    () => recentAccuracy.map((v, i) => ({ idx: i, value: v })),
    [recentAccuracy]
  );

  return (
    <div className="space-y-4 border border-border bg-background p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-muted-foreground" />
            <h3 className="font-editorial text-base tracking-tight">
              Saude do Modelo
            </h3>
          </div>
          <p className="text-micro text-muted-foreground">
            Performance e confiabilidade do motor preditivo
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 border px-2.5 py-1 text-micro font-bold",
            statusConfig.bg,
            statusConfig.color,
            statusConfig.border
          )}
        >
          <StatusIcon size={12} />
          {statusConfig.label}
        </span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label="Acuracia 7d"
          value={accuracy7d}
          suffix="%"
          decimals={1}
          status={acc7dStatus}
        />
        <MetricCard
          label="Acuracia 30d"
          value={accuracy30d}
          suffix="%"
          decimals={1}
          status={acc30dStatus}
        />
        <MetricCard
          label="Drift Score"
          value={driftScore}
          suffix=""
          decimals={2}
          status={driftStatus}
        />
      </div>

      {/* Accuracy sparkline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-micro text-muted-foreground">
            Acuracia Recente (12 periodos)
          </span>
          <div className="flex items-center gap-1">
            <Activity size={12} className="text-muted-foreground" />
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              Ultimo: {recentAccuracy[recentAccuracy.length - 1]}%
            </span>
          </div>
        </div>
        <div className="h-16 w-full border border-border bg-secondary/20">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <YAxis hide domain={[75, 100]} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature importances */}
      <div className="space-y-2">
        <h4 className="text-micro text-muted-foreground">
          Top 5 -- Importancia de Features
        </h4>
        <div className="divide-y divide-border border border-border">
          {topFeatures.map((f) => (
            <FeatureBar
              key={f.name}
              name={f.name}
              importance={f.importance}
              maxImportance={maxImportance}
            />
          ))}
        </div>
      </div>

      {/* Footer explanation */}
      <div className="border-t border-border pt-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {status === "healthy"
            ? "O modelo esta operando dentro dos parametros normais. Drift baixo indica estabilidade nas previsoes."
            : status === "recalibrating"
              ? "O modelo esta ajustando seus pesos para novas condicoes de mercado. Previsoes podem ter menor precisao temporariamente."
              : "O modelo apresenta desvio significativo. Recomendado cautela nas decisoes ate a recalibracao ser concluida."}
        </p>
      </div>
    </div>
  );
}
