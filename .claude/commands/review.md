---
name: review
description: >
  Code review checklist completo. Use para revisar qualidade do codigo antes de merge.
  Verifica seguranca, performance, tipos, testes e convencoes.
allowed-tools:
  - Read
  - Bash
  - Grep
---

# Code Review Checklist

## Workflow
1. Liste arquivos modificados com `git diff --name-only HEAD~1`
2. Para cada arquivo, verifique:

### Seguranca
- [ ] Sem secrets hardcoded
- [ ] Inputs sanitizados
- [ ] Sem XSS/SQL injection
- [ ] Auth checks em todas as rotas

### TypeScript
- [ ] Strict mode respeitado
- [ ] Sem `any` desnecessario
- [ ] Types/interfaces bem definidos
- [ ] Generics onde aplicavel

### Performance
- [ ] Sem re-renders desnecessarios
- [ ] React.memo onde util
- [ ] Lazy loading de componentes pesados
- [ ] Queries otimizadas (N+1, indexes)

### Testes
- [ ] Unit tests para logica de negocios
- [ ] Integration tests para APIs
- [ ] E2E para fluxos criticos
- [ ] Coverage adequada

### Convencoes
- [ ] Conventional commits
- [ ] Feature branch naming
- [ ] Sem TODO/FIXME esquecidos
- [ ] ESLint/Prettier clean

3. Gere relatorio com items PASS/FAIL
4. Sugira correcoes para items FAIL
