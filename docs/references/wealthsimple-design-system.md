# Wealthsimple Design System Reference

> Extracted from wealthsimple.com and public sources (March 2026).
> Purpose: Reference for BullCast UI/UX — adapting the "finance feels human" approach.

---

## 1. Design Philosophy

Wealthsimple's design is built on one core idea: **make finance feel human, not intimidating**.

Key principles:
- **Clarity over cleverness** — strip away distractions, reinforce simplicity
- **Warmth over corporate** — deliberate departure from cold blue/green fintech palettes
- **Editorial quality** — the website reads like a well-designed magazine, not a financial app
- **Generous breathing room** — white space is a feature, not wasted space
- **Real photography** — unstaged, authentic imagery of real people (no stock photos)
- **Conversational voice** — 2nd person, contractions, active voice, empathy-first

This philosophy translates directly to BullCast's "Seu Antonio" persona: direct, human, accessible.

---

## 2. Color Palette

### Primary Colors

| Token | Name | Hex | RGB | Usage |
|-------|------|-----|-----|-------|
| `--color-dune` | Dune | `#32302F` | `50, 48, 47` | Primary text, dark backgrounds, anchoring color |
| `--color-white` | White | `#FFFFFF` | `255, 255, 255` | Primary background, clean canvas |

### Accent Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-orange` | Orange (CTA) | `#FF6B35` (approx.) | Calls-to-action, buttons, interactive highlights |
| `--color-green` | Green | `#1DB954` | Success states, positive indicators |

### Extended Warm Palette

Wealthsimple uses warm yellows and reds as secondary accents — a deliberate rejection of the blue/green financial industry standard. The palette features:

| Category | Description | Approximate Values |
|----------|-------------|-------------------|
| Warm Cream | Off-white backgrounds, card surfaces | `#FAF8F5` to `#F5F0EB` |
| Warm Beige | Section dividers, subtle backgrounds | `#EDE8E2` to `#E5DED6` |
| Rich Yellow | Accent highlights, illustrations | Warm gold tones |
| Warm Red | Accent highlights, editorial emphasis | Contemporary primary reds |
| Olive/Earth | Tertiary accents, subtle indicators | Earthy green-brown tones |

### Color Philosophy

- **90% of financial brands** use blue + green. Wealthsimple intentionally avoids this.
- The **Dune + White** duo creates high contrast for readability while feeling warm, not stark.
- **Orange CTAs** pop against the neutral palette, drawing attention without visual noise.
- The dominant white palette evokes **clarity and simplicity**, demystifying finance.
- Dune adds **stability and trust** without the coldness of pure black.

### CSS Custom Properties (Reconstructed)

```css
:root {
  /* Primary */
  --ws-color-dune: #32302F;
  --ws-color-white: #FFFFFF;

  /* Backgrounds */
  --ws-bg-primary: #FFFFFF;
  --ws-bg-cream: #FAF8F5;
  --ws-bg-warm: #F5F0EB;
  --ws-bg-beige: #EDE8E2;

  /* Text */
  --ws-text-primary: #32302F;
  --ws-text-secondary: #6B6866;
  --ws-text-muted: #9B9896;
  --ws-text-inverse: #FFFFFF;

  /* Accent */
  --ws-color-orange: #FF6B35;
  --ws-color-green: #1DB954;
  --ws-color-yellow: #FFB930;
  --ws-color-red: #E85D4A;

  /* Borders */
  --ws-border-light: #EDE8E2;
  --ws-border-default: #D5CEC6;
}
```

---

## 3. Typography

### Font Families

| Role | Font | Fallback Stack | Weight Range |
|------|------|----------------|--------------|
| Display / Headlines | **Caslon Graphique** | Georgia, "Times New Roman", serif | Extra Bold (800+) |
| Body Headlines | **Caslon** (Adobe Caslon Pro) | Georgia, serif | Regular (400), Bold (700) |
| Body / UI | **Futura** (Futura PT) | "Trebuchet MS", Arial, sans-serif | Book (400), Medium (500), Bold (700) |

