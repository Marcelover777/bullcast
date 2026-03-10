---
name: frontend-react
description: >
  Padroes avancados de React 19 com TypeScript. Use esta skill SEMPRE que o usuario
  pedir para criar componentes React, implementar Server Components, usar React Actions,
  otimizar performance React, ou desenvolver frontend com React. Tambem use quando
  mencionar "React", "componente", "hook", "Server Component", "use()", "Suspense",
  "React 19", "Next.js", "Vite", "estado", "zustand", "jotai", "form", "SPA", "SSR".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Frontend React 19 Patterns

## Pipeline

### FASE 1 — ARQUITETURA
1. **Rendering**: CSR, SSR, SSG, ISR, RSC
2. **Router**: Next.js App Router / React Router v7 / TanStack Router
3. **State**: Zustand (global) + React state (local) + URL state
4. **Data fetching**: Server Components / TanStack Query / SWR
5. **Forms**: React Hook Form + Zod validation
6. **Styling**: Tailwind CSS v4

### FASE 2 — REACT 19 PATTERNS

**Server Components (default em Next.js 15+)**
- async/await para data fetching
- Sem useState/useEffect
- Passam dados para Client Components via props

**Client Components ('use client')**
- Interatividade: useState, useEffect, event handlers
- Browser APIs: localStorage, window

**React Actions (form handling)**
- 'use server' para server-side form processing
- FormData nativo
- revalidatePath/revalidateTag para cache

**use() hook**
- Ler Promises e Context em render
- Substitui useContext em muitos casos

**Suspense + Error Boundaries**
- Suspense com fallback para loading
- ErrorBoundary para error states

### FASE 3 — STATE MANAGEMENT
- Local: useState, useReducer
- Server: Server Components, TanStack Query
- Global: Zustand (simples) ou Jotai (atomico)
- URL: useSearchParams, nuqs
- Form: React Hook Form + Zod

### FASE 4 — PERFORMANCE
- React.memo para componentes puros
- useMemo para calculos caros
- useCallback para callbacks estáveis
- React.lazy + Suspense para code splitting
- startTransition para updates nao-urgentes
- TanStack Virtual para listas longas

### FASE 5 — COMPONENT PATTERNS
- Composition over props (children + slots)
- Compound components (Menu.Root + Menu.Item)
- Custom hooks para logica reutilizavel
- Error boundaries para subtrees

### FASE 6 — CHECKLIST
- [ ] TypeScript strict, sem any
- [ ] Server Components onde possivel
- [ ] Client Components apenas quando necessario
- [ ] Loading states com Suspense
- [ ] Error states com Error Boundaries
- [ ] Acessibilidade (keyboard nav, aria-labels)
- [ ] Mobile-first responsive
- [ ] Sem re-renders desnecessarios
