"use client";

import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { mockSeasonalData } from "@/lib/mock-data";

interface SeasonalCalendarProps {
  className?: string;
}

const CURRENT_MONTH_INDEX = new Date().getMonth(); // 0-based

function getMonthIndex(monthLabel: string): number {
  const map: Record<string, number> = {
    Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
    Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
  };
  return map[monthLabel] ?? -1;
}

export function SeasonalCalendar({ className }: SeasonalCalendarProps) {
  return (
    <div className={cn("border border-border bg-card p-6", className)}>
      {/* Header */}
      <h2 className="font-editorial text-lg tracking-tight mb-2">
        Calendario Sazonal
      </h2>
      <p className="text-micro uppercase tracking-widest text-muted-foreground mb-5">
        Preco atual vs media 5 anos
      </p>

      {/* 12 month grid: 4 columns x 3 rows */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {mockSeasonalData.map((point) => {
          const monthIdx = getMonthIndex(point.month);
          const isCurrent = monthIdx === CURRENT_MONTH_INDEX;
          const hasData = point.current > 0;

          let diffColor = "text-warning";
          let badgeText = "=";

          if (hasData) {
            const diff = point.current - point.average5y;
            if (diff > 0) {
              diffColor = "text-primary";
              badgeText = `+${formatBRL(diff, 1)}`;
            } else if (diff < 0) {
              diffColor = "text-destructive";
              badgeText = formatBRL(diff, 1);
            }
          }

          return (
            <div
              key={point.month}
              className={cn(
                "border p-3 flex flex-col items-center gap-1 transition-colors",
                isCurrent
                  ? "border-primary bg-primary/5 border-2"
                  : "border-border",
                !hasData && "opacity-50"
              )}
            >
              {/* Month label */}
              <span
                className={cn(
                  "text-micro uppercase tracking-widest font-bold",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}
              >
                {point.month}
              </span>

              {/* Price */}
              <span className="font-mono text-sm font-bold tabular-nums">
                {hasData ? formatBRL(point.current, 1) : "--"}
              </span>

              {/* Badge: vs average */}
              {hasData && (
                <span
                  className={cn(
                    "text-micro font-mono tabular-nums font-semibold",
                    diffColor
                  )}
                >
                  {badgeText}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
