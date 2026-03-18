"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight, ArrowRightLeft } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { fetchRegionalData, fetchMercadoData, type CattleCategory } from "@/lib/data";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { PageTransition } from "@/components/motion/page-transition";
import { PageSkeleton } from "@/components/feedback/page-skeleton";

// ═══ Types ═══
type Period = "hoje" | "semana" | "mes";

// ═══ 8 categorias PRD v2.0 ═══
interface CategoryDef {
  key: string;
  emoji: string;
  name: string;
  sex: "macho" | "femea";
  weightRange: string;
  weightMin: number;
  weightMax: number;
  unit: "/@" | "/cab";
  matchPatterns: string[];
}

const CATEGORY_DEFS: CategoryDef[] = [
  { key: "boi_gordo",   emoji: "\u{1F404}", name: "Boi Gordo",   sex: "macho", weightRange: "450-540 Kg", weightMin: 450, weightMax: 540, unit: "/@",   matchPatterns: ["boi gordo"] },
  { key: "vaca_gorda",  emoji: "\u{1F404}", name: "Vaca Gorda",  sex: "femea", weightRange: "380-450 Kg", weightMin: 380, weightMax: 450, unit: "/@",   matchPatterns: ["vaca gorda", "vaca"] },
  { key: "garrote",     emoji: "\u{1F402}", name: "Garrote",     sex: "macho", weightRange: "240-360 Kg", weightMin: 240, weightMax: 360, unit: "/cab", matchPatterns: ["garrote"] },
  { key: "novilha",     emoji: "\u{1F42E}", name: "Novilha",     sex: "femea", weightRange: "240-360 Kg", weightMin: 240, weightMax: 360, unit: "/cab", matchPatterns: ["novilha"] },
  { key: "bezerro",     emoji: "\u{1F403}", name: "Bezerro",     sex: "macho", weightRange: "180-240 Kg", weightMin: 180, weightMax: 240, unit: "/cab", matchPatterns: ["bezerro"] },
  { key: "bezerra",     emoji: "\u{1F403}", name: "Bezerra",     sex: "femea", weightRange: "180-240 Kg", weightMin: 180, weightMax: 240, unit: "/cab", matchPatterns: ["bezerra"] },
  { key: "boi_magro",   emoji: "\u{1F404}", name: "Boi Magro",   sex: "macho", weightRange: "360-450 Kg", weightMin: 360, weightMax: 450, unit: "/cab", matchPatterns: ["boi magro"] },
  { key: "novilhinha",  emoji: "\u{1F42E}", name: "Novilhinha",  sex: "femea", weightRange: "180-240 Kg", weightMin: 180, weightMax: 240, unit: "/cab", matchPatterns: ["novilhinha"] },
];

const STATE_OPTIONS = [
  { code: "SP", name: "São Paulo" },
  { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "GO", name: "Goiás" },
  { code: "PA", name: "Pará" },
  { code: "MG", name: "Minas Gerais" },
];

// ═══ Mock data (8 categorias) ═══
const today = new Date().toISOString().slice(0, 10);

