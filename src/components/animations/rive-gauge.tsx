"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface RiveGaugeProps {
  value: number;
  label: string;
  state?: "bullish" | "bearish" | "neutral";
  size?: number;
  className?: string;
}

const stateColors = {
  bullish: { needle: "#92C020", arc: "#92C020", bg: "rgba(146,192,32,0.1)" },
  bearish: { needle: "#DC2626", arc: "#DC2626", bg: "rgba(220,38,38,0.1)" },
  neutral: { needle: "#A0A0A0", arc: "#A0A0A0", bg: "rgba(160,160,160,0.1)" },
};

export function RiveGauge({ value, label, state = "neutral", size = 140, className }: RiveGaugeProps) {
  const needleRef = useRef<SVGLineElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef({ v: 0 });
  const colors = stateColors[state];

  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = size / 2 - 16;

  // Arc path for semicircle (180 degrees, from left to right)
  const startAngle = Math.PI;
  const endAngle = 0;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  const arcPath = `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;

  // Filled arc based on value
  const fillAngle = Math.PI - (value / 100) * Math.PI;
  const fx = cx + r * Math.cos(fillAngle);
  const fy = cy + r * Math.sin(fillAngle);
  const largeArc = value > 50 ? 1 : 0;
  const fillPath = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${fx} ${fy}`;

  useEffect(() => {
    const angle = -180 + (value / 100) * 180;
    if (needleRef.current) {
      gsap.to(needleRef.current, {
        attr: {
          x2: cx + (r - 8) * Math.cos((angle * Math.PI) / 180 + Math.PI),
          y2: cy + (r - 8) * Math.sin((angle * Math.PI) / 180 + Math.PI),
        },
        duration: 1.2,
        ease: "power3.out",
      });
    }
    gsap.to(counterRef.current, {
      v: value,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        if (valueRef.current) {
          valueRef.current.textContent = Math.round(counterRef.current.v).toString();
        }
      },
    });
  }, [value, cx, cy, r]);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path d={arcPath} fill="none" stroke="currentColor" strokeWidth={3} opacity={0.1} />
        {/* Filled arc */}
        <path d={fillPath} fill="none" stroke={colors.arc} strokeWidth={3} strokeLinecap="square" />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const a = Math.PI - (tick / 100) * Math.PI;
          const outerR = r + 4;
          const innerR = r - 4;
          return (
            <line
              key={tick}
              x1={cx + outerR * Math.cos(a)}
              y1={cy + outerR * Math.sin(a)}
              x2={cx + innerR * Math.cos(a)}
              y2={cy + innerR * Math.sin(a)}
              stroke="currentColor"
              strokeWidth={1}
              opacity={0.3}
            />
          );
        })}
        {/* Needle */}
        <line
          ref={needleRef}
          x1={cx}
          y1={cy}
          x2={cx - (r - 8)}
          y2={cy}
          stroke={colors.needle}
          strokeWidth={2}
          strokeLinecap="square"
        />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} fill={colors.needle} />
      </svg>
      <span ref={valueRef} className="text-2xl font-mono font-bold tabular-nums">
        {value}
      </span>
      <span className="text-micro text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}
