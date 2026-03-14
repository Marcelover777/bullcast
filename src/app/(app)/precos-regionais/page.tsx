"use client";

import { cn } from "@/lib/utils";
import { formatBRL, formatPercent } from "@/lib/format";
import { mockRegionalQuotes } from "@/lib/mock-data";
import { PageTransition } from "@/components/motion/page-transition";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, MapPin, Clock, Info } from "lucide-react";

const categoryPrices = [
  { category: "Bezerros",        weight: "180 a 240 Kg", price: 13.50, change:  0.25, changePercent:  1.89, trend: "up"      as const },
  { category: "Garrotes",        weight: "240 a 360 Kg", price: 12.80, change:  0.00, changePercent:  0.00, trend: "neutral" as const },
  { category: "Boi Gordo",       weight: "> 450 Kg",     price: 11.50, change: -0.15, changePercent: -1.29, trend: "down"    as const },
  { category: "Novilhinhas",     weight: "180 a 240 Kg", price: 13.00, change:  0.18, changePercent:  1.41, trend: "up"      as const },
  { category: "Novilha",         weight: "> 330 Kg",     price: 10.90, change:  0.00, changePercent:  0.00, trend: "neutral" as const },
  { category: "Novilha Precoce", weight: "Ate 30 meses", price: 11.20, change:  0.30, changePercent:  2.75, trend: "up"      as const },
];

const trendConfig = {
  up:      { icon: TrendingUp,   label: "ALTA",   color: "text-primary",          bg: "bg-primary/10",     border: "border-primary/20"     },
  down:    { icon: TrendingDown, label: "BAIXA",  color: "text-destructive",      bg: "bg-destructive/10", border: "border-destructive/20" },
  neutral: { icon: Minus,        label: "NEUTRO", color: "text-muted-foreground", bg: "bg-muted/40",       border: "border-border"         },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: i * 0.07 },
  }),
};

