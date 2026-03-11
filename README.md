# App Dev Supreme Template

Template de desenvolvimento supremo para Claude Code e Antigravity. Sistema completo de skills, agentes e automacoes para construir apps e sistemas com inteligencia critica, design premium e qualidade de producao.

## Quick Start

```bash
# 1. Clone o template
git clone <repo-url> my-project
cd my-project

# 2. Configure environment
cp .env.example .env.local
# Edite .env.local com suas chaves

# 3. Inicie o Claude Code
claude

# 4. Comece com um briefing
/brief
```

## Como Funciona

Este template transforma o Claude Code em um agente de desenvolvimento completo com **11 skills especializadas**, **7 slash commands**, e **5 hooks de seguranca** que se ativam automaticamente.

### Skills se ativam sozinhas

Voce nao precisa invocar skills manualmente. Basta descrever o que precisa e a skill correta ativa automaticamente:

| Voce diz... | Skill ativada |
|---|---|
| "Quero criar um novo app" | `briefing-strategy` |
| "Planeja a arquitetura" | `project-architect` |
| "Cria um componente React" | `frontend-react` |
| "Faz uma landing page bonita" | `vibe-design` + `frontend-react` |
| "Cria a API de autenticacao" | `backend-api` |
| "Modela o banco de dados" | `database-schema` |
| "Escreve testes pro modulo X" | `testing-patterns` |
| "Configura o deploy" | `cicd-deploy` |
| "Configura monitoring" | `observability` |
| "Design system completo" | `ui-ux-design` |
| "Estrategia de marketing" | `marketing-growth` |

### Hooks de seguranca automaticos

| Protecao | O que faz |
|---|---|
| Branch protection | Bloqueia edits direto na main/master |
| Secret detection | Bloqueia escrita em .env, .key, .pem |
| Auto-format | Prettier roda apos cada edit em TS/JS/CSS/HTML/MD |
| Auto-lint | ESLint roda apos cada edit em TS/JS |
| Stop validation | Type-check + testes rodam ao final de cada task |

---

## Slash Commands

### `/brief` — Briefing de Projeto
Ponto de partida para qualquer novo projeto. Conduz:
1. Discovery (10 perguntas essenciais)
2. Brainstorm estruturado (3 abordagens com trade-offs)
3. Geracao de requisitos (REQUIREMENTS.md)
4. Recomendacao de stack (tabela justificada)

```
/brief
> "Quero criar um marketplace de freelancers focado em designers"
```

### `/plan` — Planejamento de Implementacao
Cria roadmap executavel apos o briefing:
1. Decisao arquitetural documentada
2. Tasks quebradas em waves (paralelas/sequenciais)
3. Cada task e atomica (< 30min, 1 commit)
4. State tracking para acompanhar progresso

```
/plan
```

### `/suggest` — Sugestoes de Melhoria
Analisa o projeto atual como um consultor critico:
- Performance (bundle size, N+1 queries, lazy loading)
- Security (auth gaps, input validation, CORS)
- UX (loading states, error states, mobile)
- Code quality (duplicacao, types, testes)
- Scalability (bottlenecks, caching, indexes)

```
/suggest
```

### `/review` — Code Review
Checklist completo antes de merge:
- Seguranca, TypeScript, performance, testes, convencoes

```
/review
```

### `/commit` — Conventional Commit
Analisa o diff staged e gera commit semantico automaticamente.

```
/commit
```

### `/deploy` — Deploy Pipeline
Pipeline completo: lint → type-check → test → build → deploy → health check.

```
/deploy
```

### `/eval` — Avaliar Skills
Roda test cases contra uma skill especifica para validar qualidade.

```
/eval
```

---

## Skills em Detalhe

### `briefing-strategy`
**Quando**: Inicio de qualquer projeto novo
**Pipeline**: Discovery → Brainstorm → Requirements → Stack → Validacao
**Gera**: `docs/BRIEF.md`, `docs/REQUIREMENTS.md`

### `project-architect`
**Quando**: Planejar implementacao e arquitetura
**Pipeline**: Architecture Decision → Wave Breakdown → Atomic Tasks → State Tracking → Suggestions
**Gera**: `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/STATE.md`

### `vibe-design`
**Quando**: QUALQUER output visual (HTML/CSS/JS)
**Pipeline**: Curacao → Design Tokens → HTML Semantico → Estilizacao → Animacoes GSAP → Validacao
**Estilos**: minimalista, brutalist, glassmorphism, neon, editorial, organico
**Regra**: NUNCA gere HTML/CSS sem passar por este pipeline

