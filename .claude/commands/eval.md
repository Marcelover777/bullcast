---
name: eval
description: >
  Executar evaluations da skill atual. Use para testar skills contra seus test cases.
  Le evals.json da skill, executa cada prompt, valida assertions.
allowed-tools:
  - Read
  - Bash
---

# Skill Evaluation Runner

## Workflow
1. Identifique a skill a ser avaliada (pergunte se nao for claro)
2. Leia o arquivo `evals/evals.json` da skill
3. Para cada test case:
   a. Execute o prompt
   b. Verifique cada assertion no `expected_behavior`
   c. Marque PASS ou FAIL com justificativa
4. Calcule pass rate: (passed / total) * 100
5. Gere relatorio:
   - Total de test cases
   - Pass rate %
   - Detalhes de cada FAIL
   - Sugestoes de melhoria se < 95%

## Formato do Relatorio
```
## Eval Results: [skill-name]
- Test Cases: X
- Passed: Y
- Failed: Z
- Pass Rate: XX%

### Failures:
- [eval_name]: [reason]

### Recommendations:
- [suggestions to improve]
```
