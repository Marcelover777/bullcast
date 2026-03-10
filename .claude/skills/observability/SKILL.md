---
name: observability
description: >
  Observabilidade com OpenTelemetry e Langfuse. Use esta skill SEMPRE que o usuario
  pedir para configurar monitoring, tracing, logging, alertas, ou dashboards de
  observabilidade. Tambem use quando mencionar "observabilidade", "monitoring",
  "OpenTelemetry", "OTel", "Langfuse", "tracing", "metricas", "logs", "alerting",
  "dashboard", "APM", "error tracking", "performance monitoring".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Observability Stack

## Pipeline

### FASE 1 — PILARES
1. **Traces**: caminho de uma request pelo sistema
2. **Metrics**: contadores, gauges, histogramas
3. **Logs**: eventos discretos com contexto

### FASE 2 — OPENTELEMETRY SETUP
- NodeSDK com auto-instrumentations
- OTLPTraceExporter + OTLPMetricExporter
- PeriodicExportingMetricReader
- Env: OTEL_EXPORTER_OTLP_ENDPOINT

### FASE 3 — LANGFUSE (LLM Observability)
- Langfuse client com publicKey/secretKey
- trace() para rastrear chamadas
- generation() para LLM calls com tokens/custo
- score() para avaliacao de qualidade

### FASE 4 — STRUCTURED LOGGING
- Pino logger com JSON format
- Request ID em todo log
- Log levels: trace, debug, info, warn, error, fatal
- Context propagation via AsyncLocalStorage

### FASE 5 — ALERTING
Regras essenciais:
- Error rate > 5% por 5 min -> P1
- Latency p99 > 3s por 10 min -> P2
- CPU > 80% por 15 min -> P2
- Memory > 90% por 5 min -> P1
- 5xx count > 10 em 1 min -> P1

### FASE 6 — DASHBOARDS
1. Overview: request rate, error rate, latency p50/p95/p99
2. Endpoints: top 10 lentos, top 10 erros
3. Resources: CPU, memory, disk, connections
4. Business: signups, conversions, revenue
5. LLM: token usage, cost, latency, error rate