### Typography Philosophy

- **Caslon Graphique** (1970s chunky serif) is used for the logo wordmark AND headlines throughout the site — a bold, unconventional choice for fintech
- **Caslon + Futura** pairing balances tradition with modernity: organic serif warmth meets geometric sans precision
- The combination signals: "your money is secure (Caslon = established) AND we're forward-thinking (Futura = modern)"
- Typography is **bold and clean**, always surrounded by generous white space for maximum readability
- Large text blocks are broken into **3-4 shorter sentences** that appear on scroll

### Type Scale (Reconstructed)

```css
:root {
  /* Display */
  --ws-font-display: 'Caslon Graphique', Georgia, serif;
  --ws-font-heading: 'Adobe Caslon Pro', Georgia, serif;
  --ws-font-body: 'Futura PT', 'Trebuchet MS', sans-serif;

  /* Scale — mobile-first (base 16px) */
  --ws-text-xs: 0.75rem;      /* 12px — captions, labels */
  --ws-text-sm: 0.875rem;     /* 14px — secondary text */
  --ws-text-base: 1rem;       /* 16px — body text */
  --ws-text-lg: 1.125rem;     /* 18px — large body */
  --ws-text-xl: 1.25rem;      /* 20px — small headings */
  --ws-text-2xl: 1.5rem;      /* 24px — section subheads */
  --ws-text-3xl: 2rem;        /* 32px — section headings */
  --ws-text-4xl: 2.5rem;      /* 40px — page headings */
  --ws-text-5xl: 3.5rem;      /* 56px — hero headlines */
  --ws-text-6xl: 4.5rem;      /* 72px — display headlines */

  /* Line heights */
  --ws-leading-tight: 1.1;    /* Display headings */
  --ws-leading-snug: 1.25;    /* Headings */
  --ws-leading-normal: 1.5;   /* Body text */
  --ws-leading-relaxed: 1.75; /* Long-form reading */

  /* Letter spacing */
  --ws-tracking-tight: -0.02em;  /* Large display text */
  --ws-tracking-normal: 0;       /* Body text */
  --ws-tracking-wide: 0.05em;    /* Uppercase labels */
}
```

### Heading Styles

```css
/* Hero / Display */
.ws-display {
  font-family: var(--ws-font-display);
  font-size: var(--ws-text-6xl);
  font-weight: 800;
  line-height: var(--ws-leading-tight);
  letter-spacing: var(--ws-tracking-tight);
  color: var(--ws-text-primary);
}

/* Section Heading (Caslon serif) */
.ws-heading-1 {
  font-family: var(--ws-font-heading);
  font-size: var(--ws-text-4xl);
  font-weight: 700;
  line-height: var(--ws-leading-snug);
}

/* Body (Futura sans) */
.ws-body {
  font-family: var(--ws-font-body);
  font-size: var(--ws-text-base);
  font-weight: 400;
  line-height: var(--ws-leading-normal);
  color: var(--ws-text-primary);
}
```

---

## 4. Spacing System

Wealthsimple uses **extremely generous whitespace** — one of its most distinctive design traits.

### Spacing Scale (Reconstructed)

```css
:root {
  --ws-space-1: 0.25rem;   /* 4px */
  --ws-space-2: 0.5rem;    /* 8px */
  --ws-space-3: 0.75rem;   /* 12px */
  --ws-space-4: 1rem;      /* 16px */
  --ws-space-5: 1.5rem;    /* 24px */
  --ws-space-6: 2rem;      /* 32px */
  --ws-space-8: 3rem;      /* 48px */
  --ws-space-10: 4rem;     /* 64px */
  --ws-space-12: 5rem;     /* 80px */
  --ws-space-16: 8rem;     /* 128px */
  --ws-space-20: 10rem;    /* 160px */
  --ws-space-24: 12rem;    /* 192px */
}
```

### Spacing Patterns

