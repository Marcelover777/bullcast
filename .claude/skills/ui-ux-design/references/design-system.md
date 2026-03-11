# Design System — Fundamentos e Figma MCP

## Tokens de Design

### Estrutura de Tokens
```css
/* Camada 1: Primitivos (valores crus) */
--primitive-blue-500: #3b82f6;
--primitive-gray-900: #111827;
--primitive-space-4: 1rem;

/* Camada 2: Semânticos (propósito) */
--color-primary: var(--primitive-blue-500);
--color-text-default: var(--primitive-gray-900);
--spacing-component: var(--primitive-space-4);

/* Camada 3: Componente (específico) */
--button-primary-bg: var(--color-primary);
--button-primary-text: white;
```

---

## Escala Tipográfica

```css
@theme {
  /* Display */
  --text-5xl: 3rem;       /* 48px — hero headlines */
  --text-4xl: 2.25rem;    /* 36px — page titles */
  --text-3xl: 1.875rem;   /* 30px — section titles */

  /* Body */
  --text-xl: 1.25rem;     /* 20px — lead text */
  --text-lg: 1.125rem;    /* 18px — body large */
  --text-base: 1rem;      /* 16px — body default */
  --text-sm: 0.875rem;    /* 14px — captions */
  --text-xs: 0.75rem;     /* 12px — labels */

  /* Line heights */
  --leading-tight: 1.1;   /* Display text */
  --leading-snug: 1.35;   /* Headings */
  --leading-normal: 1.5;  /* Body text */
  --leading-relaxed: 1.7; /* Long form reading */
}
```

---

## Sistema de Espaçamento (base 8px)

```
4px  (0.25rem) → micro gaps, icon padding
8px  (0.5rem)  → tight spacing dentro de componentes
12px (0.75rem) → spacing interno compacto
16px (1rem)    → spacing base, padding padrão
24px (1.5rem)  → spacing entre elementos relacionados
32px (2rem)    → spacing entre seções dentro de componente
48px (3rem)    → spacing entre componentes
64px (4rem)    → spacing entre seções de página
96px (6rem)    → padding de seção grande
128px (8rem)   → spacing hero/full-page sections
```

---

## Figma MCP — Workflow

### Configuração
O Figma MCP permite ao Claude Code acessar designs diretamente do Figma.

```json
// .mcp.json
{
  "figma": {
    "command": "npx",
    "args": ["-y", "figma-developer-mcp", "--stdio"],
    "env": { "FIGMA_API_KEY": "${FIGMA_API_KEY}" }
  }
}
```

### Workflow Figma → Código
1. **Compartilhe o link do Figma** com Claude
2. Claude acessa tokens, componentes e layout automaticamente
3. Código gerado com propriedades exatas do design
4. Validação visual com screenshots do Playwright

---

## Componentes — Variantes e States

### Button
```typescript
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'
type ButtonState = 'default' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading'
```

### Input
```typescript
type InputState = 'default' | 'focused' | 'filled' | 'error' | 'disabled' | 'readonly'
// Cada state: borda, cor de fundo, cor do texto, ícone
```

---

## Acessibilidade — WCAG AA

| Elemento | Requisito |
|----------|----------|
| Texto normal | Contraste 4.5:1 mínimo |
| Texto grande (18px+) | Contraste 3:1 mínimo |
| Componentes UI | Contraste 3:1 mínimo |
| Focus indicator | Visível e com contraste 3:1 |
| Touch targets | Mínimo 44x44px |
| Animações | Respeitar `prefers-reduced-motion` |
