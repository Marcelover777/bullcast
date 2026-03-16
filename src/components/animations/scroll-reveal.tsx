"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.8,
  distance = 60,
  stagger = 0,
  once = true,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getFromVars = (): gsap.TweenVars => {
    const base: gsap.TweenVars = { opacity: 0 };
    switch (direction) {
      case "up": return { ...base, y: distance };
      case "down": return { ...base, y: -distance };
      case "left": return { ...base, x: distance };
      case "right": return { ...base, x: -distance };
    }
  };

  useGSAP(() => {
    if (!containerRef.current) return;

    const targets = stagger > 0
      ? containerRef.current.children
      : containerRef.current;

    gsap.fromTo(targets, getFromVars(), {
      opacity: 1,
      x: 0,
      y: 0,
      duration,
      delay,
      stagger: stagger > 0 ? stagger : undefined,
      ease: "power3.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 88%",
        toggleActions: once ? "play none none none" : "play none none reverse",
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
