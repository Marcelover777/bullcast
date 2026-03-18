# BullCast Design Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform BullCast from a functional dashboard into a premium, Fey/Robinhood-level livestock intelligence app with complete dark+light mode, cinematographic animations, and pixel-perfect polish.

**Architecture:** Método Asimov (Vibe Design) pipeline — 10 sequential phases (P0-P9) where each phase builds on the previous. Design tokens first, then structure, then animation, then polish. Reference Design Systems extracted from 5 premium sites guide every visual decision.

**Tech Stack:** Next.js 16 + React 19 + Tailwind CSS 4 + GSAP 3.14 + Framer Motion 12 + Lenis + Recharts 3 + shadcn/ui + next-themes

---

## Chunk 1: Foundation (P0-P1)

### Task 1: Integrate Reference Design Systems

**Files:**
- Create: `docs/references/DESIGN-SYSTEM-MERGED.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Verify reference extractions**
Check `docs/references/` for the 5 design system files (fey, robinhood, wealthsimple, agridflow, linear). If any are missing, extract manually using Firecrawl.

- [ ] **Step 2: Create merged design system**
Merge the 5 extracted systems into `docs/references/DESIGN-SYSTEM-MERGED.md` — a unified token reference showing which patterns to adopt from each site.

- [ ] **Step 3: Add Asimov references to CLAUDE.md**
Add the Design References section to CLAUDE.md pointing to docs/references/.

- [ ] **Step 4: Commit**
```bash
git add docs/references/ CLAUDE.md
git commit -m "docs: add Asimov reference design systems from 5 premium sites"
```

---

### Task 2: Refine Dark Mode Tokens (globals.css)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Audit current dark mode CSS variables**
Read globals.css. Identify all CSS custom properties in .dark {} and cross-reference with what components actually use. Find missing variables that are referenced but undefined.

- [ ] **Step 2: Add missing semantic variables**
Add to .dark {}:
- `--bull`, `--bear`, `--hold` as HSL values (for opacity variants)
- `--background-rgb` for rgba() usage
- `--card-hover`, `--elevated`, `--border-hover`
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-glow`

- [ ] **Step 3: Define ALL missing CSS classes**
Create classes that are REFERENCED in components but NOT DEFINED:
- `.card-premium` (active:scale(0.98), transition)
- `.confidence-bar`, `.confidence-bar-fill`
- `.text-display`, `.text-label`, `.font-editorial`
- Verify contrast WCAG AA on all --muted-foreground values

- [ ] **Step 4: Run build to verify**
Run: `npm run build`
Expected: No errors

- [ ] **Step 5: Commit**
```bash
git add src/app/globals.css
git commit -m "feat(design): refine dark mode tokens and add missing CSS classes"
```

---

### Task 3: Implement Light Mode (globals.css)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Redesign :root (light mode) variables**
Replace ALL light mode variables in :root {} following the VIBE-BRIEF.md palette:
- Background: #F4F3ED (Noble Cream)
- Card: #FFFFFF with border or shadow differentiation
- Primary: #2D6A4F (Deep Forest Green)
- Bull: #15803D, Bear: #B91C1C, Hold: #A16207
- Text: #1C1917 (Warm Black), Muted: #78716C
- Border: #D6D3CC (Warm)

- [ ] **Step 2: Add light mode card differentiation**
Cards in light mode MUST have either:
- `border: 1px solid var(--border)` OR
- `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`
This prevents cards from being invisible against the cream bg.

- [ ] **Step 3: Verify WCAG AA contrast**
Check all text/background combinations meet 4.5:1 for normal text, 3:1 for large text. Both modes.

- [ ] **Step 4: Build + test**
Run: `npm run build && npm run dev`
Test BOTH modes visually.

- [ ] **Step 5: Commit**
```bash
git add src/app/globals.css
git commit -m "feat(design): implement warm light mode palette (Wealthsimple + AgridFlow)"
```

---

### Task 4: Map Semantic Colors in Tailwind + Fix Theme Toggle

**Files:**
- Modify: `src/app/globals.css` (Tailwind @theme)
- Modify: `src/app/(app)/perfil/page.tsx`
- Modify: `src/components/theme-toggle.tsx`