| Context | Spacing | Notes |
|---------|---------|-------|
| Section padding (vertical) | `96px–160px` | Extremely generous — sections breathe |
| Section padding (horizontal) | `24px` (mobile), `64px` (desktop) | Generous side margins |
| Card internal padding | `24px–32px` | Comfortable content spacing |
| Between heading and body | `16px–24px` | Enough to separate without disconnecting |
| Between sections | `128px–192px` | Creates clear visual chapters |
| Grid gap | `24px–32px` | Consistent card grid spacing |
| Between paragraphs | `24px` | Relaxed reading rhythm |

### Key Insight

White space is **the** defining visual feature. Content never feels cramped. Every element has room to breathe. This creates a sense of **calm and confidence** — critical for a financial product where users may feel anxious.

---

## 5. Layout & Grid

### Grid System

```css
/* Container */
.ws-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (min-width: 768px) {
  .ws-container { padding: 0 48px; }
}

@media (min-width: 1024px) {
  .ws-container { padding: 0 64px; }
}
```

### Layout Patterns

| Pattern | Description |
|---------|-------------|
| **Hero section** | Full-width image/background + overlaid headline + single CTA |
| **Feature cards** | 3-column grid (1 col mobile, 2 tablet, 3 desktop) |
| **Alternating content** | Image-left/text-right, then text-left/image-right |
| **Magazine grid** | Mixed-size cards (1 featured large + 2-3 smaller) |
| **Tier comparison** | Side-by-side cards with feature lists |
| **FAQ accordion** | Expandable sections at page bottom |

### Responsive Breakpoints

```css
/* Mobile-first breakpoints */
--ws-breakpoint-sm: 640px;   /* Large phones */
--ws-breakpoint-md: 768px;   /* Tablets */
--ws-breakpoint-lg: 1024px;  /* Small desktops */
--ws-breakpoint-xl: 1280px;  /* Standard desktops */
--ws-breakpoint-2xl: 1440px; /* Large screens */
```

---

## 6. Component Patterns

### Buttons

```css
/* Primary CTA — Orange */
.ws-btn-primary {
  background-color: var(--ws-color-orange);
  color: var(--ws-color-white);
  font-family: var(--ws-font-body);
  font-size: var(--ws-text-base);
  font-weight: 500;
  padding: 14px 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease;
}

.ws-btn-primary:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

/* Secondary — Outlined */
.ws-btn-secondary {
  background-color: transparent;
  color: var(--ws-text-primary);
  border: 1.5px solid var(--ws-text-primary);
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.ws-btn-secondary:hover {
  background-color: var(--ws-bg-cream);
}

/* Text link CTA */
.ws-btn-text {
  color: var(--ws-text-primary);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 4px;
}
```

### Cards

```css
.ws-card {
  background: var(--ws-bg-primary);
  border-radius: 12px;
  padding: 32px;
  border: 1px solid var(--ws-border-light);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.ws-card:hover {
  box-shadow: 0 8px 30px rgba(50, 48, 47, 0.08);
  transform: translateY(-2px);
}

/* Featured card (cream background) */
.ws-card--featured {
  background: var(--ws-bg-cream);
  border: none;
  padding: 40px;
}

/* Tier card (pricing comparison) */
.ws-card--tier {
  background: var(--ws-bg-primary);
  border-radius: 16px;
  padding: 40px;
  border: 1px solid var(--ws-border-light);
}

.ws-card--tier-premium {
  border-color: var(--ws-color-orange);
  border-width: 2px;
}
```

### Navigation

- Clean, minimal top navigation
- Logo left, primary links center, CTA right
- Sticky header with subtle backdrop blur on scroll
- Mobile: hamburger menu with full-screen overlay

### Images

- CDN-optimized responsive images with format/quality parameters
- Mobile-specific image variants (different crops, not just resized)
- Aspect ratios: 3:2 standard, 1:1 for thumbnails, 16:9 for hero sections

---

## 7. Animation Patterns

