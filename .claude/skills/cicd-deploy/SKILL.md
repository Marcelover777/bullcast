---
name: cicd-deploy
description: >
  Pipeline de CI/CD com Docker, GitHub Actions e Vercel. Use esta skill SEMPRE que o
  usuario pedir para configurar deploy, criar Dockerfile, configurar CI/CD, ou
  automatizar pipeline. Tambem use quando mencionar "deploy", "Docker", "CI/CD",
  "GitHub Actions", "Vercel", "pipeline", "container", "staging", "production",
  "workflow", "build", "release", "continuous integration", "continuous deployment".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# CI/CD & Deploy

## Pipeline

### FASE 1 — DOCKERFILE
Multi-stage build:
- base: node:20-alpine + copy package.json
- deps: npm ci
- builder: copy source + npm run build
- runner: production minimal image
- EXPOSE 3000, CMD node server.js

Docker Compose (dev): app + db (postgres) + redis (optional)

### FASE 2 — GITHUB ACTIONS
Workflow CI/CD:
- Trigger: push main/develop, PR to main
- Jobs: lint → test → deploy
- lint: eslint + tsc --noEmit
- test: vitest run --coverage
- deploy: vercel-action (only on main)

### FASE 3 — VERCEL CONFIG
- buildCommand, outputDirectory, framework
- Regions otimizadas (gru1 para Brasil)
- Env variables via Vercel UI (@secret syntax)

### FASE 4 — ENVIRONMENT MANAGEMENT
- .env.local (dev, git ignored)
- .env.development (defaults dev)
- .env.production (defaults prod)
- Vercel UI (encrypted secrets)
- GitHub Secrets (CI/CD)

### FASE 5 — PWA CONFIG
- manifest.json com name, icons, display: standalone
- Service worker para offline
- Theme color consistente com brand

### FASE 6 — CHECKLIST PRE-DEPLOY
- [ ] Testes passando
- [ ] Type-check limpo
- [ ] Build sem erros
- [ ] Env variables configuradas
- [ ] Migrations aplicadas
- [ ] Health check endpoint funcional
- [ ] Rollback plan definido
