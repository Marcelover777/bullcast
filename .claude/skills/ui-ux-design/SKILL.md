---
name: ui-ux-design
description: >
  Design system completo com integracao Figma MCP. Use esta skill SEMPRE que o usuario
  pedir para criar design system, componentes UI, user flows, wireframes, prototipos,
  ou converter designs do Figma para codigo. Tambem use quando mencionar "UI", "UX",
  "design system", "Figma", "componentes", "wireframe", "prototipo", "user flow",
  "acessibilidade", "design tokens", "component library". Extends ui-ux-pro-max skill.
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
Criar tokens completos:
- **Colors**: primary, secondary, accent, neutral, semantic (error, warning, success, info)
- **Typography**: font families, sizes (fluid scale), weights, line-heights
- **Spacing**: 4px/8px base system
- **Borders**: widths, radii, colors
- **Shadows**: sm, md, lg, xl
- **Motion**: durations, easings, transitions
- **Breakpoints**: sm, md, lg, xl

### FASE 4 — COMPONENT LIBRARY
Componentes base (atomicos):
- Button (primary, secondary, ghost, destructive + sizes)
- Input (text, email, password, search + states)
- Select, Checkbox, Radio, Switch, Slider
- Badge, Tag, Avatar, Icon
- Tooltip, Popover, Dialog/Modal

Compostos:
- Card (variants: default, interactive, featured)
- Navigation (top bar, sidebar, bottom nav, breadcrumb)
- Table (sortable, filterable, paginated)
- Form (with validation states)
- Toast/Notification

### FASE 5 — FIGMA MCP WORKFLOW
Se o usuario fornecer um link do Figma:
1. Usar `get_design_context` para extrair design
2. Mapear componentes Figma → componentes do code
3. Extrair tokens (cores, fonts, spacing)
4. Gerar codigo fiel ao design
5. Usar `get_variable_defs` para tokens exatos

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
