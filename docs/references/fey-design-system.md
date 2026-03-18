# Fey.com — Design System Reference

> Extracted from [fey.com](https://fey.com) for BullCast design reference.
> Dark-mode-first, glassmorphism-heavy financial UI.

---

## 1. CSS Custom Properties / Design Tokens

```css
/* Easing Functions */
--ease-in: cubic-bezier(0.55, 0.085, 0.68, 0.53);
--ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-out: cubic-bezier(0.455, 0.03, 0.515, 0.955);

/* Gradient Border System */
--gradientBorder-size: 1px;
--gradientBorder-gradient: linear-gradient(...);

/* Animation Mask */
--mask-position: -100%; /* with @property support */

/* Duration Scale */
--duration-xs: 0.1s;
--duration-sm: 0.15s;
--duration-md: 0.25s;
--duration-base: 0.3s;
--duration-lg: 0.4s;
--duration-xl: 0.6s;
--duration-2xl: 0.9s;
--duration-3xl: 1s;
--duration-infinite: 4.8s;   /* looping animations */
--duration-ambient: 10s;      /* background effects */

/* Layout */
--gallery-side-padding: calc(50vw - min(1140px, 100%) / 2);
--container-max: 1220px;
--container-content: 1140px;
--container-narrow: 578px;
```

---

## 2. Typography

### Font Family

```css
font-family: 'Calibre', 'Calibre Fallback', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Type Scale

| Token         | Size   | Weight | Line Height | Usage               |
|---------------|--------|--------|-------------|---------------------|
| `display-xl`  | 54px   | 600    | 1.15 (115%) | Hero headlines      |
| `display-lg`  | 48px   | 600    | 1.0 (100%)  | Section headers     |
| `display-md`  | 36px   | 600    | 1.15        | Mobile hero         |
| `heading-lg`  | 21px   | 700    | 1.32 (132%) | Card titles, H3     |
| `heading-md`  | 18px   | 700    | 1.32        | Sub-headings        |
| `heading-sm`  | 16px   | 600-700| 1.36        | H4/H5/H6           |
| `body-lg`     | 18px   | 400    | 1.4         | Body text           |
| `body-md`     | 16px   | 400    | 1.4         | Secondary body      |
| `body-sm`     | 14px   | 400    | 1.4         | Captions, labels    |
| `button`      | 14-18px| 600    | 1.0         | Button text         |

### Text Gradient (Accent)

```css
background: linear-gradient(90deg,
  #B3AEF5 0.41%,
  #D7CBE7 40.68%,
  #E5C8C8 64.12%,
  #EAA879 97.82%
);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 3. Color Palette

### Core Colors

| Token              | Hex        | Usage                        |
|--------------------|------------|------------------------------|
| `bg-primary`       | `#000000`  | Page background              |
| `bg-secondary`     | `#0B0B0F`  | Card/section background      |
| `bg-elevated`      | `#0c0c0c`  | Elevated surfaces            |
| `bg-surface`       | `#151515`  | Surface overlays             |
| `text-primary`     | `#FFFFFF`  | Headlines, primary text      |
| `text-secondary`   | `#868F97`  | Body text, descriptions      |
| `text-tertiary`    | `#E6E6E6`  | Muted labels                 |
| `accent-blue`      | `#479FFA`  | Links, interactive elements  |
| `accent-teal`      | `#4EBE96`  | Positive/success indicators  |
| `accent-orange`    | `#FFA16C`  | Warnings, highlights         |
| `accent-red`       | `#FF5C5C`  | Errors, negative values      |
| `accent-red-dark`  | `#d9323f`  | Destructive actions          |
| `muted-green`      | `#5f6140`  | Subtle positive state        |

### Border / Divider Colors

```css
/* Subtle borders */
border-color: rgba(255, 255, 255, 0.1);

/* Standard borders */
border-color: rgba(255, 255, 255, 0.16);

/* Visible borders */
border-color: rgba(255, 255, 255, 0.2);
```

### Gradients

```css
/* Orange-Brown (warm accent) */
linear-gradient(97.13deg, #FFA16C 8.47%, #551B10);

/* Blue (cool accent) */
linear-gradient(96.44deg, #B6D6FF 6.12%, #393F56);

/* Yellow-Lime (highlight) */
linear-gradient(96.44deg, #D6FE51 6.12%, #58510B);

/* Light neutral */
linear-gradient(112.93deg, #e3e4e2 23.15%, #c1c2c0 104.7%);

/* Glass surface */
linear-gradient(182.51deg,
  rgba(255, 255, 255, 0.02) 27.09%,
  rgba(90, 90, 90, 0.02) 58.59%,
  rgba(0, 0, 0, 0.02) 92.75%
);

/* Text gradient (purple-to-warm) */
linear-gradient(90deg,
  #B3AEF5 0.41%,
  #D7CBE7 40.68%,
  #E5C8C8 64.12%,
  #EAA879 97.82%
);
```

---

## 4. Spacing System

### Base Scale

| Token   | Value  | Usage                          |
|---------|--------|--------------------------------|
| `xs`    | 6px    | Tight inline gaps              |
| `sm`    | 8px    | Icon gaps, tight spacing       |
| `md`    | 12px   | Compact component padding      |
| `base`  | 16px   | Standard margin/gap            |
| `lg`    | 18px   | Component internal spacing     |
| `xl`    | 20px   | Mobile container padding       |
| `2xl`   | 24px   | Card padding, standard gap     |
| `3xl`   | 26px   | Component gaps                 |
| `4xl`   | 32px   | Section gaps, card padding     |
| `5xl`   | 34px   | Feature card gaps              |
| `6xl`   | 40px   | Desktop container padding      |
| `7xl`   | 48px   | Large section gaps             |
| `8xl`   | 56px   | Section margins                |
| `9xl`   | 72px   | Large section margins          |
| `10xl`  | 92px   | Hero section spacing           |
| `11xl`  | 128px  | Maximum section spacing        |

### Container Widths

```css
--container-max: 1220px;
--container-standard: 1176px;
--container-content: 1140px;
--container-tablet: 1130px;
--container-narrow: 578px;
```

---

## 5. Responsive Breakpoints

```css
/* Desktop Large */
@media (max-width: 1440px) { ... }

/* Desktop */
@media (max-width: 1280px) { ... }

/* Tablet Large */
@media (max-width: 1024px) { ... }

/* Tablet / Mobile Landscape */
@media (max-width: 960px) { ... }
@media (max-width: 768px) { ... }

/* Mobile */
@media (max-width: 540px) { ... }

/* Small Mobile */
@media (max-width: 376px) { ... }
```

---

## 6. Animation Patterns

### Easing Curves

```css
/* Standard ease */
transition: all 0.3s ease;

/* Snappy interactive */
transition: opacity 0.4s, color 0.1s ease;

/* Bouncy / spring-like */
transition: all 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);

/* Smooth in */
transition: all var(--duration-xl) var(--ease-in);

/* Smooth out */
transition: all var(--duration-xl) var(--ease-out);

/* Smooth in-out */
transition: all var(--duration-xl) var(--ease-in-out);
```

### Keyframe Animations

```css
/* Fade In */
@keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Fade Out */
@keyframes fadeout {
  from { opacity: 1; }
  to   { opacity: 0; }
}

/* Fade In-Out (pulse) */
@keyframes fadeinout {
  0%, 100% { opacity: 0; }
  50%      { opacity: 1; }
}

/* Continuous Rotation */
@keyframes round {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
/* Usage: animation: round 4.8s linear infinite; */

/* Wipe Reveal (mask-based) */
@keyframes wipeAnimation {
  from { --mask-position: -100%; }
  to   { --mask-position: 100%; }
}

/* Shake / Micro-interaction */
@keyframes shake {
  0%, 100% { transform: translateX(0) rotate(0); }
  25%      { transform: translateX(-2px) rotate(-2deg); }
  75%      { transform: translateX(2px) rotate(2deg); }
}
```

### Duration Guidelines

| Context              | Duration | Easing                              |
|----------------------|----------|---------------------------------------|
| Color/opacity hover  | 0.1s     | ease                                  |
| Button interactions  | 0.15s    | ease                                  |
| Standard transitions | 0.25s    | ease                                  |
| Component enter/exit | 0.3s     | ease                                  |
| Slide/transform      | 0.4s     | cubic-bezier(0.34, 1.4, 0.64, 1)    |
| Page transitions     | 0.6-0.9s | ease-in-out                           |
| Fade sequences       | 1s       | ease                                  |
| Looping rotations    | 4.8s     | linear infinite                       |
| Ambient backgrounds  | 10s      | linear infinite                       |

---

## 7. Component Styles

### Cards

```css
/* Standard Card */
.card {
  background: rgba(255, 255, 255, 0.08);
  border: 0.5px solid transparent;
  border-radius: 14px;
  padding: 32px;
  transition: background 0.3s ease;
}
.card:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Glass Card */
.card-glass {
  background: linear-gradient(182.51deg,
    rgba(255, 255, 255, 0.02) 27.09%,
    rgba(90, 90, 90, 0.02) 58.59%,
    rgba(0, 0, 0, 0.02) 92.75%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
}

/* Elevated Card */
.card-elevated {
  background: #000000;
  border-radius: 14px;
  box-shadow:
    0px 30.04px 16.24px rgba(0, 0, 0, 0.1207),
    0px 15.6px 8.29px rgba(0, 0, 0, 0.07),
    0px 6.36px 4.16px rgba(0, 0, 0, 0.04);
}
```

### Buttons

```css
/* Primary Button (light on dark) */
.btn-primary {
  background: #ffffff;
  color: #26272F;
  border-radius: 43px;
  padding: 4px 33px 5px 33px;
  height: 36px;
  font-size: 14px;
  font-weight: 600;
  transition: box-shadow 0.25s ease;
}
.btn-primary:hover {
  box-shadow: 0px 5px 25px rgba(255, 255, 255, 0.15);
}

/* Ghost Button (outline) */
.btn-ghost {
  background: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 99px;
  padding: 7.5px 24px;
  height: 36px;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  transition: background 0.15s ease, opacity 0.15s ease;
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Large Button (mobile) */
.btn-lg {
  height: 46px;
  padding: 7.5px 33px;
  font-size: 18px;
}

/* Pill Button */
.btn-pill {
  border-radius: 99px;
  height: 22px;
  padding: 2px 12px;
  font-size: 12px;
}
```

### Border Radius Scale

| Token     | Value | Usage                        |
|-----------|-------|------------------------------|
| `sm`      | 5px   | Small elements, tags         |
| `md`      | 12px  | Input fields, small cards    |
| `lg`      | 14px  | Standard cards               |
| `xl`      | 24px  | Large cards, modals          |
| `2xl`     | 32px  | Feature sections             |
| `pill`    | 43px  | Primary buttons              |
| `full`    | 99px  | Pill buttons, badges         |

---

## 8. Effects & Visual Treatments

### Shadow System

```css
/* Subtle (inputs, small cards) */
box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.85);

/* Medium (cards, dropdowns) */
box-shadow:
  0px 30.04px 16.24px rgba(0, 0, 0, 0.1207),
  0px 15.6px 8.29px rgba(0, 0, 0, 0.07),
  0px 6.36px 4.16px rgba(0, 0, 0, 0.04);

/* Elevated (modals, popovers) */
box-shadow: 0px 0px 44px rgba(0, 0, 0, 0.5);

/* Deep (hero images) */
box-shadow: 0px 118px 112px rgba(0, 0, 0, 0.5);

/* Glow (hover states) */
box-shadow: 0px 5px 25px rgba(255, 255, 255, 0.15);

/* Drop shadow (floating elements) */
filter: drop-shadow(0px 34px 56px rgba(0, 0, 0, 0.42));

/* Inner (pressed/inset) */
box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.1);
```

### Glassmorphism Recipe

```css
.glass {
  /* Background: semi-transparent */
  background: rgba(255, 255, 255, 0.02);
  /* OR gradient glass */
  background: linear-gradient(182.51deg,
    rgba(255, 255, 255, 0.02) 27.09%,
    rgba(90, 90, 90, 0.02) 58.59%,
    rgba(0, 0, 0, 0.02) 92.75%
  );

  /* Blur: key ingredient */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  /* Border: subtle separation */
  border: 0.5px solid rgba(255, 255, 255, 0.1);

  /* Radius: always rounded */
  border-radius: 14px;

  /* Optional inner glow */
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.1);
}
```

### Blur Scale

| Token      | Value    | Usage                          |
|------------|----------|--------------------------------|
| `subtle`   | 4.4px    | Light background blur          |
| `standard` | 6px      | Overlay blur                   |
| `medium`   | 10px     | Glass cards, buttons           |
| `heavy`    | 75px     | Hero background blur           |
| `extreme`  | 217.5px  | Full-screen overlays           |

### Noise Texture Overlay

```css
.noise::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.svg');
  opacity: 0.05;
  pointer-events: none;
  mix-blend-mode: screen;
}
```

### 3D Perspective Effects

```css
/* Card tilt on hover */
transform: perspective(2200px) rotateX(2deg);
transition: transform 0.6s var(--ease-out);

/* Hero 3D depth */
transform: perspective(3000px) rotateX(5deg);
```

---

## 9. Gradient Border Technique

```css
/* Conic gradient border (used on feature cards) */
.gradient-border {
  position: relative;
  border-radius: 14px;
  background: #000;
}
.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: conic-gradient(
    from 216.62deg at 47.4% 51.13%,
    rgba(255, 255, 255, 0.08) 0deg,
    rgba(255, 255, 255, 0.02) 180deg,
    rgba(255, 255, 255, 0.08) 360deg
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

---

## 10. BullCast Application Notes

### What to adopt directly:
- Dark background palette (`#000000`, `#0B0B0F`, `#0c0c0c`)
- Text color hierarchy (`#FFFFFF` > `#868F97` > `#E6E6E6`)
- Glassmorphism card recipe (blur + gradient bg + subtle border)
- Shadow system (layered multi-stop shadows)
- Animation durations and easing curves
- Border radius scale (14px cards, 99px pills)

### What to adapt for BullCast:
- Accent colors: replace blue (`#479FFA`) with cattle/agro tones
- Use `#4EBE96` (teal) for positive price movement
- Use `#FF5C5C` (red) for negative price movement
- Use `#FFA16C` (orange) for alerts and warnings
- Font family: consider Inter or similar (Calibre is proprietary)
- Spacing: maintain the 8px grid base system
- Breakpoints: prioritize mobile-first (540px, 768px, 1024px)

### Key patterns for financial data:
- Glassmorphism for data cards showing prices/indicators
- Gradient text for hero values (e.g., arroba price)
- Subtle noise overlay for premium texture
- 3D perspective for hero product screenshots
- Multi-layer shadows for depth hierarchy
- Conic gradient borders for featured/premium cards
