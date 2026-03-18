# BullCast Design System -- Merged Reference

> Synthesized from 5 design system references: Fey, Robinhood, Wealthsimple, AgridFlow, Linear.
> Tailored for BullCast: livestock intelligence app, dark-mode only, mobile-first, PT-BR.
> Persona: Seu Antonio, 50+ years old, needs legibility, simplicity, and sunlight-readability.
> Date: 2026-03-18

---

## 1. Typography

### 1.1 Cross-Reference Comparison

| Source | Display Font | Body Font | Mono Font | Body Size | Body Weight |
|--------|-------------|-----------|-----------|-----------|-------------|
| Fey | Calibre (proprietary) | Calibre | -- | 16px | 400 |
| Robinhood | Phonic (proprietary) | Capsule Sans Text | -- | 15px | 400 |
| Wealthsimple | Caslon Graphique (serif) | Futura PT (sans) | -- | 16px | 400 |
| AgridFlow | Inter (recommended) | Inter | JetBrains Mono | 14px | 400 |
| Linear | Inter | Inter | JetBrains Mono | 15px | 500 |

### 1.2 BullCast Recommendation

BullCast keeps its current font stack: **Big Shoulders Display** (headings), **Barlow** (body), **JetBrains Mono** (data). Rationale:

- Big Shoulders Display is condensed, bold, and high-impact -- ideal for hero numbers like arroba price. It echoes the punch of Robinhood's Phonic and the confidence of Wealthsimple's Caslon Graphique, but in a free, variable-weight format.
- Barlow is a grotesk sans-serif with excellent readability at small sizes. It fills the same role as Linear's Inter or AgridFlow's Inter recommendation, but with a slightly warmer, more humanist character that suits the rural persona.
- JetBrains Mono is universally recommended (Linear, AgridFlow) for tabular data. Non-negotiable for price displays.

| Token | Source Inspiration | BullCast Value |
|-------|-------------------|----------------|
| `--font-display` | Fey: Calibre 600, RH: Phonic, WS: Caslon Graphique 800 | `'Big Shoulders Display', system-ui, sans-serif` |
| `--font-body` | Linear: Inter 500, AgridFlow: Inter 400 | `'Barlow', -apple-system, BlinkMacSystemFont, sans-serif` |
| `--font-mono` | Linear: JetBrains Mono, AgridFlow: JetBrains Mono | `'JetBrains Mono', 'SF Mono', monospace` |

### 1.3 Type Scale

BullCast uses a **larger base** than Linear/Robinhood (16px vs 13-15px) because Seu Antonio is 50+ and may use the app outdoors. Minimum body size: 16px.

```css
:root {
  /* Display -- Big Shoulders Display */
  --text-display-xl: 3.5rem;    /* 56px -- hero arroba price (desktop) */
  --text-display-lg: 2.5rem;    /* 40px -- hero arroba price (mobile) */
  --text-display-md: 2rem;      /* 32px -- section headers */
  --text-display-sm: 1.5rem;    /* 24px -- card titles */

  /* Body -- Barlow */
  --text-body-lg: 1.25rem;      /* 20px -- large body, intro text */
  --text-body-md: 1rem;         /* 16px -- standard body (minimum) */
  --text-body-sm: 0.875rem;     /* 14px -- captions, labels */
  --text-body-xs: 0.75rem;      /* 12px -- timestamps, metadata */

  /* Data -- JetBrains Mono */
  --text-price-hero: 3rem;      /* 48px -- main arroba price */
  --text-price-card: 1.5rem;    /* 24px -- card-level prices */
  --text-price-delta: 1rem;     /* 16px -- +3.2% change indicators */
  --text-price-table: 0.875rem; /* 14px -- table data */

  /* Weights */
  --weight-regular: 400;
  --weight-medium: 500;         /* Linear-inspired: default for UI elements */
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-extrabold: 800;      /* Display headings only */

  /* Line Heights */
  --leading-tight: 1.1;         /* Display headings */
  --leading-snug: 1.25;         /* Headings */
  --leading-normal: 1.5;        /* Body text */
  --leading-relaxed: 1.6;       /* Long-form reading */

  /* Letter Spacing */
  --tracking-tight: -0.02em;    /* Display text */
  --tracking-normal: 0;         /* Body text */
  --tracking-wide: 0.05em;      /* Uppercase labels, overlines */
}
```

### 1.4 Typography Rules

| Rule | Source | BullCast Application |
|------|--------|---------------------|
| `font-variant-numeric: tabular-nums` | Robinhood, Linear, AgridFlow | ALL numerical data -- prices, percentages, dates |
| Negative letter-spacing on large text | Robinhood (-0.1 to -2px), Linear, Fey | Display and heading sizes only |
| Medium (500) as default UI weight | Linear | All interactive labels, nav items, card metadata |
| Short paragraphs (3-4 sentences max) | Wealthsimple | Essential for Seu Antonio persona |
| Right-align numbers in tables | AgridFlow | All price/percentage columns |
| Always show units near numbers | AgridFlow | "R$ 320/@" not "320" |

---

## 2. Color Palette

