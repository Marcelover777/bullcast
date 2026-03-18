# Robinhood Design System Reference

> Extracted from robinhood.com on 2026-03-18
> Purpose: Design reference for BullCast financial UI patterns

---

## 1. CSS Custom Properties (Design Tokens)

Robinhood uses CSS custom properties extensively on their app/stock pages. The marketing site uses CSS-in-JS with hashed class names.

### Semantic Colors

```css
/* Positive / Negative (financial sentiment) */
--rh__semantic-positive-base: rgb(0, 200, 5);       /* #00C805 - stock up */
--rh__semantic-negative-base: rgb(255, 80, 0);       /* #FF5000 - stock down */

/* Positive variants */
--rh__semantic-positive-light: rgba(0, 200, 5, 0.3);
--rh__semantic-positive-lightest: rgba(0, 200, 5, 0.1);

/* Negative variants */
--rh__semantic-negative-light: rgba(255, 80, 0, 0.3);
--rh__semantic-negative-lightest: rgba(255, 80, 0, 0.1);
```

### Primary (Brand Green)

```css
--rh__primary-base: rgb(0, 200, 5);                  /* #00C805 */
--rh__primary-hover: rgba(0, 200, 5, 0.85);
--rh__primary-pressed: rgba(0, 160, 4, 1);           /* #00A004 - darker green */
--rh__primary-light-base: rgba(0, 200, 5, 0.3);
--rh__primary-lightest-base: rgba(0, 200, 5, 0.1);
```

### Neutral Palette

```css
--rh__neutral-fg1: rgb(0, 0, 0);                     /* #000000 - primary text */
--rh__neutral-bg1: rgb(255, 255, 255);                /* #FFFFFF - primary bg */
--rh__neutral-bg3: rgb(227, 233, 237);                /* #E3E9ED - borders/grid */
```

### Marketing Site Colors (Hardcoded)

```css
/* Backgrounds */
#000000   /* Pure black - primary dark bg */
#010101   /* Near black */
#110E08   /* Warm black - card/section bg */
#1C180D   /* Dark brown-black */

/* Text */
#FFFFFF   /* White - primary text on dark */
#4D4A46   /* Muted warm gray */
#696764   /* Medium gray */
#888784   /* Light gray */
#BFBFBF   /* Lighter gray */

/* Borders */
#35322D   /* Dark warm gray - subtle borders */
#808080   /* Medium gray - card borders */

/* Accent */
#CCFF00   /* Neon lime - CTA highlight, Gold page banner */
#D9D9D9   /* Light gray - dividers */
```

### Gold Premium Gradient

```css
/* Robinhood Gold branding */
background: linear-gradient(270deg, #94814C 0%, #CFB97D 100%);

/* Gold text effect */
background: linear-gradient(270deg, #94814C 0%, #CFB97D 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 2. Typography

### Font Families

| Role | Family | Fallback |
|------|--------|----------|
| **Display / Headlines** | `Phonic` | Helvetica, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif |
| **Body / UI Text** | `Capsule Sans Text` | sans-serif |
| **Premium Serif** | `Martina Plantijn` | serif |
| **Editorial Serif** | `ITC Garamond Std` | serif |
| **Decorative** | `Nib Pro Display` | serif |

### Type Scale

| Token | Size | Weight | Letter-Spacing | Line-Height | Usage |
|-------|------|--------|----------------|-------------|-------|
| displayCapsuleL | 32px | 500 | -0.33px | 40px | **Stock price display** |
| textMBold | 15px | 700 | -0.1px | 20px | Price change (+/-%) |
| textSBold | 13px | 700 | -0.1px | 18px | Tab labels, small labels |
| textM | 15px | 400 | -0.1px | 20px | Body text |
| textS | 13px | 400 | -0.1px | 18px | Secondary info |

### Marketing Scale (Responsive)

| Context | Mobile | Tablet | Desktop | Weight |
|---------|--------|--------|---------|--------|
| Hero headline | 44px | 58px | 72-90px | 400 |
| Section header | 28px | 34px | 40px | 400 |
| Body | 14px | 16px | 16px | 400 |
| Fine print | 12px | 14px | 14px | 400 |
| Button label | 14px | 14px | 16px | 700 |

### Typography Rules

- Letter-spacing is consistently **negative** (-0.1px to -2px) for tighter tracking
- Line heights scale proportionally (1.25x to 1.5x font size)
- Financial numbers use **monospace-like alignment** via tabular-nums
- Price display is always the largest element in its context

---

## 3. Color System

### Financial Sentiment Colors

```
POSITIVE (Stock Up)
  Base:     #00C805  rgb(0, 200, 5)
  Light:    rgba(0, 200, 5, 0.3)
  Lightest: rgba(0, 200, 5, 0.1)

