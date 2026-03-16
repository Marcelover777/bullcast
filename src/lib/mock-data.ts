// Mock data for Cattle Oracle - replaces real API calls during UI development
// All values are realistic for the Brazilian cattle market

export type Recommendation = "COMPRAR" | "VENDER" | "SEGURAR";

export interface DailyRecommendation {
  recommendation: Recommendation;
  confidence: number;
  explanation: string;
  factors: {
    type: "alta" | "baixa";
    text: string;
  }[];
}

export interface PriceData {
  indicator: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "neutral";
  sparkline: number[];
}

export interface ForecastData {
  days: number;
  label: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  sentiment: "positive" | "negative" | "neutral";
  sentimentScore: number;
  isHighImpact: boolean;
  summary: string;
}

export interface MarketSentiment {
  score: number;
  label: string;
  trend: "up" | "down" | "neutral";
}

// ─── Daily Recommendation ────────────────────────────────────────
export const mockRecommendation: DailyRecommendation = {
  recommendation: "VENDER",
  confidence: 87,
  explanation:
    "Preco subiu 3.2% na semana com mercado otimista. Entressafra forte e China comprando. Bom momento pra negociar lotes prontos.",
  factors: [
    { type: "alta", text: "Entressafra forte — oferta baixa" },
    { type: "alta", text: "China aumentou compras em 12%" },
    { type: "alta", text: "Dolar recuou — exportacao mais atrativa" },
    { type: "baixa", text: "SELIC alta — custo do confinamento" },
  ],
};

// ─── Prices ──────────────────────────────────────────────────────
export const mockPrices: PriceData[] = [
  {
    indicator: "boi_gordo",
    label: "Boi Gordo",
    value: 315.2,
    unit: "/@",
    change: 3.8,
    changePercent: 1.22,
    trend: "up",
    sparkline: [305, 307, 308, 310, 311.4, 313, 315.2],
  },
  {
    indicator: "bezerro",
    label: "Bezerro",
    value: 2850,
    unit: "/cab",
    change: 22,
    changePercent: 0.78,
    trend: "up",
    sparkline: [2780, 2800, 2810, 2828, 2835, 2840, 2850],
  },
  {
    indicator: "dolar",
    label: "Dolar",
    value: 5.42,
    unit: "",
    change: -0.016,
    changePercent: -0.29,
    trend: "down",
    sparkline: [5.48, 5.46, 5.45, 5.44, 5.43, 5.42, 5.42],
  },
  {
    indicator: "milho",
    label: "Milho",
    value: 72.5,
    unit: "/sc",
    change: 1.1,
    changePercent: 1.54,
    trend: "up",
    sparkline: [69.8, 70.2, 70.5, 71.0, 71.4, 72.0, 72.5],
  },
];

// ─── Forecasts ───────────────────────────────────────────────────
export const mockForecasts: ForecastData[] = [
  { days: 7, label: "7 dias", value: 318.5, change: 3.3, changePercent: 1.05 },
  { days: 15, label: "15 dias", value: 321.0, change: 5.8, changePercent: 1.84 },
  { days: 30, label: "30 dias", value: 316.8, change: 1.6, changePercent: 0.51 },
];

// ─── Sentiment ───────────────────────────────────────────────────
export const mockSentiment: MarketSentiment = {
  score: 78,
  label: "Otimista",
  trend: "up",
};