### 2.1 Cross-Reference Comparison

| Token | Fey | Robinhood | Wealthsimple | AgridFlow | Linear |
|-------|-----|-----------|--------------|-----------|--------|
| Dark bg | `#000000` | `#000000` | N/A (light) | N/A (light) | `#08090a` |
| Card bg | `#0B0B0F` | `#110E08` | `#FAF8F5` | `#F8F9FA` | `~#0f1115` |
| Light bg | N/A | N/A | `#FFFFFF` | `#F8F9FA` | N/A |
| Text primary | `#FFFFFF` | `#FFFFFF` | `#32302F` | `#212529` | `rgba(255,255,255,0.95)` |
| Positive | `#4EBE96` | `#00C805` | `#1DB954` | `#2D6A4F` | Green (unspecified) |
| Negative | `#FF5C5C` | `#FF5000` | `#E85D4A` | `#C62828` | Red (unspecified) |
| Warning | `#FFA16C` | `#CCFF00` | `#FFB930` | `#E6A817` | Amber |
| CTA | `#479FFA` | `#00C805` | `#FF6B35` | `#2D6A4F` | `#5E6AD2` |

### 2.2 BullCast Dark Mode Palette (Primary)

Inspired by Linear's near-black approach (not pure black) with warm undertones from Robinhood. The current BullCast dark bg `#0B0E0B` already has a green undertone -- we keep and refine this.

```css
:root {
  /* ===== BACKGROUNDS ===== */
  /* Source: Linear's near-black + Robinhood's warm undertone */
  --bg-primary: #0B0E0B;         /* Page background (current BullCast) */
  --bg-secondary: #111611;       /* Card/panel backgrounds */
  --bg-tertiary: #1A1F1A;        /* Hover states, active selections */
  --bg-elevated: #1E241E;        /* Modals, dropdowns, floating panels */
  --bg-surface: #252B25;         /* Tooltips, popovers */

  /* ===== TEXT HIERARCHY ===== */
  /* Source: Linear's 4-tier opacity system */
  --text-primary: rgba(244, 243, 237, 0.95);    /* #F4F3ED at 95% -- warm white */
  --text-secondary: rgba(244, 243, 237, 0.65);  /* Descriptions, secondary info */
  --text-tertiary: rgba(244, 243, 237, 0.45);   /* Metadata, timestamps */
  --text-quaternary: rgba(244, 243, 237, 0.20); /* Decorative, dividers */

  /* ===== MARKET SENTIMENT ===== */
  /* Positive: blend of Fey's teal + Robinhood's green */
  --color-positive: #4EBE96;           /* Price up, bullish */
  --color-positive-light: rgba(78, 190, 150, 0.20);
  --color-positive-lighter: rgba(78, 190, 150, 0.10);

  /* Negative: Robinhood's orange-red (better for colorblind users than pure red) */
  --color-negative: #FF5C5C;           /* Price down, bearish */
  --color-negative-light: rgba(255, 92, 92, 0.20);
  --color-negative-lighter: rgba(255, 92, 92, 0.10);

  /* Warning: Fey's warm orange */
  --color-warning: #FFA16C;            /* Alerts, price targets */
  --color-warning-light: rgba(255, 161, 108, 0.20);

  /* Info: cool blue for neutral data */
  --color-info: #60A5FA;               /* Links, informational */
  --color-info-light: rgba(96, 165, 250, 0.15);

  /* Brand: cattle-market gold */
  --color-brand: #D4A745;              /* Premium, brand accent */
  --color-brand-light: rgba(212, 167, 69, 0.20);

  /* ===== BORDERS ===== */
  /* Source: Linear's subtle rgba borders + Fey's gradient borders */
  --border-subtle: rgba(244, 243, 237, 0.06);
  --border-default: rgba(244, 243, 237, 0.10);
  --border-strong: rgba(244, 243, 237, 0.16);

  /* ===== CHART COLORS ===== */
  --chart-positive: #4EBE96;
  --chart-negative: #FF5C5C;
  --chart-secondary: #60A5FA;
  --chart-tertiary: #D4A745;
  --chart-grid: rgba(244, 243, 237, 0.06);
  --chart-axis: rgba(244, 243, 237, 0.35);
  --chart-tooltip-bg: #1E241E;
}
```

### 2.3 BullCast Light Mode Palette (Secondary)

For optional light mode (e.g., outdoor sunlight mode). Sourced from Wealthsimple's warm whites + AgridFlow's outdoor readability rules.

