---
name: brief
description: >
  Iniciar briefing estrategico de um novo projeto. Conduz discovery, brainstorm,
  requisitos, e recomendacao de stack antes de qualquer codigo.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  - WebSearch
---

# Project Briefing

## Workflow
1. Ative a skill `briefing-strategy`
2. Execute todas as 5 fases do pipeline em sequencia
3. Gere os seguintes artefatos na pasta `docs/`:
   - `BRIEF.md` — discovery e contexto
   - `REQUIREMENTS.md` — requisitos funcionais e nao-funcionais
4. Apresente a recomendacao de stack ao usuario
5. Aguarde aprovacao antes de sugerir proximos passos
6. Apos aprovacao, sugira usar `/plan` para criar o roadmap

## Regras
- NUNCA pule o discovery — pergunte antes de assumir
- Mantenha o tom colaborativo, nao prescritivo
- Adapte profundidade ao tamanho do projeto (side-project vs enterprise)
- Se o usuario ja tem brief pronto, valide e complemente
