"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseIntersectionOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersection<T extends HTMLElement>(
  options: UseIntersectionOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsInView(true);
        if (triggerOnce && ref.current) {
          observer.current?.unobserve(ref.current);
        }
      } else if (!triggerOnce) {
        setIsInView(false);
      }
    },
    [triggerOnce]
  );

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    if (ref.current) {
      observer.current.observe(ref.current);
    }

    return () => {
      observer.current?.disconnect();
    };
  }, [threshold, rootMargin, handleIntersection]);

  return { ref, isInView };
}
