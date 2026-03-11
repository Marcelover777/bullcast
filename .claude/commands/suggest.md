---
name: suggest
description: >
  Analisar projeto atual e sugerir melhorias em performance, seguranca, UX, code quality,
  e escalabilidade. Funciona como um consultor tecnico critico.
allowed-tools:
  - Read
  - Bash
  - Grep
  - WebFetch
---

# Project Suggestions Engine

## Workflow
1. Escaneie o projeto:
   - Estrutura de pastas e arquivos
   - package.json (dependencias, scripts)
   - Configuracoes (tsconfig, eslint, tailwind)
   - Schema do banco (se Prisma)
   - Routes/pages (se Next.js)
   - Componentes principais
2. Analise cada area:

### Performance
- Bundle size (dependencias pesadas desnecessarias?)
- N+1 queries no backend?
- Imagens sem otimizacao?
- Falta de lazy loading?
- Server Components vs Client Components (uso correto?)

### Security
- Auth gaps (rotas desprotegidas?)
- Input validation (Zod em todos os endpoints?)
- Secrets expostos (.env no git?)
- CORS permissivo?
- SQL injection (raw queries?)

### UX
- Loading states em todas as async operations?
- Error states com mensagens uteis?
- Empty states informativos?
- Mobile responsiveness?
- Accessibility (WCAG AA)?

### Code Quality
- Codigo duplicado?
- Abstrações premature?
- TypeScript strict sem any?
- Testes adequados?
- Convencoes consistentes?

### Scalability
- Single points of failure?
- Caching strategy?
- Database indexes?
- Rate limiting?
- Horizontal scaling ready?

3. Gere relatorio ordenado por prioridade:

```
## Suggestions Report

### Critical (fix now)
🔴 [SECURITY] Rota /api/admin sem auth middleware
   → Impact: alto | Effort: S
   → Fix: adicionar middleware authRequired()

### Important (fix soon)
🟡 [PERFORMANCE] Bundle inclui moment.js (300kb)
   → Impact: medio | Effort: S
   → Fix: trocar por date-fns ou dayjs

### Nice-to-have (backlog)
🟢 [UX] Falta empty state na lista de projetos
   → Impact: baixo | Effort: S
   → Fix: componente EmptyState com CTA
```

## Regras
- Seja critico mas construtivo
- Sempre inclua a solucao, nao apenas o problema
- Priorize por risco (security > performance > UX > quality)
- Nao sugira over-engineering
- Adapte ao stage do projeto (MVP vs production)
