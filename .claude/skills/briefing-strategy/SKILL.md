---
name: briefing-strategy
description: >
  Briefing estrategico, brainstorming e discovery de projetos. Use esta skill SEMPRE que
  o usuario iniciar um novo projeto, pedir briefing, discovery, brainstorming, analise de
  requisitos, ou quiser entender o escopo antes de codar. Tambem use quando mencionar:
  "briefing", "brief", "discovery", "brainstorm", "requisitos", "escopo", "MVP", "PRD",
  "product requirements", "stakeholders", "personas", "user stories", "ideacao",
  "viabilidade", "novo projeto", "comecar projeto", "planejar", "strategy".
  Esta skill e o PONTO DE PARTIDA de qualquer projeto novo.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  - WebSearch
---

# Briefing & Strategy Framework

## Pipeline obrigatorio

### FASE 1 — DISCOVERY (entender antes de fazer)
Pergunte e documente (crie `docs/BRIEF.md`):

**Visao**
1. Qual problema este projeto resolve?
2. Para quem? (publico-alvo primario e secundario)
3. Qual o diferencial vs alternativas existentes?
4. Qual o resultado de sucesso em 30/90 dias?

**Contexto**
5. Existe codebase/design/branding existente?
6. Stack preferida ou aberta?
7. Integrações obrigatorias (APIs, serviços)?
8. Budget/timeline constraints?

**Prioridades**
9. Top 3 funcionalidades essenciais (must-have)
10. Nice-to-haves que podem esperar

---

### FASE 2 — BRAINSTORM ESTRUTURADO
Gere e apresente ao usuario:

1. **3 abordagens tecnicas** (de simples a sofisticada) com trade-offs
2. **Competitive landscape**: 3-5 produtos similares com pontos fortes/fracos
3. **Riscos tecnicos**: identifique 3 riscos e mitigacoes
4. **Quick wins**: o que pode ser entregue em 1-2 dias com alto impacto

Formato: tabela comparativa com colunas [Opcao | Complexidade | Tempo | Trade-off]

---

### FASE 3 — REQUIREMENTS DOC
Gere `docs/REQUIREMENTS.md`:

```markdown
# [Nome do Projeto] — Requirements

## Problem Statement
[Uma frase]

## Target Users
- Persona 1: [nome, role, pain point]
- Persona 2: [nome, role, pain point]

## Core Features (MVP)
1. [Feature] — [criterio de aceitacao]
2. [Feature] — [criterio de aceitacao]
3. [Feature] — [criterio de aceitacao]

## Non-Functional Requirements
- Performance: [target]
- Security: [requirements]
- Accessibility: WCAG AA
- Platform: [web/mobile/PWA]

## Out of Scope (v1)
- [Item]

## Success Metrics
- [KPI 1]
- [KPI 2]
```

---

### FASE 4 — TECH STACK RECOMMENDATION
Baseado no brief, recomende stack com justificativa:

| Layer | Recomendacao | Alternativa | Justificativa |
|-------|-------------|-------------|---------------|
| Frontend | ... | ... | ... |
| Backend | ... | ... | ... |
| Database | ... | ... | ... |
| Auth | ... | ... | ... |
| Deploy | ... | ... | ... |
| Analytics | ... | ... | ... |

---

### FASE 5 — VALIDACAO COM USUARIO
Antes de prosseguir:
- [ ] Visao alinhada
- [ ] Requisitos aprovados
- [ ] Stack aceita
- [ ] Prioridades claras
- [ ] Constraints entendidos

Somente apos aprovacao, inicie o desenvolvimento.

---

## Anti-padroes
- Comecar a codar sem brief
- Assumir requisitos sem perguntar
- Propor stack sem justificar
- Ignorar constraints de budget/timeline
- Briefing generico sem personalizacao ao projeto
