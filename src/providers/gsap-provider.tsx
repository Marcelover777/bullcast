"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function GSAPProvider({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Respect prefers-reduced-motion
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

      if (prefersReduced.matches) {
        gsap.globalTimeline.timeScale(0);
        ScrollTrigger.defaults({ animation: undefined });
      }

      // Listen for changes (user toggles setting)
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) {
          gsap.globalTimeline.timeScale(0);
        } else {
          gsap.globalTimeline.timeScale(1);
        }
      };
      prefersReduced.addEventListener("change", handler);
      return () => prefersReduced.removeEventListener("change", handler);
    }
  }, []);

  return <>{children}</>;
}
