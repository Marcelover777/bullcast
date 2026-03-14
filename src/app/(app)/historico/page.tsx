"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatBRL, formatPercent } from "@/lib/format";
import { mockTrackRecord, mockTrackStats, mockModelHealth } from "@/lib/mock-data";
import type { PredictionRecord } from "@/lib/mock-data";
import { PageTransition } from "@/components/motion/page-transition";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { GSAPCounter } from "@/components/animations/gsap-counter";
import {
  History,
  CheckCircle2,
  XCircle,
  Target,
  Flame,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Accuracy Chart Data ────────────────────────────────────────
const accuracyChartData = mockModelHealth.recentAccuracy.map((value, i) => ({
  month: `S${i + 1}`,
  accuracy: value,
}));

// ─── Signal Badge ───────────────────────────────────────────────
const signalConfig = {
  COMPRAR: { color: "text-primary", bg: "bg-primary/10", label: "Comprar" },
  VENDER: { color: "text-foreground", bg: "bg-foreground/10", label: "Vender" },
  SEGURAR: { color: "text-muted-foreground", bg: "bg-secondary", label: "Segurar" },
};

// ─── Horizon Filter ─────────────────────────────────────────────
const horizons = [
  { key: "all", label: "Todos" },
  { key: "7d", label: "7 dias" },
  { key: "15d", label: "15 dias" },
  { key: "30d", label: "30 dias" },
] as const;

type HorizonFilter = (typeof horizons)[number]["key"];

// ═══════════════════════════════════════════════════════════════════
// TRACK RECORD PAGE
// ═══════════════════════════════════════════════════════════════════
export default function HistoricoPage() {
  const [activeHorizon, setActiveHorizon] = useState<HorizonFilter>("all");
  const stats = mockTrackStats;

  const filteredRecords =
    activeHorizon === "all"
      ? mockTrackRecord
      : mockTrackRecord.filter((r) => r.horizon === activeHorizon);

  return (
    <PageTransition>
      {/* Header */}
      <header className="sticky top-0 z-40 nav-glass">
        <div className="max-w-md mx-auto px-5 h-14 flex items-center justify-between">
          <h1 className="text-lg font-heading font-bold text-foreground">Historico</h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <History className="w-3.5 h-3.5" />
            <span className="font-medium">{stats.totalPredictions} sinais</span>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-5 pt-5 pb-8 space-y-6">
        {/* Scorecard */}
        <ScrollReveal>
          <div className="grid grid-cols-3 gap-3">
            {/* Accuracy */}
            <div className="bg-card border border-border/50 p-4 flex flex-col items-center gap-2 card-premium">
              <Target className="w-5 h-5 text-primary" />
              <GSAPCounter
                value={stats.accuracyPercent}
                suffix="%"
                decimals={1}
                className="text-2xl font-bold text-foreground"
              />
              <span className="text-micro text-muted-foreground uppercase tracking-wider">Acuracia</span>
            </div>

            {/* Total */}
            <div className="bg-card border border-border/50 p-4 flex flex-col items-center gap-2 card-premium">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              <GSAPCounter
                value={stats.correctPredictions}
                suffix=""
                decimals={0}
                className="text-2xl font-bold text-foreground"
              />
              <span className="text-micro text-muted-foreground uppercase tracking-wider">
                de {stats.totalPredictions}
              </span>
            </div>

            {/* Streak */}
            <div className="bg-card border border-border/50 p-4 flex flex-col items-center gap-2 card-premium">
              <Flame className="w-5 h-5 text-amber-500" />
              <GSAPCounter
                value={stats.streak}
                suffix=""
                decimals={0}
                className="text-2xl font-bold text-foreground"
              />
              <span className="text-micro text-muted-foreground uppercase tracking-wider">Sequencia</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Accuracy Over Time Chart */}
        <ScrollReveal delay={0.1}>
          <div className="bg-card border border-border/50 p-4 card-premium">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-bold text-foreground">Acuracia ao Longo do Tempo</h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={accuracyChartData}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[75, 100]}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0px",
                    fontSize: "12px",
                  }}
                  formatter={(value: unknown) => [`${value}%`, "Acuracia"]}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--primary)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ScrollReveal>

        {/* Breakdown by Horizon */}
        <ScrollReveal delay={0.15}>
          <h2 className="text-base font-heading font-bold text-foreground mb-3">Acuracia por Horizonte</h2>
          <div className="grid grid-cols-3 gap-3">
            {(["7d", "15d", "30d"] as const).map((horizon) => {
              const data = stats.byHorizon[horizon];
              return (
                <div
                  key={horizon}
                  className="bg-card border border-border/50 p-3 text-center card-premium"
                >
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
                    {horizon === "7d" ? "7 Dias" : horizon === "15d" ? "15 Dias" : "30 Dias"}
                  </p>
                  <p className="text-xl font-mono font-bold text-foreground">
                    {data.accuracy.toFixed(1)}%
                  </p>
                  <p className="text-micro text-muted-foreground mt-1">
                    {data.correct}/{data.total}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Prediction History Table */}
        <ScrollReveal delay={0.2}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-heading font-bold text-foreground">Previsoes Recentes</h2>
          </div>

          {/* Horizon Filter */}
          <div className="flex gap-1 bg-secondary/60 p-1 mb-4">
            {horizons.map((h) => (
              <button
                key={h.key}
                type="button"
                onClick={() => setActiveHorizon(h.key)}
                className={cn(
                  "flex-1 py-2 text-xs font-bold transition-all duration-300",
                  activeHorizon === h.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {h.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-card border border-border/50 overflow-hidden card-premium">
            {/* Header */}
            <div className="flex items-center px-4 py-3 bg-secondary/30 text-xs text-muted-foreground font-bold uppercase tracking-wider">
              <span className="w-14">Data</span>
              <span className="w-16">Sinal</span>
              <span className="flex-1 text-right">Previsto</span>
              <span className="flex-1 text-right">Real</span>
              <span className="w-10 text-center">OK</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/30">
              {filteredRecords.map((record) => {
                const signal = signalConfig[record.signal];
                return (
                  <div
                    key={record.id}
                    className="flex items-center px-4 py-3 text-sm"
                  >
                    <span className="w-14 text-muted-foreground font-medium text-xs">
                      {record.date}
                    </span>
                    <span className="w-16">
                      <span
                        className={cn(
                          "inline-block px-1.5 py-0.5 text-xs font-bold",
                          signal.bg,
                          signal.color
                        )}
                      >
                        {signal.label}
                      </span>
                    </span>
                    <span className="flex-1 text-right font-mono font-medium tabular-nums text-foreground">
                      {formatBRL(record.predictedPrice)}
                    </span>
                    <span className="flex-1 text-right font-mono font-medium tabular-nums text-foreground">
                      {formatBRL(record.actualPrice)}
                    </span>
                    <span className="w-10 flex justify-center">
                      {record.correct ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