- [ ] **Step 1: Map bull/bear/hold to Tailwind**
Ensure `text-bull`, `text-bear`, `text-hold`, `bg-bull/10`, `bg-bear/10` work in BOTH modes via @theme inline or tailwind config.

- [ ] **Step 2: Fix theme toggle**
Connect the toggle in perfil/page.tsx to useTheme() from next-themes.
Toggle between "light", "dark", and "system". Persist choice.

- [ ] **Step 3: Test toggle**
Verify switching themes updates ALL pages correctly.

- [ ] **Step 4: Commit**
```bash
git add src/app/globals.css src/app/(app)/perfil/page.tsx src/components/theme-toggle.tsx
git commit -m "feat(design): semantic Tailwind colors + functional theme toggle"
```

---

## Chunk 2: Animation System (P2)

### Task 5: Add PageTransition + ScrollReveal to ALL Pages

**Files:**
- Modify: `src/app/(app)/mercado/page.tsx`
- Modify: `src/app/(app)/cotacoes/page.tsx`
- Modify: `src/app/(app)/perfil/page.tsx`
- Modify: Any other pages missing animations

- [ ] **Step 1: Audit which pages have animations**
Check every page in src/app/(app)/ for <PageTransition> and <ScrollReveal> usage.

- [ ] **Step 2: Add PageTransition to pages missing it**
Wrap main content in <PageTransition> for any page that doesn't have it.

- [ ] **Step 3: Add ScrollReveal to each logical section**
Each section within a page gets <ScrollReveal> with incremental delay.

- [ ] **Step 4: Add GSAP hero timeline to /mercado**
In mercado/page.tsx, add GSAP timeline for the signal hero:
- 0.0s: background gradient fade-in
- 0.2s: price counter (GSAPCounter, 1.2s)
- 0.4s: signal badge scale elastic.out
- 0.6s: variation fade-up
- 0.8s: confidence bar fills
- 1.0s: recommendation fade-up
- 1.2s: quick indicators stagger

- [ ] **Step 5: Build + test**
Run: `npm run build`

- [ ] **Step 6: Commit**
```bash
git add src/app/
git commit -m "feat(design): add PageTransition + ScrollReveal to all pages"
```

---

## Chunk 3: Hero Redesign (P3)

### Task 6: Redesign Signal Hero (/mercado)

**Files:**
- Modify: `src/components/dashboard/hero-price.tsx`
- Modify: `src/app/(app)/mercado/page.tsx`

- [ ] **Step 1: Read current hero-price.tsx**
Understand the current structure, props, and animations.

- [ ] **Step 2: Remove card wrapper from hero**
The signal is NOT a card. It's the HERO. Remove rounded-xl, p-5, border wrappers.
Let it breathe across the full viewport width.

- [ ] **Step 3: Add contextual gradient background**
BUY → green 5% opacity gradient at top → transparent
SELL → red 5% opacity
HOLD → neutral
Light mode: same logic but 3% opacity.

- [ ] **Step 4: Enlarge price typography**
Price: Big Shoulders, 56px mobile / 64px desktop, font-weight 800.
Variation %: next to price, colorized (bull/bear), with icon.

- [ ] **Step 5: Redesign confidence bar**
h-2 bar with GSAP width animation from 0% to value%.

- [ ] **Step 6: Add sparklines to quick indicators**
Grid 2x2 below hero with MiniSparkline inside each card.

- [ ] **Step 7: Test both modes**
Run: `npm run build && npm run dev`
Verify light mode hero looks correct.

- [ ] **Step 8: Commit**
```bash
git add src/components/dashboard/hero-price.tsx src/app/(app)/mercado/page.tsx
git commit -m "feat(design): redesign signal hero — price as viewport protagonist"
```

---

## Chunk 4: Charts + Nav + Skeletons (P4-P6)

### Task 7: Premium Charts Overhaul

**Files:**
- Create: `src/components/charts/premium-tooltip.tsx`
- Modify: All files with Recharts (projection-chart, forward-curve, basis-chart, seasonal-chart, prediction-panel, slaughter-panel, cot-panel)

