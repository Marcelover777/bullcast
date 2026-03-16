"use client";

import { cn } from "@/lib/utils";
import { formatBRL, formatPercent } from "@/lib/format";
import { mockMarginData } from "@/lib/mock-data";
import { GSAPCounter } from "@/components/animations/gsap-counter";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

interface MarginPanelProps {
  className?: string;
}

export function MarginPanel({ className }: MarginPanelProps) {
  const data = mockMarginData;

  const basisColor = data.basis < 0 ? "text-destructive" : "text-primary";

  return (
    <div className={cn("border border-border bg-card p-6", className)}>
      {/* Header */}
      <h2 className="font-editorial text-lg tracking-tight mb-6">
        Seus Numeros
      </h2>

      {/* Top metrics grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Futures Price */}
        <div className="border border-border p-4">
          <span className="text-micro uppercase tracking-widest text-muted-foreground block mb-1">
            Futuro B3
          </span>
          <span className="font-mono text-2xl font-bold tabular-nums block">
            {formatBRL(data.futuresPrice)}
          </span>
          <span className="text-micro text-muted-foreground">R$/@</span>
        </div>

        {/* Physical Price */}
        <div className="border border-border p-4">
          <span className="text-micro uppercase tracking-widest text-muted-foreground block mb-1">
            Fisico SP
          </span>
          <span className="font-mono text-2xl font-bold tabular-nums block">
            {formatBRL(data.physicalPrice)}
          </span>
          <span className="text-micro text-muted-foreground">R$/@</span>
        </div>

        {/* Basis */}
        <div className="border border-border p-4">
          <span className="text-micro uppercase tracking-widest text-muted-foreground block mb-1">
            Base
          </span>
          <div className="flex items-baseline gap-2">
            <span className={cn("font-mono text-2xl font-bold tabular-nums", basisColor)}>
              {formatBRL(data.basis)}
            </span>
          </div>
          <span className={cn("text-micro font-mono tabular-nums", basisColor)}>
            {formatPercent(data.basisPercent)}
          </span>
        </div>

        {/* Dollar Rate */}
        <div className="border border-border p-4">
          <span className="text-micro uppercase tracking-widest text-muted-foreground block mb-1">
            Dolar
          </span>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-2xl font-bold tabular-nums">
              {formatBRL(data.dollarRate)}
            </span>
          </div>
          <span className="text-micro text-muted-foreground">BRL/USD</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-4" />

      {/* Bottom row: Margin, Breakeven, Confinement */}
      <div className="grid grid-cols-3 gap-4">
        {/* Margin per Head */}
        <div className="border border-border p-4 bg-primary/5">
          <span className="text-micro uppercase tracking-widest text-muted-foreground block mb-2">
            Margem/Cab
          </span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-mono text-2xl font-bold tabular-nums text-primary">
              R${" "}
              <GSAPCounter
                value={data.marginPerHead}
                decimals={0}
                className="text-primary"
                formatFn={(v) =>
                  v.toLocaleString("pt-BR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                }
              />
            </span>
          </div>
        </div>

        {/* Breakeven */}
        <div className="border border-border p-4">
          <span className="text-micro uppercase tracking-widest text-muted-foreground block mb-2">
            Ponto de Equil.
          </span>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4 text-warning" />
            <span className="font-mono text-xl font-bold tabular-nums">
              {formatBRL(data.breakeven)}
            </span>
          </div>
          <span className="text-micro text-muted-foreground">R$/@</span>
        </div>

        {/* Confinement Cost */}
        <div className="border border-border p-4">
          <span className="text-micro uppercase tracking-widest text-muted-foreground block mb-2">
            Custo Confin.
          </span>
          <div className="flex items-center gap-1">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <span className="font-mono text-xl font-bold tabular-nums">
              {formatBRL(data.confinementCost)}
            </span>
          </div>
          <span className="text-micro text-muted-foreground">R$/@</span>
        </div>
      </div>
    </div>
  );
}
