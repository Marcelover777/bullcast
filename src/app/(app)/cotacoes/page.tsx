"use client";

import { useState, useEffect } from "react";
import { MapPin, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchRegionalData, type CattleCategory } from "@/lib/data";

type Filter = "todos" | "macho" | "femea";

const STATE_OPTIONS = [
  { code: "MT", name: "Mato Grosso" },
  { code: "SP", name: "São Paulo" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "GO", name: "Goiás" },
  { code: "PA", name: "Pará" },
  { code: "MG", name: "Minas Gerais" },
];

function parseCategoryInfo(cat: CattleCategory): { displayName: string; sex: "macho" | "femea"; unit: "/@" | "/cab" } {
  const lower = cat.category.toLowerCase();
  if (lower.includes("boi gordo") || lower.includes("boi")) return { displayName: "Boi Gordo", sex: "macho", unit: "/@" };
  if (lower.includes("vaca gorda") || lower.includes("vaca")) return { displayName: "Vaca Gorda", sex: "femea", unit: "/@" };
  if (lower.includes("novilha")) return { displayName: "Novilha", sex: "femea", unit: "/cab" };
  if (lower.includes("garrote")) return { displayName: "Garrote", sex: "macho", unit: "/cab" };
  if (lower.includes("bezerro")) return { displayName: "Bezerro", sex: "macho", unit: "/cab" };
  if (lower.includes("bezerra")) return { displayName: "Bezerra", sex: "femea", unit: "/cab" };
  return { displayName: cat.category, sex: "macho", unit: "/cab" };
}

function getPrice(cat: CattleCategory, unit: "/@" | "/cab"): number {
  if (unit === "/@" && cat.price_per_kg) return Number(cat.price_per_kg) * 15;
  if (cat.price_per_head) return Number(cat.price_per_head);
  if (cat.price_per_kg) return Number(cat.price_per_kg);
  return 0;
}

function formatPrice(value: number, unit: "/@" | "/cab"): string {
  if (value === 0) return "—";
  return `R$ ${value.toFixed(2).replace(".", ",")}${unit}`;
}

function getWeightRange(cat: CattleCategory): string {
  if (cat.weight_min && cat.weight_max) return `${cat.weight_min}-${cat.weight_max}kg`;
  if (cat.weight_min) return `${cat.weight_min}+ kg`;
  return "";
}

const MOCK_CATEGORIES: CattleCategory[] = [
  { date: new Date().toISOString().slice(0, 10), category: "Bezerro", weight_min: 180, weight_max: 220, price_per_kg: null, price_per_head: 2450, variation_day: 0.032, variation_week: 0.045, state: "MT" },
  { date: new Date().toISOString().slice(0, 10), category: "Bezerra", weight_min: 160, weight_max: 200, price_per_kg: null, price_per_head: 2180, variation_day: 0.028, variation_week: 0.035, state: "MT" },
  { date: new Date().toISOString().slice(0, 10), category: "Garrote", weight_min: 280, weight_max: 350, price_per_kg: null, price_per_head: 3200, variation_day: 0.015, variation_week: 0.022, state: "MT" },
  { date: new Date().toISOString().slice(0, 10), category: "Novilha", weight_min: 250, weight_max: 320, price_per_kg: null, price_per_head: 2850, variation_day: -0.008, variation_week: -0.012, state: "MT" },
  { date: new Date().toISOString().slice(0, 10), category: "Boi Gordo", weight_min: null, weight_max: null, price_per_kg: 20.76, price_per_head: null, variation_day: 0.023, variation_week: 0.032, state: "MT" },
  { date: new Date().toISOString().slice(0, 10), category: "Vaca Gorda", weight_min: null, weight_max: null, price_per_kg: 18.53, price_per_head: null, variation_day: 0.019, variation_week: 0.025, state: "MT" },
];