### Philosophy

- Animations serve as **visual metaphors** for financial concepts
- Motion is **subtle and purposeful** — never decorative
- Performance-first: prefer `transform` and `opacity` (GPU-accelerated)
- Respect `prefers-reduced-motion`

### Scroll Animations

```css
/* Fade-up reveal on scroll */
.ws-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.ws-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered children */
.ws-stagger > *:nth-child(1) { transition-delay: 0ms; }
.ws-stagger > *:nth-child(2) { transition-delay: 100ms; }
.ws-stagger > *:nth-child(3) { transition-delay: 200ms; }
```

### Micro-interactions

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Button hover | Slight lift + brightness | `150-200ms` | `ease` |
| Card hover | Lift + shadow expansion | `200-300ms` | `ease` |
| Page transitions | Fade between pages | `300-400ms` | `ease-in-out` |
| Scroll reveals | Fade-up from below | `500-600ms` | `ease` |
| Number counters | Count-up animation | `800-1200ms` | `ease-out` |
| Hero coin | Follows scroll position | Continuous | Parallax |

### 3D Elements

- Evolved 3D illustration style (branded coins, abstract shapes)
- 3D elements serve as visual metaphors for financial concepts
- Combined with impactful motion: scroll-driven, parallax-based
- The hero coin that follows users through the site is a signature interactive element

### Transition Defaults

```css
:root {
  --ws-transition-fast: 150ms ease;
  --ws-transition-base: 200ms ease;
  --ws-transition-slow: 300ms ease;
  --ws-transition-reveal: 600ms ease;

  --ws-ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ws-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ws-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ws-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 8. Content & Voice

### Writing Style

| Attribute | Pattern |
|-----------|---------|
| Person | 2nd person ("you", "your") |
| Tone | Conversational, warm, empathetic |
| Contractions | Always used ("you'll", "we're", "it's") |
| Sentence length | Short — 3-4 sentences per paragraph max |
| Jargon | Avoided or explained immediately |
| Headlines | Sentence case, bold serif (Caslon Graphique) |
| Labels | Uppercase, wide tracking, small sans-serif |

### Headline Examples (Pattern)

- "Better than your bank" (direct, comparative)
- "Get started in less than three minutes" (benefit + timeframe)
- "Smart investing made simple" (outcome-focused)

### How Finance Feels Human

1. **Photography**: Real people in real contexts, nothing staged
2. **Language**: No jargon, no walls of text, conversational
3. **Whitespace**: Calm, not overwhelming
4. **Color**: Warm, not corporate cold
5. **Typography**: Classic serif headlines feel personal, not institutional
6. **Interactions**: Smooth, predictable, confidence-building
7. **Information density**: Low — one idea per screen section

---

## 9. Light Mode Implementation

Wealthsimple is primarily a **light-mode-first** design, though their 2025 design system supports dark mode toggle via Figma variables.

### Light Mode Specifics

```css
/* Light mode (default) */
:root {
  --ws-surface-primary: #FFFFFF;
  --ws-surface-secondary: #FAF8F5;       /* Warm cream */
  --ws-surface-tertiary: #F5F0EB;        /* Deeper cream */
  --ws-surface-elevated: #FFFFFF;

  --ws-text-primary: #32302F;            /* Dune */
  --ws-text-secondary: #6B6866;
  --ws-text-tertiary: #9B9896;

  --ws-border-subtle: #EDE8E2;
  --ws-border-default: #D5CEC6;

  --ws-shadow-sm: 0 1px 3px rgba(50, 48, 47, 0.04);
  --ws-shadow-md: 0 4px 12px rgba(50, 48, 47, 0.06);
  --ws-shadow-lg: 0 8px 30px rgba(50, 48, 47, 0.08);
  --ws-shadow-xl: 0 16px 50px rgba(50, 48, 47, 0.12);
}
```

### Surface Hierarchy

| Level | Color | Usage |
|-------|-------|-------|
| Base | `#FFFFFF` | Main page background |
| Subtle | `#FAF8F5` | Alternating sections, card backgrounds |
| Muted | `#F5F0EB` | Featured areas, sidebar backgrounds |
| Warm | `#EDE8E2` | Dividers, subtle separators |