// ─── News ────────────────────────────────────────────────────────
export const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "CEPEA confirma alta do boi gordo em Sao Paulo",
    source: "CEPEA/Esalq",
    timeAgo: "2h",
    sentiment: "positive",
    sentimentScore: 0.85,
    isHighImpact: true,
    summary:
      "O indicador do boi gordo CEPEA/B3 registrou alta de 1.2% nesta semana, reflexo da menor oferta de animais prontos para abate.",
  },
  {
    id: "2",
    title: "China aumenta importacoes de carne bovina brasileira",
    source: "Reuters",
    timeAgo: "4h",
    sentiment: "positive",
    sentimentScore: 0.72,
    isHighImpact: true,
    summary:
      "Importacoes chinesas de carne bovina do Brasil cresceram 12% no ultimo mes, impulsionadas pela demanda sazonal.",
  },
  {
    id: "3",
    title: "Confinamento estavel em Mato Grosso",
    source: "IMEA",
    timeAgo: "5h",
    sentiment: "neutral",
    sentimentScore: 0.5,
    isHighImpact: false,
    summary:
      "O numero de animais em confinamento no estado se mantem estavel em relacao ao ano anterior.",
  },
  {
    id: "4",
    title: "SELIC se mantem em 13,75% ao ano",
    source: "BCB",
    timeAgo: "8h",
    sentiment: "negative",
    sentimentScore: 0.3,
    isHighImpact: false,
    summary:
      "Comite do Banco Central decidiu manter a taxa basica de juros, pressionando custo do confinamento e credito rural.",
  },
  {
    id: "5",
    title: "Exportacoes de carne batem recorde em maio",
    source: "SECEX",
    timeAgo: "12h",
    sentiment: "positive",
    sentimentScore: 0.9,
    isHighImpact: true,
    summary:
      "Brasil exportou volume recorde de proteina bovina no mes passado, com destaque para mercado asiatico.",
  },
  {
    id: "6",
    title: "Chuvas atrasam colheita de milho safrinha",
    source: "CONAB",
    timeAgo: "1d",
    sentiment: "negative",
    sentimentScore: 0.25,
    isHighImpact: false,
    summary:
      "Excesso de chuvas em partes de GO e MT pode impactar disponibilidade de milho para racao no segundo semestre.",
  },
];

// ─── Candlestick data (30 days of Boi Gordo) ────────────────────
export const mockCandlestickData = [
  { time: "2026-02-06", open: 298.5, high: 300.2, low: 297.8, close: 299.4 },
  { time: "2026-02-07", open: 299.4, high: 301.0, low: 298.6, close: 300.8 },
  { time: "2026-02-10", open: 300.8, high: 302.5, low: 300.0, close: 301.2 },
  { time: "2026-02-11", open: 301.2, high: 303.0, low: 300.5, close: 302.8 },
  { time: "2026-02-12", open: 302.8, high: 304.1, low: 301.8, close: 303.5 },
  { time: "2026-02-13", open: 303.5, high: 304.8, low: 302.0, close: 302.4 },
  { time: "2026-02-14", open: 302.4, high: 303.5, low: 301.0, close: 303.0 },
  { time: "2026-02-17", open: 303.0, high: 305.2, low: 302.5, close: 304.8 },
  { time: "2026-02-18", open: 304.8, high: 306.0, low: 303.5, close: 305.2 },
  { time: "2026-02-19", open: 305.2, high: 306.5, low: 304.0, close: 304.5 },
  { time: "2026-02-20", open: 304.5, high: 305.8, low: 303.8, close: 305.6 },
  { time: "2026-02-21", open: 305.6, high: 307.0, low: 305.0, close: 306.2 },
  { time: "2026-02-24", open: 306.2, high: 308.0, low: 305.5, close: 307.5 },
  { time: "2026-02-25", open: 307.5, high: 308.8, low: 306.0, close: 306.5 },
  { time: "2026-02-26", open: 306.5, high: 307.5, low: 305.0, close: 307.2 },
  { time: "2026-02-27", open: 307.2, high: 309.0, low: 306.5, close: 308.8 },
  { time: "2026-02-28", open: 308.8, high: 310.0, low: 307.5, close: 309.5 },
  { time: "2026-03-03", open: 309.5, high: 311.2, low: 308.8, close: 310.0 },
  { time: "2026-03-04", open: 310.0, high: 311.8, low: 309.0, close: 311.4 },
  { time: "2026-03-05", open: 311.4, high: 313.0, low: 310.5, close: 312.8 },
  { time: "2026-03-06", open: 312.8, high: 314.5, low: 312.0, close: 313.0 },
  { time: "2026-03-07", open: 313.0, high: 316.0, low: 312.5, close: 315.2 },
];

// ─── Historical area chart data ──────────────────────────────────
export const mockAreaChartData = [
  { date: "06/02", value: 299.4 },
  { date: "07/02", value: 300.8 },
  { date: "10/02", value: 301.2 },
  { date: "11/02", value: 302.8 },
  { date: "12/02", value: 303.5 },
  { date: "13/02", value: 302.4 },
  { date: "14/02", value: 303.0 },
  { date: "17/02", value: 304.8 },
  { date: "18/02", value: 305.2 },
  { date: "19/02", value: 304.5 },
  { date: "20/02", value: 305.6 },
  { date: "21/02", value: 306.2 },
  { date: "24/02", value: 307.5 },
  { date: "25/02", value: 306.5 },
  { date: "26/02", value: 307.2 },
  { date: "27/02", value: 308.8 },
  { date: "28/02", value: 309.5 },
  { date: "03/03", value: 310.0 },
  { date: "04/03", value: 311.4 },
  { date: "05/03", value: 312.8 },
  { date: "06/03", value: 313.0 },
  { date: "07/03", value: 315.2 },
];

