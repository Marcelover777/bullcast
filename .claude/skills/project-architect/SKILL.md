---
name: project-architect
description: >
  Arquitetura de sistemas, planejamento de tasks e gestao de execucao. Use esta skill
  SEMPRE que o usuario pedir para planejar implementacao, criar roadmap, dividir tarefas,
  arquitetar sistema, ou gerenciar execucao de projeto. Tambem use quando mencionar:
  "arquitetura", "architecture", "system design", "task breakdown", "roadmap", "planejar",
  "plan", "tasks", "milestones", "sprint", "epics", "wave", "fase", "etapa", "ERD",
  "diagrama", "flowchart", "microservices", "monolith", "scaling", "infra", "DDD".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  - WebSearch
---

# Project Architect & Task Management

## Pipeline

### FASE 1 — ARCHITECTURE DECISION
Analise o projeto e defina:

**Padrão arquitetural**
- Monolith-first (Next.js full-stack) — padrao para MVPs
- Modular monolith — quando multiplos dominios claros
- Microservices — apenas se escala exige

**Diagrama de componentes** (gere em ASCII/Mermaid):
```
[Client] → [API Gateway] → [Service A] → [DB]
                         → [Service B] → [Cache]
                         → [Queue] → [Workers]
```

**Decisoes a documentar** (gere `docs/ARCHITECTURE.md`):
- Rendering strategy (SSR/SSG/CSR/RSC)
- Data flow pattern (server-first, client-cache, real-time)
- Auth strategy (JWT, session, OAuth)
- State boundaries (server vs client vs URL)

---

### FASE 2 — TASK BREAKDOWN (Modelo Wave)
Divida o projeto em waves de execucao paralela:

```markdown
## Wave 1 — Foundation (sem dependencias)
- [ ] Setup projeto (Next.js + Tailwind + Prisma)
- [ ] Design tokens + componentes base
- [ ] Schema do banco + seed

## Wave 2 — Core Features (depende da Wave 1)
- [ ] Auth flow completo
- [ ] CRUD principal
- [ ] Layout responsivo

## Wave 3 — Polish (depende da Wave 2)
- [ ] Animacoes + micro-interacoes
- [ ] Testes E2E
- [ ] Performance optimization

## Wave 4 — Ship (depende da Wave 3)
- [ ] CI/CD pipeline
- [ ] Deploy staging → production
- [ ] Monitoring + alertas
```

**Regra**: tasks dentro da mesma wave sao independentes (paralelizaveis).
Tasks entre waves sao sequenciais.

---

### FASE 3 — ATOMIC TASKS
Cada task deve ter:

```markdown
### Task: [Nome descritivo]
- **Files**: [arquivos a criar/modificar]
- **Action**: [passos especificos de implementacao]
- **Verify**: [como testar que esta pronto]
- **Done**: [criterio de aceitacao]
- **Estimate**: S/M/L
```

Regras:
- Cada task = 1 commit atomico
- Cada task = testavel independentemente
- Nenhuma task deve levar mais que 30min de implementacao
- Se uma task e grande, quebre em sub-tasks

---

### FASE 4 — STATE TRACKING
Mantenha `docs/STATE.md` atualizado:

```markdown
# Project State

## Current Wave: 2
## Progress: 8/15 tasks done

## Decisions Made
- [data] Escolhemos Next.js App Router porque...
- [data] Prisma sobre Drizzle porque...

## Blockers
- [descricao] — [plano de acao]

## Next Up
- Task X (in-progress)
- Task Y (next)
```

---

### FASE 5 — SUGGESTIONS ENGINE
Ao revisar o projeto, sempre avalie:

1. **Performance**: N+1 queries? Bundle size? Lazy loading?
2. **Security**: Auth gaps? Input validation? CORS?
3. **UX**: Fluxos confusos? Estados de erro? Loading states?
4. **Code quality**: Duplicacao? Abstractions premature? Types?
5. **Scalability**: Bottlenecks? Single points of failure?

Formato de sugestao:
```
[PRIORITY] [AREA] Descricao
  → Impact: [alto/medio/baixo]
  → Effort: [S/M/L]
  → Suggestion: [acao concreta]
```

---

### FASE 6 — CHECKLIST DE ENTREGA
- [ ] Arquitetura documentada
- [ ] Tasks quebradas em waves
- [ ] Cada task e atomica e testavel
- [ ] State tracking atualizado
- [ ] Sem decisoes pendentes sem justificativa
- [ ] Riscos mapeados com mitigacao
