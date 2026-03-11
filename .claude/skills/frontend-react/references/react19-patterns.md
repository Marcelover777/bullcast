# React 19 — Padrões Avançados

## Server Components vs Client Components

```
Server Component (padrão em Next.js App Router)
├── Roda no servidor — acesso direto a DB, fs, env vars
├── Zero bundle size no cliente
├── Não pode usar: useState, useEffect, event handlers
└── Ideal para: data fetching, layout, páginas estáticas

Client Component ('use client')
├── Roda no navegador (e no servidor para SSR)
├── Pode usar: hooks, event handlers, browser APIs
└── Ideal para: interatividade, formulários, animações
```

---

## Server Components — Data Fetching

```tsx
// app/products/page.tsx — Server Component
async function ProductsPage() {
  // Fetch direto no servidor — sem useEffect, sem loading state manual
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductList products={products} />
    </Suspense>
  )
}
```

---

## Server Actions

```tsx
// actions/createPost.ts
'use server'

import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(10),
})

export async function createPost(formData: FormData) {
  const result = schema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  })

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  const post = await prisma.post.create({ data: result.data })
  revalidatePath('/posts')
  return { data: post }
}

// Uso no componente
function PostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="content" />
      <button type="submit">Publicar</button>
    </form>
  )
}
```

---

## useOptimistic

```tsx
'use client'

import { useOptimistic } from 'react'

function LikeButton({ post }: { post: Post }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    post.likes,
    (state, increment: number) => state + increment
  )

  async function handleLike() {
    addOptimisticLike(1) // Atualização instantânea na UI
    await likePost(post.id) // Mutation real no servidor
  }

  return (
    <button onClick={handleLike}>
      ❤️ {optimisticLikes}
    </button>
  )
}
```

---

## use() Hook — Suspense com Promises

```tsx
'use client'
import { use, Suspense } from 'react'

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise) // Suspend até resolver

  return <div>{user.name}</div>
}

// Wrapper com Suspense obrigatório
function Page() {
  const userPromise = fetchUser(userId)

  return (
    <Suspense fallback={<Skeleton />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  )
}
```

---

## Patterns de Performance

### Parallel Data Fetching
```tsx
async function Dashboard() {
  // Paralelo — não sequencial
  const [user, stats, notifications] = await Promise.all([
    fetchUser(),
    fetchStats(),
    fetchNotifications(),
  ])

  return <DashboardView user={user} stats={stats} notifications={notifications} />
}
```

### Streaming com Multiple Suspense
```tsx
function Page() {
  return (
    <>
      <Header /> {/* Renderiza imediato */}
      <Suspense fallback={<HeroSkeleton />}>
        <Hero /> {/* Stream quando pronto */}
      </Suspense>
      <Suspense fallback={<ProductsSkeleton />}>
        <Products /> {/* Stream independente */}
      </Suspense>
    </>
  )
}
```