// ─── B3 Futures ─────────────────────────────────────────────────
export interface B3Future {
  contract: string;
  month: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
}

export const mockB3Futures: B3Future[] = [
  { contract: "BGIK26", month: "Mai/26", price: 318.50, change: 2.30, changePercent: 0.73, volume: 4521, openInterest: 18200 },
  { contract: "BGIM26", month: "Jun/26", price: 322.00, change: 1.80, changePercent: 0.56, volume: 3890, openInterest: 15400 },
  { contract: "BGIN26", month: "Jul/26", price: 319.80, change: -0.50, changePercent: -0.16, volume: 2100, openInterest: 12300 },
  { contract: "BGIQ26", month: "Ago/26", price: 316.20, change: -1.20, changePercent: -0.38, volume: 1800, openInterest: 9800 },
  { contract: "BGIV26", month: "Out/26", price: 312.50, change: -0.80, changePercent: -0.26, volume: 1200, openInterest: 7500 },
  { contract: "BGIZ26", month: "Dez/26", price: 308.00, change: 0.40, changePercent: 0.13, volume: 890, openInterest: 5200 },
];

// ─── Regional Quotes ────────────────────────────────────────────
export interface RegionalQuote {
  region: string;
  state: string;
  price: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "neutral";
}

export const mockRegionalQuotes: RegionalQuote[] = [
  { region: "Sao Paulo", state: "SP", price: 315.20, change: 3.80, changePercent: 1.22, trend: "up" },
  { region: "Mato Grosso", state: "MT", price: 298.50, change: 2.10, changePercent: 0.71, trend: "up" },
  { region: "Mato Grosso do Sul", state: "MS", price: 305.80, change: -1.20, changePercent: -0.39, trend: "down" },
  { region: "Goias", state: "GO", price: 308.40, change: 1.50, changePercent: 0.49, trend: "up" },
  { region: "Minas Gerais", state: "MG", price: 310.60, change: 0.80, changePercent: 0.26, trend: "up" },
  { region: "Rondonia", state: "RO", price: 285.30, change: -2.40, changePercent: -0.83, trend: "down" },
];

// ─── Seasonal Data ──────────────────────────────────────────────
export interface SeasonalPoint {
  month: string;
  current: number;
  average5y: number;
  previous: number;
}

export const mockSeasonalData: SeasonalPoint[] = [
  { month: "Jan", current: 295.0, average5y: 288.5, previous: 282.0 },
  { month: "Fev", current: 302.0, average5y: 292.0, previous: 287.5 },
  { month: "Mar", current: 315.2, average5y: 298.0, previous: 293.0 },
  { month: "Abr", current: 0, average5y: 305.0, previous: 301.0 },
  { month: "Mai", current: 0, average5y: 312.0, previous: 308.5 },
  { month: "Jun", current: 0, average5y: 318.0, previous: 315.0 },
  { month: "Jul", current: 0, average5y: 315.0, previous: 312.0 },
  { month: "Ago", current: 0, average5y: 308.0, previous: 305.0 },
  { month: "Set", current: 0, average5y: 302.0, previous: 298.0 },
  { month: "Out", current: 0, average5y: 298.0, previous: 295.0 },
  { month: "Nov", current: 0, average5y: 295.0, previous: 290.0 },
  { month: "Dez", current: 0, average5y: 290.0, previous: 285.0 },
];

// ─── Technical Indicators ───────────────────────────────────────
export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: "COMPRA" | "VENDA" | "NEUTRO";
  category: "oscillator" | "moving_average";
}

export const mockTechnicalIndicators: TechnicalIndicator[] = [
  { name: "RSI (14)", value: 62.5, signal: "COMPRA", category: "oscillator" },
  { name: "Stochastic %K", value: 71.3, signal: "COMPRA", category: "oscillator" },
  { name: "CCI (20)", value: 85.4, signal: "COMPRA", category: "oscillator" },
  { name: "MACD", value: 2.15, signal: "COMPRA", category: "oscillator" },
  { name: "Williams %R", value: -28.7, signal: "COMPRA", category: "oscillator" },
  { name: "SMA (20)", value: 308.5, signal: "COMPRA", category: "moving_average" },
  { name: "SMA (50)", value: 304.2, signal: "COMPRA", category: "moving_average" },
  { name: "EMA (20)", value: 310.1, signal: "COMPRA", category: "moving_average" },
  { name: "EMA (50)", value: 305.8, signal: "COMPRA", category: "moving_average" },
  { name: "SMA (200)", value: 295.0, signal: "COMPRA", category: "moving_average" },
];