```css
[data-theme="light"] {
  /* Source: Wealthsimple warm surfaces + AgridFlow off-whites */
  --bg-primary: #F4F3ED;           /* Current BullCast light bg -- warm off-white */
  --bg-secondary: #ECEAE3;         /* Card backgrounds */
  --bg-tertiary: #E3E1D9;          /* Hover states */
  --bg-elevated: #FFFFFF;           /* Modals, floating */
  --bg-surface: #F9F8F4;           /* Subtle sections */

  /* Source: Wealthsimple's Dune + AgridFlow's dark slate */
  --text-primary: #2A2A25;          /* Primary text -- warm near-black */
  --text-secondary: #5C5B55;
  --text-tertiary: #8A8880;
  --text-quaternary: #B8B6AE;

  /* Market sentiment (darker variants for light bg) */
  --color-positive: #2D7A5A;        /* Desaturated green (AgridFlow outdoor rule) */
  --color-negative: #C0392B;
  --color-warning: #D4781C;

  /* Borders -- warm toned (Wealthsimple pattern) */
  --border-subtle: #E3E1D9;
  --border-default: #D5D3CB;
  --border-strong: #B8B6AE;

  /* Shadows -- warm tinted (Wealthsimple pattern, never pure black) */
  --shadow-sm: 0 1px 3px rgba(42, 42, 37, 0.06);
  --shadow-md: 0 4px 12px rgba(42, 42, 37, 0.08);
  --shadow-lg: 0 8px 30px rgba(42, 42, 37, 0.10);
}
```

### 2.4 Outdoor Readability Rules

