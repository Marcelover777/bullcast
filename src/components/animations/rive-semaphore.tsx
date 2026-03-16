"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

type RiskLevel = "low" | "medium" | "high";

interface RiveSemaphoreProps {
  level: RiskLevel;
  className?: string;
  showLabel?: boolean;
}

const config = {
  low: { color: "#92C020", label: "RISCO BAIXO", glow: "rgba(146,192,32,0.4)" },
  medium: { color: "#F59E0B", label: "RISCO MODERADO", glow: "rgba(245,158,11,0.4)" },
  high: { color: "#DC2626", label: "RISCO ALTO", glow: "rgba(220,38,38,0.4)" },
};

export function RiveSemaphore({ level, className, showLabel = true }: RiveSemaphoreProps) {
  const lightsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { color, label, glow } = config[level];

  useEffect(() => {
    lightsRef.current.forEach((el) => {
      if (el) gsap.killTweensOf(el);
    });

    const activeIndex = level === "low" ? 2 : level === "medium" ? 1 : 0;

    lightsRef.current.forEach((el, i) => {
      if (!el) return;
      if (i === activeIndex) {
        gsap.to(el, {
          backgroundColor: config[level].color,
          boxShadow: `0 0 12px ${config[level].glow}, 0 0 24px ${config[level].glow}`,
          duration: 0.4,
        });
        gsap.to(el, {
          scale: 1.1,
          duration: 0.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      } else {
        gsap.to(el, {
          backgroundColor: "rgba(128,128,128,0.15)",
          boxShadow: "none",
          scale: 1,
          duration: 0.4,
        });
      }
    });
  }, [level]);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="flex flex-col gap-2 p-3 bg-card border-2 border-border">
        {(["high", "medium", "low"] as const).map((l, i) => (
          <div
            key={l}
            ref={(el) => { lightsRef.current[i] = el; }}
            className="w-8 h-8 transition-colors"
            style={{ backgroundColor: "rgba(128,128,128,0.15)" }}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-micro font-black uppercase tracking-widest" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}
