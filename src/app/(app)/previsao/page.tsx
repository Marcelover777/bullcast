"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Info, Shield, Cpu, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPrevisaoData, type PrevisaoData, type MLPrediction } from "@/lib/data";

type Horizon = 5 | 15 | 30;

const MOCK_PREDICTIONS: MLPrediction[] = [
  { horizon_days: 5, pred_value: 315.80, pred_lower: 312.00, pred_upper: 319.50, confidence: 0.82, model_name: "ensemble", mape: 0.018, directional_accuracy: 0.82, feature_importance: { "spot_lag1": 0.35, "rsi_14": 0.18, "basis": 0.15, "sma_21": 0.12, "volume_b3": 0.10, "usd_brl": 0.10 }, created_at: new Date().toISOString() },
  { horizon_days: 15, pred_value: 318.40, pred_lower: 310.50, pred_upper: 326.00, confidence: 0.74, model_name: "ensemble", mape: 0.026, directional_accuracy: 0.74, feature_importance: { "spot_lag1": 0.28, "seasonal": 0.22, "basis": 0.18, "cycle_phase": 0.15, "rsi_14": 0.10, "climate": 0.07 }, created_at: new Date().toISOString() },
  { horizon_days: 30, pred_value: 316.20, pred_lower: 305.00, pred_upper: 328.00, confidence: 0.63, model_name: "ensemble", mape: 0.037, directional_accuracy: 0.63, feature_importance: { "seasonal": 0.30, "cycle_phase": 0.22, "spot_lag1": 0.15, "export_vol": 0.12, "climate": 0.11, "macro": 0.10 }, created_at: new Date().toISOString() },
];

const directionConfig = {
  ALTA:    { icon: TrendingUp,   color: "text-bull", bg: "bg-bull/10", barBg: "bg-bull" },
  BAIXA:   { icon: TrendingDown, color: "text-bear", bg: "bg-bear/10", barBg: "bg-bear" },
  LATERAL: { icon: Minus,        color: "text-hold", bg: "bg-hold/10", barBg: "bg-hold" },
};

function getDirection(pred: number, current: number): "ALTA" | "BAIXA" | "LATERAL" {
  const diff = ((pred - current) / current) * 100;
  if (diff > 0.5) return "ALTA";
  if (diff < -0.5) return "BAIXA";
  return "LATERAL";
}

function getFactorsFromImportance(fi: Record<string, number> | null): string[] {
  if (!fi || Object.keys(fi).length === 0) {
    return ["Análise sendo processada pelo modelo"];
  }
  const labelMap: Record<string, string> = {
    spot_lag1: "Preço recente da arroba (inércia de mercado)",
    rsi_14: "RSI indicando momentum do preço",
    basis: "Diferença entre futuro B3 e físico (basis)",
    sma_21: "Média móvel 21 dias como suporte/resistência",
    volume_b3: "Volume de contratos na B3",
    usd_brl: "Câmbio USD/BRL afetando exportações",
    seasonal: "Padrão sazonal histórico do período",
    cycle_phase: "Fase do ciclo pecuário (retenção/liquidação)",
    climate: "Condições climáticas e pastagem",
    export_vol: "Volume de exportação de carne bovina",
    macro: "Indicadores macroeconômicos (Selic, IPCA)",
  };
  return Object.entries(fi)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([key, weight]) => {
      const label = labelMap[key] || key;
      return `${label} (peso: ${(weight * 100).toFixed(0)}%)`;
    });
}