| Rule | Source | BullCast Implementation |
|------|--------|------------------------|
| No pure black (#000) in dark mode | Linear, AgridFlow | Use `#0B0E0B` (green undertone) to prevent OLED smearing |
| No pure white (#FFF) in light mode | AgridFlow, Wealthsimple | Use `#F4F3ED` (warm off-white) to prevent halo effect |
| 7:1 contrast ratio minimum | AgridFlow | Body text on bg-primary must exceed WCAG AAA |
| Desaturated earth tones | AgridFlow | Avoid neon greens; use `#4EBE96` not `#00FF00` |
| Orange-red for negative (not pure red) | Robinhood | `#FF5C5C` is distinguishable for colorblind users |

### 2.5 Gradients

```css
/* Text gradient for hero arroba price (Source: Fey) */
--gradient-text-hero: linear-gradient(90deg, #4EBE96 0%, #D4A745 100%);

/* Card accent border glow (Source: Fey conic gradient) */
--gradient-border-glow: conic-gradient(
  from 216deg at 50% 50%,
  rgba(78, 190, 150, 0.3) 0deg,
  rgba(212, 167, 69, 0.1) 180deg,
  rgba(78, 190, 150, 0.3) 360deg
);

/* Alert card warm gradient (Source: Fey + Robinhood gold) */
--gradient-warm: linear-gradient(97deg, #D4A745 8%, #3E2A10 100%);

/* Surface glass gradient (Source: Fey) */
--gradient-glass: linear-gradient(182deg,
  rgba(244, 243, 237, 0.02) 27%,
  rgba(90, 90, 80, 0.02) 59%,
  rgba(0, 0, 0, 0.02) 93%
);
```

---

## 3. Spacing System

### 3.1 Cross-Reference Comparison

| Token | Fey | Robinhood | Wealthsimple | AgridFlow | Linear |
|-------|-----|-----------|--------------|-----------|--------|
| Base unit | ~6-8px | 4px | 4px | 4-8px | 4px |
| Tight gap | 6px | 4px | 4px | 4px | 4px |
| Component padding | 12px | 12px | 12px | 12px | 12px |
| Standard gap | 16px | 16px | 16px | 16px | 16px |
| Card padding | 32px | 24px | 32px | 16px | 16px |
| Section gap | 48-72px | 48-80px | 96-160px | 32-48px | 48-80px |

### 3.2 BullCast Unified 4px Base Scale

Linear and Robinhood both use a strict 4px base. BullCast adopts this with adjustments for the 50+ persona (slightly more generous padding than Linear's dense approach).

```css
:root {
  --space-0: 0px;
  --space-1: 4px;       /* Micro: icon padding, badge insets */
  --space-2: 8px;       /* Tight: icon-to-text, between related items */
  --space-3: 12px;      /* Compact: small card padding (mobile) */
  --space-4: 16px;      /* Standard: component gaps, input padding */
  --space-5: 20px;      /* Comfortable: card padding (mobile) */
  --space-6: 24px;      /* Generous: card padding (desktop), grid gap */
  --space-8: 32px;      /* Section: between card groups */
  --space-10: 40px;     /* Large: page-level spacing */
  --space-12: 48px;     /* XL: major section separators */
  --space-16: 64px;     /* 2XL: section breathing room */
  --space-20: 80px;     /* 3XL: hero section spacing */
  --space-24: 96px;     /* 4XL: between major page sections */
}
```

### 3.3 Context-Based Spacing Guide

| Context | Token | Value | Source Blend |
|---------|-------|-------|-------------|
| Icon-to-text gap | `--space-2` | 8px | Linear (8px), Fey (8px) |
| Inline element gap | `--space-2` | 8px | Consistent across all 5 |
| Card internal padding (mobile) | `--space-4` | 16px | AgridFlow (16px), Robinhood (20px) -- biased generous |
| Card internal padding (desktop) | `--space-6` | 24px | Fey (32px), Linear (16px) -- middle ground |
| Between cards in a grid | `--space-4` | 16px | Linear (16px), AgridFlow (12px) |
| Between heading and body | `--space-4` | 16px | Wealthsimple (16-24px) |
| Between sections | `--space-12` | 48px | Linear (48px), Robinhood (48px) |
| Hero section vertical padding | `--space-20` | 80px | Robinhood (80px), Fey (92px) |
| Mobile container horizontal padding | `--space-5` | 20px | Fey (20px), Robinhood (20px) |
| Desktop container horizontal padding | `--space-10` | 40px | Fey (40px), Wealthsimple (64px) |

### 3.4 Container Widths

```css
:root {
  --container-max: 1200px;       /* Wealthsimple (1200), Fey (1220), Robinhood (1184) */
  --container-content: 1140px;   /* Fey (1140) */
  --container-narrow: 640px;     /* Text-heavy content */
  --container-chart: 100%;       /* Charts always full-width within container */
}
```

---

## 4. Component Patterns

### 4.1 Buttons

**Best-of sources**: Linear's compact, confident buttons + Robinhood's pill CTAs + AgridFlow's 48px mobile touch targets.

BullCast uses **sharp corners (radius: 0)** as its design identity, departing from the rounded/pill approach of all 5 references.

```css
/* PRIMARY CTA */
.btn-primary {
  background: var(--color-positive);     /* #4EBE96 -- teal green */
  color: #0B0E0B;                        /* Dark text on light button */
  font-family: var(--font-body);
  font-size: var(--text-body-md);        /* 16px */
  font-weight: var(--weight-semibold);   /* 600 */
  height: 48px;                          /* AgridFlow: 48px min for farmer hands */
  padding: 0 var(--space-6);            /* 24px horizontal */
  border: none;
  border-radius: 0;                      /* BullCast identity: sharp corners */
  cursor: pointer;
  transition: background 150ms ease, transform 80ms ease;
}
.btn-primary:hover {
  filter: brightness(1.1);
}
.btn-primary:active {
  transform: scale(0.98);               /* Linear: press feedback */
}

/* SECONDARY / OUTLINE */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-strong);
  height: 48px;
  padding: 0 var(--space-6);
  border-radius: 0;
  font-weight: var(--weight-medium);
  transition: background 150ms ease;
}
.btn-secondary:hover {
  background: rgba(244, 243, 237, 0.06);
}

/* GHOST */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  height: 40px;
  padding: 0 var(--space-4);
  border-radius: 0;
  font-weight: var(--weight-medium);
}
.btn-ghost:hover {
  color: var(--text-primary);
  background: rgba(244, 243, 237, 0.04);
}

/* DANGER */
.btn-danger {
  background: var(--color-negative);
  color: #FFFFFF;
  height: 48px;
  padding: 0 var(--space-6);
  border: none;
  border-radius: 0;
}

/* COMPACT (for dense UIs like tables) */
.btn-compact {
  height: 32px;                          /* Linear compact: 28-32px */
  padding: 0 var(--space-3);
  font-size: var(--text-body-sm);
}
```

**Source mapping**:

| Pattern | Source | BullCast Adaptation |
|---------|--------|-------------------|
| Pill shape (radius: 36-99px) | Fey, Robinhood | Rejected -- sharp corners (radius: 0) is BullCast identity |
| 48px mobile height | AgridFlow, Robinhood (44px) | Adopted -- critical for farmer's hands |
| scale(0.98) press feedback | Linear | Adopted -- instant tactile feedback |
| brightness hover | Wealthsimple | Adopted -- simpler than color swap |
| 120-150ms transitions | Linear | Adopted -- snappy interactions |

### 4.2 Cards

**Best-of sources**: Fey's glassmorphism for premium feel + Linear's dense structure + AgridFlow's metric card pattern.

```css
/* BASE CARD */
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 0;                      /* BullCast identity */
  padding: var(--space-5);              /* 20px */
  transition: background 120ms ease;     /* Linear speed */
}
.card:hover {
  background: var(--bg-tertiary);
}

/* GLASS CARD (Source: Fey -- for premium data displays) */
.card-glass {
  background: var(--gradient-glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-default);
  border-radius: 0;
  padding: var(--space-6);
  box-shadow: inset 0 0.5px 0 rgba(244, 243, 237, 0.08);
}

/* METRIC CARD (Source: AgridFlow hero metric + Robinhood price display) */
.card-metric {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 0;
  padding: var(--space-5);
}
.card-metric__label {
  font-size: var(--text-body-xs);        /* 12px */
  font-weight: var(--weight-medium);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}
.card-metric__value {
  font-family: var(--font-mono);
  font-size: var(--text-price-card);     /* 24px */
  font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
}
.card-metric__delta {
  font-family: var(--font-mono);
  font-size: var(--text-price-delta);    /* 16px */
  font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums;
}
.card-metric__delta--positive { color: var(--color-positive); }
.card-metric__delta--negative { color: var(--color-negative); }

/* ALERT CARD (Source: AgridFlow color-border pattern) */
.card-alert {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-left: 4px solid var(--color-warning);  /* Color-coded left border */
  border-radius: 0;
  padding: var(--space-5);
}
.card-alert--positive { border-left-color: var(--color-positive); }
.card-alert--negative { border-left-color: var(--color-negative); }
.card-alert--info { border-left-color: var(--color-info); }
```

**Source mapping**:

| Pattern | Source | BullCast Adaptation |
|---------|--------|-------------------|
| Glassmorphism (blur + gradient bg + border) | Fey | For premium data displays (arroba price hero) |
| Color-coded left border on alerts | AgridFlow | Direct adoption for alert cards |
| 120ms hover transitions | Linear | Fast, professional response |
| Hero metric pattern (oversized number + label + delta) | AgridFlow, Robinhood | Core dashboard pattern |
| Card hover = bg shift (not shadow) | Linear | Cleaner for dark mode |
| 14px border-radius | Fey, Wealthsimple | Rejected -- radius: 0 for BullCast |

### 4.3 Tooltips and Popovers

```css
/* TOOLTIP (Source: Linear's elevated surfaces + Fey's blur) */
.tooltip {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 0;
  padding: var(--space-2) var(--space-3);  /* 8px 12px */
  font-size: var(--text-body-sm);
  color: var(--text-primary);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

/* CHART TOOLTIP (Source: Robinhood price display + AgridFlow) */
.tooltip-chart {
  background: var(--chart-tooltip-bg);
  border: 1px solid var(--border-default);
  border-radius: 0;
  padding: var(--space-3);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
```

### 4.4 Price Display (Source: Robinhood)

```css
/* Hero price -- largest element on screen */
.price-hero {
  font-family: var(--font-display);
  font-size: var(--text-display-lg);      /* 40px mobile, 56px desktop */
  font-weight: var(--weight-extrabold);
  line-height: var(--leading-tight);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--tracking-tight);
}

/* Price change pill (Source: Robinhood) */
.price-delta-pill {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);  /* 4px 8px */
  border-radius: 0;                        /* BullCast identity */
  font-family: var(--font-mono);
  font-size: var(--text-price-delta);
  font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums;
}
.price-delta-pill--positive {
  background: var(--color-positive-lighter);
  color: var(--color-positive);
}
.price-delta-pill--negative {
  background: var(--color-negative-lighter);
  color: var(--color-negative);
}
```

### 4.5 Status Pills / Badges (Source: AgridFlow + Linear)

```css
.badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 var(--space-2);              /* 8px */
  border-radius: 0;
  font-size: var(--text-body-xs);         /* 12px */
  font-weight: var(--weight-medium);
}
/* Color-coded using accent at 15% bg + full-brightness text (Linear pattern) */
.badge--positive { background: var(--color-positive-light); color: var(--color-positive); }
.badge--negative { background: var(--color-negative-light); color: var(--color-negative); }
.badge--warning  { background: var(--color-warning-light);  color: var(--color-warning); }
.badge--info     { background: var(--color-info-light);     color: var(--color-info); }
.badge--brand    { background: var(--color-brand-light);    color: var(--color-brand); }
```

### 4.6 Time Period Selector (Source: Robinhood)

```css
/* Chart time range tabs: 1D, 1S, 1M, 3M, 1A, MAX */
.time-selector {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2) 0;
}
.time-selector__btn {
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  font-weight: var(--weight-bold);
  padding: var(--space-1) var(--space-3);  /* 4px 12px */
  background: transparent;
  border: none;
  border-radius: 0;
  color: var(--text-secondary);
  cursor: pointer;
  min-height: 32px;
}
.time-selector__btn--active {
  background: var(--color-positive-lighter);
  color: var(--color-positive);
}
```

### 4.7 Bottom Navigation (Source: Robinhood + AgridFlow)

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-default);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 var(--space-4);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);  /* Notch safety */
}
.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-tertiary);
  font-size: 10px;
  font-weight: var(--weight-medium);
  min-width: 48px;                              /* AgridFlow: 48px touch target */
  min-height: 48px;
  justify-content: center;
}
.bottom-nav__item--active {
  color: var(--color-positive);
}
```

---

## 5. Animation Patterns

### 5.1 Cross-Reference Comparison

| Context | Fey | Robinhood | Wealthsimple | Linear |
|---------|-----|-----------|--------------|--------|
| Hover | 0.1-0.15s ease | 0.25s ease-in-out | 0.15-0.2s ease | 80-120ms ease |
| Component enter | 0.3s ease | 0.4s ease | 0.3-0.4s ease-in-out | 150-200ms ease |
| Page transition | 0.6-0.9s ease-in-out | 0.4s ease | 0.5-0.6s ease | 200ms cubic-bezier |
| Scroll reveal | -- | fadeUp 0.4s | fadeUp 0.6s | -- |
| Chart animation | -- | cubic-bezier | -- | 500-800ms cubic-bezier |
| Looping/ambient | 4.8-10s linear | -- | -- | 2800-3200ms stepped |

### 5.2 BullCast Animation Tokens

BullCast favors Linear's fast approach for UI interactions, with Fey's longer durations for ambient/decorative motion. Seu Antonio should never feel like the UI is "animating" -- transitions should feel instant.

```css
:root {
  /* ===== DURATIONS ===== */
  --duration-instant: 80ms;       /* Button press, active states */
  --duration-fast: 120ms;         /* Hover, focus, toggle */
  --duration-base: 200ms;         /* Standard transitions */
  --duration-moderate: 300ms;     /* Component enter/exit */
  --duration-slow: 500ms;         /* Page transitions, charts */
  --duration-reveal: 600ms;       /* Scroll-triggered reveals */
  --duration-chart: 800ms;        /* Chart line drawing */
  --duration-ambient: 4800ms;     /* Background loops (Fey) */

  /* ===== EASINGS ===== */
  /* Standard (Source: Linear) */
  --ease-default: cubic-bezier(0.25, 0.1, 0.25, 1);

  /* Snappy -- for UI interactions (Source: Linear) */
  --ease-snappy: cubic-bezier(0.16, 1, 0.3, 1);

  /* Smooth -- for content reveals (Source: Wealthsimple) */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);

  /* Spring -- for playful feedback (Source: Fey bouncy) */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Chart -- for data visualization (Source: Linear) */
  --ease-chart: cubic-bezier(0.33, 1, 0.68, 1);
}
```

### 5.3 Animation Patterns

```css
/* FADE-UP REVEAL (Source: Robinhood + Wealthsimple -- for scroll-triggered content) */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Usage with GSAP ScrollTrigger or Framer Motion */

