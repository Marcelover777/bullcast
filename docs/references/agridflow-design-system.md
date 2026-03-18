# AgridFlow Design System Reference

> Extracted from [AgridFlow - Farming SaaS & UX UI Design](https://rondesignlab.com/cases/agridflow-farming-saas-ux-ui-design) by RonDesignLab.
> Supplemented with agritech UI best practices from [Gapsy Studio](https://gapsystudio.com/blog/agriculture-app-design/) and [Halo Lab / Agrinex](https://www.halo-lab.com/project/agrinex).
>
> **Purpose**: Design pattern reference for BullCast dark-mode adaptation.
> **Date**: 2026-03-18

---

## 1. Design Philosophy

AgridFlow transforms fragmented farming tools into a unified, data-driven SaaS platform.
Core principles that apply to BullCast:

| Principle | AgridFlow Approach | BullCast Adaptation |
|---|---|---|
| Simplicity over density | Sequential information architecture; show only relevant fields per action | Seu Antonio needs one clear answer, not 12 charts |
| Agentic UI | Suggest actions instead of raw data ("Sector B-12 is 15% below hydration. Trigger irrigation?") | "Arroba subiu 3.2% -- hora de vender?" binary decisions |
| Outdoor readability | Contrast ratios 7:1+, desaturated earth tones, no pure white | BullCast is dark-mode only, so invert this: no pure black, use charcoal/slate |
| Zero-training onboarding | Comic-strip animations, literal icons, predictive data entry | Persona is 50+ years old, low digital literacy |
| Offline-first | Local database with sync indicators | Essential for rural Brazil connectivity |

**SUS Score benchmark**: AgridFlow achieved 72/100 (Excellent category).
**Efficiency gain**: 26% increase in farmer operational efficiency post-launch.

---

## 2. Color Palette

### AgridFlow Light-Mode Palette (Inferred)

AgridFlow uses a light-mode, earth-tone palette inspired by agriculture and sustainability.

```
PRIMARY GREENS
---------------------------------------------
Forest Green (Primary)    #2D6A4F   -- CTAs, active states, primary actions
Leaf Green (Secondary)    #40916C   -- secondary indicators, positive trends
Light Sage               #95D5B2   -- backgrounds, subtle highlights
Mint Wash                #D8F3DC   -- card backgrounds, success states

EARTH TONES
---------------------------------------------
Deep Brown               #3E2723   -- headings on light backgrounds
Clay                     #795548   -- secondary text, borders
Warm Tan                 #D7CCC8   -- dividers, muted backgrounds
Sand                     #EFEBE9   -- page backgrounds

NEUTRALS
---------------------------------------------
Off-White                #F8F9FA   -- page background (NOT pure #FFF)
Light Gray               #E9ECEF   -- card backgrounds, inactive states
Medium Gray              #6C757D   -- placeholder text, disabled
Dark Slate               #212529   -- body text

STATUS COLORS
---------------------------------------------
Success                  #2D6A4F   -- same as primary green
Warning / Alert          #E6A817   -- amber, crop risk indicators
Danger / Pest Risk       #C62828   -- red, critical alerts
Info                     #1565C0   -- blue, weather data, neutral info
```

### BullCast Dark-Mode Translation

| AgridFlow Light | BullCast Dark Equivalent | Usage |
|---|---|---|
| Off-White `#F8F9FA` | Charcoal `#1A1A2E` | Page background |
| Light Gray `#E9ECEF` | Dark Surface `#16213E` | Card backgrounds |
| Sand `#EFEBE9` | Navy Slate `#0F3460` | Elevated surfaces |
| Forest Green `#2D6A4F` | Emerald `#00B87C` | Primary CTA, positive |
| Warning `#E6A817` | Gold `#F0A500` | Alerts, arroba price up |
| Danger `#C62828` | Coral Red `#E94560` | Critical alerts, price drop |

### Outdoor Readability Rules (from Gapsy Studio)

- Avoid high-vibrancy "neon" colors that wash out in sunlight
- Desaturated earth tones have low-reflectivity properties
- Replace pure white `#FFFFFF` with off-whites to prevent "halo effect"
- For BullCast dark mode: replace pure black `#000000` with charcoal to prevent OLED smearing
- **Minimum contrast ratio**: 7:1 for outdoor environments (10,000+ lux)

---

## 3. Typography

### AgridFlow Approach

- Clean, modern sans-serif (likely Inter or similar geometric sans)
- Heavy font weights for outdoor visibility
- Solid-fill icons paired with text (thin lines disappear at angles)
- Clear hierarchy: title > value > label > caption

### Recommended Type Scale for BullCast

```
FONT FAMILY
---------------------------------------------
Primary:    Inter (or Neue Haas Grotesk Display Pro)
Monospace:  JetBrains Mono (for prices, numbers, percentages)

TYPE SCALE (mobile-first)
---------------------------------------------
Display     32px / 700 / 1.1    -- hero numbers (arroba price)
H1          24px / 700 / 1.2    -- section titles
H2          20px / 600 / 1.3    -- card titles
H3          16px / 600 / 1.4    -- subsection headers
Body        14px / 400 / 1.5    -- paragraph text
Caption     12px / 500 / 1.4    -- labels, timestamps
Overline    11px / 600 / 1.3    -- uppercase category labels

DATA NUMBERS
---------------------------------------------
Price Large  40px / 700 / 1.0   -- main arroba price display
Price Medium 24px / 600 / 1.1   -- card-level prices
Delta        16px / 700 / 1.0   -- +3.2% change indicators
Table Data   14px / 500 / 1.3   -- tabular numbers (tabular-nums)
```

### Data-Heavy Interface Rules

- Use `font-variant-numeric: tabular-nums` for all numerical data
- Right-align numbers in tables for easy comparison
- Price deltas: green for up, red for down, gray for flat
- Always show units close to numbers ("R$ 320/@ " not just "320")

---

## 4. Dashboard Layout Patterns

### AgridFlow Information Architecture

```
DESKTOP LAYOUT (3 columns)
+--------------------------------------------------+
| [Logo] [Search]           [Notifications] [User] |  -- Top bar
+----------+---------------------------------------+
|          |  [Date Range]  [Filters]  [Export]     |  -- Toolbar
| SIDEBAR  |---------------------------------------|
| - Dashboard  |  HERO METRIC CARDS (3-4 across)  |  -- KPI row
| - Tasks      |---------------------------------|
| - Weather    |  CHART AREA        | SIDE PANEL  |  -- Main content
| - Crops      |  (full-width or    | - Alerts    |
| - Reports    |   2/3 width)       | - Tasks     |
| - Settings   |                    | - Weather   |
+--------------+--------------------+-------------+

MOBILE LAYOUT (single column, stacked)
+---------------------------+
| [Hamburger] [Logo] [Bell] |  -- Sticky top bar
+---------------------------+
| [Tab: Dashboard | Tasks | Weather] |  -- Horizontal scroll tabs
+---------------------------+
| HERO METRIC (swipeable)   |  -- Horizontal card carousel
+---------------------------+
| CHART (full width)        |  -- Simplified chart
+---------------------------+
| ALERT CARDS (stacked)     |  -- Vertical stack
+---------------------------+
| TASK LIST                 |  -- Scrollable list
+---------------------------+
| [Bottom Nav: Home|Tasks|  |  -- Fixed bottom nav
|  Weather|Profile]         |
+---------------------------+
```

### Key Layout Principles from AgridFlow

1. **Card-first architecture**: Every data point lives in a card
2. **Progressive disclosure**: Summary on dashboard, detail on tap/click
3. **Hero metric pattern**: The single most important number is oversized at the top
4. **3D terrain maps as single source of truth** (Gapsy): overlay NDVI, drainage, fleet
5. **Financial overlay on field maps**: Green Zones = profit, Red Zones = loss

### BullCast Dashboard Priority Order

1. **Arroba price** (hero metric, largest element)
2. **Price trend** (sparkline or area chart, 30 days)
3. **AI sentiment** (bull/bear indicator with confidence score)
4. **Alert cards** (price targets, CEPEA updates)
5. **Market news** (latest headlines, scrollable)
6. **Historical comparison** (year-over-year)

---

## 5. Card Styles

### AgridFlow Card Taxonomy

| Card Type | Content | Visual Treatment |
|---|---|---|
| **Metric Card** | Single KPI + delta + sparkline | Prominent number, small label, trend indicator |
| **Weather Card** | Temperature, wind, sunlight graph | Icon + current value + mini graph |
| **Task Card** | Status, date, assignee, progress | Status pill + title + due date + progress bar |
| **Risk/Alert Card** | Crop name, risk type, severity | Color-coded left border, icon, action CTA |
| **Chart Card** | Title + full chart + legend | Minimal chrome, chart takes 80%+ of space |

### Card Design Tokens

```css
/* Light mode (AgridFlow) */
--card-bg:              #FFFFFF;
--card-border:          1px solid #E9ECEF;
--card-border-radius:   12px;        /* rounded, friendly feel */
--card-shadow:          0 1px 3px rgba(0,0,0,0.08);
--card-shadow-hover:    0 4px 12px rgba(0,0,0,0.12);
--card-padding:         16px;        /* mobile: 12px */
--card-gap:             12px;        /* between cards */

/* Dark mode (BullCast adaptation) */
--card-bg:              #16213E;
--card-border:          1px solid rgba(255,255,255,0.06);
--card-border-radius:   12px;
--card-shadow:          0 1px 3px rgba(0,0,0,0.3);
--card-shadow-hover:    0 4px 12px rgba(0,0,0,0.4);
--card-padding:         16px;
--card-gap:             12px;
```

### Alert Card Pattern

```
+----------------------------------------------+
| [colored left border 4px]                    |
|  [Icon]  PEST RISK - Soybean Field B        |
|          High probability of aphid           |
|          infestation detected                |
|                                              |
|  [Dismiss]              [Take Action ->]     |
+----------------------------------------------+
```

For BullCast, translate to:

```
+----------------------------------------------+
| [gold left border 4px]                       |
|  [TrendingUp]  ARROBA SUBIU 3.2%            |
|                Preco atingiu R$ 320/@        |
|                Meta de venda alcancada       |
|                                              |
|  [Ignorar]              [Ver Analise ->]     |
+----------------------------------------------+
```

---

## 6. Icon Usage

### AgridFlow Icon Strategy

- **Literal over abstract**: Depict equipment and infrastructure exactly as they look in the field
- **Solid-fill preferred**: Thin lines disappear when viewed at angles or in bright light
- **Heavy stroke weight**: 2px minimum for outline icons (not the standard 1.5px)
- **Functional illustrations** for complex concepts instead of abstract icons

### Icon Categories for BullCast

| Category | Icon Style | Examples |
|---|---|---|
| Navigation | Filled, 24px | Home, Chart, Bell, User |
| Status | Filled, color-coded, 20px | TrendUp (green), TrendDown (red), Minus (gray) |
| Weather | Literal, 24px | Sun, Cloud, Rain, Thermometer |
| Cattle | Literal illustrations, 32px | Cow head, scale/weight, pasture |
| Actions | Outlined, 20px | Share, Download, Filter, Search |
| Alerts | Filled, 20px | Warning triangle, Info circle, Check circle |

### Recommended Icon Set

- **Lucide Icons** (2px stroke, consistent, MIT license) for UI icons
- **Custom literal illustrations** for cattle-specific concepts
- Minimum touch target: **48x48dp** (critical for farmer hands with gloves)

---

## 7. Mobile-First Patterns

### AgridFlow Mobile Principles

1. **One-Handed Rule**: Critical buttons in the lower third of the screen
2. **Touch zones**: Minimum 48x48dp for all interactive elements
3. **Card carousel**: Swipeable horizontal cards for metrics on mobile
4. **Bottom navigation**: 4-5 max items, icons + labels always visible
5. **Offline sync indicators**: Clear badge showing data freshness

### Mobile Navigation Pattern

```
BOTTOM NAV BAR (fixed, 56px height)
+---+---+---+---+---+
| O | O | O | O | O |
|Inicio|Preco|Alerta|Analise|Perfil|
+---+---+---+---+---+

- Active: Filled icon + green text
- Inactive: Outline icon + gray text
- Badge: Red dot for unread alerts
```

### Touch Target Zones

```
TOP ZONE (hard to reach one-handed)
  -> Status bar info, non-critical actions

MIDDLE ZONE (comfortable)
  -> Content scrolling, cards, charts

BOTTOM ZONE (easy reach, thumb-friendly)
  -> Primary actions, navigation, CTAs
  -> "Ver Analise", "Definir Alerta" buttons here
```

### Responsive Breakpoints

```css
/* Mobile-first approach */
--bp-sm:   375px;   /* Small phones (minimum supported) */
--bp-md:   768px;   /* Tablets, large phones landscape */
--bp-lg:   1024px;  /* Small laptops */
--bp-xl:   1280px;  /* Desktop */
```

---

## 8. Data Density Management

### AgridFlow Strategy

AgridFlow replaces dense dashboards with **sequential information architecture**:

| Traditional | AgridFlow / Agritech 2026 |
|---|---|
| 12 charts on one screen | 1 hero metric + contextual drill-down |
| Raw percentages | Binary decisions ("Irrigar agora?") |
| Complex legends | Color-coded inline indicators |
| Dense data tables | Card-based summaries with "ver mais" |
| Multiple dropdowns | Predictive pre-populated fields (GPS/history) |

### Data Visualization Rules

1. **One chart per card**: Never stack multiple chart types
2. **Sparklines for trends**: Inline mini charts (no axes) for quick scanning
3. **Area charts > line charts**: Filled area creates stronger visual weight
4. **Limit to 3 data series**: More than 3 lines becomes noise
5. **Always show current value**: Large number above the chart, not just the chart
6. **Confidence scores replace error codes**: "85% certeza" not "margin of error +/- 2.3"

### Chart Color Palette (BullCast Dark Mode)

```
Primary series:    #00B87C (emerald green)
Secondary series:  #3B82F6 (blue)
Tertiary series:   #F0A500 (gold)
Negative:          #E94560 (coral red)
Grid lines:        rgba(255,255,255,0.06)
Axis labels:       rgba(255,255,255,0.5)
Tooltip bg:        #0F3460
```

---

## 9. Weather Widget Design

### AgridFlow Weather Pattern

Temperature, wind, and sunlight displayed on a graph with current conditions prominent.

```
WEATHER CARD
+------------------------------------------+
|  Clima Hoje          Fazenda Boa Vista   |
|                                          |
|  [Sun Icon]  32°C                        |
|  Sensacao: 35°C                          |
|                                          |
|  [Wind] 12 km/h    [Humidity] 45%       |
|  [Rain] 0%          [UV] Alto           |
|                                          |
|  +------ 7-day mini chart ------+       |
|  | temp sparkline               |       |
|  +------------------------------+       |
|                                          |
|  [Previsao 7 dias ->]                   |
+------------------------------------------+
```

---

## 10. Light Mode Implementation Notes

AgridFlow is designed for light mode with outdoor readability in mind.

### Key Light Mode Principles (for reference if BullCast ever adds light mode)

1. **No pure white backgrounds**: Use `#F8F9FA` or `#F5F5F0` (warm off-white)
2. **Desaturated green, not neon**: `#2D6A4F` reads better than `#00FF00` in sunlight
3. **Design in grayscale first**: Verify hierarchy survives high glare before adding color
4. **Card shadows instead of borders**: Subtle `box-shadow` creates depth without clutter
5. **High-value off-whites prevent the "halo effect"** from backlighting on mobile screens
6. **7:1 contrast ratio minimum** for body text (WCAG AAA equivalent)

---

## 11. Component Summary

### Buttons

```
PRIMARY:    bg: green-600, text: white, rounded: 8px, h: 44px (mobile: 48px)
SECONDARY:  bg: transparent, border: 1px green-600, text: green-600, rounded: 8px
GHOST:      bg: transparent, text: green-600, no border
DANGER:     bg: red-600, text: white, rounded: 8px
DISABLED:   bg: gray-300, text: gray-500, cursor: not-allowed
```

### Form Elements

```
INPUT:      bg: surface, border: 1px gray-300, rounded: 8px, h: 44px, px: 12px
            focus: border-green-600, ring: 2px green-600/20
SELECT:     Same as input + chevron-down icon right-aligned
TOGGLE:     w: 44px, h: 24px, rounded-full, bg: gray-300 off / green-600 on
CHECKBOX:   w: 20px, h: 20px, rounded: 4px, check icon when selected
```

### Status Pills

```
SUCCESS:    bg: green-100, text: green-800, rounded-full, px: 8px, py: 2px
WARNING:    bg: amber-100, text: amber-800
DANGER:     bg: red-100, text: red-800
INFO:       bg: blue-100, text: blue-800
NEUTRAL:    bg: gray-100, text: gray-800
```

---

## 12. Spacing System

Based on agritech design conventions (8pt grid):

```
--space-1:    4px     (tight: icon padding)
--space-2:    8px     (compact: between related items)
--space-3:    12px    (default: card internal padding mobile)
--space-4:    16px    (comfortable: card internal padding desktop)
--space-5:    20px    (between card groups)
--space-6:    24px    (section separation)
--space-8:    32px    (major section gaps)
--space-10:   40px    (page-level spacing)
--space-12:   48px    (hero sections)
```

---

## 13. Key Takeaways for BullCast

1. **Hero metric pattern**: Arroba price should be 40px+ bold, impossible to miss
2. **Agentic UI**: "Preco atingiu sua meta. Vender agora?" instead of raw charts
3. **Literal icons for cattle**: Cow, scale, pasture -- not abstract shapes
4. **48px touch targets**: Essential for Seu Antonio's hands
5. **Sequential disclosure**: Summary first, detail on tap
6. **Offline-first**: Sync badge mandatory for rural Brazil
7. **Confidence scores**: "90% chance de alta" not "p-value < 0.05"
8. **Bottom navigation**: All critical actions in thumb zone
9. **Tabular numbers**: Monospace for all prices and percentages
10. **Dark mode earth tones**: Charcoal `#1A1A2E`, emerald `#00B87C`, gold `#F0A500`

---

## Sources

- [AgridFlow Case Study - RonDesignLab](https://rondesignlab.com/cases/agridflow-farming-saas-ux-ui-design)
- [AgridFlow - Behance](https://www.behance.net/gallery/215569699/AgridFlow-Farming-SaaS-UX-UI-Design)
- [Agriculture App Design Guide - Gapsy Studio](https://gapsystudio.com/blog/agriculture-app-design/)
- [Agrinex Platform - Halo Lab](https://www.halo-lab.com/project/agrinex)