### `ui-ux-design`
**Quando**: Design systems, componentes, Figma
**Pipeline**: Discovery → User Flows → Design Tokens → Component Library → Figma MCP → Accessibility Audit

### `frontend-react`
**Quando**: Desenvolvimento React/Next.js
**Pipeline**: Arquitetura → React 19 Patterns → State → Performance → Components → Checklist

### `backend-api`
**Quando**: APIs REST/GraphQL
**Pipeline**: API Design → Response Format → Auth → Middleware → Security

### `database-schema`
**Quando**: Modelagem de dados
**Pipeline**: Modelagem → Prisma Schema → Relacoes → Migrations → Indexes → Seed → RLS

### `testing-patterns`
**Quando**: Testes e TDD
**Pipeline**: Estrategia (piramide) → Unit → Integration → E2E → TDD → Mocking

### `cicd-deploy`
**Quando**: Deploy e CI/CD
**Pipeline**: Dockerfile → GitHub Actions → Vercel → Env Management → PWA → Checklist

### `observability`
**Quando**: Monitoring e tracing
**Pipeline**: Pilares → OpenTelemetry → Langfuse → Structured Logging → Alerting → Dashboards

### `marketing-growth`
**Quando**: Marketing e growth
**Pipeline**: Product-Market Context → CRO → SEO → Analytics → Growth Loops → Launch

---

## Integracoes Configuradas

### Langfuse (LLM Observability)
Rastreia chamadas LLM com custos, latencia e qualidade.
```env
LANGFUSE_SECRET_KEY=sk-lf-xxx
LANGFUSE_PUBLIC_KEY=pk-lf-xxx
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

### Phoenix Arize (ML Observability)
Monitoring de modelos ML em producao.
```env
PHOENIX_API_KEY=your-key
PHOENIX_BASE_URL=https://app.phoenix.arize.com
```

### Pinecone (Vector DB)
Busca semantica e pipelines RAG.
```env
PINECONE_API_KEY=pcsk_xxx
PINECONE_ENVIRONMENT=us-east-1
```

### PostHog (Product Analytics)
Event tracking, funnels, feature flags.
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Firecrawl (Web Scraping MCP)
Pesquisa web durante desenvolvimento via MCP.
Configurado em `.mcp.json`.

### GSAP (Animations)
ScrollTrigger e micro-interacoes premium.
Usado automaticamente pela skill `vibe-design`.

---

## Workflow Recomendado

```
Novo Projeto:
  /brief → /plan → [desenvolve] → /review → /commit → /deploy

Projeto Existente:
  /suggest → [implementa melhorias] → /review → /commit → /deploy

Feature Nova:
  descreva a feature → [skills ativam automaticamente] → /review → /commit

Design/Landing Page:
  descreva a vibe → vibe-design ativa → 6 fases do pipeline → output premium
```

---

## Estrutura do Template

```
.claude/
├── settings.json          # Hooks de seguranca e formatacao
├── commands/
│   ├── brief.md           # /brief — Project discovery
│   ├── plan.md            # /plan — Implementation planning
│   ├── suggest.md         # /suggest — Project improvements
│   ├── commit.md          # /commit — Conventional commits
│   ├── deploy.md          # /deploy — Deploy pipeline
│   ├── review.md          # /review — Code review
│   └── eval.md            # /eval — Skill evaluation
└── skills/
    ├── briefing-strategy/  # Discovery & brainstorm
    ├── project-architect/  # Architecture & task management
    ├── marketing-growth/   # Marketing & growth engineering
    ├── vibe-design/        # Premium web design (Awwwards-level)
    ├── ui-ux-design/       # Design systems & Figma
    ├── frontend-react/     # React 19 patterns
    ├── backend-api/        # REST/GraphQL APIs
    ├── database-schema/    # Prisma ORM & migrations
    ├── testing-patterns/   # TDD, Vitest, Playwright
    ├── cicd-deploy/        # Docker, GitHub Actions, Vercel
    └── observability/      # OpenTelemetry, Langfuse

.github/workflows/
├── claude.yml              # Claude Code interativo (issues/PRs)
└── claude-code-review.yml  # Review automatico de PRs
```

---

## Usando com Antigravity

O template funciona automaticamente com Antigravity (Claude Code na web). As skills e commands sao detectados pela estrutura de pastas `.claude/skills/` e `.claude/commands/`.

Para ativar tudo:
1. Abra o repo no Antigravity
2. O CLAUDE.md sera lido automaticamente
3. Skills ativam por contexto — basta descrever o que precisa
4. Use `/brief` para comecar um projeto do zero

---

## License

MIT
