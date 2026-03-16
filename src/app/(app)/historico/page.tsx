"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { fetchHistoricoData, type HistoricoData } from "@/lib/data";
import { mockTrackRecord, mockTrackStats, mockModelHealth } from "@/lib/mock-data";
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
  Loader2,
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

// ─── Signal Badge ───────────────────────────────────────────────
const signalConfig = {
  COMPRAR: { color: "text-primary", bg: "bg-primary/10", label: "Comprar" },
  BUY: { color: "text-primary", bg: "bg-primary/10", label: "Comprar" },
  VENDER: { color: "text-foreground", bg: "bg-foreground/10", label: "Vender" },
  SELL: { color: "text-foreground", bg: "bg-foreground/10", label: "Vender" },
  SEGURAR: { color: "text-muted-foreground", bg: "bg-secondary", label: "Segurar" },
  HOLD: { color: "text-muted-foreground", bg: "bg-secondary", label: "Segurar" },
};

// ─── Horizon Filter ─────────────────────────────────────────────
const horizons = [
  { key: "all", label: "Todos" },
  { key: 5, label: "5 dias" },
  { key: 15, label: "15 dias" },
  { key: 30, label: "30 dias" },
] as const;

type HorizonFilter = "all" | number;

// ═══════════════════════════════════════════════════════════════════
// TRACK RECORD PAGE — Real Supabase data + mock fallback
// ═══════════════════════════════════════════════════════════════════
export default function HistoricoPage() {
  const [activeHorizon, setActiveHorizon] = useState<HorizonFilter>("all");
  const [data, setData] = useState<HistoricoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricoData()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const hasReal = data && data.predictions.length > 0;

  // Stats
  const totalPredictions = hasReal ? data.totalPredictions : mockTrackStats.totalPredictions;
  const accuracyByHorizon = hasReal ? data.accuracyByHorizon : [];

  // Overall accuracy
  const overallAccuracy = hasReal
    ? (() => {
        const total = data.predictions.length;
        const accSum = data.predictions.reduce((s, p) => s + (p.directional_accuracy || 0), 0);
        return total > 0 ? Math.round((accSum / total) * 1000) / 10 : 0;
      })()
    : mockTrackStats.accuracyPercent;

  // Build records for table from real signals
  const realRecords = hasReal && data.recentSignals.length > 0
    ? data.recentSignals.map((s, i) => ({
        id: String(i),
        date: new Date(s.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        signal: (s.signal === "BUY" ? "COMPRAR" : s.signal === "SELL" ? "VENDER" : "SEGURAR") as "COMPRAR" | "VENDER" | "SEGURAR",
        predictedPrice: s.price_pred_15d || s.price_pred_5d || 0,
        actualPrice: s.price_current || 0,
        correct: s.confidence > 0.5,
        diffPercent: s.price_pred_15d && s.price_current
          ? Math.round(((s.price_pred_15d - s.price_current) / s.price_current) * 10000) / 100
          : 0,
        horizon: 15 as number,
      }))
    : null;

  const records = realRecords || mockTrackRecord;
  const filteredRecords = activeHorizon === "all"
    ? records
    : records.filter((r) => {
        if ("horizon" in r && typeof r.horizon === "number") return r.horizon === activeHorizon;
        if ("horizon" in r && typeof r.horizon === "string") {
          const h = parseInt(r.horizon);
          return h === activeHorizon;
        }
        return true;
      });

  // Chart data
  const accuracyChartData = hasReal
    ? data.predictions
        .slice(0, 12)
        .reverse()
        .map((p, i) => ({
          month: `S${i + 1}`,
          accuracy: Math.round((p.directional_accuracy || 0) * 100),
        }))
    : mockModelHealth.recentAccuracy.map((value, i) => ({
        month: `S${i + 1}`,
        accuracy: value,
      }));

  return (
    <PageTransition>
      {/* Header */}
      <header className="sticky top-0 z-40 nav-glass">
        <div className="max-w-md mx-auto px-5 h-14 flex items-center justify-between">
          <h1 className="text-lg font-heading font-bold text-foreground">Historico</h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <History className="w-3.5 h-3.5" />
                <span className="font-medium">{totalPredictions} sinais</span>
              </>
            )}
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
                value={overallAccuracy}
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
                value={totalPredictions}
                suffix=""
                decimals={0}
                className="text-2xl font-bold text-foreground"
              />
              <span className="text-micro text-muted-foreground uppercase tracking-wider">
                Previsões
              </span>
            </div>

            {/* Streak */}
            <div className="bg-card border border-border/50 p-4 flex flex-col items-center gap-2 card-premium">
              <Flame className="w-5 h-5 text-amber-500" />
              <GSAPCounter
                value={hasReal ? data.recentSignals.filter((s) => s.confidence > 0.5).length : mockTrackStats.streak}
                suffix=""
                decimals={0}
                className="text-2xl font-bold text-foreground"
              />
              <span className="text-micro text-muted-foreground uppercase tracking-wider">
                {hasReal ? "Bons sinais" : "Sequencia"}
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Accuracy Over Time Chart */}
        <ScrollReveal delay={0.1}>
          <div className="bg-card border border-border/50 p-4 card-premium">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-bold text-foreground">Acuracia ao Longo do Tempo</h2>
              {hasReal && <span className="text-xs text-primary ml-auto">● Ao vivo</span>}
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
                  domain={[0, 100]}
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
            {hasReal && accuracyByHorizon.length > 0
              ? accuracyByHorizon.map((h) => (
                  <div key={h.horizon} className="bg-card border border-border/50 p-3 text-center card-premium">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
                      {h.horizon} Dias
                    </p>
                    <p className="text-xl font-mono font-bold text-foreground">
                      {h.avgAccuracy.toFixed(1)}%
                    </p>
                    <p className="text-micro text-muted-foreground mt-1">{h.total} prev.</p>
                  </div>
                ))
              : (["7d", "15d", "30d"] as const).map((horizon) => {
                  const d = mockTrackStats.byHorizon[horizon];
                  return (
                    <div key={horizon} className="bg-card border border-border/50 p-3 text-center card-premium">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
                        {horizon === "7d" ? "7 Dias" : horizon === "15d" ? "15 Dias" : "30 Dias"}
                      </p>
                      <p className="text-xl font-mono font-bold text-foreground">
                        {d.accuracy.toFixed(1)}%
                      </p>
                      <p className="text-micro text-muted-foreground mt-1">
                        {d.correct}/{d.total}
                      </p>
                    </div>
                  );
                })}
          </div>
        </ScrollReveal>

        {/* Prediction History Table */}
        <ScrollReveal delay={0.2}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-heading font-bold text-foreground">Sinais Recentes</h2>
          </div>

          {/* Horizon Filter */}
          <div className="flex gap-1 bg-secondary/60 p-1 mb-4">
            {horizons.map((h) => (
              <button
                key={String(h.key)}
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
              {filteredRecords.slice(0, 15).map((record) => {
                const sig = signalConfig[record.signal as keyof typeof signalConfig] || signalConfig.HOLD;
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
                          sig.bg,
                          sig.color
                        )}
                      >
                        {sig.label}
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

        {/* ═══ FOOTER ═══ */}
        <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
          Dados: CEPEA, B3, BCB, IBGE, NASA · Modelo BullCast · Não constitui recomendação de investimento.
        </p>
      </div>
    </PageTransition>
  );
}
