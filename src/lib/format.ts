// Formatting utilities - pt-BR locale, farmer-friendly

/**
 * Format currency in R$ with comma as decimal separator
 * e.g. formatBRL(315.20) => "315,20"
 */
export function formatBRL(value: number, decimals = 2): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format price with R$ prefix
 * e.g. formatPrice(315.20) => "R$ 315,20"
 */
export function formatPrice(value: number, decimals = 2): string {
  return `R$ ${formatBRL(value, decimals)}`;
}

/**
 * Format percentage with sign
 * e.g. formatPercent(1.22) => "+1,22%"
 */
export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

/**
 * Format date in dd/mm/yyyy
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

/**
 * Get greeting based on time of day (farmer wakes at 5am)
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

/**
 * Format confidence as descriptive text
 */
export function formatConfidence(pct: number): string {
  if (pct >= 85) return "Muito Alta";
  if (pct >= 70) return "Alta";
  if (pct >= 55) return "Moderada";
  return "Baixa";
}