/* FADE IN (Source: Fey) */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* PRICE COUNTER (Source: Wealthsimple number count-up) */
/* Implement via Framer Motion's useSpring or GSAP .to() */

/* SKELETON SHIMMER (Source: Linear loading pattern) */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1500ms ease-in-out infinite;
}

/* CHART LINE DRAW (Source: Robinhood + Linear) */
/* Implement via Recharts animationDuration={800} animationEasing="ease-out" */
```

### 5.4 Duration Guidelines

| Context | Duration | Easing | Source |
|---------|----------|--------|--------|
| Color/opacity hover | 120ms | ease | Linear |
| Button press | 80ms | ease | Linear |
| Dropdown open | 150ms | ease-snappy | Linear |
| Card hover bg shift | 120ms | ease | Linear |
| Content fade-in | 200ms | ease-default | Linear |
| Scroll reveal | 600ms | ease-smooth | Wealthsimple |
| Stagger children | +100ms each | ease-smooth | Wealthsimple |
| Chart line draw | 800ms | ease-chart | Linear |
| Price count-up | 800-1200ms | ease-out | Wealthsimple |
| Skeleton shimmer | 1500ms | ease-in-out | Linear |
| Ambient rotation | 4800ms | linear infinite | Fey |
| Background effects | 10s | linear infinite | Fey |

### 5.5 GSAP + Framer Motion Integration

BullCast uses both GSAP (scroll-based, complex sequences) and Framer Motion (component-level, React integration).

| Library | Use Case | Example |
|---------|----------|---------|
| GSAP ScrollTrigger | Scroll-based reveals, parallax, chart entrances | Dashboard sections fade-up on scroll |
| GSAP .to() | Price counter animation, number interpolation | Arroba price counting up from old to new value |
| Framer Motion | Component mount/unmount, layout animations, gestures | Card expand/collapse, modal enter/exit |
| Framer Motion `useSpring` | Spring physics for drag interactions | Pull-to-refresh, swipeable cards |

### 5.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Effects -- Shadows, Blurs, Glassmorphism, Glows

### 6.1 Cross-Reference Comparison

| Effect | Fey | Robinhood | Wealthsimple | Linear |
|--------|-----|-----------|--------------|--------|
| Shadows | Multi-layer complex | None (bg shifts only) | Warm-tinted subtle | Minimal (bg shifts) |
| Blur | 4.4-217px scale | 10px sticky header | None | None |
| Glassmorphism | Core visual identity | Not used | Not used | Not used |
| Glow | CTA hover glow | Not used | Not used | Primary CTA only |
| Noise texture | Yes (screen blend) | Not used | Not used | Not used |
| 3D transforms | perspective() on cards | Not used | Scroll parallax | Not used |

### 6.2 BullCast Shadow System

BullCast uses a hybrid: Linear's "no shadow" approach for standard UI, with Fey's layered shadows reserved for elevated/premium elements.

```css
:root {
  /* Standard UI: no shadows, elevation via background color shift (Linear approach) */

  /* Elevated elements only (modals, dropdowns, sticky headers) */
  --shadow-elevated: 0 4px 16px rgba(0, 0, 0, 0.4);

  /* Premium / hero elements (Source: Fey multi-layer) */
  --shadow-premium:
    0 30px 16px rgba(0, 0, 0, 0.12),
    0 16px 8px rgba(0, 0, 0, 0.07),
    0 6px 4px rgba(0, 0, 0, 0.04);

  /* Glow for primary CTA hover (Source: Fey) */
  --shadow-glow-positive: 0 4px 20px rgba(78, 190, 150, 0.25);
  --shadow-glow-brand: 0 4px 20px rgba(212, 167, 69, 0.25);
  --shadow-glow-negative: 0 4px 20px rgba(255, 92, 92, 0.25);

  /* Inner highlight for glass surfaces (Source: Fey) */
  --shadow-inner-highlight: inset 0 0.5px 0 rgba(244, 243, 237, 0.08);
}
```

### 6.3 BullCast Blur Scale

```css
:root {
  /* Source: Fey blur scale, adapted for BullCast */
  --blur-subtle: 4px;          /* Light background blur */
  --blur-standard: 6px;        /* Overlay blur */
  --blur-medium: 10px;         /* Glass cards, sticky headers, buttons */
  --blur-heavy: 40px;          /* Full-screen overlays */
}
```

### 6.4 Glassmorphism Recipe

Use sparingly -- only for the hero arroba price card and premium data displays. Not for every card.

```css
.glass {
  background: var(--gradient-glass);
  backdrop-filter: blur(var(--blur-medium));
  -webkit-backdrop-filter: blur(var(--blur-medium));
  border: 1px solid var(--border-default);
  border-radius: 0;                              /* BullCast identity */
  box-shadow: var(--shadow-inner-highlight);
}
```

### 6.5 Noise Texture Overlay (Source: Fey)

Apply to hero sections and glass surfaces for premium texture.

```css
.noise::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.svg');
  opacity: 0.04;
  pointer-events: none;
  mix-blend-mode: screen;
}
```

### 6.6 Gradient Border Technique (Source: Fey)

For premium/featured cards only (e.g., "Plano Pro" card, featured alert).

```css
.gradient-border {
  position: relative;
  border-radius: 0;
  background: var(--bg-secondary);
}
.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  background: var(--gradient-border-glow);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

