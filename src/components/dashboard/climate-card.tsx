"use client";

import { cn } from "@/lib/utils";
import { mockClimateData, type ClimateState } from "@/lib/mock-data";
import { Sun, Cloud, CloudRain, Thermometer, Droplets } from "lucide-react";

interface ClimateCardProps {
  className?: string;
}

const droughtConfig: Record<
  ClimateState["drought"],
  { label: string; color: string; bg: string }
> = {
  none: { label: "Normal", color: "text-primary", bg: "bg-primary/10" },
  watch: { label: "Atencao", color: "text-warning", bg: "bg-warning/10" },
  warning: { label: "Alerta", color: "text-orange-500", bg: "bg-orange-500/10" },
  alert: { label: "Critico", color: "text-destructive", bg: "bg-destructive/10" },
};

function getWeatherIcon(condition: ClimateState["condition"]) {
  switch (condition) {
    case "seco":
      return <Sun className="h-5 w-5 text-warning" />;
    case "chuvoso":
      return <CloudRain className="h-5 w-5 text-blue-400" />;
    case "normal":
    default:
      return <Cloud className="h-5 w-5 text-muted-foreground" />;
  }
}

function getNdviColor(ndvi: number): string {
  if (ndvi >= 0.7) return "bg-primary";
  if (ndvi >= 0.5) return "bg-warning";
  return "bg-destructive";
}

export function ClimateCard({ className }: ClimateCardProps) {
  return (
    <div className={cn("border border-border bg-card p-6", className)}>
      {/* Header */}
      <h2 className="font-editorial text-lg tracking-tight mb-5">
        Monitor Climatico
      </h2>

      {/* State grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {mockClimateData.map((state) => {
          const drought = droughtConfig[state.drought];

          return (
            <div
              key={state.state}
              className="border border-border p-4 flex flex-col gap-3"
            >
              {/* State header */}
              <div className="flex items-center justify-between">
                <span className="font-editorial text-xl font-bold">
                  {state.state}
                </span>
                {getWeatherIcon(state.condition)}
              </div>

              {/* State full name */}
              <span className="text-micro uppercase tracking-widest text-muted-foreground -mt-2">
                {state.stateFull}
              </span>

              {/* Temperature */}
              <div className="flex items-center gap-2">
                <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-sm tabular-nums">
                  {state.temperature}
                  <span className="text-muted-foreground">°C</span>
                </span>
              </div>

              {/* Precipitation */}
              <div className="flex items-center gap-2">
                <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-sm tabular-nums">
                  {state.precipitation}
                  <span className="text-muted-foreground"> mm</span>
                </span>
              </div>

              {/* NDVI bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-micro uppercase tracking-widest text-muted-foreground">
                    NDVI
                  </span>
                  <span className="font-mono text-micro tabular-nums">
                    {state.ndvi.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted">
                  <div
                    className={cn("h-full transition-all", getNdviColor(state.ndvi))}
                    style={{ width: `${state.ndvi * 100}%` }}
                  />
                </div>
              </div>

              {/* Drought badge */}
              <div
                className={cn(
                  "inline-flex items-center justify-center py-1 px-2 text-micro uppercase tracking-widest font-bold",
                  drought.bg,
                  drought.color
                )}
              >
                {drought.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
