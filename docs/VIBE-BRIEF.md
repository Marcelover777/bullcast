# BullCast — Vibe Design Brief v2.0
## Framework Asimov Academy + Pipeline Premium v3

> Documento de direção estética. Aprovação necessária antes de qualquer código.

---

## A. Identidade do Produto

**BullCast** é um sistema autônomo de inteligência pecuária para o mercado brasileiro de gado.

**Persona primária:** "Seu Antônio" — pecuarista experiente (50+ anos), usa o app no pasto sob sol forte. Precisa de respostas diretas, sem jargão financeiro. Letras grandes, contraste alto, ícones literais.

**Arquétipo:** Dashboard financeiro agrícola — intersecção de Robinhood (dados como hero) + AgridFlow (agritech legível) + Fey (storytelling cinematográfico).

---

## B. 3 Adjetivos da Vibe

1. **Editorial** — Tipografia como protagonista, hierarquia extrema, whitespace intencional
2. **Autoritativo** — Transmite confiança e expertise sem ser frio ou corporativo
3. **Terroso** — Paleta natural que conecta com o campo, longe de "tech genérico"

---

## C. Estilo Visual (catalogo vibe-design)

- **Primário:** V06 (Dark Mode Premium) + V13 (Earth Tones)
- **Secundário:** A02 (Editorial) + V01 (Glassmorphism sutil na nav)
- **Motion:** M01 (Scroll Storytelling) com filosofia "Preciso e Confiável"

---

## D. Tipografia

### Display / Headings
- **Font:** Big Shoulders Display (Google Fonts)
- **Weights:** 700 (headings), 800 (hero prices)
- **Letter-spacing:** -0.02em (display), -0.01em (headings)
- **Line-height:** 1.0 (display), 1.1 (headings)
- **Uso:** Preços (SEMPRE), sinais, títulos de seção

### Body
- **Font:** Barlow
- **Weights:** 400 (body), 500 (emphasis), 600 (labels), 700 (active nav)
- **Letter-spacing:** 0 (body), 0.12em (labels/micro)
- **Line-height:** 1.5 (body), 1.3 (UI labels)
- **Uso:** Texto geral, descrições, parágrafos

### Mono (dados numéricos)
- **Font:** JetBrains Mono
- **Weights:** 400 (data), 500 (emphasis)
- **Features:** font-variant-numeric: tabular-nums
- **Uso:** Preços secundários, variações, timestamps

### Regra do Seu Antônio
- Preços SEMPRE em Big Shoulders, mínimo 40px mobile / 56px desktop
- NUNCA font-weight < 400 em dados importantes
- NUNCA font-size < 12px em informação acionável
- Labels micro: 10.4px (0.65rem), uppercase, letter-spacing 0.12em, weight 600

---

## E. Paleta de Cores

### Dark Mode (PRINCIPAL — refinar o existente)

```css
/* Backgrounds */
--background:          #0B0E0B;   /* Deepest Forest Black (manter) */
--background-rgb:      11, 14, 11; /* Para uso com rgba() */
--card:                #111611;   /* Sutil elevação (ajustar) */
--card-hover:          #161B16;   /* Card hover state */
--secondary:           #141A14;   /* Painéis secundários */
--elevated:            #1A201A;   /* Modais, popovers */

/* Text */
--foreground:          #E5E5D8;   /* Ivory off-white (manter) */
--muted-foreground:    #8A8A7A;   /* WCAG AA verified — 4.6:1 ratio */

/* Semantic */
--bull:                #4ADE80;   /* Green 400 — alta/positivo */
--bull-muted:          rgba(74, 222, 128, 0.10);
--bear:                #F87171;   /* Red 400 — baixa/negativo */
--bear-muted:          rgba(248, 113, 113, 0.10);
--hold:                #FBBF24;   /* Amber 400 — neutro */
--hold-muted:          rgba(251, 191, 36, 0.10);

/* Brand */
--primary:             #A3D824;   /* Serenaai Green */
--primary-foreground:  #0B0E0B;
--accent:              #E5E5D8;

/* State */
--destructive:         #EF4444;
--warning:             #F59E0B;
--info:                #60A5FA;
--success:             #4ADE80;

/* Border */
--border:              #222922;
--border-hover:        #2D352D;
```

### Light Mode (NOVO — criar do zero)

Referências: Wealthsimple (warm cream) + AgridFlow (legível no sol)