const MOCK_CATEGORIES: CattleCategory[] = [
  { date: today, category: "Boi Gordo",  weight_min: 450, weight_max: 540, price_per_kg: 20.76, price_per_head: null,  variation_day: 0.023,  variation_week: 0.032, state: "SP" },
  { date: today, category: "Vaca Gorda", weight_min: 380, weight_max: 450, price_per_kg: 18.53, price_per_head: null,  variation_day: 0.019,  variation_week: 0.025, state: "SP" },
  { date: today, category: "Garrote",    weight_min: 240, weight_max: 360, price_per_kg: null,  price_per_head: 3200,  variation_day: 0.015,  variation_week: 0.022, state: "SP" },
  { date: today, category: "Novilha",    weight_min: 240, weight_max: 360, price_per_kg: null,  price_per_head: 2850,  variation_day: -0.008, variation_week: -0.012, state: "SP" },
  { date: today, category: "Bezerro",    weight_min: 180, weight_max: 240, price_per_kg: null,  price_per_head: 2450,  variation_day: 0.032,  variation_week: 0.045, state: "SP" },
  { date: today, category: "Bezerra",    weight_min: 180, weight_max: 240, price_per_kg: null,  price_per_head: 2180,  variation_day: 0.028,  variation_week: 0.035, state: "SP" },
  { date: today, category: "Boi Magro",  weight_min: 360, weight_max: 450, price_per_kg: null,  price_per_head: 3850,  variation_day: 0.011,  variation_week: 0.018, state: "SP" },
  { date: today, category: "Novilhinha", weight_min: 180, weight_max: 240, price_per_kg: null,  price_per_head: 2050,  variation_day: -0.005, variation_week: 0.008, state: "SP" },
];

// ═══ Sparkline mock (30 dias) ═══
function generateSparkline(basePrice: number, variation: number): { value: number }[] {
  const points: { value: number }[] = [];
  let price = basePrice * (1 - Math.abs(variation) * 15);
  for (let i = 0; i < 30; i++) {
    const noise = (Math.random() - 0.48) * basePrice * 0.012;
    const trend = (variation * basePrice * 0.5) / 30;
    price += trend + noise;
    points.push({ value: Math.round(price * 100) / 100 });
  }
  return points;
}

// ═══ Helpers ═══
function matchCategory(cat: CattleCategory): CategoryDef | null {
  const lower = cat.category.toLowerCase();
  // Match most specific first (novilhinha before novilha, boi magro before boi gordo)
  for (const def of [...CATEGORY_DEFS].sort((a, b) => b.matchPatterns[0].length - a.matchPatterns[0].length)) {
    if (def.matchPatterns.some((p) => lower.includes(p))) return def;
  }
  return null;
}

function getPricePerKg(cat: CattleCategory): number {
  if (cat.price_per_kg) return Number(cat.price_per_kg);
  if (cat.price_per_head && cat.weight_min && cat.weight_max) {
    const avgWeight = (cat.weight_min + cat.weight_max) / 2;
    return Number(cat.price_per_head) / avgWeight;
  }
  return 0;
}

function getPricePerHead(cat: CattleCategory, def: CategoryDef): number {
  if (cat.price_per_head) return Number(cat.price_per_head);
  if (cat.price_per_kg) {
    const avgWeight = (def.weightMin + def.weightMax) / 2;
    return Number(cat.price_per_kg) * avgWeight;
  }
  return 0;
}

function getPricePerArroba(cat: CattleCategory): number {
  if (cat.price_per_kg) return Number(cat.price_per_kg) * 15; // 1@ = 15kg
  return 0;
}

