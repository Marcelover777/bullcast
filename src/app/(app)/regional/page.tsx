"use client";

import { useState } from "react";
import { MapPin, TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = "todos" | "macho" | "femea";

const regions = [
  { name: "Nova Ubiratã", state: "MT" },
  { name: "Sorriso", state: "MT" },
  { name: "Lucas do Rio Verde", state: "MT" },
  { name: "Sinop", state: "MT" },
];

const prices = [
  { category: "Bezerro(a)", sex: "macho", weight: "180-220kg", price: 2450, change: 3.2, region: "Nova Ubiratã" },
  { category: "Bezerro(a)", sex: "femea", weight: "160-200kg", price: 2180, change: 2.8, region: "Nova Ubiratã" },
  { category: "Garrote/Novilha", sex: "macho", weight: "280-350kg", price: 3200, change: 1.5, region: "Nova Ubiratã" },
  { category: "Garrote/Novilha", sex: "femea", weight: "250-320kg", price: 2850, change: -0.8, region: "Nova Ubiratã" },
  { category: "Boi Gordo", sex: "macho", weight: "18+ @", price: 311, change: 2.3, region: "Nova Ubiratã" },
  { category: "Vaca Gorda", sex: "femea", weight: "15+ @", price: 278, change: 1.9, region: "Nova Ubiratã" },

  { category: "Bezerro(a)", sex: "macho", weight: "180-220kg", price: 2520, change: 4.1, region: "Sorriso" },
  { category: "Bezerro(a)", sex: "femea", weight: "160-200kg", price: 2220, change: 3.5, region: "Sorriso" },
  { category: "Garrote/Novilha", sex: "macho", weight: "280-350kg", price: 3150, change: 0.9, region: "Sorriso" },
  { category: "Garrote/Novilha", sex: "femea", weight: "250-320kg", price: 2780, change: -1.2, region: "Sorriso" },
  { category: "Boi Gordo", sex: "macho", weight: "18+ @", price: 308, change: 1.8, region: "Sorriso" },
  { category: "Vaca Gorda", sex: "femea", weight: "15+ @", price: 274, change: 1.2, region: "Sorriso" },

  { category: "Bezerro(a)", sex: "macho", weight: "180-220kg", price: 2480, change: 3.0, region: "Lucas do Rio Verde" },
  { category: "Bezerro(a)", sex: "femea", weight: "160-200kg", price: 2150, change: 2.1, region: "Lucas do Rio Verde" },
  { category: "Garrote/Novilha", sex: "macho", weight: "280-350kg", price: 3100, change: 0.5, region: "Lucas do Rio Verde" },
  { category: "Garrote/Novilha", sex: "femea", weight: "250-320kg", price: 2800, change: -0.3, region: "Lucas do Rio Verde" },
  { category: "Boi Gordo", sex: "macho", weight: "18+ @", price: 306, change: 1.5, region: "Lucas do Rio Verde" },
  { category: "Vaca Gorda", sex: "femea", weight: "15+ @", price: 271, change: 0.8, region: "Lucas do Rio Verde" },

  { category: "Bezerro(a)", sex: "macho", weight: "180-220kg", price: 2460, change: 2.7, region: "Sinop" },
  { category: "Bezerro(a)", sex: "femea", weight: "160-200kg", price: 2170, change: 2.4, region: "Sinop" },
  { category: "Garrote/Novilha", sex: "macho", weight: "280-350kg", price: 3080, change: 0.2, region: "Sinop" },
  { category: "Garrote/Novilha", sex: "femea", weight: "250-320kg", price: 2750, change: -1.5, region: "Sinop" },
  { category: "Boi Gordo", sex: "macho", weight: "18+ @", price: 304, change: 1.0, region: "Sinop" },
  { category: "Vaca Gorda", sex: "femea", weight: "15+ @", price: 268, change: 0.5, region: "Sinop" },

];
export default function RegionalPage() {
  const [selectedRegion, setSelectedRegion] = useState("Nova Ubiratã");
  const [filter, setFilter] = useState<Category>("todos");
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const filtered = prices
    .filter((p) => p.region === selectedRegion)
    .filter((p) => filter === "todos" || p.sex === filter);

  const formatPrice = (val: number, cat: string) => {
    if (cat.includes("Boi") || cat.includes("Vaca")) {
      return `R$ ${val.toFixed(2).replace(".", ",")}/@`;
    }
    return `R$ ${val.toLocaleString("pt-BR")}/cab`;
  };

  return (
    <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
      {/* Título + Seletor de região */}
      <div>
        <h1 className="text-display text-xl text-primary">REGIONAL</h1>
        <p className="text-sm text-muted-foreground mt-1">Preços por categoria — Mato Grosso</p>
      </div>

      {/* Region picker */}
      <div className="relative">
        <button
          onClick={() => setShowRegionPicker(!showRegionPicker)}
          className="w-full flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">{selectedRegion}, MT</span>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showRegionPicker && "rotate-180")} />
        </button>

        {showRegionPicker && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg overflow-hidden z-10 shadow-lg">
            {regions.map((r) => (
              <button
                key={r.name}
                onClick={() => { setSelectedRegion(r.name); setShowRegionPicker(false); }}
                className={cn(
                  "w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer border-b border-border last:border-0",
                  r.name === selectedRegion ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-secondary"
                )}
              >
                {r.name}, {r.state}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Filter pills */}
      <div className="flex gap-2">
        {([
          { key: "todos", label: "Todos" },
          { key: "macho", label: "Macho" },
          { key: "femea", label: "Fêmea" },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Price table */}
      <section className="space-y-2">
        {filtered.map((item, i) => (
          <div key={i} className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                  item.sex === "macho" ? "bg-blue-500/10 text-blue-400" : "bg-pink-500/10 text-pink-400"
                )}>
                  {item.sex === "macho" ? "♂" : "♀"}
                </span>
                <span className="text-sm font-semibold">{item.category}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.change >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-bull" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-bear" />
                )}
                <span className={cn("text-xs font-semibold tabular-nums", item.change >= 0 ? "text-bull" : "text-bear")}>
                  {item.change >= 0 ? "+" : ""}{item.change}%
                </span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold tabular-nums text-foreground">
                {formatPrice(item.price, item.category)}
              </span>
              <span className="text-[10px] text-muted-foreground">{item.weight}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
        Preços indicativos da região. Valores livres de Funrural.
        Última atualização: {new Date().toLocaleDateString("pt-BR")}
      </p>
    </div>
  );
}