```css
/* Backgrounds */
--background:          #F4F3ED;   /* Noble Cream (já existe, manter) */
--background-rgb:      244, 243, 237;
--card:                #FFFFFF;   /* Branco puro SÓ em cards */
--card-hover:          #FAFAF7;
--secondary:           #EBE9E0;   /* Cream escuro */
--elevated:            #FFFFFF;

/* Text */
--foreground:          #1C1917;   /* Warm Black (nunca #000) */
--muted-foreground:    #78716C;   /* Stone 500 — legível no sol */

/* Semantic */
--bull:                #15803D;   /* Green 700 — funciona em light bg */
--bull-muted:          rgba(21, 128, 61, 0.08);
--bear:                #B91C1C;   /* Red 800 — funciona em light bg */
--bear-muted:          rgba(185, 28, 28, 0.08);
--hold:                #A16207;   /* Amber 700 */
--hold-muted:          rgba(161, 98, 7, 0.08);

/* Brand */
--primary:             #2D6A4F;   /* Deep Forest Green */
--primary-foreground:  #FFFFFF;
--accent:              #1C1917;

/* State */
--destructive:         #B91C1C;
--warning:             #A16207;
--info:                #1D4ED8;
--success:             #15803D;

/* Border */
--border:              #D6D3CC;   /* Warm border */
--border-hover:        #C5C2BB;

/* Card differentiation (CRÍTICO no light mode) */
/* Cards DEVEM ter: border: 1px solid var(--border) OU box-shadow: 0 1px 3px rgba(0,0,0,0.08) */
/* Isso cria contraste visual entre o fundo cream e os cards brancos */
```

---

## F. Princípio de Motion

**Filosofia:** "Preciso e Confiável" — como um relógio suíço, não um brinquedo.

### Easings
- **Entrada:** power3.out (cubic-bezier(0.33, 1, 0.68, 1))
- **Saída:** power2.in (cubic-bezier(0.55, 0.085, 0.68, 0.53))
- **Bounce:** elastic.out(1, 0.3) — APENAS para badges do sinal
- **Default:** power2.inOut

### Durações
- Fast: 0.3s (hover, toggle, micro-interactions)
- Normal: 0.5s (fade, slide, reveals)
- Emphasis: 0.8s (hero entrada, counters)
- Slow: 1.2s (GSAP counters, progress bars)

### Regras
- Dados numéricos SEMPRE animam (GSAPCounter)
- Gráficos "desenham" a linha na entrada
- ScrollReveal em TODAS as seções (fade-up, 30px offset)
- Stagger delay: 0.1s entre items do mesmo grupo
- NADA de bounce excessivo ou animação "toy-like"
- @media (prefers-reduced-motion: reduce) → GSAP timeScale(0)

### Timeline de Entrada do Hero (/mercado)
```
0.0s → Background gradiente fade-in
0.2s → Preço counter de 0 ao valor (1.2s duration)
0.4s → Badge sinal scale 0.8→1 elastic.out
0.6s → Variação % fade-up
0.8s → Barra confiança preenche (GSAP width)
1.0s → Texto recomendação fade-up
1.2s → Indicadores rápidos stagger (0.1s cada)
```

---

## G. Grade e Espaçamento

- **Base unit:** 4px
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
- **Section padding:** 48px (mobile), 64px (tablet), 80px (desktop)
- **Content margin:** 16px horizontal (mobile), 24px (tablet), auto com max-width (desktop)
- **Component gaps:** 8px (tight), 12px (default), 16px (relaxed), 24px (section)
- **Border radius:** 0px GLOBAL (identidade brutal/editorial)
  - Exceção: avatares (50%), pills de filtro (2px)

---

## H. Elevação e Profundidade

### Dark Mode
```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.3);
--shadow-md:  0 4px 12px rgba(0,0,0,0.4);
--shadow-lg:  0 8px 24px rgba(0,0,0,0.5);
--shadow-glow: 0 0 20px rgba(163, 216, 36, 0.15); /* Primary glow */
```

### Light Mode
```css
--shadow-sm:  0 1px 3px rgba(0,0,0,0.08);
--shadow-md:  0 4px 12px rgba(0,0,0,0.10);
--shadow-lg:  0 8px 24px rgba(0,0,0,0.12);
--shadow-glow: none; /* Sem glow no light */
```

---

## I. Componentes-Chave (Direção)

### Hero do Sinal
- NÃO é um card. É o HERO da viewport.
- Preço: 56px mobile, 64px desktop, Big Shoulders 800
- Gradiente contextual: BUY→verde 5% opacity, SELL→vermelho, HOLD→neutro
- Background cobre viewport inteira acima do fold