function fmtBRL(value: number): string {
  if (value === 0) return "—";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function trendIcon(variation: number) {
  if (variation > 0.3) return { Icon: TrendingUp, color: "text-bull", label: "Alta" };
  if (variation < -0.3) return { Icon: TrendingDown, color: "text-bear", label: "Baixa" };
  return { Icon: Minus, color: "text-hold", label: "Estável" };
}

// ═══ Processed row type ═══
interface ProcessedRow {
  def: CategoryDef;
  cat: CattleCategory;
  pricePerKg: number;
  pricePerHead: number;
  pricePerArroba: number;
  variationDay: number;
  variationWeek: number;
  sparkline: { value: number }[];
}

// ═══ Component ═══
export default function CotacoesPage() {
  const [rawCategories, setRawCategories] = useState<CattleCategory[]>(MOCK_CATEGORIES);
  const [selectedState, setSelectedState] = useState("SP");
  const [period, setPeriod] = useState<Period>("hoje");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);
  const [tradeRatio, setTradeRatio] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchRegionalData(selectedState).catch(() => []),
      fetchMercadoData().catch(() => null),
    ]).then(([regional, mercado]) => {
      if (cancelled) return;
      if (regional.length > 0) {
        setRawCategories(regional);
        setUsingMock(false);
      } else {
        setRawCategories(MOCK_CATEGORIES);
        setUsingMock(true);
      }
      if (mercado?.fundamental?.trade_ratio_bezerro) {
        setTradeRatio(Number(mercado.fundamental.trade_ratio_bezerro));
      }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedState]);

  // Process rows: match raw data to 8 category definitions
  const rows: ProcessedRow[] = useMemo(() => {
    const matched: ProcessedRow[] = [];
    const usedKeys = new Set<string>();

    // First match from real data
    for (const cat of rawCategories) {
      const def = matchCategory(cat);
      if (def && !usedKeys.has(def.key)) {
        usedKeys.add(def.key);
        const variationDay = Number(cat.variation_day || 0) * 100;
        const variationWeek = Number(cat.variation_week || 0) * 100;
        const pricePerKg = getPricePerKg(cat);
        const basePrice = cat.price_per_head ? Number(cat.price_per_head) : pricePerKg * 15;
        matched.push({
          def,
          cat,
          pricePerKg,
          pricePerHead: getPricePerHead(cat, def),
          pricePerArroba: getPricePerArroba(cat),
          variationDay,
          variationWeek,
          sparkline: generateSparkline(basePrice, Number(cat.variation_week || 0)),
        });
      }
    }

    // Fill missing categories with mock
    for (const def of CATEGORY_DEFS) {
      if (!usedKeys.has(def.key)) {
        const mockCat = MOCK_CATEGORIES.find((m) => matchCategory(m)?.key === def.key);
        if (mockCat) {
          const variationDay = Number(mockCat.variation_day || 0) * 100;
          const variationWeek = Number(mockCat.variation_week || 0) * 100;
          const pricePerKg = getPricePerKg(mockCat);
          const basePrice = mockCat.price_per_head ? Number(mockCat.price_per_head) : pricePerKg * 15;
          matched.push({
            def,
            cat: { ...mockCat, state: selectedState },
            pricePerKg,
            pricePerHead: getPricePerHead(mockCat, def),
            pricePerArroba: getPricePerArroba(mockCat),
            variationDay,
            variationWeek,
            sparkline: generateSparkline(basePrice, Number(mockCat.variation_week || 0)),
          });
        }
      }
    }

    // Sort in CATEGORY_DEFS order
    return matched.sort((a, b) => CATEGORY_DEFS.indexOf(a.def) - CATEGORY_DEFS.indexOf(b.def));
  }, [rawCategories, selectedState]);

  const selectedStateName = STATE_OPTIONS.find((s) => s.code === selectedState)?.name || selectedState;
  const latestDate = rawCategories[0]?.date;

  // Variation to use based on period
  const getVariation = (row: ProcessedRow) => {
    if (period === "semana") return row.variationWeek;
    if (period === "mes") return row.variationWeek * 3.5; // approximate
    return row.variationDay;
  };

  // Trade ratio: boi gordo -> bezerro
  const boiGordoRow = rows.find((r) => r.def.key === "boi_gordo");
  const bezerroRow = rows.find((r) => r.def.key === "bezerro");
  const computedTradeRatio = tradeRatio || (boiGordoRow && bezerroRow && bezerroRow.pricePerHead > 0
    ? (boiGordoRow.pricePerArroba > 0 ? (boiGordoRow.pricePerArroba * ((boiGordoRow.def.weightMin + boiGordoRow.def.weightMax) / 2 / 15)) / bezerroRow.pricePerHead : 0)
    : 1.85);
  // Milho: ~1 arroba boi = ~4.5 sacos milho (benchmark)
  const milhoRatio = boiGordoRow?.pricePerArroba ? Math.round(boiGordoRow.pricePerArroba / 70 * 10) / 10 : 4.5;

  return (
    <PageTransition>
    <div className="px-4 py-6 space-y-5 max-w-2xl mx-auto">
      {/* Badge mock */}
      {usingMock && (
        <div className="bg-hold/10 border border-hold/20 px-3 py-2 text-center">
          <p className="text-[10px] text-hold font-semibold uppercase tracking-wider">
            Dados demonstrativos — preços reais após ativar o backend
          </p>
        </div>
      )}

      {/* Título */}
      <div>
        <h1 className="text-display text-xl text-primary">COTAÇÕES</h1>
        <p className="text-sm text-muted-foreground mt-1">Preços por categoria — {selectedStateName}</p>
      </div>

      {/* ═══ Filtros ═══ */}
      <div className="space-y-3">
        {/* Estado */}
        <div className="flex gap-2 flex-wrap">
          {STATE_OPTIONS.map((s) => (
            <button
              key={s.code}
              onClick={() => { setSelectedState(s.code); setExpandedRow(null); }}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
                selectedState === s.code
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground"
              )}
            >
              {s.code}
            </button>
          ))}
        </div>

        {/* Período */}
        <div className="flex gap-2">
          {([
            { key: "hoje", label: "Hoje" },
            { key: "semana", label: "Semana" },
            { key: "mes", label: "Mês" },
          ] as const).map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
                period === p.key
                  ? "bg-secondary text-foreground border border-primary/30"
                  : "bg-card border border-border text-muted-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && <PageSkeleton variant="cotacoes" />}

      {/* ═══ MOBILE: Cards ═══ */}
      {!loading && (
        <section className="sm:hidden space-y-2">
          {rows.map((row, idx) => {
            const variation = getVariation(row);
            const trend = trendIcon(variation);
            const isExpanded = expandedRow === row.def.key;

            return (
              <ScrollReveal key={row.def.key} direction="up" delay={idx * 0.03} once>
                <div className="bg-card border border-border overflow-hidden">
                  {/* Main row */}
                  <button
                    onClick={() => setExpandedRow(isExpanded ? null : row.def.key)}
                    className="w-full p-4 flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-lg">{row.def.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{row.def.name}</span>
                        <span className="text-[9px] text-muted-foreground">{row.def.weightRange}</span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        {row.def.unit === "/@" ? (
                          <span className="text-lg font-bold tabular-nums">R$ {fmtBRL(row.pricePerArroba)}/@</span>
                        ) : (
                          <span className="text-lg font-bold tabular-nums">R$ {fmtBRL(row.pricePerHead)}/cab</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <trend.Icon className={cn("w-3.5 h-3.5", trend.color)} />
                        <span className={cn("text-xs font-bold tabular-nums", trend.color)}>
                          {variation >= 0 ? "+" : ""}{variation.toFixed(1)}%
                        </span>
                      </div>
                      <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                      {/* Sparkline */}
                      <div>
                        <p className="text-label text-[9px] mb-1">ÚLTIMOS 30 DIAS</p>
                        <div className="h-[60px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={row.sparkline}>
                              <defs>
                                <linearGradient id={`grad-${row.def.key}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={variation >= 0 ? "var(--bull)" : "var(--bear)"} stopOpacity={0.15} />
                                  <stop offset="100%" stopColor={variation >= 0 ? "var(--bull)" : "var(--bear)"} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <YAxis domain={["dataMin", "dataMax"]} hide />
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke={variation >= 0 ? "var(--bull)" : "var(--bear)"}
                                strokeWidth={1.5}
                                fill={`url(#grad-${row.def.key})`}
                                dot={false}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Price details */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-secondary/40 p-2">
                          <p className="text-label text-[9px]">R$/KG</p>
                          <p className="text-sm font-bold tabular-nums">
                            {row.pricePerKg > 0 ? `R$ ${fmtBRL(row.pricePerKg)}` : "—"}
                          </p>
                        </div>
                        <div className="bg-secondary/40 p-2">
                          <p className="text-label text-[9px]">R$/CABEÇA</p>
                          <p className="text-sm font-bold tabular-nums">
                            {row.pricePerHead > 0 ? `R$ ${fmtBRL(row.pricePerHead)}` : "—"}
                          </p>
                        </div>
                        <div className="bg-secondary/40 p-2">
                          <p className="text-label text-[9px]">VAR. DIA</p>
                          <p className={cn("text-sm font-bold tabular-nums", row.variationDay >= 0 ? "text-bull" : "text-bear")}>
                            {row.variationDay >= 0 ? "+" : ""}{row.variationDay.toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-secondary/40 p-2">
                          <p className="text-label text-[9px]">VAR. SEMANA</p>
                          <p className={cn("text-sm font-bold tabular-nums", row.variationWeek >= 0 ? "text-bull" : "text-bear")}>
                            {row.variationWeek >= 0 ? "+" : ""}{row.variationWeek.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* Trade ratio inline */}
                      {row.def.key === "boi_gordo" && bezerroRow && (
                        <div className="bg-primary/5 border border-primary/10 p-2 flex items-center gap-2">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-primary shrink-0" />
                          <p className="text-xs text-secondary-foreground">
                            1 boi gordo = <span className="font-bold text-foreground">{computedTradeRatio.toFixed(1)} bezerros</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </section>
      )}

      {/* ═══ DESKTOP: Tabela completa (>640px) ═══ */}
      {!loading && (
        <section className="hidden sm:block">
          <div className="border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-label text-[9px] text-left py-2.5 px-3 font-normal">CATEGORIA</th>
                  <th className="text-label text-[9px] text-left py-2.5 px-2 font-normal">PESO</th>
                  <th className="text-label text-[9px] text-right py-2.5 px-2 font-normal">R$/KG</th>
                  <th className="text-label text-[9px] text-right py-2.5 px-2 font-normal">R$/CAB</th>
                  <th className="text-label text-[9px] text-right py-2.5 px-2 font-normal">VAR. DIA</th>
                  <th className="text-label text-[9px] text-right py-2.5 px-2 font-normal">VAR. SEM</th>
                  <th className="text-label text-[9px] text-center py-2.5 px-2 font-normal">TEND.</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const variation = getVariation(row);
                  const trend = trendIcon(variation);
                  const isExpanded = expandedRow === row.def.key;

                  return (
                    <tr key={row.def.key} className="group">
                      <td colSpan={8} className="p-0">
                        {/* Main row */}
                        <button
                          onClick={() => setExpandedRow(isExpanded ? null : row.def.key)}
                          className="w-full flex items-center cursor-pointer hover:bg-secondary/20 transition-colors"
                        >
                          <span className="py-2.5 px-3 flex items-center gap-2 flex-1 text-left min-w-[140px]">
                            <span className="text-sm">{row.def.emoji}</span>
                            <span className="font-semibold text-sm">{row.def.name}</span>
                          </span>
                          <span className="py-2.5 px-2 text-xs text-muted-foreground w-[90px]">{row.def.weightRange}</span>
                          <span className="py-2.5 px-2 text-right font-mono tabular-nums text-sm w-[80px]">
                            {row.pricePerKg > 0 ? fmtBRL(row.pricePerKg) : "—"}
                          </span>
                          <span className="py-2.5 px-2 text-right font-mono tabular-nums text-sm w-[100px]">
                            {row.pricePerHead > 0 ? fmtBRL(row.pricePerHead) : "—"}
                          </span>
                          <span className={cn("py-2.5 px-2 text-right font-mono tabular-nums text-xs font-bold w-[70px]", row.variationDay >= 0 ? "text-bull" : "text-bear")}>
                            {row.variationDay >= 0 ? "+" : ""}{row.variationDay.toFixed(1)}%
                          </span>
                          <span className={cn("py-2.5 px-2 text-right font-mono tabular-nums text-xs font-bold w-[70px]", row.variationWeek >= 0 ? "text-bull" : "text-bear")}>
                            {row.variationWeek >= 0 ? "+" : ""}{row.variationWeek.toFixed(1)}%
                          </span>
                          <span className="py-2.5 px-2 flex items-center justify-center w-[60px]">
                            <trend.Icon className={cn("w-4 h-4", trend.color)} />
                          </span>
                          <span className="py-2.5 px-2 w-8">
                            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                          </span>
                        </button>

                        {/* Expanded */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 bg-secondary/10 border-t border-border flex gap-4">
                            {/* Sparkline */}
                            <div className="flex-1">
                              <p className="text-label text-[9px] mb-1">ÚLTIMOS 30 DIAS</p>
                              <div className="h-[60px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={row.sparkline}>
                                    <defs>
                                      <linearGradient id={`grad-desk-${row.def.key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={variation >= 0 ? "var(--bull)" : "var(--bear)"} stopOpacity={0.15} />
                                        <stop offset="100%" stopColor={variation >= 0 ? "var(--bull)" : "var(--bear)"} stopOpacity={0} />
                                      </linearGradient>
                                    </defs>
                                    <YAxis domain={["dataMin", "dataMax"]} hide />
                                    <Area
                                      type="monotone"
                                      dataKey="value"
                                      stroke={variation >= 0 ? "var(--bull)" : "var(--bear)"}
                                      strokeWidth={1.5}
                                      fill={`url(#grad-desk-${row.def.key})`}
                                      dot={false}
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-2">
                              {row.pricePerArroba > 0 && (
                                <div>
                                  <p className="text-label text-[9px]">R$/@</p>
                                  <p className="text-sm font-bold tabular-nums">R$ {fmtBRL(row.pricePerArroba)}</p>
                                </div>
                              )}
                              {row.def.key === "boi_gordo" && bezerroRow && (
                                <div className="bg-primary/5 p-2">
                                  <p className="text-[10px] text-secondary-foreground">
                                    1 boi gordo = <span className="font-bold text-foreground">{computedTradeRatio.toFixed(1)} bezerros</span>
                                  </p>
                                </div>
                              )}
                              <p className="text-[9px] text-muted-foreground">
                                Praça: {selectedStateName}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Row separator */}
                        <div className="h-px bg-border" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ═══ RELAÇÃO DE TROCA ═══ */}
      {!loading && (
        <ScrollReveal direction="up" delay={0.15}>
          <section className="border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-primary" />
              <h2 className="text-display text-base">Relação de Troca</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-secondary/40 p-3 flex items-center gap-3">
                <span className="text-2xl">{"\u{1F404}"}</span>
                <div>
                  <p className="text-xs text-muted-foreground">1 boi gordo =</p>
                  <p className="text-lg font-bold tabular-nums text-foreground">
                    {computedTradeRatio.toFixed(1)} bezerros
                  </p>
                </div>
              </div>
              <div className="bg-secondary/40 p-3 flex items-center gap-3">
                <span className="text-2xl">{"\u{1F33D}"}</span>
                <div>
                  <p className="text-xs text-muted-foreground">1 arroba boi gordo =</p>
                  <p className="text-lg font-bold tabular-nums text-foreground">
                    {milhoRatio.toFixed(1)} sacos de milho
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground">
              {tradeRatio
                ? "Fonte: dados Supabase em tempo real"
                : "Cálculo baseado nos preços atuais das categorias"}
            </p>
          </section>
        </ScrollReveal>
      )}

      {/* ═══ Disclaimer ═══ */}
      <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
        Dados: CEPEA, B3, BCB, IBGE, NASA · Modelo BullCast · Não constitui recomendação de investimento.
        <br />
        Última atualização: {latestDate ? new Date(latestDate + "T12:00:00").toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR")}
      </p>
    </div>
    </PageTransition>
  );
}
