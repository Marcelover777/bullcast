# Font Pairings Database — 57 Combinacoes Tipograficas

## Como usar
Consulte na **Fase 2 do vibe-design** (Design Tokens) para selecionar a combinacao
de fontes adequada ao estilo e plataforma. Todas as fontes estao disponiveis no Google Fonts
exceto onde indicado (†).

Formato: `Display/Heading | Body | Mono (opcional)`

---

## Categoria 1 — Editorial & Luxury (14 pares)

| # | Heading | Body | Mono | Melhor para |
|---|---------|------|------|-------------|
| E01 | Playfair Display | Inter | — | Revistas de luxo, moda |
| E02 | Cormorant Garamond | Raleway | — | Joalheria, editorial premium |
| E03 | DM Serif Display | DM Sans | — | Jornais modernos, publishers |
| E04 | Libre Baskerville | Source Sans 3 | — | Editorial classico, academico |
| E05 | Bodoni Moda† | Jost | — | Alta moda, revistas impressas |
| E06 | Freight Display† | Freight Text | — | Publicacoes premium |
| E07 | Lora | Nunito | — | Blogs de qualidade, slow reading |
| E08 | Merriweather | Open Sans | — | Leitura longa, jornalismo |
| E09 | EB Garamond | Quattrocento Sans | — | Academico, ensaios |
| E10 | Spectral | Assistant | — | Legal, documentos formais |
| E11 | Crimson Text | Work Sans | — | Literatura, publicacoes |
| E12 | Cardo | Montserrat | — | Arte, museus, cultura |
| E13 | Bitter | Hind | — | Editorial digital, apps de leitura |
| E14 | PT Serif | PT Sans | — | Jornalismo russo, internacional |

---

## Categoria 2 — Tech & SaaS (12 pares)

| # | Heading | Body | Mono | Melhor para |
|---|---------|------|------|-------------|
| T01 | Inter | Inter | JetBrains Mono | SaaS geral, dashboards |
| T02 | Space Grotesk | Space Grotesk | Space Mono | Dev tools, crypto |
| T03 | Geist† | Geist | Geist Mono | Vercel-style, startups |
| T04 | Cal Sans† | Inter | JetBrains Mono | Calendly-style, SaaS B2B |
| T05 | General Sans† | General Sans | Fira Code | Fintech moderno |
| T06 | Syne | Syne | Source Code Pro | Design tools, criativo-tech |
| T07 | Plus Jakarta Sans | Plus Jakarta Sans | Courier Prime | Startups africanas/asiaticas |
| T08 | Outfit | Outfit | Fira Mono | Apps consumer, mobile |
| T09 | DM Sans | DM Sans | DM Mono | Google-style, clean SaaS |
| T10 | Manrope | Manrope | IBM Plex Mono | Enterprise tech |
| T11 | IBM Plex Sans | IBM Plex Sans | IBM Plex Mono | IBM/enterprise, documentacao |
| T12 | Lexend | Lexend | — | Acessibilidade, inclusao digital |

---

## Categoria 3 — Minimalismo & Modernismo (10 pares)

| # | Heading | Body | Mono | Melhor para |
|---|---------|------|------|-------------|
| M01 | Helvetica Now† | Helvetica Now | — | Corporativo internacional |
| M02 | Neue Haas Grotesk† | Neue Haas Grotesk | — | Swiss style, institucional |
| M03 | Aktiv Grotesk† | Aktiv Grotesk | — | Marcas globais |
| M04 | Hanken Grotesk | Hanken Grotesk | — | Minimalismo digital |
| M05 | Be Vietnam Pro | Be Vietnam Pro | — | Asia-Pacific, clean |
| M06 | Schibsted Grotesk | Schibsted Grotesk | — | Scandinavian, nordico |
| M07 | Cabinet Grotesk† | Satoshi† | — | Startups de alto nivel |
| M08 | Mona Sans† | Hubot Sans† | — | GitHub-style |
| M09 | Graphik† | Graphik | — | Agency, branding |
| M10 | Circular† | Circular | — | Airbnb-style, marketplace |

---

## Categoria 4 — Display & Impactante (8 pares)

