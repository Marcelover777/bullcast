# OpenTelemetry — Guia de Setup

## Instrumentação Node.js/Next.js

### Instalação
```bash
npm install @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions
```

### Arquivo de instrumentação
```typescript
// instrumentation.ts (Next.js) ou tracing.ts (carregado com --require)
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'app-dev',
    [SEMRESATTRS_SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false }, // muito verboso
    }),
  ],
})

sdk.start()
process.on('SIGTERM', () => sdk.shutdown())
```

---

## Langfuse — LLM Observability

### Setup
```bash
npm install langfuse
```

```typescript
// lib/langfuse.ts
import { Langfuse } from 'langfuse'

export const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
  secretKey: process.env.LANGFUSE_SECRET_KEY!,
  baseUrl: process.env.LANGFUSE_BASEURL || 'https://cloud.langfuse.com',
})
```

### Rastreamento de chamadas LLM
```typescript
async function chat(userId: string, message: string) {
  const trace = langfuse.trace({
    name: 'chat-completion',
    userId,
    metadata: { model: 'claude-sonnet-4-6' }
  })

  const generation = trace.generation({
    name: 'claude-response',
    model: 'claude-sonnet-4-6',
    input: [{ role: 'user', content: message }],
  })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    messages: [{ role: 'user', content: message }],
    max_tokens: 1024,
  })

  generation.end({
    output: response.content[0].text,
    usage: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    }
  })

  await langfuse.flushAsync()
  return response
}
```

---

## Alertas — Regras Recomendadas

| Regra | Condição | Severidade | Canal |
|-------|---------|-----------|-------|
| Error rate alto | > 5% por 5min | P1 | PagerDuty |
| Latência p99 alta | > 3s por 10min | P2 | Slack |
| CPU alta | > 80% por 15min | P2 | Slack |
| Memory alta | > 90% por 10min | P1 | PagerDuty |
| DB connections | > 80% do pool | P2 | Slack |
| 5xx rate | > 1% por 1min | P1 | PagerDuty |

---

## Variáveis de Ambiente

```env
OTEL_SERVICE_NAME=app-dev
OTEL_SERVICE_VERSION=1.0.0
OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.example.com
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer <token>

LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASEURL=https://cloud.langfuse.com
```