### Cards
- Dark: bg-card, sem borda, shadow-sm no hover
- Light: bg-white, border sutil OU shadow-sm, shadow-md no hover
- Padding: 16px mobile, 20px desktop
- .card-premium: active:scale(0.98) + transition 150ms

### Gráficos (Recharts)
- Linha: strokeWidth 2.5, glow sutil (drop-shadow)
- Grid: opacity 0.06 (quase invisível) ou removido
- Tooltip: glassmorphism (blur 12px + rgba 92% opacity)
- Dots: escondidos, activeDot r=5 com stroke do bg
- Gradiente fill: 15% → 0% opacity
- XAxis/YAxis: fontSize 9, opacity 0.5, sem axisLine

### Bottom Nav
- Indicador ativo: motion.div com layoutId (desliza entre tabs)
- Ícone ativo: glow sutil via filter drop-shadow
- Label ativo: font-weight 700 com transição
- Feedback tátil: navigator.vibrate(5)

### Skeleton Loading
- NUNCA texto "Carregando..."
- Skeleton que imita a forma dos dados reais
- Stagger: 50ms delay incremental entre blocos
- Variantes: mercado, previsao, regional

---

## J. 5 Referências de Design (Método Asimov)

| # | Site | Por Quê | O Que Extrair |
|---|------|---------|---------------|
| 1 | **Fey.com** | Dark mode rico, dados como cinema, glow sutil | Tipografia editorial em preços, tooltip minimal, cards com hierarquia |
| 2 | **Robinhood.com** | Preço domina viewport, variação colorida imediata | Preço como hero 56px+, gráfico sem grid, bottom nav 5 items |
| 3 | **Wealthsimple.com** | Design emocionalmente inteligente, light mode warm | Paleta warm (cremes, off-whites), micro-copy amigável |
| 4 | **AgridFlow** | Dashboard agritech premium, farmer-friendly | Cards de clima literais, fontes pesadas legíveis no sol, off-white bg |
| 5 | **Linear.app** | Dark mode denso e premium, animações precisas | Transições rápidas, hover states, data density elegante |

### Regras Derivadas
- Preço SEMPRE em tipografia gigante (hero da tela)
- Verde = alta/positivo, Vermelho = baixa/negativo (NUNCA inverter)
- Gráficos: sem grid pesado, linha grossa com glow, tooltip floating
- Light mode: NUNCA branco puro (#FFF) como bg, sempre off-white quente
- Dark mode: NUNCA preto puro (#000), sempre preto quente/esverdeado
- Dados climáticos: ícones literais (sol, chuva), não abstratos
- Texto pra fazendeiro: direto, sem jargão, frases curtas
- Mobile: thumb-zone, sticky CTA, swipe gestures

---

## K. O Que JÁ Funciona (MANTER)

- Dark mode palette base (#0B0E0B)
- Sharp corners (radius: 0) — identidade editorial
- Big Shoulders + Barlow + JetBrains Mono
- GSAP + Framer Motion + Lenis integrados
- Hero-price component com timeline GSAP
- ScrollReveal, parallax, counters animados
- Bottom nav com 4 tabs
- Noise texture (.bg-noise)
- Pulse dot animation
- Nav glass effect

## L. O Que Precisa REDESENHAR

- [ ] Loading states → Skeleton premium
- [ ] Light mode → Implementar do zero com paleta warm
- [ ] Theme toggle → Conectar ao ThemeProvider
- [ ] Hero do sinal → Explodir para viewport inteira (sair do card)
- [ ] Gráficos Recharts → Nível Fey/Robinhood (glow, tooltip glass)
- [ ] Bottom nav → Indicador com layoutId animado
- [ ] Micro-interações → Hover/tap feedback em TUDO
- [ ] Cards → Sistema de elevação dark/light
- [ ] Tipografia responsiva → Scale entre breakpoints
- [ ] Páginas stub → /riscos, /historico, /previsao (completar)
- [ ] Consistência → tabular-nums, formato BR, aria-labels
- [ ] Acessibilidade → Focus states, reduced-motion, WCAG AA
- [ ] Performance → Dynamic imports 3D, lazy charts, bundle audit

---

> **PRÓXIMO PASSO:** Após aprovação deste brief, seguir para P1 (Design Tokens + Light Mode).
> Pipeline completo: P0 (este) → P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8 → P9