export const mockTechnicalRating = {
  overall: "COMPRA FORTE" as const,
  oscillators: { buy: 4, sell: 0, neutral: 1 },
  movingAverages: { buy: 5, sell: 0, neutral: 0 },
};

// ─── Basis Data ─────────────────────────────────────────────────
export interface BasisPoint {
  date: string;
  physical: number;
  futures: number;
  basis: number;
}

export const mockBasisData: BasisPoint[] = Array.from({ length: 22 }, (_, i) => {
  const physical = 299.4 + i * 0.72;
  const futures = 301.0 + i * 0.68 + Math.sin(i * 0.5) * 1.5;
  return {
    date: mockAreaChartData[i]?.date ?? `${i}`,
    physical: Number(physical.toFixed(2)),
    futures: Number(futures.toFixed(2)),
    basis: Number((physical - futures).toFixed(2)),
  };
});

// ─── COT Data (Commitments of Traders) ──────────────────────────
export interface COTData {
  week: string;
  hedgersLong: number;
  hedgersShort: number;
  speculatorsLong: number;
  speculatorsShort: number;
  netPosition: number;
}

export const mockCOTData: COTData[] = [
  { week: "S1", hedgersLong: 45200, hedgersShort: 38100, speculatorsLong: 22500, speculatorsShort: 29600, netPosition: -7100 },
  { week: "S2", hedgersLong: 44800, hedgersShort: 39500, speculatorsLong: 24100, speculatorsShort: 29400, netPosition: -5300 },
  { week: "S3", hedgersLong: 46100, hedgersShort: 38800, speculatorsLong: 25800, speculatorsShort: 33100, netPosition: -7300 },
  { week: "S4", hedgersLong: 47500, hedgersShort: 37200, speculatorsLong: 28200, speculatorsShort: 38500, netPosition: -10300 },
  { week: "S5", hedgersLong: 48200, hedgersShort: 36900, speculatorsLong: 30100, speculatorsShort: 41400, netPosition: -11300 },
  { week: "S6", hedgersLong: 49800, hedgersShort: 35500, speculatorsLong: 32400, speculatorsShort: 46700, netPosition: -14300 },
  { week: "S7", hedgersLong: 51200, hedgersShort: 34100, speculatorsLong: 29800, speculatorsShort: 47000, netPosition: -17200 },
  { week: "S8", hedgersLong: 50800, hedgersShort: 35800, speculatorsLong: 27500, speculatorsShort: 42500, netPosition: -15000 },
  { week: "S9", hedgersLong: 49500, hedgersShort: 37200, speculatorsLong: 26800, speculatorsShort: 39100, netPosition: -12300 },
  { week: "S10", hedgersLong: 48900, hedgersShort: 38500, speculatorsLong: 28100, speculatorsShort: 38500, netPosition: -10400 },
  { week: "S11", hedgersLong: 50200, hedgersShort: 37800, speculatorsLong: 30500, speculatorsShort: 42900, netPosition: -12400 },
  { week: "S12", hedgersLong: 51800, hedgersShort: 36500, speculatorsLong: 33200, speculatorsShort: 48500, netPosition: -15300 },
];

// ─── Slaughter Data ─────────────────────────────────────────────
export interface SlaughterData {
  week: string;
  total: number;
  females: number;
  femalePercent: number;
  states: { state: string; total: number }[];
}

export const mockSlaughterData: SlaughterData[] = [
  { week: "S1", total: 785000, females: 298300, femalePercent: 38.0, states: [{ state: "MT", total: 185000 }, { state: "SP", total: 142000 }, { state: "GO", total: 125000 }, { state: "MS", total: 118000 }, { state: "MG", total: 98000 }] },
  { week: "S2", total: 792000, females: 301000, femalePercent: 38.0, states: [{ state: "MT", total: 188000 }, { state: "SP", total: 140000 }, { state: "GO", total: 128000 }, { state: "MS", total: 120000 }, { state: "MG", total: 96000 }] },
  { week: "S3", total: 778000, females: 295600, femalePercent: 38.0, states: [{ state: "MT", total: 182000 }, { state: "SP", total: 145000 }, { state: "GO", total: 122000 }, { state: "MS", total: 115000 }, { state: "MG", total: 100000 }] },
  { week: "S4", total: 801000, females: 308400, femalePercent: 38.5, states: [{ state: "MT", total: 192000 }, { state: "SP", total: 148000 }, { state: "GO", total: 130000 }, { state: "MS", total: 122000 }, { state: "MG", total: 95000 }] },
];

