# Prisma — Padrões e Boas Práticas

## Schema Base

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts     Post[]
  profile   Profile?

  @@index([email])
  @@map("users")
}

enum Role {
  USER
  ADMIN
}
```

---

## Padrões de Relação

### 1:N (One-to-Many)
```prisma
model Post {
  id       String @id @default(cuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

### N:M (Many-to-Many) — Explícita
```prisma
model Post {
  tags PostTag[]
}

model Tag {
  posts PostTag[]
}

model PostTag {
  postId    String
  tagId     String
  post      Post   @relation(fields: [postId], references: [id])
  tag       Tag    @relation(fields: [tagId], references: [id])
  createdAt DateTime @default(now())

  @@id([postId, tagId])
}
```

### 1:1 (One-to-One)
```prisma
model User {
  profile Profile?
}

model Profile {
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}
```

---

## Migrations Seguras

### Adicionar coluna NOT NULL em tabela com dados

```sql
-- Step 1: Adicionar nullable
ALTER TABLE "posts" ADD COLUMN "slug" TEXT;

-- Step 2: Backfill (gerar slug a partir do título)
UPDATE "posts" SET "slug" = LOWER(REGEXP_REPLACE("title", '[^a-z0-9]+', '-', 'g'));

-- Step 3: Tornar NOT NULL
ALTER TABLE "posts" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "posts" ADD CONSTRAINT "posts_slug_key" UNIQUE ("slug");
```

Em Prisma, crie 3 migrations separadas para isso.

---

## Row Level Security (Supabase)

```sql
-- Habilitar RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Política de leitura
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

-- Política de inserção
CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política de update/delete
CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Seed Script Padrão

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Upsert para idempotência
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: await hashPassword('admin123'),
      role: 'ADMIN',
    },
  })

  console.log({ admin })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## Performance

- Sempre crie `@@index` em campos de busca frequente e foreign keys
- Use `select` para projeção — nunca retorne tudo em listas
- Use `include` com cuidado — prefer `select` nested
- Para listas grandes: cursor pagination > offset pagination
- Use `$transaction` para operações atômicas
