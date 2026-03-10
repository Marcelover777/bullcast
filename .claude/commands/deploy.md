---
name: deploy
description: >
  Pipeline completo de deploy com validacao. Use para deploy em staging ou production.
  Executa lint, type-check, testes, build, e deploy com verificacao de saude.
allowed-tools:
  - Bash
  - Read
---

# Deploy Pipeline

## Workflow
1. Confirme o ambiente alvo (staging/production)
2. Execute pre-flight checks:
   ```bash
   npx eslint . --max-warnings 0
   npx tsc --noEmit
   npx vitest run
   ```
3. Se todos passarem, execute build:
   ```bash
   npm run build
   ```
4. Deploy baseado no ambiente:
   - **Staging**: `vercel --env preview`
   - **Production**: `vercel --prod`
5. Verificacao pos-deploy:
   - Health check endpoint
   - Smoke test basico
   - Verificar logs por erros

## Rollback
Se o deploy falhar:
1. `vercel rollback` para reverter
2. Investigar logs
3. Corrigir e re-deploy

## Checklist Pre-Deploy
- [ ] Todos os testes passam
- [ ] Type-check limpo
- [ ] Lint sem warnings
- [ ] Build sem erros
- [ ] Env variables configuradas
- [ ] Migration aplicada (se houver)