- [ ] **Step 1: Create premium-tooltip.tsx**
Glassmorphism tooltip: blur(12px), rgba card 92% opacity, no border, shadow-lg, radius 0, font-mono for values, works in both modes.

- [ ] **Step 2: Apply global chart improvements**
For ALL Recharts instances:
- CartesianGrid: opacity 0.06 or remove
- Lines: strokeWidth 2.5
- SVG filter: drop-shadow glow (0 0 6px rgba(primary, 0.25))
- AreaChart gradient: 15% → 0% opacity
- Dots: hidden, activeDot r=5
- XAxis/YAxis: fontSize 9, opacity 0.5, no axisLine/tickLine
- Light mode: glow 0.15 opacity, grid 0.08

- [ ] **Step 3: Build + test both modes**

- [ ] **Step 4: Commit**
```bash
git add src/components/charts/ src/components/dashboard/ src/components/indicators/
git commit -m "feat(design): premium charts overhaul — Fey-level glow + glass tooltip"
```

---

### Task 8: Animated Bottom Nav

**Files:**
- Modify: `src/app/(app)/layout.tsx`

- [ ] **Step 1: Read current nav implementation**

- [ ] **Step 2: Add motion.div with layoutId**
Replace conditional span indicator with motion.div layoutId="tab-indicator" for smooth slide between tabs.

- [ ] **Step 3: Add icon glow**
Active icon gets filter: drop-shadow(0 0 3px var(--primary)).

- [ ] **Step 4: Add haptic feedback**
navigator.vibrate(5) on click (with typeof check).

- [ ] **Step 5: Active label weight transition**
font-weight 700 with CSS transition.

- [ ] **Step 6: Light mode nav**
bg-background/95 + backdrop-blur, border-top 1px solid var(--border).

- [ ] **Step 7: Build + test**

- [ ] **Step 8: Commit**
```bash
git add src/app/(app)/layout.tsx
git commit -m "feat(design): animated bottom nav with layoutId slide indicator"
```

---

### Task 9: Skeleton Loading System

**Files:**
- Create: `src/components/feedback/page-skeleton.tsx`
- Modify: `src/app/(app)/mercado/page.tsx` (loading state)
- Modify: `src/app/(app)/cotacoes/page.tsx` (loading state)

- [ ] **Step 1: Create page-skeleton.tsx**
Props: variant ("mercado" | "cotacoes" | "previsao" | "regional")
Each variant mimics the actual layout shape with skeleton blocks.
Stagger: 50ms delay between blocks.

- [ ] **Step 2: Replace loading states**
In mercado/page.tsx: `if (loading) return <PageSkeleton variant="mercado" />`
In cotacoes/page.tsx: similar.

- [ ] **Step 3: Redesign demo data badge**
Border dashed, AlertTriangle icon, text-xs, fadeIn animation. Works in both modes.

- [ ] **Step 4: Build + test**

- [ ] **Step 5: Commit**
```bash
git add src/components/feedback/ src/app/(app)/
git commit -m "feat(design): premium skeleton loading system — no more text spinners"
```

---

## Chunk 5: 3D + Secondary Pages (P7-P8)

### Task 10: Integrate 3D Components

**Files:**
- Modify: `src/app/(app)/mercado/page.tsx`
- Modify: `src/app/(app)/regional/page.tsx` (if exists and not stub)

- [ ] **Step 1: Add CattleParticles to /mercado hero**
Dynamic import with ssr: false, loading: () => null.
Container: absolute inset-0, z-0, opacity-[0.06], pointer-events-none.
DESKTOP ONLY: hidden below 768px.

- [ ] **Step 2: Add GlobeBrazil to /regional (if applicable)**
Similar dynamic import, decorative background, desktop only.

- [ ] **Step 3: Verify bundle size**
Run: `npm run build`
Check that mobile bundle doesn't include Three.js.

- [ ] **Step 4: Commit**
```bash
git add src/app/(app)/
git commit -m "feat(design): integrate 3D components as decorative backgrounds (desktop only)"
```

---