### Key Light Mode Traits

- Shadows use **Dune-tinted rgba** (not pure black), keeping shadows warm
- Backgrounds alternate between pure white and warm cream to create visual rhythm
- Borders are soft, warm-toned, never harsh gray
- The overall impression is of a **warm, sunlit room** — not a sterile white interface

---

## 10. Adaptation Notes for BullCast

### What to Adopt

| Wealthsimple Pattern | BullCast Adaptation |
|----------------------|---------------------|
| Warm palette (not cold blue) | Use warm earth tones for cattle/agro context |
| Generous whitespace | Critical for mobile-first older user (Seu Antonio) |
| Serif + sans pairing | Consider similar pairing adapted for PT-BR readability |
| Short paragraphs | Essential for Seu Antonio persona |
| Conversational voice | Already aligned with "Seu Antonio" directness |
| Orange CTAs | High-contrast CTAs work well on dark backgrounds too |
| Editorial card layout | Map to cattle market data cards |
| Scroll-based reveals | Subtle animations for dashboard data loading |

### What to Adapt Differently

| Wealthsimple | BullCast Difference |
|-------------|---------------------|
| Light mode primary | BullCast is **dark-mode only** |
| English / EN-CA | PT-BR exclusively |
| Young urban audience | Older rural audience (50+) |
| Investing complexity | Cattle market simplicity |
| Clean minimal imagery | Pastoral / ranch imagery |
| Futura body text | May need larger base size for older users |

### Dark Mode Translation

To translate Wealthsimple's warm light palette to BullCast's dark mode:

```css
/* BullCast dark mode — warm dark adaptation */
:root {
  --bc-surface-primary: #1A1918;         /* Warm near-black (not pure #000) */
  --bc-surface-secondary: #242220;       /* Elevated cards */
  --bc-surface-tertiary: #2E2B28;        /* Active/hover states */

  --bc-text-primary: #FAF8F5;            /* Warm white (Wealthsimple cream) */
  --bc-text-secondary: #B5B0AA;          /* Muted warm text */
  --bc-text-muted: #7A756F;             /* Tertiary text */

  --bc-accent-primary: #FF6B35;          /* Orange CTA (high contrast) */
  --bc-accent-success: #4CAF50;          /* Positive market movement */
  --bc-accent-danger: #E85D4A;           /* Negative / alerts */

  --bc-border-subtle: #333028;           /* Warm dark border */
  --bc-border-default: #4A4540;          /* Standard border */
}
```

---

## Sources

- [Wealthsimple.com](https://www.wealthsimple.com) (homepage, magazine, about, product pages)
- [Wealthsimple Design System 2025 UI Kit (Figma)](https://www.figma.com/community/file/1553208141755439461/wealthsimple-design-system-2025-ui-kit)
- [Wealthsimple Brand Colors (ColorFYI)](https://colorfyi.com/brands/wealthsimple/)
- [Wealthsimple Brand Color Palette (Mobbin)](https://mobbin.com/colors/brand/wealthsimple)
- [Wealthsimple Logo Font (FontMeme)](https://fontmeme.com/wealthsimple-logo-font/)
- [Typewolf — Favorite Sites (Caslon Graphique analysis)](https://www.typewolf.com/blog/favorite-sites-of-march-2016)
- [Rebranding Wealthsimple (Joonas Virtanen)](https://www.joonasvirtanen.com/project/rebranding-wealthsimple-for-a-new-era)
- [Wealthsimple Design (Mike Giepert)](https://mikegiepert.com/wealthsimple-design)
- [Wealthsimple Rebrand (BetaKit)](https://betakit.com/wealthsimple-rebrands-as-the-fintech-company-sheds-its-startup-skin/)