export default function PrecosRegionaisPage() {
  const now = new Date().toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  return (
    <PageTransition>
      <main className="w-full pb-24">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10">
          {/* Header */}
          <ScrollReveal>
            <div className="pt-8 pb-6 border-b border-border">
              <p className="text-micro text-muted-foreground mb-2">[ Cotacoes Fisicas ]</p>
              <h1 className="text-4xl font-editorial font-bold tracking-tight">Precos Regionais</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Pracas de Mato Grosso — Sorriso, Nova Ubirata e adjacentes
              </p>
            </div>
          </ScrollReveal>
          {/* Section and timestamp */}
          <ScrollReveal delay={0.1}>
            <div className="pt-10 pb-5 flex items-center justify-between">
              <div>
                <p className="text-micro text-muted-foreground mb-1">[ Comparativo ]</p>
                <h2 className="text-2xl font-editorial font-bold">Cotacoes por Praca</h2>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px] uppercase tracking-widest">{now}</span>
              </div>
            </div>
          </ScrollReveal>
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] border border-border bg-border">
            {mockRegionalQuotes.map((quote, i) => {
              const cfg = trendConfig[quote.trend];
              const Icon = cfg.icon;
              return (
                <motion.div key={quote.region} custom={i} variants={cardVariants}
                  initial="hidden" animate="show"
                  className="bg-background p-6 flex flex-col gap-4 hover:bg-muted/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-micro text-muted-foreground">{quote.state}</span>
                      </div>
                      <h3 className="text-lg font-editorial font-bold leading-tight">{quote.region}</h3>
                    </div>
                    <div className={cn("flex items-center gap-1 px-2 py-1 border text-micro", cfg.color, cfg.bg, cfg.border)}>
                      <Icon className="w-3 h-3" strokeWidth={2.5} />
                      {cfg.label}
                    </div>
                  </div>
                  <div>
                    <p className="text-micro text-muted-foreground mb-1">Boi Gordo (R$/arroba)</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl font-bold tabular-nums tracking-tight">{formatBRL(quote.price, 2)}</span>
                      <span className={cn("font-mono text-sm font-bold", quote.change > 0 ? "text-primary" : quote.change < 0 ? "text-destructive" : "text-muted-foreground")}>
                        {formatPercent(quote.changePercent)}
                      </span>
                    </div>
                  </div>
                  <div className="h-[2px] bg-muted/40 w-full overflow-hidden">
                    <motion.div initial={{ width: 0 }}
                      animate={{ width: (Math.min(Math.abs(quote.changePercent) * 40, 100)).toString() + "%" }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.07, ease: "easeOut" }}
                      className={cn("h-full", quote.trend === "up" ? "bg-primary" : quote.trend === "down" ? "bg-destructive" : "bg-muted-foreground")}
                    />
                  </div>
                  <p className={cn("text-micro", quote.change > 0 ? "text-primary" : quote.change < 0 ? "text-destructive" : "text-muted-foreground")}>
                    {quote.change > 0 ? "+" : ""}{formatBRL(quote.change, 2)} na semana
                  </p>
                </motion.div>
              );
            })}
          </div>
          {/* Full reference table */}
          <ScrollReveal delay={0.15}>
            <div className="mt-12 border border-border">
              <div className="p-6 md:p-8 border-b border-border bg-muted/5">
                <p className="text-micro text-muted-foreground mb-1">[ Tabela de Referencia ]</p>
                <h2 className="text-2xl font-editorial font-bold">Mapeamento por Categoria (R$/Kg)</h2>
                <p className="text-sm text-muted-foreground mt-1">Pracas de Sorriso e municipios adjacentes — MT</p>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse min-w-[640px]">
                  <thead><tr className="bg-muted/20">
                    <th className="py-4 px-6 md:px-8 text-left text-micro text-muted-foreground font-bold border-b border-border">Categoria</th>
                    <th className="py-4 px-6 text-left text-micro text-muted-foreground font-bold border-b border-border">Peso / Faixa</th>
                    <th className="py-4 px-6 text-right text-micro text-muted-foreground font-bold border-b border-border">Preco R$/Kg</th>
                    <th className="py-4 px-6 text-right text-micro text-muted-foreground font-bold border-b border-border">Variacao</th>
                    <th className="py-4 px-6 md:px-8 text-center text-micro text-muted-foreground font-bold border-b border-border">Tendencia</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {categoryPrices.map((item, idx) => {
                      const cfg = trendConfig[item.trend];
                      const Icon = cfg.icon;
                      return (
                        <tr key={idx} className="group hover:bg-muted/10 transition-colors duration-150">
                          <td className="py-6 px-6 md:px-8">
                            <span className="text-base font-editorial font-bold text-foreground">{item.category}</span>
                          </td>
                          <td className="py-6 px-6">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{item.weight}</span>
                          </td>
                          <td className="py-6 px-6 text-right">
                            <span className="font-mono text-xl font-bold tabular-nums tracking-tight">{formatBRL(item.price, 2)}</span>
                          </td>
                          <td className="py-6 px-6 text-right">
                            <span className={cn("font-mono text-sm font-bold", item.change > 0 ? "text-primary" : item.change < 0 ? "text-destructive" : "text-muted-foreground")}>
                              {item.change !== 0 ? (item.change > 0 ? "+" : "") + formatBRL(item.change, 2) : "—"}
                            </span>
                          </td>
                          <td className="py-6 px-6 md:px-8"><div className="flex justify-center">
                            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 border text-micro", cfg.color, cfg.bg, cfg.border)}>
                              <Icon className="w-3 h-3" strokeWidth={2.5} />{cfg.label}
                            </div></div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
          {/* Footer */}
          <ScrollReveal delay={0.2}>
            <div className="mt-6 mb-4 flex items-start gap-3 p-4 border border-border bg-muted/5">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground/70">Valores livres de Funrural, pagamento a vista.</span>
                {" "}Cotacoes referenciais apuradas junto a frigorificos e traders da regiao.
                {" "}Atualizado em <span className="font-mono">{now}</span>. Consulte seu corretor.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </PageTransition>
  );
}