---
name: vibe-design
description: >
  Framework de design premium para interfaces web de nivel Awwwards.
  Use esta skill SEMPRE que o usuario pedir qualquer coisa com HTML/CSS/JS visual:
  site, landing page, pagina de produto, portfolio, banner, componente, dashboard, app.
  Use tambem quando mencionar: "design bonito", "profissional", "premium", "Awwwards",
  "vibe", "animacoes", "glassmorphism", "parallax", "nao pareca IA", "moderno",
  "impactante", "sofisticado", "minimalista", "editorial", "neon", "brutalist".
  Esta skill e OBRIGATORIA para qualquer output visual — nunca gere HTML/CSS sem ela.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# Vibe Design Framework

## Pipeline obrigatorio (NUNCA pule etapas)

### FASE 1 — CURADORIA (antes de qualquer codigo)
1. Se o usuario **ja especificou a vibe** (ex: "minimalista", "glassmorphism"), confirme e prossiga.
   Se **nao especificou**, pergunte: **"Qual a vibe? (minimalista, brutalist, glassmorphism, neon, editorial, organico)"**
2. Se o usuario nao souber, proponha **3 referencias do Awwwards/Godly.website** com descricao visual.
3. Extraia e documente no output:
   - tipografia (familia, pesos, tamanhos)
   - paleta (background, foreground, accent)
   - espacamento (ritmo base)
   - efeitos especiais (glassmorphism, glow, blur, etc)
   - tom geral (luxo, tech, organico, editorial)

---

### FASE 2 — DESIGN TOKENS (antes do HTML)
Gere um bloco de **variaveis CSS ou `tailwind.config.js`** contendo:

**Fontes**
- titulo (serifada/display)
- corpo (sans-serif)
- pesos
- line-heights

**Paleta**
- background
- foreground
- accent
- accent-gradient
- glass-bg
- glass-border

**Espacamento**
- sistema baseado em **multiplos de 8px**

**Efeitos**
- glassmorphism
- sombras
- border-radius

**Breakpoints**
- mobile-first com **3 breakpoints**

---

### FASE 3 — ARQUITETO (estrutura HTML)
Gere **HTML semantico SEM estilos visuais**. Apenas:
- Estrutura de secoes (`<header>`, `<main>`, `<section>`, `<footer>`)
- Hierarquia de conteudo (`h1 → h6`, `p`, `ul`, `img`)
- Atributos de acessibilidade (`aria-labels`, `alt texts`)
- `data-attributes` para **targets do GSAP**

---

### FASE 4 — ESTILISTA (aplicacao dos tokens)
Aplique os **Design Tokens da Fase 2**:
- Layout com **Tailwind CSS v4 / CSS Grid / Flexbox**
- Responsividade **mobile-first**
- Micro-espacamentos consistentes (**multiplos de 8px**)
- Hierarquia visual clara (tamanho, peso, cor, espaco)

---

### FASE 5 — ANIMADOR (vida ao design)
Injete animacoes usando:
- **GSAP ScrollTrigger** para reveal-on-scroll (fade-in + slide-up)
- **GSAP** para hover states e micro-interacoes
- **Canvas API / Three.js** para backgrounds premium (particulas, gradientes animados)
- **Framer Motion** se React (variants + AnimatePresence)
- **CSS transitions** para estados simples (hover, focus)

---

### FASE 6 — VALIDACAO
Checklist antes de entregar:
- [ ] Responsivo em **3 breakpoints** (mobile, tablet, desktop)
- [ ] **Acessibilidade**: contraste WCAG AA, focus states, alt texts
- [ ] **Performance**: images otimizadas, lazy loading, `font-display: swap`
- [ ] Animacoes respeitam `prefers-reduced-motion`
- [ ] **Design tokens consistentes** em todo o projeto
- [ ] Nao parece **"feito por IA"** — tem personalidade e ritmo visual

---

## Referencias de estilo (usar como vocabulario)

### Glassmorphism
- `backdrop-filter: blur(10px)` + `bg rgba(255,255,255,0.1)`
- Bordas sutis com `border: 1px solid rgba(255,255,255,0.2)`
- Sombras suaves multi-camada

### Neon
- `text-shadow` com spread + cores vibrantes em dark bg
- Glow effects com `box-shadow: 0 0 20px color`
- Gradientes animados como background

### Brutalist
- Tipografia oversized, grid quebrado, cores cruas
- Borders grossas, sem border-radius
- Contraste extremo preto/branco com accent color

### Editorial
- Whitespace generoso, serifas, hierarquia extrema
- Grid assimetrico com imagens full-bleed
- Tipografia como elemento visual principal

### Organico
- Border-radius grandes, paleta earth-tone, ilustracoes
- Formas blob com SVG, gradientes suaves
- Animacoes fluidas e naturais

---

## Anti-padroes (NUNCA faca)
- Gerar HTML+CSS+JS tudo junto sem separar as fases
- Usar cores genericas (#333, #666, #blue) sem design tokens
- Espacamento inconsistente (misturar px, rem, em sem sistema)
- Animacoes sem ScrollTrigger (tudo aparece de uma vez)
- Ignorar mobile (desktop-first e anti-padrao em 2026)
- Pular a Fase 2 (Design Tokens) e ir direto pro HTML
- Usar Tailwind sem definir tokens customizados primeiro
- Entregar apenas HTML/CSS estatico sem nenhuma animacao