export default function CotacoesPage() {
  const [categories, setCategories] = useState<CattleCategory[]>(MOCK_CATEGORIES);
  const [selectedState, setSelectedState] = useState("MT");
  const [filter, setFilter] = useState<Filter>("todos");
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchRegionalData(selectedState)
      .then((d) => {
        if (d.length > 0) {
          setCategories(d);
          setUsingMock(false);
        } else {
          setCategories(MOCK_CATEGORIES);
          setUsingMock(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedState]);

  const processed = categories.map((cat) => {
    const info = parseCategoryInfo(cat);
    const price = getPrice(cat, info.unit);
    const variation = Number(cat.variation_day || 0) * 100;
    const variationWeek = Number(cat.variation_week || 0) * 100;
    const weight = getWeightRange(cat);
    return { ...cat, ...info, price, formattedPrice: formatPrice(price, info.unit), variation, variationWeek, weight };
  });

  const filtered = processed.filter((p) => {
    if (filter === "todos") return true;
    return p.sex === filter;
  });

  const selectedStateName = STATE_OPTIONS.find((s) => s.code === selectedState)?.name || selectedState;
  const latestDate = categories[0]?.date;

  return (
    <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
      {/* Badge mock */}
      {usingMock && (
        <div className="bg-hold/10 border border-hold/20 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-hold font-semibold uppercase tracking-wider">
            Dados demonstrativos — preços reais após ativar o backend
          </p>
        </div>
      )}

      {/* Título */}
      <div>
        <h1 className="text-display text-xl text-primary">COTAÇÕES</h1>
        <p className="text-sm text-muted-foreground mt-1">Preços por categoria — {selectedStateName}</p>
      </div>

      {/* State picker */}
      <div className="relative">
        <button
          onClick={() => setShowStatePicker(!showStatePicker)}
          className="w-full flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">{selectedStateName} ({selectedState})</span>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showStatePicker && "rotate-180")} />
        </button>

        {showStatePicker && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg overflow-hidden z-10 shadow-lg">
            {STATE_OPTIONS.map((s) => (
              <button
                key={s.code}
                onClick={() => { setSelectedState(s.code); setShowStatePicker(false); }}
                className={cn(
                  "w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer border-b border-border last:border-0",
                  s.code === selectedState ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-secondary"
                )}
              >
                {s.name} ({s.code})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {([
          { key: "todos", label: "Todos" },
          { key: "macho", label: "Macho ♂" },
          { key: "femea", label: "Fêmea ♀" },
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

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-pulse text-primary">Carregando preços...</div>
        </div>
      )}

      {/* Price cards */}
      {!loading && (
        <section className="space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-card rounded-lg p-6 border border-border text-center">
              <p className="text-sm text-muted-foreground">Sem dados para {selectedStateName} com esse filtro.</p>
            </div>
          ) : (
            filtered.map((item, i) => (
              <div key={i} className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                      item.sex === "macho" ? "bg-blue-500/10 text-blue-400" : "bg-pink-500/10 text-pink-400"
                    )}>
                      {item.sex === "macho" ? "♂" : "♀"}
                    </span>
                    <span className="text-sm font-semibold">{item.displayName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.variation >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-bull" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-bear" />
                    )}
                    <span className={cn("text-xs font-semibold tabular-nums", item.variation >= 0 ? "text-bull" : "text-bear")}>
                      {item.variation >= 0 ? "+" : ""}{item.variation.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold tabular-nums text-foreground">
                    {item.formattedPrice}
                  </span>
                  <div className="text-right">
                    {item.weight && <span className="text-[10px] text-muted-foreground block">{item.weight}</span>}
                    {item.variationWeek !== 0 && (
                      <span className={cn("text-[10px] tabular-nums", item.variationWeek >= 0 ? "text-bull/70" : "text-bear/70")}>
                        Sem: {item.variationWeek >= 0 ? "+" : ""}{item.variationWeek.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
        Preços indicativos — fonte CEPEA. Valores livres de Funrural.
        <br />
        Última atualização: {latestDate ? new Date(latestDate + "T12:00:00").toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR")}
      </p>
    </div>
  );
}
