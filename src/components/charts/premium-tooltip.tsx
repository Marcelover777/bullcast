"use client";

import { formatBRL } from "@/lib/format";

interface PremiumTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string; color?: string }>;
  label?: string;
  prefix?: string;
  suffix?: string;
  valueFormatter?: (value: number) => string;
}

export function PremiumTooltip({
  active,
  payload,
  label,
  prefix = "R$ ",
  suffix,
  valueFormatter,
}: PremiumTooltipProps) {
  if (!active || !payload?.length) return null;

  const format = valueFormatter || ((v: number) => formatBRL(v));

  return (
    <div
      className="border-none px-3 py-2 shadow-lg"
      style={{
        background: "rgba(var(--background-rgb), 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "0px",
      }}
    >
      {label && (
        <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-0.5">
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <p
          key={i}
          className="font-mono text-sm font-bold tabular-nums text-foreground"
        >
          {prefix}
          {format(entry.value)}
          {suffix}
        </p>
      ))}
    </div>
  );
}

/** SVG filter for line glow effect — add inside <defs> of any chart */
export function ChartGlowFilter({
  id = "lineGlow",
  color = "var(--color-primary)",
  opacity = 0.25,
}: {
  id?: string;
  color?: string;
  opacity?: number;
}) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={color} floodOpacity={opacity} />
    </filter>
  );
}

/** Standard chart axis config for consistency */
export const premiumAxisConfig = {
  tick: {
    fontSize: 9,
    fill: "var(--color-muted-foreground)",
    fontFamily: "var(--font-mono)",
    opacity: 0.6,
  },
  axisLine: false as const,
  tickLine: false as const,
};

/** Standard chart grid config */
export const premiumGridConfig = {
  strokeDasharray: "2 4",
  stroke: "var(--color-border)",
  opacity: 0.06,
};
