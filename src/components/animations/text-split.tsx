"use client";

import { useRef, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface TextSplitProps {
  text: string;
  className?: string;
  splitBy?: "chars" | "words";
  stagger?: number;
  duration?: number;
  delay?: number;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  useScroll?: boolean;
}

export function TextSplit({
  text,
  className,
  splitBy = "chars",
  stagger = 0.03,
  duration = 0.6,
  delay = 0,
  tag: Tag = "h2",
  useScroll = false,
}: TextSplitProps) {
  const containerRef = useRef<HTMLElement>(null);

  const parts = useMemo(() => {
    if (splitBy === "words") {
      return text.split(" ").map((word, i) => ({ text: word, key: `w-${i}` }));
    }
    return text.split("").map((char, i) => ({
      text: char === " " ? "\u00A0" : char,
      key: `c-${i}`,
    }));
  }, [text, splitBy]);

  useGSAP(() => {
    if (!containerRef.current) return;

    const spans = containerRef.current.querySelectorAll(".split-part");

    const animConfig: gsap.TweenVars = {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration,
      stagger,
      ease: "power3.out",
    };

    if (useScroll) {
      gsap.fromTo(
        spans,
        { opacity: 0, y: 30, rotateX: -40 },
        {
          ...animConfig,
          delay,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    } else {
      gsap.fromTo(
        spans,
        { opacity: 0, y: 30, rotateX: -40 },
        { ...animConfig, delay }
      );
    }
  }, { scope: containerRef });

  return (
    <Tag
      ref={containerRef as unknown as React.RefObject<HTMLHeadingElement>}
      className={cn("overflow-hidden", className)}
      style={{ perspective: "600px" }}
    >
      {parts.map(({ text: partText, key }) => (
        <span
          key={key}
          className="split-part inline-block will-change-transform"
          style={{ opacity: 0, transformOrigin: "bottom center" }}
        >
          {partText}
          {splitBy === "words" ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}
