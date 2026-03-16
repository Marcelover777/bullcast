"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface UseGSAPScrollOptions {
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  trigger?: ScrollTrigger.Vars;
}

export function useGSAPScroll<T extends HTMLElement>(options: UseGSAPScrollOptions = {}) {
  const ref = useRef<T>(null);
  const {
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
    trigger = {},
  } = options;

  useGSAP(() => {
    if (!ref.current) return;

    gsap.fromTo(ref.current, from, {
      ...to,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        ...trigger,
      },
    });
  }, { scope: ref });

  return ref;
}