export default function PrevisaoPage() {
  const [data, setData] = useState<PrevisaoData>({
    predictions: MOCK_PREDICTIONS,
    currentPrice: 311.45,
    predictionAccuracy: [
      { horizon: 5, accuracy: 82, total: 45 },
      { horizon: 15, accuracy: 74, total: 38 },
      { horizon: 30, accuracy: 68, total: 30 },
    ],
  });
  const [selected, setSelected] = useState<Horizon>(5);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    fetchPrevisaoData()
      .then((d) => {
        if (d.predictions.length > 0) {
          setData(d);
          setUsingMock(false);
          // Seleciona o menor horizonte disponível
          const horizons = d.predictions.map((p) => p.horizon_days).sort((a, b) => a - b);
          if (horizons.length > 0) setSelected(horizons[0] as Horizon);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pred = data.predictions.find((p) => p.horizon_days === selected) || data.predictions[0];
  if (!pred) return null;

  const currentPrice = data.currentPrice || 311.45;
  const direction = getDirection(pred.pred_value, currentPrice);
  const dirConf = directionConfig[direction];
  const DirIcon = dirConf.icon;
  const confidencePct = Math.round(pred.confidence * 100);
  const changePct = ((pred.pred_value - currentPrice) / currentPrice * 100).toFixed(1);
  const factors = getFactorsFromImportance(pred.feature_importance);

  const availableHorizons = data.predictions
    .map((p) => p.horizon_days)
    .sort((a, b) => a - b) as Horizon[];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-primary text-lg">Carregando previsões...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
      {/* Badge mock */}
      {usingMock && (
        <div className="bg-hold/10 border border-hold/20 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-hold font-semibold uppercase tracking-wider">
            Dados demonstrativos — conecte o backend para previsões reais
          </p>
        </div>
      )}

      {/* Título */}
      <div>
        <h1 className="text-display text-xl text-primary">PREVISÃO</h1>
        <p className="text-sm text-muted-foreground mt-1">Projeção do preço da @ (Ensemble: XGBoost + Prophet)</p>
      </div>

      {/* Seletor de horizonte */}
      <div className="flex gap-2">
        {availableHorizons.map((h) => (
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
            <p className={cn("text-display text-xl", dirConf.color)}>{direction}</p>
          </div>
          <span className={cn("ml-auto text-sm font-bold tabular-nums", Number(changePct) >= 0 ? "text-bull" : "text-bear")}>
            {Number(changePct) >= 0 ? "+" : ""}{changePct}%
          </span>
        </div>

        {/* Target */}
        <div className="mb-4">
          <p className="text-label text-[9px] mb-1">PREÇO ALVO</p>
          <p className="text-display text-4xl text-foreground">
            R$ {pred.pred_value.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Faixa: R$ {pred.pred_lower.toFixed(2).replace(".", ",")} — R$ {pred.pred_upper.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Preço atual: R$ {currentPrice.toFixed(2).replace(".", ",")}
          </p>
        </div>

        {/* Confiança */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-label text-[10px]">CONFIANÇA</span>
            <span className={cn("text-sm font-bold tabular-nums", dirConf.color)}>{confidencePct}%</span>
          </div>
          <div className="confidence-bar">
            <div className={cn("confidence-bar-fill", dirConf.barBg)} style={{ width: `${confidencePct}%` }} />
          </div>
        </div>

        {/* Erro do modelo */}
        <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
          <span>MAPE: {(pred.mape * 100).toFixed(1)}%</span>
          <span>Acerto direcional: {(pred.directional_accuracy * 100).toFixed(0)}%</span>
        </div>
      </section>

      {/* Métricas do modelo */}
      <section className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Modelo Ensemble</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <p className="text-[9px] text-muted-foreground uppercase">XGBoost</p>
            <p className="text-sm font-bold text-foreground mt-1">Peso 50%</p>
            <p className="text-[10px] text-muted-foreground">Captura padrões não-lineares</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <p className="text-[9px] text-muted-foreground uppercase">Prophet</p>
            <p className="text-sm font-bold text-foreground mt-1">Peso 30%</p>
            <p className="text-[10px] text-muted-foreground">Sazonalidade + tendência</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Features: preço CEPEA, B3, RSI, MACD, câmbio, clima, sentimento, ciclo pecuário
        </p>
      </section>

      {/* Fatores (Feature Importance) */}
      <section className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">O que sustenta essa previsão</h2>
        </div>
        <ul className="space-y-2.5">
          {factors.map((factor, i) => (
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

      {/* Assertividade histórica */}
      {data.predictionAccuracy.length > 0 && (
        <section className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Assertividade Histórica</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {data.predictionAccuracy.sort((a, b) => a.horizon - b.horizon).map((item) => (
              <div key={item.horizon} className="text-center">
                <p className="text-display text-2xl text-foreground">{item.accuracy}%</p>
                <p className="text-label text-[9px] mt-1">{item.horizon} dias</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.total} previsões</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
        Previsões do ensemble XGBoost (50%) + Prophet (30%) com dados CEPEA, B3, BCB e IBGE.
        <br />Não constitui recomendação de investimento.
      </p>
    </div>
  );
}
