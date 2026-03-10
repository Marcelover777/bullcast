---
name: commit
description: >
  Gerar conventional commit com mensagem semantica. Use sempre que for fazer commit.
  Analisa o diff staged, classifica o tipo (feat/fix/chore/docs/refactor/style),
  gera mensagem descritiva seguindo Conventional Commits spec.
allowed-tools:
  - Bash
---

# Conventional Commit

## Workflow
1. Execute `git diff --staged --stat` para ver arquivos modificados
2. Execute `git diff --staged` para ver as mudancas detalhadas
3. Classifique o tipo de mudanca:
   - `feat`: nova funcionalidade
   - `fix`: correcao de bug
   - `chore`: manutencao, configs
   - `docs`: documentacao
   - `refactor`: refatoracao sem mudanca de comportamento
   - `style`: formatacao, whitespace
   - `test`: adicao/correcao de testes
   - `ci`: mudancas em CI/CD
4. Identifique o escopo (componente/area afetada)
5. Escreva mensagem no formato: `type(scope): descricao concisa`
6. Se necessario, adicione body com detalhes
7. Execute o commit

## Regras
- Mensagem em ingles
- Primeira linha max 72 caracteres
- Imperativo: "add" nao "added"
- Sem ponto final na primeira linha
- Body separado por linha em branco
