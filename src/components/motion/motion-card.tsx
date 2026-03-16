"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function MotionCard({
  children,
  className,
  delay = 0,
  hover = true,
}: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      }}
      whileTap={hover ? { scale: 0.98 } : undefined}
      className={cn(
        "bg-card rounded-2xl border border-border/60",
        hover && "cursor-pointer active:shadow-none transition-shadow",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
