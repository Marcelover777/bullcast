"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface RiveTrendProps {
  direction: "up" | "down" | "sideways";
  size?: number;
  className?: string;
  label?: string;
}

export function RiveTrend({ direction, size = 32, className, label }: RiveTrendProps) {
  const arrowRef = useRef<SVGSVGElement>(null);

  const rotation = direction === "up" ? -45 : direction === "down" ? 45 : 0;
  const color = direction === "up" ? "#92C020" : direction === "down" ? "#DC2626" : "#A0A0A0";

  useEffect(() => {
    if (arrowRef.current) {
      gsap.to(arrowRef.current, {
        rotation,
        duration: 0.8,
        ease: "elastic.out(1.2, 0.5)",
        transformOrigin: "center center",
      });
      gsap.to(arrowRef.current, {
        color,
        duration: 0.4,
      });
    }
  }, [direction, rotation, color]);

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <svg
        ref={arrowRef}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ color }}
      >
        <path
          d="M5 12h14M13 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
      {label && (
        <span className="text-micro uppercase tracking-widest" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}