### 6.7 Effects Usage Guidelines

| Effect | When to Use | When NOT to Use |
|--------|-------------|-----------------|
| Glassmorphism | Hero arroba price, premium overlay | Regular cards, list items |
| Multi-layer shadow | Modals, floating panels | Cards in grids, buttons |
| Glow | CTA hover, active alert | Decorative, ambient |
| Noise texture | Hero section, glass surfaces | Everywhere (performance cost) |
| Gradient border | Featured/premium cards, pro tier | Standard cards |
| 3D perspective | Hero screenshots, marketing | Dashboard UI |

---

## 7. Responsive Breakpoints

### 7.1 Cross-Reference Comparison

| Breakpoint | Fey | Robinhood | Wealthsimple | AgridFlow | Linear |
|-----------|-----|-----------|--------------|-----------|--------|
| Small mobile | 376px | -- | -- | 375px | -- |
| Mobile | 540px | 426px | 640px | -- | 640px |
| Tablet | 768px | 768px | 768px | 768px | 768px |
| Desktop | 1024px | 1024px | 1024px | 1024px | 1024px |
| Wide | 1280px | 1280px | 1280px | 1280px | 1280px |
| XL | 1440px | -- | 1440px | -- | -- |

### 7.2 BullCast Breakpoints (Mobile-First)