NEGATIVE (Stock Down)
  Base:     #FF5000  rgb(255, 80, 0)
  Light:    rgba(255, 80, 0, 0.3)
  Lightest: rgba(255, 80, 0, 0.1)
```

Note: Robinhood uses **orange-red (#FF5000)** instead of pure red for negative changes. This is a deliberate accessibility choice - orange-red has better contrast and is more distinguishable for colorblind users.

### Dark Theme Palette

```
BACKGROUNDS
  Level 0 (deepest):  #000000
  Level 1 (sections): #110E08
  Level 2 (cards):    #1C180D
  Level 3 (elevated): #35322D

FOREGROUND
  Primary:   #FFFFFF
  Secondary: #BFBFBF
  Tertiary:  #888784
  Muted:     #696764
  Disabled:  #4D4A46

BORDERS
  Subtle:  #35322D
  Default: #808080
  Strong:  #D9D9D9

ACCENT
  Neon:    #CCFF00
  Gold:    linear-gradient(270deg, #94814C, #CFB97D)
```

---

## 4. Spacing System

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Minimal gaps |
| space-2 | 6px | Icon-to-text gaps |
| space-3 | 8px | Tight component padding |
| space-4 | 12px | Small gaps between elements |
| space-5 | 16px | Default component padding |
| space-6 | 20px | Tab gaps, section inner padding |
| space-7 | 24px | Card padding, mobile sections |
| space-8 | 32px | Section gaps |
| space-10 | 48px | Desktop section padding, large gaps |
| space-12 | 70px | Major section separators |
| space-14 | 80px | Hero spacing |

### Container Max Widths

| Context | Width |
|---------|-------|
| Text content | 750px |
| Carousel | 656px |
| Feature section | 1184px |
| Full section | 90vw |

---

## 5. Animation Patterns

### Transition Defaults

```css
/* Standard interaction */
transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

/* Hover states */
transition: opacity 0.25s ease-in-out;
transition: border-color 0.25s ease-in-out;
transition: box-shadow 0.25s ease-in-out;

/* Content reveal */
transition: all 0.4s ease;
```

### Keyframe Patterns

```css
/* Infinite rotation (loading spinner) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Fade up (content entry) */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Horizontal marquee scroll */
@keyframes slideLeft {
  from { transform: translateX(0); }
  to { transform: translateX(-20px); }
}

/* Emphasis pulse */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(2.5); }
  100% { transform: scale(1); }
}

/* Slide in from right */
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

### Animation Principles

- **Entry animations**: Fade + translate (subtle, 0.4s ease)
- **Interaction feedback**: Immediate (opacity/color change)
- **Chart animations**: Smooth line drawing with cubic-bezier easing
- **Loading states**: Infinite rotation (spinner) or skeleton shimmer
- **No bounce/spring physics** - all animations are clean and professional

---

## 6. Component Styles

### Buttons

