# Linear.app Design System Reference

> Extracted from linear.app on 2026-03-18
> Purpose: Reference for BullCast dark-mode dashboard design

---

## 1. Design Philosophy

Linear builds around three principles that translate directly into their UI:

- **Craftsmanship over speed** -- every pixel is intentional, no generic UI patterns
- **Density with clarity** -- maximum information, zero clutter
- **Speed as a feature** -- sub-100ms interactions, keyboard-first, instant transitions

Their product feels premium because it treats the interface as a precision instrument, not a web page.

---

## 2. Color System

### 2.1 Background Palette (Dark Mode)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `#08090a` | Page background -- near-black with slight blue undertone |
| `--color-bg-secondary` | `~#0f1115` | Card/panel backgrounds -- subtle elevation |
| `--color-bg-tertiary` | `~#1a1d23` | Hover states, active selections |
| `--color-bg-elevated` | `~#1e2028` | Modals, dropdowns, floating panels |

**Key insight:** Linear does NOT use pure black (`#000`). Their backgrounds have a slight blue-gray warmth (`#08090a`) that reduces eye strain and feels more premium than cold black.

### 2.2 Text Color Hierarchy

| Token | Approx. Value | Usage |
|-------|---------------|-------|
| `--color-text-primary` | `rgba(255,255,255,0.95)` | Headlines, primary content |
| `--color-text-secondary` | `rgba(255,255,255,0.65)` | Descriptions, secondary info |
| `--color-text-tertiary` | `rgba(255,255,255,0.48)` | Metadata, timestamps, labels |
| `--color-text-quaternary` | `rgba(255,255,255,0.24)` | Borders, dividers, decorative |

**Key insight:** Four-tier text hierarchy using opacity on white. This creates perfect contrast consistency and makes theming trivial -- change the base and all tiers adjust.

### 2.3 Accent Colors

| Color | Usage |
|-------|-------|
| Purple/Violet (`~#5E6AD2`) | Primary brand, active states, selected items |
| Blue (`~#4EA1D3`) | Links, informational badges |
| Green (`--color-green`) | Success states, completed items, checkmarks |
| Red (`--color-red`) | Error states, urgent/critical priority |
| Yellow/Amber | Warning states, medium priority |
| Orange | High priority indicators |

**Key insight:** Accents are used SPARINGLY. The interface is 95% grayscale with strategic color pops for status and priority. This makes every colored element meaningful.

### 2.4 Dark Mode Excellence Details

- Background: `#08090a` (not pure black -- has blue undertone)
- Theme attribute: `data-theme="dark"` on root element
- Decorative underlines: `rgba(255,255,255,0.48)` thickness
- Elevation conveyed through subtle brightness shifts, NOT shadows
- Borders use `rgba(255,255,255,0.08-0.12)` -- barely visible, just enough structure
- No gradients on backgrounds -- flat, clean surfaces
- Glow effects only on primary CTAs and hover states

---

## 3. Typography System

