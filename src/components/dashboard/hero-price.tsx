"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { Bell, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL, formatPercent, getGreeting } from "@/lib/format";
import { mockRecommendation, mockPrices, mockForecasts } from "@/lib/mock-data";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { RiveTrend } from "@/components/animations/rive-trend";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

const SIGNAL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  COMPRAR: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
  VENDER: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30" },
  SEGURAR: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
};

interface HeroPriceProps {
  price?: number;
  variationDay?: number;
  signal?: string;
  confidence?: number;
  recommendationText?: string;
}

export function HeroPrice({
  price,
  variationDay,
  signal: signalProp,
  confidence: confidenceProp,
  recommendationText,
}: HeroPriceProps = {}) {
  const greetingRef = useRef<HTMLHeadingElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);
  const signalRef = useRef<HTMLDivElement>(null);
  const priceBlockRef = useRef<HTMLDivElement>(null);

  // Usar dados reais se disponiveis, senao mock
  const boiGordoMock = mockPrices.find((p) => p.indicator === "boi_gordo")!;
  const priceValue = price ?? boiGordoMock.value;
  const variationValue = variationDay ?? boiGordoMock.change;
  const changePercent =
    price != null && variationDay != null
      ? (variationDay / (price - variationDay)) * 100
      : boiGordoMock.changePercent;
  const signal = signalProp ?? mockRecommendation.recommendation;
  const confidenceValue = confidenceProp ?? mockRecommendation.confidence;

  // Determinar trend para RiveTrend baseado na variacao
  const trendDirection =
    price != null
      ? variationValue > 0
        ? "up"
        : variationValue < 0
          ? "down"
          : "sideways"
      : boiGordoMock.trend === "up"
        ? "up"
        : boiGordoMock.trend === "down"
          ? "down"
          : "sideways";

  const signalStyle = SIGNAL_COLORS[signal] ?? SIGNAL_COLORS.SEGURAR;

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (greetingRef.current) {
      tl.fromTo(greetingRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
    }
    if (headlineRef.current) {
      tl.fromTo(headlineRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");
    }
    if (signalRef.current) {
      tl.fromTo(signalRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 }, "-=0.2");
    }
    if (priceBlockRef.current) {
      tl.fromTo(priceBlockRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.3");
    }
  }, []);

  return (
    <section className="relative w-full">
      {/* Sticky header bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
        <span className="font-editorial text-lg tracking-tight">BullCast</span>
        <button
          type="button"
          className="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Notificacoes"
        >
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 bg-primary" />
        </button>
      </div>

      <div className="space-y-6 px-4 pb-6 pt-8">
        {/* Greeting */}
        <h1 ref={greetingRef} className="font-editorial text-2xl text-foreground" style={{ opacity: 0 }}>
          {getGreeting()}, Pecuarista.
        </h1>

        {/* Headline */}
        <p ref={headlineRef} className="max-w-md text-sm leading-relaxed text-muted-foreground" style={{ opacity: 0 }}>
          {recommendationText ?? "A profecia de Ceres decifrada em dados irrevogaveis."}
        </p>

        {/* Recommendation signal */}
        <div
          ref={signalRef}
          className={cn("inline-flex items-center gap-3 border px-5 py-3", signalStyle.bg, signalStyle.border)}
          style={{ opacity: 0 }}
        >
          <span className={cn("text-micro font-bold uppercase tracking-widest", signalStyle.text)}>
            Sinal do Dia
          </span>
          <span className={cn("font-editorial text-xl font-bold tracking-tight", signalStyle.text)}>
            {signal}
          </span>
          <span className="font-mono text-xs text-muted-foreground">{confidenceValue}% confianca</span>
        </div>

        {/* Main price block */}
        <div ref={priceBlockRef} className="space-y-4 border border-border bg-secondary/40 p-5" style={{ opacity: 0 }}>
          <div className="flex items-baseline gap-2">
            <span className="text-micro uppercase tracking-widest text-muted-foreground">
              Boi Gordo (Indicador CEPEA)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-4xl font-bold tabular-nums text-foreground">
              R${"  "}
              <AnimatedNumber value={priceValue} decimals={2} className="font-mono" />
            </span>
            <span className="font-mono text-sm text-muted-foreground">/@</span>
          </div>
          <div className="flex items-center gap-3">
            <RiveTrend direction={trendDirection} size={20} />
            <span className={cn("font-mono text-sm font-semibold", variationValue >= 0 ? "text-primary" : "text-destructive")}>
              {variationValue >= 0 ? "+" : ""}{formatBRL(variationValue)}
            </span>
            <span className={cn("font-mono text-sm", changePercent >= 0 ? "text-primary" : "text-destructive")}>
              ({formatPercent(changePercent)})
            </span>
          </div>
        </div>

        {/* Forecast horizons */}
        <ScrollReveal direction="up" stagger={0.1} delay={0.2}>
          <div className="grid grid-cols-3 gap-3">
            {mockForecasts.map((f) => {
              const isPositive = f.changePercent >= 0;
              return (
                <div key={f.days} className="border border-border bg-background p-3 space-y-2">
                  <span className="text-micro uppercase tracking-widest text-muted-foreground">{f.label}</span>
                  <div className="font-mono text-lg font-bold tabular-nums">{formatBRL(f.value)}</div>
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp size={12} className="text-primary" />
                    ) : (
                      <TrendingDown size={12} className="text-destructive" />
                    )}
                    <span className={cn("font-mono text-xs", isPositive ? "text-primary" : "text-destructive")}>
                      {formatPercent(f.changePercent)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