```css
:root {
  --bp-sm: 375px;     /* Small phones -- minimum supported (AgridFlow) */
  --bp-md: 768px;     /* Tablets -- universal consensus */
  --bp-lg: 1024px;    /* Small desktops -- universal consensus */
  --bp-xl: 1280px;    /* Standard desktops */
}

/* Usage */
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Wide */ }
```

### 7.3 Mobile Layout Grid

| Breakpoint | Columns | Gap | Margin | Source |
|-----------|---------|-----|--------|--------|
| < 768px | 1 | 16px | 20px | Robinhood + Fey |
| 768-1023px | 2 | 16px | 24px | Robinhood |
| 1024-1279px | 3 | 24px | 40px | Fey |
| 1280px+ | 3-4 | 24px | auto (centered) | Robinhood |

---

## 8. Design Identity Summary

### What BullCast Takes From Each Source

| Source | Primary Contribution | Key Tokens Adopted |
|--------|--------------------|--------------------|
| **Fey** | Glassmorphism, shadows, gradients, ambient animations | Glass recipe, blur scale, shadow layers, noise texture, gradient borders |
| **Robinhood** | Financial data patterns, price displays, chart styling | Sentiment colors, price pill, time selector, bottom nav, tabular-nums |
| **Wealthsimple** | Warmth, generosity, editorial quality, light mode | Warm off-whites, section spacing, scroll reveals, content voice |
| **AgridFlow** | Agritech UX, outdoor readability, farmer persona | 48px touch targets, alert cards, metric cards, hero metric pattern, data density rules |
| **Linear** | Dark mode excellence, density, speed, precision | Near-black bg, 4-tier text opacity, fast animations, tight spacing, medium weight default |

### What BullCast Does Differently

| Industry Pattern | BullCast Override | Reason |
|-----------------|-------------------|--------|
| Rounded corners (8-14px) | `border-radius: 0` | Sharp identity -- cattle branding aesthetic |
| Pill buttons (36-99px) | `border-radius: 0` | Consistent with sharp identity |
| 13-14px body text | 16px minimum | Seu Antonio is 50+, needs legibility |
| Dense spacing (8-12px gaps) | 16-20px card padding | Older users need more breathing room |
| Pure black backgrounds | `#0B0E0B` (green undertone) | Warm, prevents OLED smearing |
| Blue/purple accents | Teal `#4EBE96` + Gold `#D4A745` | Cattle market = pastoral green + commodities gold |
| Inter for everything | Big Shoulders + Barlow + JetBrains Mono | Distinctive display + readable body + precise data |

