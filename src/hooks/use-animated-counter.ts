"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface UseAnimatedCounterOptions {
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function useAnimatedCounter(
  target: number,
  options: UseAnimatedCounterOptions = {}
) {
  const { duration = 1.2, decimals = 2, prefix = "", suffix = "" } = options;
  const [display, setDisplay] = useState(target);
  const counterRef = useRef({ value: target });
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(counterRef.current, {
      value: target,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        setDisplay(Number(counterRef.current.value.toFixed(decimals)));
      },
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [target, duration, decimals]);

  const formatted = `${prefix}${display.toFixed(decimals)}${suffix}`;

  return { value: display, formatted };
}
