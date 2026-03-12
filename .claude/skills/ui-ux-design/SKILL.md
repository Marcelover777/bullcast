---
name: ui-ux-design
description: >
  Design system completo com integracao Figma MCP. Use esta skill SEMPRE que o usuario
  pedir design system, componentes UI, user flows, wireframes, prototipos, ou converter
  designs do Figma para codigo. Tambem use quando mencionar: "UI", "UX", "design system",
  "Figma", "componentes", "wireframe", "prototipo", "user flow", "acessibilidade",
  "design tokens", "component library", "design critique", "audit de UI", "WCAG",
  "contrast", "accessibility", "mini library", "button variants", "input states".
  Use mesmo que o usuario nao mencione Figma — qualquer pedido de componentes UI aciona esta skill.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# UI/UX Design System

## Pipeline

### FASE 1 — DISCOVERY
1. **Objetivo do produto**: qual problema resolve?
2. **Usuarios**: quem sao? (personas)
3. **Plataforma**: web, mobile, PWA, desktop
4. **Referencias visuais**: sites/apps inspiradores
5. **Constraints**: acessibilidade, performance, brand existente

### FASE 2 — USER FLOWS
Mapear fluxos criticos:
- Onboarding (primeiro uso)
- Core loop (acao principal repetida)
- Conversao (compra, signup, etc)
- Recovery (erro, esqueci senha, etc)

Formato: diagrama com decisoes e acoes
```
Start → Login/Signup → Onboarding → Dashboard → [Core Action] → Success
                                                → Error → Recovery → [Core Action]
```

### FASE 3 — DESIGN TOKENS
Criar tokens completos **antes de qualquer componente**:
- **Colors**: primary, secondary, accent, neutral, semantic (error, warning, success, info)
- **Typography**: font families, sizes (fluid scale), weights, line-heights
- **Spacing**: 4px/8px base system
- **Borders**: widths, radii, colors
- **Shadows**: sm, md, lg, xl
- **Motion**: durations, easings, transitions
- **Breakpoints**: sm, md, lg, xl

### FASE 4 — COMPONENT LIBRARY
Componentes base (atomicos):
- Button (primary, secondary, ghost, destructive + sizes + disabled + loading states)
- Input (text, email, password, search + states: default, focus, error, disabled)
- Select, Checkbox, Radio, Switch, Slider
- Badge, Tag, Avatar, Icon
- Tooltip, Popover, Dialog/Modal

Compostos:
- Card (variants: default, interactive, featured)
- Navigation (top bar, sidebar, bottom nav, breadcrumb)
- Table (sortable, filterable, paginated)
- Form (with validation states)
- Toast/Notification

**Regra**: cada componente precisa de minimo 2 variantes e 3 estados (default, hover/focus, disabled).

### FASE 5 — FIGMA MCP WORKFLOW
Se o usuario fornecer um link do Figma:
1. Usar `get_design_context` para extrair design
2. Mapear componentes Figma → componentes do code
3. Extrair tokens (cores, fonts, spacing) com `get_variable_defs`
4. Gerar codigo fiel ao design, preservando espacamentos exatos
5. Registrar mapeamento com `add_code_connect_map` para futuro reuso

### FASE 6 — ACCESSIBILITY AUDIT
Checklist WCAG AA:
- [ ] Contraste minimo 4.5:1 (texto normal) / 3:1 (texto grande)
- [ ] Focus indicators visiveis em TODOS os interativos
- [ ] Alt text em todas as imagens
- [ ] Aria-labels em icones e botoes sem texto
- [ ] Keyboard navigation completa (Tab, Esc, Enter, Space)
- [ ] Skip links no topo da pagina
- [ ] Error messages associadas ao campo (aria-describedby)
- [ ] Reduced motion respeitado
- [ ] Semantic HTML (heading hierarchy, landmarks)

---

## Product Type Intelligence

Antes de criar um design system, identifique o tipo de produto para determinar
os padraoes de componentes e fluxos prioritarios:

### Tipos de produto por categoria

**SaaS / Productivity**
- Prioridade: tabelas, filtros, dashboards, formularios complexos
- Padrao nav: sidebar colapsavel + topbar
- Paleta: light clean ou dark premium, sem distractors
- Font: Inter, DM Sans, Manrope

**E-commerce / Marketplace**
- Prioridade: product cards, search, cart, checkout flow
- Padrao nav: topbar + categorias + busca prominente
- Paleta: brand-led, imagens dominam
- Font: serif para luxo, sans moderna para popular

**Consumer App (mobile-first)**
- Prioridade: bottom navigation, cards de conteudo, onboarding
- Padrao nav: bottom tabs (5 max) + hamburger para secundario
- Paleta: high contrast, pastel, ou dark system
- Font: Rounded (Nunito), ou system font

**Landing Page / Marketing**
- Prioridade: hero, social proof, pricing, CTA
- Padrao: scroll linear, sections tematicas
- Paleta: brand-led, gradientes, impacto
- Font: display para headline, legivel para corpo

**Dashboard / Analytics**
- Prioridade: charts, KPIs, tabelas, filtros de data
- Padrao nav: sidebar com categorias + breadcrumb
- Paleta: dark premium ou zinc claro, accent para dados
- Font: Inter ou IBM Plex (monospace para numeros)

**Portfolio / Creative**
- Prioridade: galeria, case studies, identidade pessoal
- Padrao: scroll imersivo, transicoes de pagina
- Paleta: monochrome + 1 accent OU editorial premium
- Font: display serif + sans minimalista

**Healthcare / Wellness**
- Prioridade: legibilidade, formularios, calendarios, confianca
- Padrao: simple nav, muito whitespace, sem distractors
- Paleta: azul/verde calmo, pasteis, nunca vermelho como accent
- Font: humanista (Nunito, Raleway), nunca geometric frio

---

## Regras de ouro
- **Tokens antes de componentes**: nunca crie um componente sem tokens definidos.
- **Variantes explicitadas**: todo componente precisa de pelo menos 2 variantes e 3 estados.
- **Consistencia acima de criatividade**: tokens garantem consistencia; criatividade fica no layout.
- **Acessibilidade nao e opcional**: WCAG AA e o minimo aceitavel em 2026.
- **Product type first**: o tipo de produto define os padraoes — nao inverta a logica.
- **Consultar ux-guidelines.md**: regras P1-P2 sao obrigatorias, P3-P5 sao qualidade.
