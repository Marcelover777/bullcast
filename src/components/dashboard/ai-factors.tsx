"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockRecommendation } from "@/lib/mock-data";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

export function AIFactors() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;

    const cards = listRef.current.querySelectorAll(".factor-card");

    gsap.fromTo(
      cards,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.3,
      }
    );
  }, []);

  const factors = mockRecommendation.factors;

  return (
    <ScrollReveal direction="up" delay={0.1}>
      <section className="border border-border bg-background p-4 space-y-4">
        <h2 className="font-editorial text-lg tracking-tight">
          Fundamentos (IA)
        </h2>

        <div ref={listRef} className="space-y-2">
          {factors.map((factor, i) => {
            const isAlta = factor.type === "alta";
            return (
              <div
                key={i}
                className="factor-card flex items-start gap-3 border border-border p-3"
                style={{ opacity: 0 }}
              >
                {/* Badge */}
                <div
                  className={cn(
                    "flex shrink-0 items-center gap-1 px-2 py-0.5",
                    isAlta
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {isAlta ? (
                    <TrendingUp size={12} strokeWidth={2} />
                  ) : (
                    <TrendingDown size={12} strokeWidth={2} />
                  )}
                  <span className="text-micro font-bold uppercase tracking-widest">
                    {isAlta ? "Alta" : "Baixa"}
                  </span>
                </div>

                {/* Text */}
                <p className="text-sm leading-relaxed text-foreground">
                  {factor.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </ScrollReveal>
  );
}