// ─── Climate Data ───────────────────────────────────────────────
export interface ClimateState {
  state: string;
  stateFull: string;
  temperature: number;
  precipitation: number;
  ndvi: number;
  drought: "none" | "watch" | "warning" | "alert";
  condition: "normal" | "seco" | "chuvoso";
}

export const mockClimateData: ClimateState[] = [
  { state: "SP", stateFull: "Sao Paulo", temperature: 28, precipitation: 85, ndvi: 0.72, drought: "none", condition: "normal" },
  { state: "MT", stateFull: "Mato Grosso", temperature: 32, precipitation: 120, ndvi: 0.68, drought: "watch", condition: "seco" },
  { state: "MS", stateFull: "Mato Grosso do Sul", temperature: 30, precipitation: 95, ndvi: 0.71, drought: "none", condition: "normal" },
  { state: "GO", stateFull: "Goias", temperature: 29, precipitation: 75, ndvi: 0.65, drought: "warning", condition: "seco" },
  { state: "MG", stateFull: "Minas Gerais", temperature: 27, precipitation: 110, ndvi: 0.74, drought: "none", condition: "chuvoso" },
];

// ─── Prediction Bands ───────────────────────────────────────────
export interface PredictionPoint {
  date: string;
  predicted: number;
  upper: number;
  lower: number;
  actual?: number;
}

export const mockPredictionBands: PredictionPoint[] = mockAreaChartData.map((d) => ({
  date: d.date,
  predicted: d.value + (Math.random() - 0.5) * 2,
  upper: d.value + 4 + Math.random() * 2,
  lower: d.value - 4 - Math.random() * 2,
  actual: d.value,
}));

// ─── Model Health ───────────────────────────────────────────────
export const mockModelHealth = {
  accuracy7d: 89.2,
  accuracy30d: 85.7,
  driftScore: 0.12,
  status: "healthy" as const,
  topFeatures: [
    { name: "Oferta (abate semanal)", importance: 0.28 },
    { name: "Exportacoes China", importance: 0.22 },
    { name: "Basis B3", importance: 0.18 },
    { name: "Dolar", importance: 0.15 },
    { name: "Clima NDVI", importance: 0.10 },
  ],
  recentAccuracy: [92, 88, 91, 85, 89, 87, 90, 86, 88, 92, 89, 91],
};

// ─── Cycle Data ─────────────────────────────────────────────────
export const mockCycleData = {
  phase: "INICIO DE RETENCAO" as const,
  explanation: "Pecuaristas estao segurando femeas pra reposicao. Menos vaca no abate = oferta menor no curto prazo, preco sobe.",
  femaleSlaughterPercent: 38.0,
  trend: "declining" as "declining" | "rising" | "stable",
  seasonality: "entressafra" as "safra" | "entressafra" | "transicao",
};

// ─── Forward Curve ──────────────────────────────────────────────
export interface ForwardPoint {
  contract: string;
  month: string;
  price: number;
  daysToExpiry: number;
}

export const mockForwardCurve: ForwardPoint[] = [
  { contract: "BGIK26", month: "Mai/26", price: 318.50, daysToExpiry: 52 },
  { contract: "BGIM26", month: "Jun/26", price: 322.00, daysToExpiry: 83 },
  { contract: "BGIN26", month: "Jul/26", price: 319.80, daysToExpiry: 113 },
  { contract: "BGIQ26", month: "Ago/26", price: 316.20, daysToExpiry: 144 },
  { contract: "BGIV26", month: "Out/26", price: 312.50, daysToExpiry: 205 },
  { contract: "BGIZ26", month: "Dez/26", price: 308.00, daysToExpiry: 266 },
];

// ─── Margin Panel Data ──────────────────────────────────────────
export const mockMarginData = {
  futuresPrice: 318.50,
  physicalPrice: 315.20,
  basis: -3.30,
  basisPercent: -1.04,
  dollarRate: 5.42,
  confinementCost: 285.00,
  marginPerHead: 1812.00,
  breakeven: 289.50,
};

