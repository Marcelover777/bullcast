"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface GSAPCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  formatFn?: (value: number) => string;
}

export function GSAPCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  duration = 1.5,
  className,
  formatFn,
}: GSAPCounterProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef({ value: 0 });
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(counterRef.current, {
      value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        if (spanRef.current) {
          const formatted = formatFn
            ? formatFn(counterRef.current.value)
            : counterRef.current.value.toFixed(decimals);
          spanRef.current.textContent = `${prefix}${formatted}${suffix}`;
        }
      },
    });

    return () => { tweenRef.current?.kill(); };
  }, [value, duration, decimals, prefix, suffix, formatFn]);

  return (
    <span
      ref={spanRef}
      className={cn("tabular-nums font-mono", className)}
    >
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
}
