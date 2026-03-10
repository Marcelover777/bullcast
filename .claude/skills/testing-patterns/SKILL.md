---
name: testing-patterns
description: >
  Padroes de testes com TDD, Vitest e Playwright. Use esta skill SEMPRE que o usuario
  pedir para criar testes, implementar TDD, fazer testes E2E, configurar test setup,
  ou melhorar coverage. Tambem use quando mencionar "teste", "test", "TDD", "E2E",
  "Playwright", "Vitest", "Jest", "unit test", "integration test", "coverage",
  "mock", "fixture", "assertion", "red-green-refactor".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Testing Patterns

## Pipeline

### FASE 1 — ESTRATEGIA (Piramide)
- Unit: 70% - logica de negocios, hooks, utils
- Integration: 20% - API routes, DB queries
- E2E: 10% - fluxos criticos do usuario

### FASE 2 — UNIT TESTS (Vitest)
- describe/it/expect pattern
- Testing React hooks com renderHook + act
- Mocking com vi.fn() e vi.mock()
- Edge cases e boundary testing

### FASE 3 — INTEGRATION TESTS
- API routes com fetch real
- Database queries com test DB
- Auth flow testing
- Cleanup entre testes

### FASE 4 — E2E TESTS (Playwright)
- Page interactions (fill, click, navigate)
- Assertions (toHaveURL, toContainText, toBeVisible)
- Page Object pattern para reutilizacao
- Fixtures para setup/teardown

### FASE 5 — TDD WORKFLOW
1. RED: Escreva teste que falha
2. GREEN: Minimo de codigo para passar
3. REFACTOR: Melhore mantendo verde
4. Repita

### FASE 6 — MOCKING
- vi.fn() para funcoes
- vi.mock() para modulos
- vi.spyOn() para espionar
- MSW para mock de API