### 3.1 Font Stack

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-monospace: "JetBrains Mono", "SF Mono", "Fira Code", monospace;
```

**Key insight:** Inter is the workhorse. It was literally designed for screen UI with features like tabular numbers, contextual alternates, and optical sizing.

### 3.2 Type Scale

| Token | Size (desktop) | Size (mobile) | Weight | Usage |
|-------|---------------|---------------|--------|-------|
| `--title-1-size` | ~56px | ~36px | Semibold | Hero headlines |
| `--title-2-size` | ~44px | ~28px | Semibold | Section titles |
| `--title-3-size` | ~36px | ~24px | Semibold | Feature headers |
| `--title-4-size` | ~28px | ~22px | Semibold | Card titles |
| `--title-5-size` | ~24px | ~20px | Medium | Sub-headers |
| `--title-6-size` | ~20px | ~18px | Medium | Section labels |
| `--title-7-size` | ~18px | ~16px | Medium | Component headers |
| `--title-8-size` | ~16px | ~15px | Medium | Item titles |
| `--title-9-size` | ~14px | ~13px | Medium | Small labels |
| `--text-large-size` | ~18px | ~16px | Regular | Large body |
| `--text-regular-size` | ~15px | ~14px | Regular | Body copy |
| `--text-small-size` | ~13px | ~13px | Regular | Secondary info |
| `--text-mini-size` | ~12px | ~12px | Medium | Metadata, timestamps |
| `--text-tiny-size` | ~11px | ~11px | Medium | Badges, micro labels |
| `--text-micro-size` | ~10px | ~10px | Medium | Extreme compact data |

### 3.3 Font Weight Tokens

```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;    /* Default for UI elements */
--font-weight-semibold: 600;  /* Headlines, emphasis */
```

**Key insight:** Linear favors `medium (500)` for most UI text, not `regular (400)`. This gives everything a slightly bolder, more confident feel without being heavy. Semibold is reserved for true headings.

### 3.4 Responsive Breakpoints

```css
@media (max-width: 640px)  { /* Mobile */ }
@media (max-width: 768px)  { /* Tablet portrait */ }
@media (max-width: 1024px) { /* Tablet landscape */ }
@media (max-width: 1280px) { /* Small desktop */ }
```

### 3.5 Typography Features

- `font-variant-numeric: tabular-nums` -- Numbers align in columns (critical for data-dense UIs)
- `text-decoration-thickness` custom values for underlines
- `letter-spacing` tightens on larger titles, loosens on small text
- `line-height` ranges from 1.1 (titles) to 1.6 (body text)

---

## 4. Spacing System

### 4.1 Base Scale

Linear uses an 4px/8px base grid:

| Value | Usage |
|-------|-------|
| 4px | Micro gaps (icon-to-text, badge padding) |
| 8px | Tight gaps (list item padding, inline spacing) |
| 12px | Component internal padding |
| 16px | Standard component gap |
| 20px | Card internal padding |
| 24px | Section separators |
| 32px | Section gaps |
| 48px | Major section breaks |
| 64px | Page section spacing |
| 80px | Large section breathing room |
| 128px | Hero/feature section spacing |

### 4.2 Layout Gaps

```css
/* Flex gap patterns observed */
gap: 8px;   /* Dense lists, tag groups */
gap: 12px;  /* Standard component spacing */
gap: 16px;  /* Card grids, form fields */
gap: 32px;  /* Section spacing */
```

**Key insight:** The spacing is TIGHT compared to most SaaS products. Linear packs more information per viewport by using 8-12px as default gaps instead of the typical 16-24px. This density is what makes it feel like a professional tool rather than a consumer app.

---

## 5. Animation System

### 5.1 Core Principles

- **Duration:** 100-200ms for micro-interactions, 300-500ms for transitions, 2800-3200ms for decorative animations
- **Easing:** Custom cubic-bezier curves, NOT default ease-in-out
- **Philosophy:** Animations should feel like physics, not decoration

### 5.2 Micro-Interactions

```css
/* Typical hover transition */
transition: all 120ms ease;

/* Menu/dropdown appear */
transition: opacity 150ms ease, transform 150ms ease;
transform: translateY(-4px) -> translateY(0);

/* Button press */
transform: scale(0.98);
transition: transform 80ms ease;
```

### 5.3 Page Transitions

```css
/* Content fade-in */
opacity: 0 -> 1;
transform: translateY(8px) -> translateY(0);
transition: 200ms cubic-bezier(0.25, 0.1, 0.25, 1);

/* Sidebar collapse/expand */
transition: width 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
```

### 5.4 Decorative Animations (Marketing Pages)

```css
/* Grid dot animations -- directional fill patterns */
@keyframes grid-dot-animation {
  duration: 2800-3200ms;
  timing-function: steps(N);  /* Stepped for digital/precise feel */
  opacity: 0.3 <-> 1.0;
}
```

### 5.5 Animation Guidelines for BullCast

| Context | Duration | Easing |
|---------|----------|--------|
| Hover states | 80-120ms | `ease` |
| Dropdowns/menus | 150ms | `ease` |
| Page transitions | 200ms | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Modal open/close | 200-300ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Chart animations | 500-800ms | `cubic-bezier(0.33, 1, 0.68, 1)` |
| Loading skeletons | 1500ms | `ease-in-out` (pulse) |

**Key insight:** Linear animations are FAST. Most UI transitions complete in under 200ms. This creates a sense of instant responsiveness. The stepped timing on decorative animations gives a digital/precision feel that matches the tool's identity.

---

## 6. Component Patterns

### 6.1 Cards

```
Structure:
+------------------------------------------+
|  [Icon/Status]  Title          [Actions] |
|  Description text in secondary color      |
|                                           |
|  [Tags] [Priority] [Assignee] [Date]    |
+------------------------------------------+

