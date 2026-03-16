"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockNews } from "@/lib/mock-data";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

const SENTIMENT_CONFIG = {
  positive: {
    label: "Positivo",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  negative: {
    label: "Negativo",
    bg: "bg-destructive/10",
    text: "text-destructive",
  },
  neutral: {
    label: "Neutro",
    bg: "bg-warning/10",
    text: "text-warning",
  },
} as const;

export function NewsPanel() {
  const displayNews = mockNews.slice(0, 3);

  return (
    <ScrollReveal direction="up" delay={0.15}>
      <section className="border border-border bg-background p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-lg tracking-tight">
            Radar do Setor
          </h2>
          <Link
            href="/noticias"
            className="flex items-center gap-1 text-micro uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver tudo
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* News items */}
        <div className="space-y-3">
          {displayNews.map((news) => {
            const sentiment = SENTIMENT_CONFIG[news.sentiment];
            return (
              <div
                key={news.id}
                className="space-y-2 border border-border p-3 transition-colors hover:bg-secondary/40"
              >
                {/* Meta row */}
                <div className="flex items-center gap-2">
                  <span className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">
                    {news.source}
                  </span>
                  <span className="text-micro text-muted-foreground/60">
                    &middot;
                  </span>
                  <span className="text-micro text-muted-foreground">
                    {news.timeAgo}
                  </span>
                  {news.isHighImpact && (
                    <Zap size={10} className="text-warning fill-warning" />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-medium leading-snug text-foreground">
                  {news.title}
                </h3>

                {/* Sentiment badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 text-micro font-bold uppercase tracking-widest",
                      sentiment.bg,
                      sentiment.text
                    )}
                  >
                    {sentiment.label}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {(news.sentimentScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </ScrollReveal>
  );
}
