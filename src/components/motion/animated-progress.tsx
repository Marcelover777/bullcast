"use client";

import { motion } from "framer-motion";

interface AnimatedProgressProps {
  value: number;
  max?: number;
  color?: string;
  bgColor?: string;
  height?: number;
  className?: string;
  delay?: number;
}

export function AnimatedProgress({
  value,
  max = 100,
  color = "var(--primary)",
  bgColor = "var(--muted)",
  height = 6,
  className,
  delay = 0.3,
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div
      className={className}
      style={{
        height,
        borderRadius: height,
        background: bgColor,
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: 1,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        style={{
          height: "100%",
          borderRadius: height,
          background: color,
        }}
      />
    </div>
  );
}
