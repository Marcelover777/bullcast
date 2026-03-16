"use client";

import { useState } from "react";
import { Calendar, TrendingUp, TrendingDown, Minus, Info, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Horizon = 7 | 15 | 30;

const predictions: Record<Horizon, { direction: string; target: number; range: [number, number]; confidence: number; factors: string[] }> = {
  7: {
    direction: "ALTA",
    target: 315.80,
    range: [312.00, 319.50],
    confidence: 82,
    factors: [
      "Demanda aquecida em SP e MT nas últimas 3 semanas",
      "Oferta restrita — abate caiu 8% vs mês anterior",
      "B3 futuro sinaliza prêmio crescente",
    ],
  },
  15: {
    direction: "ALTA",
    target: 318.40,
    range: [310.50, 326.00],
    confidence: 74,
    factors: [
      "Entressafra deve pressionar oferta até meados de outubro",
      "China mantém compras estáveis — suporte ao preço",
      "Milho em queda alivia custo do confinamento",
      "Risco: chuvas podem antecipar retorno do pasto",
    ],
  },
  30: {
    direction: "LATERAL",
    target: 316.20,
    range: [305.00, 328.00],
    confidence: 63,
    factors: [
      "Incerteza sobre volume de confinamento no 2º giro",
      "Câmbio pode pressionar exportações se USD recuar",
      "Sazonalidade historicamente positiva em Out-Nov",
      "Monitorar: retorno das chuvas e início da safra de pasto",
    ],
  },
};

const directionConfig = {
  ALTA: { icon: TrendingUp, color: "text-bull", bg: "bg-bull/10" },
  BAIXA: { icon: TrendingDown, color: "text-bear", bg: "bg-bear/10" },
  LATERAL: { icon: Minus, color: "text-hold", bg: "bg-hold/10" },
};

export default function PrevisaoPage() {
  const [selected, setSelected] = useState<Horizon>(7);
  const pred = predictions[selected];
  const dirConf = directionConfig[pred.direction as keyof typeof directionConfig];
  const DirIcon = dirConf.icon;

  return (
    <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
      {/* Título */}
      <div>
        <h1 className="text-display text-xl text-primary">PREVISÃO</h1>
        <p className="text-sm text-muted-foreground mt-1">Projeção do preço da @ do boi gordo</p>
      </div>

      {/* Seletor de horizonte */}
      <div className="flex gap-2">
        {([7, 15, 30] as Horizon[]).map((h) => (
          <button
            key={h}
            onClick={() => setSelected(h)}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-center transition-all duration-300 cursor-pointer",
              selected === h
                ? "bg-primary text-primary-foreground font-bold"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="text-display text-lg">{h}</span>
            <span className="text-[10px] block uppercase tracking-wider mt-0.5">dias</span>
          </button>
        ))}
      </div>

      {/* Card da previsão */}
      <section className={cn("rounded-xl p-5 border", dirConf.bg, "border-border")}>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", dirConf.bg)}>
            <DirIcon className={cn("w-6 h-6", dirConf.color)} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-label text-[10px]">TENDÊNCIA {selected} DIAS</p>
            <p className={cn("text-display text-xl", dirConf.color)}>{pred.direction}</p>
          </div>
        </div>

        {/* Target */}
        <div className="mb-4">
          <p className="text-label text-[9px] mb-1">PREÇO ALVO</p>
          <p className="text-display text-4xl text-foreground">
            R$ {pred.target.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Faixa: R$ {pred.range[0].toFixed(2).replace(".", ",")} — R$ {pred.range[1].toFixed(2).replace(".", ",")}
          </p>
        </div>

        {/* Confiança */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-label text-[10px]">CONFIANÇA</span>
            <span className={cn("text-sm font-bold tabular-nums", dirConf.color)}>{pred.confidence}%</span>
          </div>
          <div className="confidence-bar">
            <div
              className={cn(
                "confidence-bar-fill",
                pred.direction === "ALTA" ? "bg-bull" : pred.direction === "BAIXA" ? "bg-bear" : "bg-hold"
              )}
              style={{ width: `${pred.confidence}%` }}
            />
          </div>
        </div>
      </section>

      {/* Fatores */}
      <section className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">O que sustenta essa previsão</h2>
        </div>
        <ul className="space-y-2.5">
          {pred.factors.map((factor, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className={cn(
                "w-5 h-5 rounded flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5",
                dirConf.bg, dirConf.color
              )}>
                {i + 1}
              </span>
              <span className="text-sm text-secondary-foreground leading-snug">{factor}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
        Previsões baseadas em modelos estatísticos e aprendizado de máquina.
        Não constitui recomendação de investimento. Dados do CEPEA, B3 e IBGE.
      </p>
    </div>
  );
}