// ─── Track Record (Historico) ───────────────────────────────────
export interface PredictionRecord {
  id: string;
  date: string;
  signal: "COMPRAR" | "VENDER" | "SEGURAR";
  predictedPrice: number;
  actualPrice: number;
  correct: boolean;
  diffPercent: number;
  horizon: "7d" | "15d" | "30d";
}

export const mockTrackRecord: PredictionRecord[] = [
  { id: "1", date: "07/03", signal: "VENDER", predictedPrice: 316.0, actualPrice: 315.2, correct: true, diffPercent: 0.25, horizon: "7d" },
  { id: "2", date: "28/02", signal: "COMPRAR", predictedPrice: 312.0, actualPrice: 309.5, correct: true, diffPercent: 0.81, horizon: "7d" },
  { id: "3", date: "21/02", signal: "SEGURAR", predictedPrice: 307.0, actualPrice: 306.2, correct: true, diffPercent: 0.13, horizon: "7d" },
  { id: "4", date: "14/02", signal: "COMPRAR", predictedPrice: 305.0, actualPrice: 303.0, correct: true, diffPercent: 0.66, horizon: "7d" },
  { id: "5", date: "07/02", signal: "COMPRAR", predictedPrice: 302.0, actualPrice: 300.8, correct: true, diffPercent: 0.40, horizon: "7d" },
  { id: "6", date: "31/01", signal: "VENDER", predictedPrice: 298.0, actualPrice: 299.4, correct: false, diffPercent: -0.47, horizon: "7d" },
  { id: "7", date: "24/01", signal: "SEGURAR", predictedPrice: 296.0, actualPrice: 297.5, correct: true, diffPercent: 0.51, horizon: "7d" },
  { id: "8", date: "17/01", signal: "COMPRAR", predictedPrice: 295.0, actualPrice: 296.0, correct: true, diffPercent: 0.34, horizon: "7d" },
  { id: "9", date: "28/02", signal: "COMPRAR", predictedPrice: 318.0, actualPrice: 315.2, correct: true, diffPercent: 0.89, horizon: "15d" },
  { id: "10", date: "14/02", signal: "COMPRAR", predictedPrice: 310.0, actualPrice: 306.2, correct: true, diffPercent: 1.24, horizon: "15d" },
  { id: "11", date: "31/01", signal: "SEGURAR", predictedPrice: 303.0, actualPrice: 303.0, correct: true, diffPercent: 0.00, horizon: "15d" },
  { id: "12", date: "17/01", signal: "COMPRAR", predictedPrice: 300.0, actualPrice: 299.4, correct: true, diffPercent: 0.20, horizon: "15d" },
  { id: "13", date: "21/02", signal: "COMPRAR", predictedPrice: 320.0, actualPrice: 315.2, correct: true, diffPercent: 1.52, horizon: "30d" },
  { id: "14", date: "24/01", signal: "COMPRAR", predictedPrice: 310.0, actualPrice: 306.2, correct: true, diffPercent: 1.24, horizon: "30d" },
  { id: "15", date: "27/12", signal: "SEGURAR", predictedPrice: 295.0, actualPrice: 297.5, correct: true, diffPercent: 0.85, horizon: "30d" },
];

export const mockTrackStats = {
  totalPredictions: 156,
  correctPredictions: 132,
  accuracyPercent: 84.6,
  streak: 7,
  byHorizon: {
    "7d": { total: 82, correct: 72, accuracy: 87.8 },
    "15d": { total: 48, correct: 40, accuracy: 83.3 },
    "30d": { total: 26, correct: 20, accuracy: 76.9 },
  },
};

// ─── Risk Data ──────────────────────────────────────────────────
export const mockRiskData = {
  overallLevel: "medium" as "low" | "medium" | "high",
  volatility: { value: 42, trend: "up" as const },
  crisisKeywords: [
    { keyword: "seca", mentions: 23, trend: "up" as const },
    { keyword: "embargo", mentions: 5, trend: "down" as const },
    { keyword: "aftosa", mentions: 1, trend: "neutral" as const },
    { keyword: "greve", mentions: 8, trend: "up" as const },
  ],
  priceAnomaly: { detected: false, zScore: 1.2 },
  chinaQuota: { used: 78, total: 100, daysRemaining: 45 },
  advice: "Mercado estavel mas fique de olho na seca em GO. Considere travar preco nos futuros de junho pra garantir margem.",
};
