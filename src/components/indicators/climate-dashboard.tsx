"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Sun,
  CloudRain,
  Cloud,
  Droplets,
  Thermometer,
  Leaf,
  AlertTriangle,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockClimateData, type ClimateState } from "@/lib/mock-data";

const DROUGHT_CONFIG: Record<
  ClimateState["drought"],
  { label: string; color: string; bg: string; border: string; icon: typeof ShieldCheck }
> = {
  none: {
    label: "Normal",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: ShieldCheck,
  },
  watch: {
    label: "Observacao",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    icon: Eye,
  },
  warning: {
    label: "Alerta",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: AlertTriangle,
  },
  alert: {
    label: "Critico",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: AlertTriangle,
  },
};

function getNDVIColor(ndvi: number): string {
  if (ndvi >= 0.7) return "bg-emerald-500";
  if (ndvi >= 0.5) return "bg-yellow-500";
  if (ndvi >= 0.3) return "bg-orange-500";
  return "bg-red-500";
}

function getNDVILabel(ndvi: number): string {
  if (ndvi >= 0.7) return "Excelente";
  if (ndvi >= 0.5) return "Moderado";
  if (ndvi >= 0.3) return "Baixo";
  return "Critico";
}

function getConditionIcon(condition: ClimateState["condition"]) {
  switch (condition) {
    case "chuvoso":
      return CloudRain;
    case "seco":
      return Sun;
    default:
      return Cloud;
  }
}

function TemperatureGauge({ value }: { value: number }) {
  // Map 15-40C to 0-100%
  const pct = Math.max(0, Math.min(100, ((value - 15) / 25) * 100));
  return (
    <div className="flex items-center gap-2">
      <Thermometer size={14} className="text-muted-foreground" />
      <div className="flex-1 h-1.5 bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full transition-all",
            value > 34 ? "bg-destructive" : value > 30 ? "bg-warning" : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums w-8 text-right">{value}C</span>
    </div>
  );
}

function PrecipitationBar({ value }: { value: number }) {
  // Map 0-200mm to 0-100%
  const pct = Math.max(0, Math.min(100, (value / 200) * 100));
  return (
    <div className="flex items-center gap-2">
      <Droplets size={14} className="text-muted-foreground" />
      <div className="flex-1 h-1.5 bg-muted overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums w-12 text-right">{value}mm</span>
    </div>
  );
}

function ClimateCard({ data }: { data: ClimateState }) {
  const drought = DROUGHT_CONFIG[data.drought];
  const DroughtIcon = drought.icon;
  const ConditionIcon = getConditionIcon(data.condition);
  const conditionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conditionRef.current) return;
    const icon = conditionRef.current.querySelector(".climate-icon");
    if (!icon) return;

    if (data.condition === "normal" || data.condition === "seco") {
      // Sun pulse
      gsap.to(icon, {
        scale: 1.15,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    } else {
      // Rain drops bounce
      gsap.to(icon, {
        y: -3,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    return () => {
      gsap.killTweensOf(icon);
    };
  }, [data.condition]);

  return (
    <div className="border border-border bg-background p-4 space-y-3">
      {/* State header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div ref={conditionRef}>
            <ConditionIcon
              size={18}
              className={cn(
                "climate-icon",
                data.condition === "seco"
                  ? "text-warning"
                  : data.condition === "chuvoso"
                    ? "text-blue-500"
                    : "text-muted-foreground"
              )}
            />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{data.state}</h4>
            <p className="text-[10px] text-muted-foreground">{data.stateFull}</p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 border px-2 py-0.5 text-micro font-bold",
            drought.bg,
            drought.color,
            drought.border
          )}
        >
          <DroughtIcon size={10} />
          {drought.label}
        </span>
      </div>

      {/* Temperature gauge */}
      <TemperatureGauge value={data.temperature} />

      {/* Precipitation bar */}
      <PrecipitationBar value={data.precipitation} />

      {/* NDVI indicator */}
      <div className="flex items-center gap-2">
        <Leaf size={14} className="text-muted-foreground" />
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-micro text-muted-foreground">NDVI</span>
          <div className="flex-1 h-1.5 bg-muted overflow-hidden">
            <div
              className={cn("h-full transition-all", getNDVIColor(data.ndvi))}
              style={{ width: `${data.ndvi * 100}%` }}
            />
          </div>
        </div>
        <span className="font-mono text-xs tabular-nums w-10 text-right">
          {data.ndvi.toFixed(2)}
        </span>
        <span className="text-[10px] text-muted-foreground w-16 text-right">
          {getNDVILabel(data.ndvi)}
        </span>
      </div>
    </div>
  );
}

export function ClimateDashboard() {
  const alertCount = mockClimateData.filter(
    (d) => d.drought === "warning" || d.drought === "alert"
  ).length;
  const watchCount = mockClimateData.filter((d) => d.drought === "watch").length;

  return (
    <div className="space-y-4 border border-border bg-background p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cloud size={14} className="text-muted-foreground" />
            <h3 className="font-editorial text-base tracking-tight">
              Inteligencia Climatica
            </h3>
          </div>
          <p className="text-micro text-muted-foreground">
            Temperatura, precipitacao, NDVI e seca por UF
          </p>
        </div>
      </div>

      {/* Overall summary */}
      <div className="flex items-center gap-4 border border-border bg-secondary/30 p-3">
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={16}
            className={
              alertCount > 0
                ? "text-destructive"
                : watchCount > 0
                  ? "text-warning"
                  : "text-primary"
            }
          />
          <span className="text-sm text-foreground">
            {alertCount > 0
              ? `${alertCount} estado(s) em alerta`
              : watchCount > 0
                ? `${watchCount} estado(s) em observacao`
                : "Todas as regioes normais"}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 bg-primary" />
            <span className="text-micro text-muted-foreground">Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 bg-warning" />
            <span className="text-micro text-muted-foreground">Obs.</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 bg-destructive" />
            <span className="text-micro text-muted-foreground">Alerta</span>
          </div>
        </div>
      </div>

      {/* State cards grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mockClimateData.map((data) => (
          <ClimateCard key={data.state} data={data} />
        ))}
      </div>
    </div>
  );
}
