"use client";

import { cn } from "@/lib/utils";

function Bone({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div
      className={cn("bg-muted animate-pulse", className)}
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

interface PageSkeletonProps {
  variant: "mercado" | "cotacoes" | "previsao" | "regional";
}

export function PageSkeleton({ variant }: PageSkeletonProps) {
  switch (variant) {
    case "mercado":
      return <MercadoSkeleton />;
    case "cotacoes":
      return <CotacoesSkeleton />;
    case "previsao":
      return <PrevisaoSkeleton />;
    case "regional":
      return <RegionalSkeleton />;
  }
}

function MercadoSkeleton() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
      {/* Hero price */}
      <div className="space-y-3 py-8">
        <Bone className="h-4 w-24" delay={0} />
        <Bone className="h-14 w-48" delay={50} />
        <div className="flex gap-3 items-center">
          <Bone className="h-8 w-32" delay={100} />
          <Bone className="h-6 w-20" delay={150} />
        </div>
        <Bone className="h-2 w-full" delay={200} />
        <Bone className="h-4 w-3/4" delay={250} />
      </div>

      {/* Quick indicators 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 p-4 border border-border">
            <Bone className="h-3 w-16" delay={300 + i * 50} />
            <Bone className="h-6 w-24" delay={350 + i * 50} />
            <Bone className="h-8 w-full" delay={400 + i * 50} />
          </div>
        ))}
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2 p-4 border border-border">
            <Bone className="h-3 w-20" delay={500 + i * 50} />
            <Bone className="h-24 w-full" delay={550 + i * 50} />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="space-y-2 p-4 border border-border">
        <Bone className="h-3 w-32" delay={600} />
        <Bone className="h-48 w-full" delay={650} />
      </div>

      {/* Climate + Cycle */}
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2 p-4 border border-border">
            <Bone className="h-3 w-20" delay={700 + i * 50} />
            <Bone className="h-16 w-full" delay={750 + i * 50} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CotacoesSkeleton() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <Bone className="h-8 w-40" delay={0} />
      <Bone className="h-4 w-56" delay={50} />

      {/* Filter pills */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <Bone key={i} className="h-9 w-20" delay={100 + i * 50} />
        ))}
      </div>

      {/* Cards */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-border">
          <div className="space-y-1">
            <Bone className="h-4 w-32" delay={200 + i * 50} />
            <Bone className="h-3 w-20" delay={250 + i * 50} />
          </div>
          <div className="text-right space-y-1">
            <Bone className="h-5 w-24" delay={300 + i * 50} />
            <Bone className="h-3 w-16" delay={350 + i * 50} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PrevisaoSkeleton() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
      <Bone className="h-8 w-36" delay={0} />

      {/* Horizon buttons */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <Bone key={i} className="h-12 flex-1" delay={50 + i * 50} />
        ))}
      </div>

      {/* Prediction card */}
      <div className="space-y-3 p-6 border border-border">
        <Bone className="h-4 w-24" delay={200} />
        <Bone className="h-12 w-40" delay={250} />
        <Bone className="h-3 w-56" delay={300} />
        <Bone className="h-48 w-full" delay={350} />
      </div>

      {/* Feature importance */}
      <div className="space-y-2 p-4 border border-border">
        <Bone className="h-4 w-32" delay={400} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Bone className="h-3 w-20" delay={450 + i * 50} />
            <Bone className="h-4 flex-1" delay={500 + i * 50} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RegionalSkeleton() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
      <Bone className="h-8 w-40" delay={0} />

      {/* State picker */}
      <Bone className="h-12 w-full" delay={50} />

      {/* Filter pills */}
      <div className="flex gap-2">
        {[0, 1].map((i) => (
          <Bone key={i} className="h-9 w-24" delay={100 + i * 50} />
        ))}
      </div>

      {/* Price cards */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-border">
          <div className="space-y-1">
            <Bone className="h-4 w-28" delay={200 + i * 50} />
            <Bone className="h-3 w-16" delay={250 + i * 50} />
          </div>
          <Bone className="h-6 w-24" delay={300 + i * 50} />
        </div>
      ))}
    </div>
  );
}