```css
/* Primary CTA */
.btn-primary {
  height: 44px;
  padding: 0 32px;
  border-radius: 36px;           /* Fully rounded / pill shape */
  background: #00C805;           /* App: green */
  /* or */
  background: #CCFF00;           /* Marketing: neon */
  /* or */
  background: linear-gradient(270deg, #94814C, #CFB97D); /* Gold */
  color: #000000;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  min-width: 120px;
}

.btn-primary:hover {
  opacity: 0.85;
}

/* Secondary / Outline */
.btn-secondary {
  height: 44px;
  padding: 0 32px;
  border-radius: 36px;
  background: transparent;
  border: 1px solid #FFFFFF;
  color: #FFFFFF;
}

/* Buy/Sell (App) */
.btn-trade {
  height: 36px;
  min-width: 120px;
  border-radius: 36px;
  border: 1px solid var(--rh__primary-base);
  background: transparent;
  color: var(--rh__primary-base);
}

.btn-trade:hover {
  background: var(--rh__primary-lightest-base); /* rgba(0, 200, 5, 0.1) */
}

.btn-trade:active {
  background: var(--rh__primary-light-base);    /* rgba(0, 200, 5, 0.3) */
}
```

### Cards

```css
/* Feature Card (Marketing) */
.card-feature {
  border: 1px solid #808080;
  border-radius: 20px;
  overflow: hidden;
  min-height: 325px;
  background: #110E08;
}

/* Info Card (App) */
.card-info {
  border: 1px solid var(--rh__neutral-bg3);
  border-radius: 4px;
  padding: 20px;
  height: 184px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Card with media overlay */
.card-media {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
}

.card-media::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to top, #000000, transparent);
}
```

### Tab Navigation

```css
.tab-item {
  font-size: 13px;
  font-weight: 700;
  padding-bottom: 8px;
  border-bottom: 2px solid transparent;
  color: var(--rh__neutral-fg1);
  cursor: pointer;
}

.tab-item:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.tab-item--active {
  border-bottom-color: var(--rh__neutral-fg1);
}

.tab-list {
  display: flex;
  gap: 20px;
  border-bottom: 1px solid var(--rh__neutral-bg3);
}
```

---

## 7. Chart Styling Patterns

### Chart Container

```css
.chart-container {
  background: var(--rh__neutral-bg1);
  width: 100%;
  position: relative;
}

/* Chart grid lines */
.chart-grid {
  stroke: var(--rh__neutral-bg3);    /* #E3E9ED */
  stroke-width: 1px;
  stroke-dasharray: none;            /* Solid lines, not dashed */
}

/* Chart line (positive) */
.chart-line--positive {
  stroke: var(--rh__semantic-positive-base);  /* #00C805 */
  stroke-width: 2px;
  fill: none;
}

/* Chart line (negative) */
.chart-line--negative {
  stroke: var(--rh__semantic-negative-base);  /* #FF5000 */
  stroke-width: 2px;
  fill: none;
}

/* Chart area fill */
.chart-area--positive {
  fill: rgba(0, 200, 5, 0.1);
}

.chart-area--negative {
  fill: rgba(255, 80, 0, 0.1);
}
```

### Price Display Pattern

```css
/* Main price (hero element) */
.price-display {
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.33px;
  line-height: 40px;
  font-variant-numeric: tabular-nums;
}

/* Price change badge */
.price-change {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.1px;
}

.price-change--positive {
  color: var(--rh__semantic-positive-base);  /* #00C805 */
}

.price-change--negative {
  color: var(--rh__semantic-negative-base);  /* #FF5000 */
}

/* Price change with background pill */
.price-change-pill {
  padding: 2px 8px;
  border-radius: 4px;
}

.price-change-pill--positive {
  background: rgba(0, 200, 5, 0.1);
  color: #00C805;
}

.price-change-pill--negative {
  background: rgba(255, 80, 0, 0.1);
  color: #FF5000;
}
```

### Time Period Selector

```css
/* Chart time range tabs (1D, 1W, 1M, 3M, 1Y, ALL) */
.time-selector {
  display: flex;
  gap: 8px;
  padding: 8px 0;
}

.time-selector__btn {
  font-size: 13px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 16px;
  background: transparent;
  border: none;
  color: var(--rh__neutral-fg1);
  cursor: pointer;
}

.time-selector__btn--active {
  background: var(--rh__primary-lightest-base);
  color: var(--rh__primary-base);
}
```