### Task 11: Complete Secondary Pages

**Files:**
- Modify: All pages in src/app/(app)/ that are stubs or need polish

- [ ] **Step 1: Audit stub pages**
Check /riscos, /historico, /previsao — which redirect and which have content.

- [ ] **Step 2: For each stub page, implement minimal UI**
Use existing data structures and components.
Apply design system tokens.
Add PageTransition + ScrollReveal.
Ensure light mode works.

- [ ] **Step 3: Polish /perfil**
Connect theme toggle to useTheme (if not done in Task 4).
Animate stats with GSAPCounter.
Light mode: cards with shadow.

- [ ] **Step 4: Build + test ALL pages in both modes**

- [ ] **Step 5: Commit per page**
```bash
git commit -m "feat(design): complete /riscos page with premium polish"
git commit -m "feat(design): complete /historico page with accuracy chart"
git commit -m "feat(design): complete /previsao page with horizon selector"
```

---

## Chunk 6: Polish + Performance (P9)

### Task 12: Consistency Pass

**Files:**
- Modify: All component and page files as needed

- [ ] **Step 1: Audit tabular-nums**
Ensure ALL price/number displays use font-variant-numeric: tabular-nums + font-mono.

- [ ] **Step 2: Audit BR format**
Every price must use .replace(".", ",") for Brazilian number format.

- [ ] **Step 3: Audit .card-premium**
All interactive cards use .card-premium for tap feedback.

- [ ] **Step 4: Audit aria attributes**
All decorative icons: aria-hidden="true"
All buttons: aria-label
All data tables: proper header association

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "fix(design): consistency pass — tabular-nums, BR format, aria labels"
```

---

### Task 13: Accessibility + Reduced Motion

**Files:**
- Modify: `src/providers/gsap-provider.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add reduced-motion support**
In GSAPProvider: check matchMedia('(prefers-reduced-motion: reduce)').matches
If true: gsap.globalTimeline.timeScale(0)

- [ ] **Step 2: Verify focus states**
All interactive elements must have visible focus states in both modes.

- [ ] **Step 3: Verify contrast WCAG AA**
Check all text/background combinations. Both modes.

- [ ] **Step 4: Commit**
```bash
git add src/providers/ src/app/globals.css
git commit -m "feat(a11y): reduced-motion support + focus states + WCAG AA verification"
```

---

### Task 14: Performance Audit + Lighthouse

**Files:**
- Modify: Various files for performance fixes

- [ ] **Step 1: Verify Three.js dynamic imports**
Three.js must NEVER be in the mobile bundle. Only via next/dynamic ssr: false.

- [ ] **Step 2: Check GSAP cleanup**
Every useEffect with gsap.to/from must have cleanup (useGSAP or .kill()).

- [ ] **Step 3: Lazy load heavy charts**
Charts below the fold should be lazy loaded.

- [ ] **Step 4: Run npm run build**
Check bundle sizes. JS total should be reasonable.

- [ ] **Step 5: Console audit**
npm run dev → ZERO warnings, ZERO hydration errors, ZERO missing keys.

- [ ] **Step 6: Lighthouse audit on /mercado**
Target: Performance > 85, Accessibility > 90.
Report scores.

- [ ] **Step 7: Final commit**
```bash
git add .
git commit -m "feat(design): complete premium overhaul with light mode, animations, and 3D integration"
```

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| P0-P1 | 1-4 | Foundation: tokens, light mode, theme toggle |
| P2 | 5 | Animations: PageTransition + ScrollReveal everywhere |
| P3 | 6 | Hero: signal redesign, viewport-wide |
| P4 | 7 | Charts: premium Recharts overhaul |
| P5 | 8 | Nav: animated bottom nav with layoutId |
| P6 | 9 | Skeletons: premium loading states |
| P7 | 10 | 3D: integrate CattleParticles + GlobeBrazil |
| P8 | 11 | Pages: complete all stubs + polish secondary |
| P9 | 12-14 | Polish: consistency, accessibility, performance |

**Total: 14 tasks across 6 chunks, ~10 phases (P0-P9)**
**Estimated commits: 15-20 atomic commits**
