"use client";

import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { mockForwardCurve, mockMarginData } from "@/lib/mock-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ForwardCurveProps {
  className?: string;
}

export function ForwardCurve({ className }: ForwardCurveProps) {
  const spotPrice = mockMarginData.physicalPrice;
  const nearestFuture = mockForwardCurve[0];

  // Determine contango or backwardation
  // Contango: far contracts > near contracts
  // Backwardation: far contracts < near contracts
  const firstPrice = mockForwardCurve[0].price;
  const lastPrice = mockForwardCurve[mockForwardCurve.length - 1].price;
  const isContango = lastPrice > firstPrice;
  const curveShape = isContango ? "Preço futuro ACIMA do atual" : "Preço futuro ABAIXO do atual";
  const curveColor = isContango ? "text-primary" : "text-destructive";
  const curveIcon = isContango ? (
    <TrendingUp className="h-4 w-4" />
  ) : (
    <TrendingDown className="h-4 w-4" />
  );

  // Spread: nearest future vs spot
  const spread = nearestFuture.price - spotPrice;
  const spreadColor = spread >= 0 ? "text-primary" : "text-destructive";

  // Chart data includes spot as first point
  const chartData = [
    { month: "Fisico", price: spotPrice },
    ...mockForwardCurve.map((p) => ({
      month: p.month,
      price: p.price,
    })),
  ];

  const minPrice = Math.floor(Math.min(...chartData.map((d) => d.price)) - 4);
  const maxPrice = Math.ceil(Math.max(...chartData.map((d) => d.price)) + 4);

  return (
    <div className={cn("border border-border bg-card p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-editorial text-lg tracking-tight">
          Curva de Futuros
        </h2>
        <div className={cn("flex items-center gap-1.5", curveColor)}>
          {curveIcon}
          <span className="text-micro uppercase tracking-widest font-bold max-w-[140px] text-right leading-tight">
            {curveShape}
          </span>
        </div>
      </div>

      {/* Spot vs Nearest */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div>
          <span className="text-micro uppercase tracking-widest text-muted-foreground mr-2">
            Fisico:
          </span>
          <span className="font-mono font-bold tabular-nums">
            {formatBRL(spotPrice)}
          </span>
        </div>
        <div>
          <span className="text-micro uppercase tracking-widest text-muted-foreground mr-2">
            {nearestFuture.contract}:
          </span>
          <span className="font-mono font-bold tabular-nums">
            {formatBRL(nearestFuture.price)}
          </span>
        </div>
        <div>
          <span className="text-micro uppercase tracking-widest text-muted-foreground mr-2">
            Diferença:
          </span>
          <span className={cn("font-mono font-bold tabular-nums", spreadColor)}>
            {spread >= 0 ? "+" : ""}
            {formatBRL(spread)}
          </span>
        </div>
      </div>

      {/* Explicação */}
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        {isContango
          ? "O mercado espera que o preço suba — bom momento para travar venda futura."
          : "O mercado espera que o preço caia — considere vender no físico agora."}
      </p>

      {/* Chart */}
      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "currentColor" }}
              tickLine={false}
              axisLine={{ stroke: "currentColor", opacity: 0.15 }}
              className="font-mono"
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 10, fill: "currentColor" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatBRL(v, 0)}
              width={48}
              className="font-mono"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "0px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
              }}
              formatter={(value: unknown) => [
                `R$ ${formatBRL(value as number)}`,
                "Preco",
              ]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: "var(--color-card)",
                stroke: "var(--color-primary)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "var(--color-primary)",
                stroke: "var(--color-card)",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Contracts table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-micro uppercase tracking-widest text-muted-foreground text-left py-2 font-normal">
                Contrato
              </th>
              <th className="text-micro uppercase tracking-widest text-muted-foreground text-left py-2 font-normal">
                Mes
              </th>
              <th className="text-micro uppercase tracking-widest text-muted-foreground text-right py-2 font-normal">
                Preco
              </th>
              <th className="text-micro uppercase tracking-widest text-muted-foreground text-right py-2 font-normal">
                Dias
              </th>
            </tr>
          </thead>
          <tbody>
            {mockForwardCurve.map((point) => (
              <tr
                key={point.contract}
                className="border-b border-border/50 last:border-0"
              >
                <td className="py-2 font-mono font-bold tabular-nums">
                  {point.contract}
                </td>
                <td className="py-2 text-muted-foreground">{point.month}</td>
                <td className="py-2 font-mono tabular-nums text-right">
                  {formatBRL(point.price)}
                </td>
                <td className="py-2 font-mono tabular-nums text-right text-muted-foreground">
                  {point.daysToExpiry}d
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
