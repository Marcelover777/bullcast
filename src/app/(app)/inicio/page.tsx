import { Suspense } from "react";
import dynamic from "next/dynamic";
import { PageTransition } from "@/components/motion/page-transition";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { AlertBanner } from "@/components/dashboard/alert-banner";
import { HeroPrice } from "@/components/dashboard/hero-price";
import { ProjectionChart } from "@/components/dashboard/projection-chart";
import { getLatestSpotPrice, getLatestSignal } from "@/lib/data";

// ─── Abaixo do fold — lazy load (chunks separados, compila sob demanda) ───
const TechnicalGauges = dynamic(() =>
  import("@/components/dashboard/technical-gauges").then((m) => m.TechnicalGauges)
);
const B3Futures = dynamic(() =>
  import("@/components/dashboard/b3-futures").then((m) => m.B3Futures)
);
const MarginPanel = dynamic(() =>
  import("@/components/dashboard/margin-panel").then((m) => m.MarginPanel)
);
const ForwardCurve = dynamic(() =>
  import("@/components/dashboard/forward-curve").then((m) => m.ForwardCurve)
);
const CycleCard = dynamic(() =>
  import("@/components/dashboard/cycle-card").then((m) => m.CycleCard)
);
const QuotesBlock = dynamic(() =>
  import("@/components/dashboard/quotes-block").then((m) => m.QuotesBlock)
);
const AIFactors = dynamic(() =>
  import("@/components/dashboard/ai-factors").then((m) => m.AIFactors)
);
const SeasonalCalendar = dynamic(() =>
  import("@/components/dashboard/seasonal-calendar").then((m) => m.SeasonalCalendar)
);
const ClimateCard = dynamic(() =>
  import("@/components/dashboard/climate-card").then((m) => m.ClimateCard)
);
const NewsPanel = dynamic(() =>
  import("@/components/dashboard/news-panel").then((m) => m.NewsPanel)
);

// ═══════════════════════════════════════════════════════════════════
// HOME PAGE — PREMIUM DASHBOARD (Server Component com dados reais)
// ═══════════════════════════════════════════════════════════════════
export default async function InicioPage() {
  // Fetch paralelo dos dados reais — fallback automatico se null
  const [spotData, signalData] = await Promise.all([
    getLatestSpotPrice().catch(() => null),
    getLatestSignal().catch(() => null),
  ]);

  return (
    <PageTransition>
      {/* ─── Alert Banner (conditional, top of page) ─── */}
      <AlertBanner />

      {/* ─── Hero: Price + Recommendation + Forecast ─── */}
      <HeroPrice
        price={spotData?.price_per_arroba ?? undefined}
        variationDay={spotData?.variation_day ?? undefined}
        signal={signalData?.signal ?? undefined}
        confidence={signalData?.confidence ?? undefined}
        recommendationText={signalData?.recommendation_text ?? undefined}
      />

      <main className="w-full pb-24">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10">

          {/* ═══ PRIMARY ROW: Chart + B3 Futures ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6">
            {/* Projection Chart — main visual */}
            <ScrollReveal className="lg:col-span-8">
              <ProjectionChart />
            </ScrollReveal>

            {/* B3 Futures — sidebar data */}
            <ScrollReveal delay={0.1} className="lg:col-span-4">
              <B3Futures />
            </ScrollReveal>
          </div>

          {/* ═══ TECHNICAL GAUGES ═══ */}
          <ScrollReveal delay={0.1}>
            <TechnicalGauges className="mt-4" />
          </ScrollReveal>

          {/* ═══ SECOND ROW: Margin + Forward Curve + Cycle ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mt-4">
            <ScrollReveal className="lg:col-span-4">
              <MarginPanel />
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="lg:col-span-5">
              <ForwardCurve />
            </ScrollReveal>

            <ScrollReveal delay={0.15} className="lg:col-span-3">
              <CycleCard />
            </ScrollReveal>
          </div>

          {/* ═══ THIRD ROW: Quotes + AI Factors + Seasonal ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mt-4">
            <ScrollReveal className="lg:col-span-4">
              <QuotesBlock />
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="lg:col-span-4">
              <AIFactors />
            </ScrollReveal>

            <ScrollReveal delay={0.15} className="lg:col-span-4">
              <SeasonalCalendar />
            </ScrollReveal>
          </div>

          {/* ═══ FOURTH ROW: Climate + News ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
            <ScrollReveal className="lg:col-span-7">
              <ClimateCard />
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="lg:col-span-5">
              <NewsPanel />
            </ScrollReveal>
          </div>

        </div>
      </main>
    </PageTransition>
  );
}
