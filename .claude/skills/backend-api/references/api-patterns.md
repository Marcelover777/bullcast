# Padrões de API — REST e GraphQL

## REST vs GraphQL

| Critério | REST | GraphQL |
|---------|------|---------|
| Overfetching | Comum | Eliminado |
| Underfetching | N+1 possível | Resolvido com queries |
| Caching | HTTP cache nativo | Requer setup adicional |
| Schema | Implícito | Explícito e tipado |
| Curva de aprendizado | Baixa | Média |
| Melhor para | APIs públicas, CRUD simples | Dashboards, apps complexos |

---

## HTTP Status Codes

```
200 OK          — GET, PUT, PATCH bem-sucedidos
201 Created     — POST que criou recurso
204 No Content  — DELETE bem-sucedido
400 Bad Request — Validação falhou, payload inválido
401 Unauthorized — Token ausente ou inválido
403 Forbidden   — Autenticado mas sem permissão
404 Not Found   — Recurso não existe
409 Conflict    — Conflito (ex: email duplicado)
422 Unprocessable — Payload válido mas semanticamente errado
429 Too Many Requests — Rate limit atingido
500 Internal Server Error — Erro não tratado
```

---

## Response Format Padrão

```typescript
// Sucesso
{
  "data": { ... },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 143,
    "totalPages": 8
  }
}

// Erro
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already in use",
    "fields": {
      "email": ["Email already registered"]
    }
  }
}
```

---

## Paginação

```typescript
// Query params padrão
GET /api/posts?page=1&perPage=20&sort=createdAt&order=desc

// Cursor-based (para feeds)
GET /api/posts?cursor=eyJpZCI6MTIzfQ&limit=20
```

---

## Rate Limiting

```typescript
// express-rate-limit
import rateLimit from 'express-rate-limit'

export const publicLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minuto
  max: 100,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many requests' } }
})

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  skipFailedRequests: true
})
```

---

## Middleware Stack (ordem correta)

```typescript
app.use(helmet())           // 1. Security headers
app.use(cors(corsOptions))  // 2. CORS
app.use(publicLimiter)      // 3. Rate limit
app.use(express.json())     // 4. Body parser
app.use(authMiddleware)     // 5. Auth (rotas protegidas)
app.use(validationMiddleware) // 6. Validação
app.use(router)             // 7. Rotas
app.use(errorHandler)       // 8. Error handler (sempre último)
```

---

## Checklist de Segurança

- [ ] Inputs validados com Zod em todos os endpoints
- [ ] SQL via ORM (nunca string concatenation)
- [ ] Senhas hasheadas com bcrypt (cost factor ≥ 12)
- [ ] JWTs assinados com secret forte (≥ 256 bits)
- [ ] CORS configurado com whitelist, não `*`
- [ ] Helmet.js para security headers
- [ ] Rate limiting em auth endpoints (login, register)
- [ ] Dados sensíveis excluídos do response (ex: `password`, `refreshToken`)
- [ ] HTTPS apenas em produção
- [ ] Logs sem dados PII
