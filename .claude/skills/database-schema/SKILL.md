---
name: database-schema
description: >
  Design de banco de dados com Prisma ORM e migrations. Use esta skill SEMPRE que o
  usuario pedir para criar schema de banco, definir tabelas, criar migrations, modelar
  dados, ou configurar o banco de dados. Tambem use quando mencionar "database",
  "banco de dados", "schema", "Prisma", "migration", "tabela", "modelo", "relacao",
  "SQL", "PostgreSQL", "Supabase", "RLS", "seed", "index".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Database Schema Design

## Pipeline

### FASE 1 — MODELAGEM
1. Listar entidades do dominio
2. Definir atributos de cada entidade
3. Mapear relacoes (1:1, 1:N, N:M)
4. Identificar constraints (unique, not null, default)
5. Desenhar ERD

### FASE 2 — PRISMA SCHEMA
Padroes:
- cuid() para IDs (melhor que UUID para indexes)
- createdAt + updatedAt em toda tabela
- @@map para nomes snake_case
- Soft delete com deletedAt DateTime?

### FASE 3 — RELACOES
- 1:N: author User @relation(fields: [authorId], references: [id])
- N:M: tabela join com @@id([postId, tagId])
- 1:1: @unique no campo de FK

### FASE 4 — MIGRATIONS
- npx prisma migrate dev --name descricao
- npx prisma migrate deploy (producao)
- npx prisma migrate reset (CUIDADO)

### FASE 5 — INDEXES & PERFORMANCE
- Index em foreign keys (automatico no Prisma)
- Index em campos de busca frequente
- Composite index para queries combinadas
- @@index([field1, field2(sort: Desc)])

### FASE 6 — SEED DATA
- prisma/seed.ts com upsert pattern
- Dados realistas
- Idempotente (rodar N vezes sem duplicar)

### FASE 7 — RLS (Supabase)
- ALTER TABLE ENABLE ROW LEVEL SECURITY
- Policies: SELECT, INSERT, UPDATE, DELETE
- auth.uid() para filtrar por usuario
- Policies por role (admin override)
