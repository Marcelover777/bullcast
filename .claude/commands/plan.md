---
name: plan
description: >
  Criar plano de implementacao com arquitetura, task breakdown em waves, e tracking.
  Use apos o /brief ou quando o usuario quiser planejar a execucao de um projeto.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Implementation Planning

## Workflow
1. Ative a skill `project-architect`
2. Leia `docs/BRIEF.md` e `docs/REQUIREMENTS.md` se existirem
3. Execute as fases do pipeline:
   a. Defina arquitetura e documente em `docs/ARCHITECTURE.md`
   b. Quebre em waves com tasks atomicas em `docs/ROADMAP.md`
   c. Inicialize `docs/STATE.md` com estado atual
4. Apresente o plano ao usuario para aprovacao
5. Apos aprovacao, comece execucao pela Wave 1

## Formato das Tasks
Cada task deve seguir:
```
### [Wave].[Number] — [Nome]
- Files: [lista de arquivos]
- Action: [passos claros]
- Verify: [como testar]
- Done: [criterio]
- Size: S/M/L
```

## Regras
- Tasks na mesma wave = independentes (paralelizaveis)
- Tasks entre waves = sequenciais (dependencias)
- Nenhuma task > 30min de implementacao
- Cada task = 1 commit atomico
- Atualize STATE.md ao completar cada task