| # | Heading | Body | Mono | Melhor para |
|---|---------|------|------|-------------|
| D01 | Clash Display† | Satoshi† | — | Startups, portfolios criativos |
| D02 | General Sans† | General Sans | — | Landing pages premium |
| D03 | Unbounded | DM Sans | — | Crypto, web3, bold brands |
| D04 | Big Shoulders Display | Barlow | — | Esportes, masculino, impacto |
| D05 | Bebas Neue | Barlow Condensed | — | Eventos, posters, bold |
| D06 | Montserrat | Hind Siliguri | — | Versatil premium |
| D07 | Raleway | Lato | — | Creative agencies |
| D08 | Titillium Web | Source Sans 3 | — | Gov/institucional moderno |

---

## Categoria 5 — Organico & Handcrafted (7 pares)

| # | Heading | Body | Mono | Melhor para |
|---|---------|------|------|-------------|
| H01 | Recoleta† | Nunito | — | Food, lifestyle suave |
| H02 | Fraunces | Mulish | — | Craft brands, organic |
| H03 | Instrument Serif | Instrument Sans | — | Design contemporaneo delicado |
| H04 | Young Serif | Jost | — | Slow food, artesanato |
| H05 | Sora | Sora | — | Japones-inspired, clean |
| H06 | Literata | Noto Sans | — | Multilingual, inclusivo |
| H07 | Noto Serif | Noto Sans | Noto Sans Mono | Global, acessivel |

---

## Categoria 6 — Futurista & Sci-fi (6 pares)

| # | Heading | Body | Mono | Melhor para |
|---|---------|------|------|-------------|
| F01 | Orbitron | Exo 2 | Share Tech Mono | Gaming, sci-fi |
| F02 | Rajdhani | Barlow | IBM Plex Mono | Militar, tech pesada |
| F03 | Audiowide | Chakra Petch | — | Gaming, motorsport |
| F04 | Exo 2 | Exo 2 | Space Mono | Cyberpunk suave |
| F05 | Jura | Jura | — | Sci-fi elegante |
| F06 | Michroma | Share Tech | Roboto Mono | UI futuristica |

---

## Escala Tipografica Recomendada (Fluid)

```css
/* Escala modular — ratio 1.25 (Major Third) */
:root {
  --text-xs:   clamp(0.64rem,  0.60rem + 0.2vw,  0.75rem);
  --text-sm:   clamp(0.80rem,  0.75rem + 0.25vw, 0.875rem);
  --text-base: clamp(1rem,     0.9rem  + 0.5vw,  1.125rem);
  --text-lg:   clamp(1.25rem,  1.1rem  + 0.75vw, 1.5rem);
  --text-xl:   clamp(1.5rem,   1.3rem  + 1vw,    2rem);
  --text-2xl:  clamp(2rem,     1.6rem  + 2vw,    3rem);
  --text-3xl:  clamp(2.5rem,   2rem    + 2.5vw,  4rem);
  --text-4xl:  clamp(3rem,     2.5rem  + 3vw,    5.5rem);

  /* Leading (line-height) */
  --leading-tight:  1.2;
  --leading-snug:   1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose:  2;

  /* Tracking (letter-spacing) */
  --tracking-tight:  -0.025em;
  --tracking-normal:  0;
  --tracking-wide:    0.025em;
  --tracking-wider:   0.05em;
  --tracking-widest:  0.1em;
}
```

---

## Regras de Uso

1. **Max 2 familias por projeto** — heading + body (mono e opcional e tecnico)
2. **Display: bold e escasso** — titulos com peso 700-900, corpo com 400-500
3. **Escala modular** — use a escala acima, nao invente tamanhos arbitrarios
4. **Variable fonts** — prefira versoes variavel quando disponivel (performance)
5. **Font loading**: sempre `font-display: swap` + `<link rel="preconnect">`
6. **Fallback stack**: `font-family: 'Sua Fonte', system-ui, -apple-system, sans-serif`
7. **Nunca misture 2 serifas** — conflito visual sem proposito claro

## Carregamento Google Fonts (template)

```html
<!-- Preconnect para performance -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Exemplo: Playfair Display + Inter -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300..700&display=swap" rel="stylesheet">
```
