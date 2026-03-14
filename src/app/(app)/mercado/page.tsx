"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/motion/page-transition";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

const SeasonalChart = dynamic(() =>
  import("@/components/indicators/seasonal-chart").then((m) => m.SeasonalChart)
);

const TechnicalRating = dynamic(() =>
  import("@/components/indicators/technical-rating").then((m) => m.TechnicalRating)
);

const BasisChart = dynamic(() =>
  import("@/components/indicators/basis-chart").then((m) => m.BasisChart)
);

const COTPanel = dynamic(() =>
  import("@/components/indicators/cot-panel").then((m) => m.COTPanel)
);

const SlaughterPanel = dynamic(() =>
  import("@/components/indicators/slaughter-panel").then((m) => m.SlaughterPanel)
);

const PredictionPanel = dynamic(() =>
  import("@/components/indicators/prediction-panel").then((m) => m.PredictionPanel)
);

const ModelHealth = dynamic(() =>
  import("@/components/indicators/model-health").then((m) => m.ModelHealth)
);

type TabId =
  | "sazonalidade"
  | "tecnica"
  | "basis-cot"
  | "abates"
  | "previsao"
  | "saude";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "sazonalidade", label: "Sazonalidade" },
  { id: "tecnica", label: "Análise Técnica" },
  { id: "basis-cot", label: "Basis & COT" },
  { id: "abates", label: "Abates" },
  { id: "previsao", label: "Previsão IA" },
  { id: "saude", label: "Saúde do Modelo" },
];

export default function MercadoPage() {
  const [activeTab, setActiveTab] = useState<TabId>("sazonalidade");

  return (
    <PageTransition>
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10 pb-24">
        {/* Page Header */}
        <div className="pt-8 pb-6">
          <h1 className="font-editorial text-4xl md:text-5xl text-foreground leading-tight">
            Mercado
          </h1>
          <p className="font-sans text-muted-foreground mt-2 text-base md:text-lg">
            Análise Técnica e Fundamentos
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-8 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-5 py-3 font-sans text-sm font-medium transition-colors whitespace-nowrap",
                  "focus:outline-none",
                  activeTab === tab.id
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Sazonalidade */}
          {activeTab === "sazonalidade" && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12">
                <ScrollReveal>
                  <SeasonalChart />
                </ScrollReveal>
              </div>
            </div>
          )}

          {/* Análise Técnica */}
          {activeTab === "tecnica" && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12">
                <ScrollReveal>
                  <TechnicalRating />
                </ScrollReveal>
              </div>
            </div>
          )}

          {/* Basis & COT */}
          {activeTab === "basis-cot" && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-7">
                <ScrollReveal>
                  <BasisChart />
                </ScrollReveal>
              </div>
              <div className="col-span-12 lg:col-span-5">
                <ScrollReveal>
                  <COTPanel />
                </ScrollReveal>
              </div>
            </div>
          )}

          {/* Abates */}
          {activeTab === "abates" && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12">
                <ScrollReveal>
                  <SlaughterPanel />
                </ScrollReveal>
              </div>
            </div>
          )}

          {/* Previsão IA */}
          {activeTab === "previsao" && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <ScrollReveal>
                  <PredictionPanel />
                </ScrollReveal>
              </div>
              <div className="col-span-12 lg:col-span-4">
                <ScrollReveal>
                  <ModelHealth />
                </ScrollReveal>
              </div>
            </div>
          )}

          {/* Saúde do Modelo */}
          {activeTab === "saude" && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12">
                <ScrollReveal>
                  <ModelHealth />
                </ScrollReveal>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
