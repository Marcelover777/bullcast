"use client";

import { cn } from "@/lib/utils";
import { formatBRL, formatPercent } from "@/lib/format";
import { mockB3Futures } from "@/lib/mock-data";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

export function B3Futures() {
  return (
    <ScrollReveal direction="up" delay={0.1}>
      <section className="border border-border bg-background p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-lg tracking-tight">
            Mercado Futuro [B3]
          </h2>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 bg-primary" />
            </span>
            <span className="text-micro font-semibold uppercase tracking-widest text-primary">
              Ao Vivo
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 pr-3 text-micro uppercase tracking-widest text-muted-foreground font-normal">
                  Contrato
                </th>
                <th className="pb-2 pr-3 text-micro uppercase tracking-widest text-muted-foreground font-normal">
                  Mes
                </th>
                <th className="pb-2 pr-3 text-right text-micro uppercase tracking-widest text-muted-foreground font-normal">
                  Preco
                </th>
                <th className="pb-2 pr-3 text-right text-micro uppercase tracking-widest text-muted-foreground font-normal">
                  Var%
                </th>
                <th className="pb-2 text-right text-micro uppercase tracking-widest text-muted-foreground font-normal">
                  Volume
                </th>
              </tr>
            </thead>
            <tbody>
              {mockB3Futures.map((f) => {
                const isPositive = f.changePercent >= 0;
                return (
                  <tr
                    key={f.contract}
                    className="border-b border-border/50 transition-colors hover:bg-secondary/40"
                  >
                    <td className="py-2.5 pr-3 font-mono text-sm font-semibold tabular-nums">
                      {f.contract}
                    </td>
                    <td className="py-2.5 pr-3 text-sm text-muted-foreground">
                      {f.month}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono text-sm tabular-nums">
                      {formatBRL(f.price)}
                    </td>
                    <td
                      className={cn(
                        "py-2.5 pr-3 text-right font-mono text-sm font-semibold tabular-nums",
                        isPositive ? "text-primary" : "text-destructive"
                      )}
                    >
                      {formatPercent(f.changePercent)}
                    </td>
                    <td className="py-2.5 text-right font-mono text-sm tabular-nums text-muted-foreground">
                      {f.volume.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </ScrollReveal>
  );
}