---

## Appendix: Complete Token Reference

```css
:root {
  /* ===== TYPOGRAPHY ===== */
  --font-display: 'Big Shoulders Display', system-ui, sans-serif;
  --font-body: 'Barlow', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;

  --text-display-xl: 3.5rem;
  --text-display-lg: 2.5rem;
  --text-display-md: 2rem;
  --text-display-sm: 1.5rem;
  --text-body-lg: 1.25rem;
  --text-body-md: 1rem;
  --text-body-sm: 0.875rem;
  --text-body-xs: 0.75rem;
  --text-price-hero: 3rem;
  --text-price-card: 1.5rem;
  --text-price-delta: 1rem;
  --text-price-table: 0.875rem;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-extrabold: 800;

  --leading-tight: 1.1;
  --leading-snug: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.6;

  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;

  /* ===== COLORS (DARK MODE) ===== */
  --bg-primary: #0B0E0B;
  --bg-secondary: #111611;
  --bg-tertiary: #1A1F1A;
  --bg-elevated: #1E241E;
  --bg-surface: #252B25;

  --text-primary: rgba(244, 243, 237, 0.95);
  --text-secondary: rgba(244, 243, 237, 0.65);
  --text-tertiary: rgba(244, 243, 237, 0.45);
  --text-quaternary: rgba(244, 243, 237, 0.20);

  --color-positive: #4EBE96;
  --color-positive-light: rgba(78, 190, 150, 0.20);
  --color-positive-lighter: rgba(78, 190, 150, 0.10);
  --color-negative: #FF5C5C;
  --color-negative-light: rgba(255, 92, 92, 0.20);
  --color-negative-lighter: rgba(255, 92, 92, 0.10);
  --color-warning: #FFA16C;
  --color-warning-light: rgba(255, 161, 108, 0.20);
  --color-info: #60A5FA;
  --color-info-light: rgba(96, 165, 250, 0.15);
  --color-brand: #D4A745;
  --color-brand-light: rgba(212, 167, 69, 0.20);

  --border-subtle: rgba(244, 243, 237, 0.06);
  --border-default: rgba(244, 243, 237, 0.10);
  --border-strong: rgba(244, 243, 237, 0.16);

  /* ===== SPACING (4px base) ===== */
  --space-0: 0px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* ===== CONTAINERS ===== */
  --container-max: 1200px;
  --container-content: 1140px;
  --container-narrow: 640px;

  /* ===== ANIMATION ===== */
  --duration-instant: 80ms;
  --duration-fast: 120ms;
  --duration-base: 200ms;
  --duration-moderate: 300ms;
  --duration-slow: 500ms;
  --duration-reveal: 600ms;
  --duration-chart: 800ms;
  --duration-ambient: 4800ms;

  --ease-default: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-snappy: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-chart: cubic-bezier(0.33, 1, 0.68, 1);

  /* ===== EFFECTS ===== */
  --shadow-elevated: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-premium:
    0 30px 16px rgba(0, 0, 0, 0.12),
    0 16px 8px rgba(0, 0, 0, 0.07),
    0 6px 4px rgba(0, 0, 0, 0.04);
  --shadow-glow-positive: 0 4px 20px rgba(78, 190, 150, 0.25);
  --shadow-glow-brand: 0 4px 20px rgba(212, 167, 69, 0.25);
  --shadow-glow-negative: 0 4px 20px rgba(255, 92, 92, 0.25);
  --shadow-inner-highlight: inset 0 0.5px 0 rgba(244, 243, 237, 0.08);

  --blur-subtle: 4px;
  --blur-standard: 6px;
  --blur-medium: 10px;
  --blur-heavy: 40px;

  /* ===== CHARTS ===== */
  --chart-positive: #4EBE96;
  --chart-negative: #FF5C5C;
  --chart-secondary: #60A5FA;
  --chart-tertiary: #D4A745;
  --chart-grid: rgba(244, 243, 237, 0.06);
  --chart-axis: rgba(244, 243, 237, 0.35);
  --chart-tooltip-bg: #1E241E;

  /* ===== GRADIENTS ===== */
  --gradient-text-hero: linear-gradient(90deg, #4EBE96 0%, #D4A745 100%);
  --gradient-border-glow: conic-gradient(
    from 216deg at 50% 50%,
    rgba(78, 190, 150, 0.3) 0deg,
    rgba(212, 167, 69, 0.1) 180deg,
    rgba(78, 190, 150, 0.3) 360deg
  );
  --gradient-warm: linear-gradient(97deg, #D4A745 8%, #3E2A10 100%);
  --gradient-glass: linear-gradient(182deg,
    rgba(244, 243, 237, 0.02) 27%,
    rgba(90, 90, 80, 0.02) 59%,
    rgba(0, 0, 0, 0.02) 93%
  );
}
```