Properties:
- background: var(--color-bg-secondary)
- border: 1px solid rgba(255,255,255,0.08)
- border-radius: 8px
- padding: 12-16px
- hover: background shifts to var(--color-bg-tertiary)
- transition: background 120ms ease
```

### 6.2 Sidebar Navigation

```
Structure:
+------------------+
|  [Logo]          |
|  ─────────────── |
|  [Search] ⌘K    |
|  ─────────────── |
|  Inbox           |
|  My Issues       |
|  ─────────────── |
|  TEAMS           |
|  > Team Alpha    |
|    > Active      |
|    > Backlog     |
|  > Team Beta     |
|  ─────────────── |
|  Views           |
|  Settings        |
+------------------+

Properties:
- width: 220-240px (collapsible to 48px icons-only)
- background: slightly darker than main content
- items: 32px height, 8px padding
- active item: bg highlight + left border accent
- hover: subtle bg shift
- collapsible with keyboard shortcut
- nested items with 12px indent per level
```

### 6.3 Data Tables / Issue Lists

```
Properties:
- Row height: 36-40px (dense mode: 32px)
- Alternating row colors: NONE (uses hover highlight instead)
- Column headers: sticky, text-mini, uppercase, tertiary color
- Hover: full-row subtle background highlight
- Selected: accent-tinted background
- Inline actions appear on hover (right-aligned)
- Keyboard navigation: j/k to move, enter to open
- Virtual scrolling for large datasets
```

### 6.4 Buttons

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| Primary (invert) | White/Light | Dark | None |
| Secondary | Transparent | Primary text | 1px rgba(255,255,255,0.12) |
| Ghost | Transparent | Secondary text | None |
| Danger | Red tint | White | None |
| Disabled | Muted bg | Quaternary text | None |

```
Properties:
- height: 32px (default), 28px (compact), 36px (large)
- padding: 0 12px
- border-radius: 6px
- font-weight: 500 (medium)
- font-size: 13-14px
- transition: all 120ms ease
- active: scale(0.98)
```

### 6.5 Badges / Tags

```
Properties:
- height: 20-22px
- padding: 0 6px
- border-radius: 4px
- font-size: 11-12px (text-tiny / text-micro)
- font-weight: 500
- background: accent color at 15% opacity
- text: accent color at full brightness
- Example: Priority "Urgent" = red bg at 15%, red text
```

### 6.6 Pricing Cards (Tier Differentiation)

```
Standard tier:
- border: 1px solid rgba(255,255,255,0.08)
- background: var(--color-bg-secondary)

Recommended tier (Business):
- "invert" variant -- lighter/highlighted background
- Stands out without being garish
- Sometimes includes a "Recommended" badge

Enterprise tier:
- "secondary" styling -- understated, custom/contact-us feel
```

---

## 7. Data-Dense Interface Patterns

### 7.1 How Linear Makes Density Feel Premium

1. **Consistent vertical rhythm** -- Every row is exactly 36px. Every gap is a multiple of 4px. The grid never breaks.

2. **Progressive disclosure** -- Show summary first, expand for detail. No information dump.

3. **Contextual actions** -- Buttons/icons appear on hover, not always visible. Reduces visual noise by 40%+.

4. **Keyboard-first** -- Power users never touch the mouse. `Cmd+K` command palette, `j/k` navigation, single-key shortcuts.

5. **Color as signal, not decoration** -- Color only appears for status (priority, state, labels). Everything else is grayscale.

6. **Typography hierarchy does the work** -- Instead of boxes and borders, Linear uses font-size, weight, and opacity to create visual grouping.

7. **Whitespace is earned** -- Tight default spacing with generous breathing room between SECTIONS, not between ITEMS.

8. **Tabular numerics** -- Numbers always align in columns. Dates and counts are scannable.

9. **Sticky headers** -- Column labels and section headers stay visible while scrolling.

10. **Virtual rendering** -- Only visible rows are in the DOM. Lists of 10,000+ items scroll at 60fps.

### 7.2 Information Density Metrics

- **Issue list:** ~18-22 items visible per screen (at 1080p)
- **Sidebar:** ~25-30 items visible before scrolling
- **Board view:** 4-6 columns visible with 6-8 cards each
- **Row height:** 36px default (industry standard is 48-56px)
- **Font size:** 13px body (industry standard is 14-16px)

---

## 8. Changelog / Content Page Patterns

### 8.1 Entry Structure

```
[Date -- right-aligned, text-mini, tertiary color, tabular-nums]

