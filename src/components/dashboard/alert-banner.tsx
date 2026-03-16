"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { mockRiskData } from "@/lib/mock-data";
import { ShieldAlert, X } from "lucide-react";

interface AlertBannerProps {
  className?: string;
}

const levelConfig = {
  low: {
    title: "Risco Baixo",
    borderColor: "border-primary",
    bgColor: "bg-primary/5",
    iconColor: "text-primary",
    barColor: "bg-primary",
  },
  medium: {
    title: "Risco Moderado",
    borderColor: "border-warning",
    bgColor: "bg-warning/5",
    iconColor: "text-warning",
    barColor: "bg-warning",
  },
  high: {
    title: "Risco Alto",
    borderColor: "border-destructive",
    bgColor: "bg-destructive/5",
    iconColor: "text-destructive",
    barColor: "bg-destructive",
  },
};

export function AlertBanner({ className }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const data = mockRiskData;
  const config = levelConfig[data.overallLevel];

  const quotaPercent = (data.chinaQuota.used / data.chinaQuota.total) * 100;

  useEffect(() => {
    if (dismissed || !bannerRef.current) return;

    // Shake animation on mount when risk is high
    if (data.overallLevel === "high") {
      gsap.fromTo(
        bannerRef.current,
        { x: -6 },
        {
          x: 6,
          duration: 0.08,
          repeat: 5,
          yoyo: true,
          ease: "power2.inOut",
          onComplete: () => {
            if (bannerRef.current) {
              gsap.set(bannerRef.current, { x: 0 });
            }
          },
        }
      );
    }

    // Fade in
    gsap.fromTo(
      bannerRef.current,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [data.overallLevel, dismissed]);

  if (dismissed) return null;

  return (
    <div
      ref={bannerRef}
      className={cn(
        "border-2 p-5 relative",
        config.borderColor,
        config.bgColor,
        className
      )}
    >
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Fechar alerta"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-3 pr-6">
        <ShieldAlert className={cn("h-5 w-5 flex-shrink-0", config.iconColor)} />
        <h3 className="font-editorial text-lg tracking-tight">
          {config.title}
        </h3>
      </div>

      {/* Advice text */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        {data.advice}
      </p>

      {/* China quota progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-micro uppercase tracking-widest text-muted-foreground">
            Cota China
          </span>
          <span className="font-mono text-sm tabular-nums">
            <span className="font-bold">{data.chinaQuota.used}</span>
            <span className="text-muted-foreground">
              /{data.chinaQuota.total} mil ton
            </span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-muted">
          <div
            className={cn("h-full transition-all", config.barColor)}
            style={{ width: `${quotaPercent}%` }}
          />
        </div>

        {/* Remaining days */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-micro text-muted-foreground font-mono tabular-nums">
            {quotaPercent.toFixed(0)}% utilizado
          </span>
          <span className="text-micro text-muted-foreground font-mono tabular-nums">
            {data.chinaQuota.daysRemaining} dias restantes
          </span>
        </div>
      </div>
    </div>
  );
}
