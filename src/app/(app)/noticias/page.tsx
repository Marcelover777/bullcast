"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { mockNews } from "@/lib/mock-data";
import type { NewsItem } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/motion/page-transition";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { TrendingUp, TrendingDown, Minus, Zap, Filter } from "lucide-react";

const filters = [
  { key: "all",         label: "Todas"        },
  { key: "positive",   label: "Positivas"    },
  { key: "negative",   label: "Negativas"    },
  { key: "high_impact", label: "Alto Impacto" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

const sentimentConfig = {
  positive: { label: "POSITIVO", color: "text-primary",          bg: "bg-primary/10",     border: "border-primary/20",     icon: TrendingUp   },
  negative: { label: "NEGATIVO", color: "text-destructive",      bg: "bg-destructive/10", border: "border-destructive/20", icon: TrendingDown },
  neutral:  { label: "NEUTRO",   color: "text-muted-foreground", bg: "bg-muted/40",       border: "border-border",         icon: Minus        },
};

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const cfg = sentimentConfig[item.sentiment];
  const Icon = cfg.icon;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.05 }}
      className="border border-border bg-background hover:bg-muted/5 transition-colors"
    >
      {item.isHighImpact && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-primary/5 border-b border-primary/10">
          <Zap className="w-3 h-3 text-primary" strokeWidth={2.5} />
          <span className="text-micro text-primary">Alto Impacto</span>
        </div>
      )}
      <div className="p-5 md:p-6">
        <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 border mb-3 text-micro", cfg.color, cfg.bg, cfg.border)}>
          <Icon className="w-3 h-3" strokeWidth={2.5} />
          {cfg.label}
        </div>
        <h3 className="text-base font-bold text-foreground leading-snug mb-1.5">{item.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{item.summary}</p>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-micro text-muted-foreground">Impacto</span>
            <span className="font-mono text-[10px] text-muted-foreground">{(item.sentimentScore * 100 | 0)}%</span>
          </div>
          <div className="h-[2px] bg-muted/40 w-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: (item.sentimentScore * 100).toString() + "%" }}
              transition={{ duration: 0.7, delay: 0.2 + index * 0.04, ease: "easeOut" }}
              className={cn("h-full", item.sentiment === "positive" ? "bg-primary" : item.sentiment === "negative" ? "bg-destructive" : "bg-muted-foreground")}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-micro text-muted-foreground">{item.source}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{item.timeAgo}</span>
        </div>
      </div>
    </motion.article>
  );
}

export default function NoticiasPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const filteredNews = mockNews.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "high_impact") return item.isHighImpact;
    return item.sentiment === activeFilter;
  });
  return (
    <PageTransition>
      <main className="w-full pb-24">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10">

          {/* Header */}
          <ScrollReveal>
            <div className="pt-8 pb-6 border-b border-border">
              <p className="text-micro text-muted-foreground mb-2">[ Feed de Informacoes ]</p>
              <h1 className="text-4xl font-editorial font-bold tracking-tight">
                Noticias & Mercado
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {mockNews.length} materias. Filtradas por relevancia ao mercado de boi gordo.
              </p>
            </div>
          </ScrollReveal>

          {/* Filter pills */}
          <ScrollReveal delay={0.1}>
            <div className="pt-6 pb-4 flex flex-wrap gap-2 items-center">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setActiveFilter(f.key)}
                  className={cn(
                    "px-4 py-2 border text-sm font-semibold transition-all duration-200",
                    activeFilter === f.key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
              <span className="ml-auto font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                {filteredNews.length} resultados
              </span>
            </div>
          </ScrollReveal>

          {/* News grid with AnimatePresence */}
          <ScrollReveal delay={0.15}>
            <AnimatePresence mode="popLayout">
              {filteredNews.length > 0 ? (
                <motion.div
                  key={activeFilter}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1px] border border-border bg-border mb-6"
                >
                  {filteredNews.map((item, i) => (
                    <NewsCard key={item.id} item={item} index={i} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 border border-border"
                >
                  <Filter className="w-10 h-10 text-muted-foreground/30 mb-4" />
                  <p className="font-editorial text-lg font-bold text-foreground/50 mb-1">Nenhum resultado</p>
                  <p className="text-sm text-muted-foreground">Altere o filtro acima para ver mais noticias</p>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollReveal>

        </div>
      </main>
    </PageTransition>
  );
}