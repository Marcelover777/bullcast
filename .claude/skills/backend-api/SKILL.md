---
name: backend-api
description: >
  Design e implementacao de APIs REST e GraphQL com autenticacao. Use esta skill SEMPRE
  que o usuario pedir para criar endpoints, definir rotas, implementar autenticacao,
  criar middlewares, ou desenhar a API de um projeto. Tambem use quando mencionar "API",
  "REST", "GraphQL", "endpoint", "rota", "middleware", "JWT", "OAuth", "autenticacao",
  "auth", "backend", "server", "route handler".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Backend API Design

## Pipeline

### FASE 1 — API DESIGN
Definir recursos e operacoes:
- Plural nouns para recursos (/users, /posts)
- Nested max 2 niveis (/users/:id/posts)
- Query params para filtros (?status=active&page=1)
- Versioning: /api/v1/

### FASE 2 — RESPONSE FORMAT
Success: { data: {...}, meta: { page, perPage, total } }
Error: { error: { code, message, details: [{field, message}] } }

HTTP Status Codes:
- 200 OK, 201 Created, 204 No Content
- 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found
- 422 Unprocessable Entity, 429 Too Many Requests
- 500 Internal Server Error

### FASE 3 — AUTHENTICATION
**JWT + Refresh Tokens:**
- Login → access_token (15min) + refresh_token (7 days)
- API calls → Authorization: Bearer <access_token>
- Token expired → POST /auth/refresh

**OAuth 2.0:** Redirect → Callback → Exchange code → Issue JWT
**Magic Link:** Email token → Verify → Issue JWT

### FASE 4 — MIDDLEWARE STACK
Request → Rate Limit → Auth → Validate → Handler → Serialize → Response
- Rate limiting: 100 req/min unauth, 1000 auth
- Auth: verify JWT, attach user
- Validation: Zod schema
- Error handler: catch all, consistent format

### FASE 5 — SECURITY
- [ ] Input validation (Zod) em todos endpoints
- [ ] SQL injection prevention (ORM)
- [ ] XSS prevention (sanitize output)
- [ ] CORS configurado
- [ ] Rate limiting ativo
- [ ] Helmet headers
- [ ] HTTPS only
