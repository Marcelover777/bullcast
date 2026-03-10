---
name: frontend-react
description: >
  Padroes avancados de React 19 com TypeScript. Use esta skill SEMPRE que o usuario
  pedir para criar componentes React, implementar Server Components, usar React Actions,
  otimizar performance React, ou desenvolver frontend com React ou Next.js.
  Tambem use quando mencionar: "React", "componente", "hook", "Server Component",
  "use()", "Suspense", "React 19", "Next.js", "Vite", "estado", "zustand", "jotai",
  "form", "SPA", "SSR", "RSC", "TanStack", "infinite scroll", "auth flow", "dashboard".
  Use sempre que o contexto for frontend com React — mesmo sem mencionar explicitamente.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Frontend React 19 Patterns

## Pipeline

### FASE 1 — ARQUITETURA
1. **Rendering**: CSR, SSR, SSG, ISR, RSC — escolha explicitamente
2. **Router**: Next.js App Router (padrao) / React Router v7 / TanStack Router
3. **State**: Zustand (global) + React state (local) + URL state (nuqs)
4. **Data fetching**: Server Components > TanStack Query > SWR
5. **Forms**: React Hook Form + Zod validation
6. **Styling**: Tailwind CSS v4

### FASE 2 — REACT 19 PATTERNS

**Server Components (padrao em Next.js 15+)**
- Use por default — sem `use client`, async/await direto no componente
- Data fetching com fetch/Prisma/ORM direto, sem useEffect
- Passam dados como props para Client Components

```tsx
// Server Component (default)
export default async function ProductList() {
  const products = await db.product.findMany()  // direto, sem useEffect
  return <ProductGrid products={products} />
}
```

**Client Components (`use client`)**
- Apenas quando necessario: onClick, useState, useEffect, browser APIs
- Isolar client components no nivel mais baixo possivel

```tsx
'use client'
export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  // ...
}
```

**React Actions (substituem API routes para forms)**
```tsx
// actions.ts
'use server'
export async function createPost(formData: FormData) {
  const data = PostSchema.parse(Object.fromEntries(formData))
  await db.post.create({ data })
  revalidatePath('/posts')
}
```

**use() hook**
- Ler Promises e Context diretamente no render
- `const user = use(UserContext)` — substitui useContext em muitos casos

**Suspense + Error Boundaries**
- Sempre envolva async content com `<Suspense fallback={<Skeleton />}>`
- ErrorBoundary para capturar erros sem crashar a pagina

### FASE 3 — STATE MANAGEMENT
- Local: useState, useReducer
- Server: Server Components + TanStack Query (cache e revalidation)
- Global: Zustand (simples) ou Jotai (atomico, granular)
- URL: useSearchParams + nuqs para estado persistido na URL
- Form: React Hook Form + Zod (validacao no cliente e servidor)

### FASE 4 — PERFORMANCE
- `React.memo` para componentes que recebem mesmas props
- `useMemo` para calculos caros (dependencias estáveis)
- `useCallback` para callbacks passadas como props
- `React.lazy + Suspense` para code splitting de rotas pesadas
- `startTransition` para updates nao-urgentes (filtros, pesquisa)
- `TanStack Virtual` para listas com 100+ items

### FASE 5 — COMPONENT PATTERNS
- **Composition**: `children` e `slots` sobre prop drilling
- **Compound components**: `<Menu.Root>` + `<Menu.Item>` para APIs expressivas
- **Custom hooks**: extraia logica com estado em hooks (`useCart`, `useAuth`)
- **Error boundaries**: proteja subtrees criticas com `<ErrorBoundary>`
- **Colocacao**: mantenha estado perto de onde e usado

### FASE 6 — CHECKLIST
- [ ] TypeScript strict, sem `any` explicito
- [ ] Server Components como default, `use client` apenas quando necessario
- [ ] Suspense boundary em todo conteudo async
- [ ] Error boundary em componentes criticos
- [ ] Zod schema para toda validacao de dados externos
- [ ] Acessibilidade: teclado, aria-labels, focus management
- [ ] Mobile-first responsive com Tailwind breakpoints
- [ ] Sem re-renders desnecessarios (verificar com React DevTools)