### Progress/Sparkline Bar

```css
.progress-bar {
  height: 6px;
  border-radius: 3px;
  background: var(--rh__neutral-bg3);
  overflow: hidden;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-bar__fill {
  height: 100%;
  border-radius: 3px;
  background: var(--rh__primary-base);
}
```

---

## 8. Bottom Navigation / Mobile Patterns

### Mobile Navigation Bar

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #000000;
  border-top: 1px solid #35322D;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 16px;
  z-index: 1000;
  /* Safe area for notched phones */
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #888784;
  font-size: 10px;
}

.bottom-nav__item--active {
  color: #FFFFFF;
}

.bottom-nav__icon {
  width: 24px;
  height: 24px;
  stroke-width: 1.5px;
}
```

### Sticky Header (Scroll)

```css
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #000000;
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  border-bottom: 1px solid #35322D;
}

/* Condensed price in sticky header */
.sticky-header .price {
  font-size: 16px;
  font-weight: 700;
}
```

---

## 9. Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 426px) {
  /* Tablet portrait */
}

@media (min-width: 768px) {
  /* Tablet landscape / small desktop */
}

@media (min-width: 1024px) {
  /* Desktop */
}

@media (min-width: 1280px) {
  /* Wide desktop */
}
```

| Breakpoint | Width | Columns | Gutter | Margin |
|------------|-------|---------|--------|--------|
| Mobile | < 426px | 1 | 16px | 20px |
| Tablet | 426-767px | 2 | 16px | 24px |
| Desktop | 768-1023px | 3 | 24px | 48px |
| Wide | 1280px+ | 3-4 | 24px | auto (centered) |

---

## 10. Icon System

- **Style**: Outlined stroke icons (not filled)
- **Sizes**: 16px (inline), 24px (navigation), 32px (feature)
- **Stroke weight**: 1.5-2px consistent
- **Color**: Inherits from parent (`currentColor`)
- **Format**: Inline SVG (not icon font)

---

## 11. Key Design Principles (Observed)

1. **Dark-first**: All financial data screens use dark backgrounds for reduced eye strain
2. **Minimal chrome**: Very few borders, shadows, or decorative elements
3. **Data hierarchy**: Price is always the largest, most prominent element
4. **Color = meaning**: Green/red only used for financial sentiment, never decorative
5. **Pill-shaped CTAs**: All action buttons use fully-rounded border-radius (36px)
6. **Negative letter-spacing**: Tighter tracking throughout for a modern, dense feel
7. **Subtle borders**: 1px borders at low-contrast colors, never heavy outlines
8. **Accessibility orange-red**: Uses #FF5000 instead of pure red for better colorblind distinction
9. **No shadows**: Elevation expressed through background color shifts, not box-shadow
10. **Tabular numbers**: Financial figures use `font-variant-numeric: tabular-nums` for alignment

---

## 12. BullCast Adaptation Notes

### Direct Mappings
| Robinhood | BullCast Equivalent |
|-----------|-------------------|
| Stock price (#00C805 / #FF5000) | Arroba price (alta / baixa) |
| Chart green/red lines | Grafico de preco do boi |
| Buy/Sell buttons | Alertas de compra/venda |
| Time selector (1D, 1W, 1M...) | Periodo do grafico |
| Bottom nav (5 items) | Menu inferior BullCast |
| Price change pill | Variacao diaria da arroba |

### Recommended Adaptations
- Replace `Capsule Sans Text` with `Inter` or `DM Sans` (open source equivalents)
- Replace `Phonic` with `Outfit` or `Plus Jakarta Sans` (display alternative)
- Replace `Martina Plantijn` with `Lora` or `Playfair Display` (serif alternative)
- Keep the **#00C805 / #FF5000** pair - excellent for financial UIs
- Use `#110E08` warm black instead of pure `#000000` for a friendlier dark theme
- Adapt pill buttons and tab navigation patterns directly
- Chart styling maps 1:1 to Lightweight Charts library configuration
