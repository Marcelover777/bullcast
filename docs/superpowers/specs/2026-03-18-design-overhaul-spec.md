# BullCast Design Overhaul v2.0 — Spec

> **Status:** Draft — aguardando aprovação
> **Método:** Asimov Vibe Design + Pipeline Premium v3
> **Referências:** Fey, Robinhood, Wealthsimple, AgridFlow, Linear.app

---

## 1. Problema

O BullCast tem uma base técnica sólida (Next.js 16, React 19, GSAP, Framer Motion, Lenis, Recharts, 54 componentes) mas o design está funcional, não premium. Loading states são texto pulsante, light mode existe no CSS mas nunca é ativado, gráficos são genéricos, micro-interações são escassas, e 3 páginas são stubs.

**O gap:** BullCast funciona como um dashboard, mas não impressiona como Fey ou Robinhood. Seu Antônio (pecuarista 50+) precisa de interfaces claras e legíveis — mas isso não significa feio. Clareza e premium coexistem.

---

## 2. Objetivos

1. **Design System completo** — Dark + Light mode com tokens consistentes
2. **Hero do Sinal redesenhado** — Preço como protagonista cinematográfico
3. **Gráficos premium** — Nível Fey (glow, tooltip glass, animação de entrada)
4. **Skeleton loading** — Eliminar todos os "Carregando..." textuais
5. **Bottom nav animada** — Indicador que desliza entre tabs
6. **Animações consistentes** — PageTransition + ScrollReveal em TODAS as páginas
7. **Páginas completas** — /riscos, /historico, /previsao saem de stubs
8. **Light mode funcional** — Warm cream, legível no sol, connected ao ThemeProvider
9. **Performance** — Lighthouse > 85 Performance, > 90 Accessibility
10. **Acessibilidade** — WCAG AA, reduced-motion, focus states, aria-labels

---

## 3. Escopo

### Incluído
- Todas as 10 fases (P0-P9) do Pipeline Premium
- 5 extrações de Design System de referências
- Refatoração completa de globals.css (light + dark)
- Redesign do hero-price.tsx
- Overhaul de todos os gráficos Recharts
- Novo componente page-skeleton.tsx
- Bottom nav com Framer Motion layoutId
- Integração de componentes 3D órfãos (CattleParticles, GlobeBrazil)
- Completar páginas stub (/riscos, /historico, /previsao)
- Polimento final + Lighthouse audit

### Excluído
- Backend/API changes (Python microservices intocados)
- Novas features de negócio (sem novos dados)
- DataTerrain 3D (muito pesado para mobile, futuro)
- Shopify/e-commerce pipeline (não se aplica)
- Novas dependências pesadas (Three.js já está, não adicionar mais)

---

## 4. Arquitetura de Mudanças

### Camada 1: Foundation (P1)
```
globals.css → Design tokens dark + light completos
tailwind config → Mapeamento de cores semânticas
theme-toggle.tsx → Conectar ao next-themes
```

### Camada 2: Motion (P2)
```
Todas as páginas → PageTransition + ScrollReveal
mercado/page.tsx → Timeline GSAP customizada no hero
```

### Camada 3: Components (P3-P6)
```
hero-price.tsx → Redesign viewport-wide
charts/*.tsx → Premium tooltip + glow + gradient
page-skeleton.tsx → Novo componente com variantes
layout.tsx → Bottom nav com layoutId
```

### Camada 4: Pages (P7-P8)
```
3D components → Integrar CattleParticles + GlobeBrazil
/riscos, /historico, /previsao → Completar
Todas as páginas → Light mode verification
```

### Camada 5: Polish (P9)
```
Consistency pass → tabular-nums, formato BR, aria
Accessibility → Focus states, reduced-motion
Performance → Bundle audit, dynamic imports, Lighthouse
```

---

## 5. Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Light mode quebra componentes existentes | Testar AMBOS os modos após cada prompt |
| GSAP cleanup memory leaks | Usar useGSAP hook com scope em TODOS os efeitos |
| Bundle size explode com 3D | Dynamic import desktop-only, hidden < 768px |
| Contraste WCAG falha no light mode | Verificar ratios antes de commitar paleta |
| Páginas stub complexas demais | Manter escopo mínimo: dados existentes + polish visual |

---

## 6. Critérios de Sucesso

- [ ] `npm run build` sem erros em TODAS as fases
- [ ] ZERO warnings no console (dev mode)
- [ ] Light + Dark mode testados em CADA página
- [ ] Lighthouse Performance > 85, Accessibility > 90 no /mercado
- [ ] WCAG AA em todos os textos (ambos modos)
- [ ] Skeleton loading em TODAS as páginas com fetch
- [ ] Animações respeitam prefers-reduced-motion
- [ ] Three.js SÓ carrega via dynamic import (desktop only)
- [ ] Commits atômicos por fase (conventional commits)