## Feature Title
[anchor link icon on hover]

Body description in text-regular, secondary color.

- Bullet point improvements
- Each as a concise single-line statement

### Improvements
- Item with brief context

### Fixes
- Bug fix description

[Hero image -- full-width, WebP, 2x DPR, rounded corners]
```

### 8.2 Image Handling

- Format: WebP with fallback
- Resolution: 2x DPR (3600x2080px source for ~1800px display)
- Border-radius: 8px consistent with cards
- Alt text: Always descriptive
- Loading: Lazy-loaded below fold

---

## 9. Application to BullCast

### 9.1 Direct Translations

| Linear Pattern | BullCast Application |
|---------------|---------------------|
| `#08090a` background | Main dashboard background |
| 4-tier text opacity | Price levels, market data hierarchy |
| Purple accent | Replace with cattle-market green/amber |
| 36px row height | Commodity price rows |
| `tabular-nums` | Price columns, percentage changes |
| Hover-reveal actions | Chart timeframe selectors, alert config |
| `Cmd+K` palette | Quick search for commodities, reports |
| Stepped grid animations | Market data ticker / price grid |
| Card-based layout | Market summary cards, alert cards |
| Sidebar navigation | Commodity categories, saved views |

### 9.2 Recommended BullCast Color Tokens

```css
/* Backgrounds (Linear-inspired near-black with warm undertone) */
--bc-bg-primary: #0a0b0d;
--bc-bg-secondary: #12141a;
--bc-bg-tertiary: #1a1d25;
--bc-bg-elevated: #1e2130;

/* Text hierarchy (opacity-based on white) */
--bc-text-primary: rgba(255, 255, 255, 0.95);
--bc-text-secondary: rgba(255, 255, 255, 0.65);
--bc-text-tertiary: rgba(255, 255, 255, 0.45);
--bc-text-quaternary: rgba(255, 255, 255, 0.20);

/* Market accents */
--bc-green: #34D399;          /* Price up, positive signals */
--bc-red: #F87171;            /* Price down, alerts */
--bc-amber: #FBBF24;         /* Warnings, neutral signals */
--bc-blue: #60A5FA;          /* Informational, links */
--bc-brand: #D4A745;         /* BullCast gold -- premium feel */

/* Borders */
--bc-border-subtle: rgba(255, 255, 255, 0.08);
--bc-border-default: rgba(255, 255, 255, 0.12);
```

### 9.3 Key Takeaways for BullCast

1. **Near-black, not pure black** -- Use `#0a0b0d` with a slight warm/blue undertone
2. **Opacity-based text hierarchy** -- Four tiers create instant visual scanning
3. **Tight spacing, generous sections** -- 8-12px between items, 32-64px between groups
4. **Color = meaning only** -- Green for up, red for down, gold for brand. Everything else is grayscale
5. **Medium font weight (500) as default** -- More confident than regular, less heavy than bold
6. **Fast animations (120-200ms)** -- Seu Antonio should never wait for the UI
7. **Progressive disclosure** -- Summary view by default, expand for details
8. **Tabular numbers everywhere** -- Prices, percentages, dates must align perfectly
9. **Keyboard shortcuts** -- Even if the primary user is mobile, power features should exist
10. **Virtual scrolling** -- Historical price data could be thousands of rows
