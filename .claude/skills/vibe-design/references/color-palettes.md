# Color Palettes Database — Paletas Curadas por Mood

## Como usar
Na **Fase 1 do vibe-design**, identifique o mood/estilo e use as paletas abaixo
como ponto de partida. Adapte os valores conforme o contexto do projeto.

---

## Mood 1 — Dark Premium (tecnologia, SaaS, fintech)

### Dark Void
```css
--bg-base:     #09090b;  /* zinc-950 — fundo principal */
--bg-surface:  #18181b;  /* zinc-900 — cards, paineis */
--bg-elevated: #27272a;  /* zinc-800 — modais, popovers */
--fg-primary:  #fafafa;  /* text principal */
--fg-muted:    #a1a1aa;  /* text secundario */
--accent:      #6366f1;  /* indigo-500 */
--accent-glow: rgba(99, 102, 241, 0.3);
--border:      rgba(255,255,255,0.08);
```

### Midnight Blue
```css
--bg-base:     #0a0f1e;
--bg-surface:  #0d1528;
--bg-elevated: #131e3a;
--fg-primary:  #e8eaf6;
--fg-muted:    #7986cb;
--accent:      #3d5afe;
--accent-glow: rgba(61, 90, 254, 0.35);
--border:      rgba(121, 134, 203, 0.15);
```

### Obsidian + Amber
```css
--bg-base:     #0c0a09;
--bg-surface:  #1c1917;
--bg-elevated: #292524;
--fg-primary:  #fef3c7;
--fg-muted:    #a8a29e;
--accent:      #f59e0b;
--accent-glow: rgba(245, 158, 11, 0.3);
--border:      rgba(245, 158, 11, 0.12);
```

### Carbon + Cyan
```css
--bg-base:     #070d12;
--bg-surface:  #0f1923;
--bg-elevated: #1a2535;
--fg-primary:  #e0f7fa;
--fg-muted:    #80cbc4;
--accent:      #00bcd4;
--accent-glow: rgba(0, 188, 212, 0.3);
--border:      rgba(0, 188, 212, 0.1);
```

---

## Mood 2 — Light Clean (enterprise, produtividade, saas B2B)

### Pure White
```css
--bg-base:     #ffffff;
--bg-surface:  #f8fafc;
--bg-elevated: #f1f5f9;
--fg-primary:  #0f172a;
--fg-muted:    #64748b;
--accent:      #2563eb;
--accent-light: #dbeafe;
--border:      #e2e8f0;
```

### Warm Paper
```css
--bg-base:     #fdfcfb;
--bg-surface:  #faf8f5;
--bg-elevated: #f5f0e8;
--fg-primary:  #1c1917;
--fg-muted:    #78716c;
--accent:      #dc2626;
--accent-light: #fee2e2;
--border:      #e7e5e4;
```

### Cool Zinc
```css
--bg-base:     #fafafa;
--bg-surface:  #f4f4f5;
--bg-elevated: #e4e4e7;
--fg-primary:  #09090b;
--fg-muted:    #71717a;
--accent:      #18181b;
--accent-light: #f4f4f5;
--border:      #d4d4d8;
```

### Soft Blue Gray
```css
--bg-base:     #f8fafc;
--bg-surface:  #f1f5f9;
--bg-elevated: #e2e8f0;
--fg-primary:  #1e293b;
--fg-muted:    #64748b;
--accent:      #0ea5e9;
--accent-light: #e0f2fe;
--border:      #cbd5e1;
```

---

## Mood 3 — Glassmorphism (premium, tech, apps)

### Frost Clear
```css
--glass-bg:     rgba(255, 255, 255, 0.08);
--glass-border: rgba(255, 255, 255, 0.15);
--glass-shadow: rgba(0, 0, 0, 0.3);
--blur:         blur(20px);
--bg-gradient:  linear-gradient(135deg, #0f0c29, #302b63, #24243e);
--accent:       #a78bfa;
--fg-primary:   #ffffff;
--fg-muted:     rgba(255,255,255,0.6);
```

### Arctic Blue
```css
--glass-bg:     rgba(148, 163, 184, 0.1);
--glass-border: rgba(148, 163, 184, 0.2);
--glass-shadow: rgba(15, 23, 42, 0.4);
--blur:         blur(16px);
--bg-gradient:  linear-gradient(135deg, #0c1445, #1a237e, #283593);
--accent:       #60a5fa;
--fg-primary:   #e2e8f0;
--fg-muted:     rgba(226,232,240,0.6);
```

### Rose Gold Glass
```css
--glass-bg:     rgba(251, 207, 232, 0.08);
--glass-border: rgba(251, 207, 232, 0.2);
--glass-shadow: rgba(88, 28, 135, 0.3);
--blur:         blur(24px);
--bg-gradient:  linear-gradient(135deg, #1a0533, #2d1b69, #450a77);
--accent:       #f472b6;
--fg-primary:   #fce7f3;
--fg-muted:     rgba(252,231,243,0.6);
```

---

## Mood 4 — Neon / Cyberpunk (gaming, crypto, entretenimento)

### Electric Violet
```css
--bg-base:    #030014;
--neon-1:     #7c3aed;
--neon-2:     #a855f7;
--neon-3:     #ec4899;
--neon-glow:  0 0 20px rgba(124,58,237,0.6), 0 0 40px rgba(168,85,247,0.3);
--grid-color: rgba(124, 58, 237, 0.1);
--fg-primary: #f3e8ff;
--fg-muted:   rgba(243,232,255,0.5);
```

### Matrix Green
```css
--bg-base:    #000000;
--neon-1:     #00ff41;
--neon-2:     #39ff14;
--neon-3:     #00e676;
--neon-glow:  0 0 10px rgba(0,255,65,0.8), 0 0 30px rgba(0,255,65,0.4);
--grid-color: rgba(0, 255, 65, 0.05);
--fg-primary: #ccffdd;
--fg-muted:   rgba(204,255,221,0.5);
```

### Blade Runner Orange
```css
--bg-base:    #0d0208;
--neon-1:     #ff6b35;
--neon-2:     #ff9f1c;
--neon-3:     #ef476f;
--neon-glow:  0 0 15px rgba(255,107,53,0.7), 0 0 35px rgba(255,159,28,0.3);
--grid-color: rgba(255, 107, 53, 0.08);
--fg-primary: #fff1e6;
--fg-muted:   rgba(255,241,230,0.5);
```

### Cyan Punk
```css
--bg-base:    #020a14;
--neon-1:     #00f5ff;
--neon-2:     #00b4d8;
--neon-3:     #7209b7;
--neon-glow:  0 0 20px rgba(0,245,255,0.6), 0 0 40px rgba(0,180,216,0.3);
--grid-color: rgba(0, 245, 255, 0.06);
--fg-primary: #e0f7fa;
--fg-muted:   rgba(224,247,250,0.5);
```

---

## Mood 5 — Earth / Organic (wellness, sustentabilidade, food)

### Forest Calm
```css
--bg-base:     #f2f0eb;
--bg-surface:  #e8e4db;
--bg-elevated: #d9d3c7;
--fg-primary:  #1a1f1a;
--fg-muted:    #5c6b5c;
--accent:      #3a5a40;
--accent-warm: #a7c957;
--border:      #c5bfb2;
```

### Desert Sand
```css
--bg-base:     #fdf6ec;
--bg-surface:  #f5ead8;
--bg-elevated: #ebdabd;
--fg-primary:  #2d1b00;
--fg-muted:    #8b6914;
--accent:      #c8751a;
--accent-warm: #e8a838;
--border:      #d4bf9e;
```

### Terracotta & Sage
```css
--bg-base:     #faf7f2;
--bg-surface:  #f0e9df;
--bg-elevated: #e4d5c5;
--fg-primary:  #2c1810;
--fg-muted:    #7a5c4c;
--accent:      #c1440e;
--accent-cool: #6b8e6b;
--border:      #d4c4b4;
```

### Slate & Moss
```css
--bg-base:     #f5f5f0;
--bg-surface:  #eaead8;
--bg-elevated: #dcdcc0;
--fg-primary:  #1e2420;
--fg-muted:    #5a6b5a;
--accent:      #4a7c59;
--accent-warm: #8b7355;
--border:      #c5c5a8;
```

---

## Mood 6 — Editorial / Luxury (moda, joalheria, cultura)

### Ink & Ivory
```css
--bg-base:     #fefdf9;
--bg-surface:  #f8f5ee;
--fg-primary:  #0a0a0a;
--fg-muted:    #555555;
--accent:      #0a0a0a;
--accent-warm: #b8a878;
--border:      #e0d8cc;
--font-style:  serif;
```

### Champagne & Black
```css
--bg-base:     #0c0c0c;
--bg-surface:  #1a1a1a;
--fg-primary:  #f5e6c8;
--fg-muted:    #9e8c6a;
--accent:      #c9a94a;
--accent-light: rgba(201,169,74,0.15);
--border:      rgba(201,169,74,0.2);
```

### Blood & Cream
```css
--bg-base:     #faf8f5;
--bg-surface:  #f2ede6;
--fg-primary:  #1a0505;
--fg-muted:    #7a4a4a;
--accent:      #8b0000;
--accent-light: #fde8e8;
--border:      #e8d8d8;
```

---

## Mood 7 — Gradient Mesh (startups, criativas, gen-Z)

### Aurora
```css
--gradient: conic-gradient(from 230.29deg at 51.63% 52.16%,
  rgb(36, 0, 255) 0deg, rgb(0, 135, 255) 67.5deg,
  rgb(108, 39, 157) 198.75deg, rgb(24, 38, 163) 251.25deg,
  rgb(54, 103, 196) 301.88deg, rgb(105, 30, 255) 360deg);
--bg-base:   #06040f;
--fg-primary: #ffffff;
--fg-muted:   rgba(255,255,255,0.6);
```

### Sunset Flow
```css
--gradient: linear-gradient(135deg,
  #ff6b6b 0%, #feca57 25%, #ff9ff3 50%, #48dbfb 75%, #ff6b6b 100%);
--bg-base:   #1a0a2e;
--fg-primary: #ffffff;
--fg-muted:   rgba(255,255,255,0.7);
```

### Digital Rose
```css
--gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--bg-base:   #120a1e;
--fg-primary: #fff0f8;
--fg-muted:   rgba(255,240,248,0.6);
--accent:     #f5576c;
```

---

## Semantic Colors (todas as paletas devem incluir)

```css
/* Adicione ao final de qualquer paleta */
--color-success:    #22c55e;
--color-warning:    #f59e0b;
--color-error:      #ef4444;
--color-info:       #3b82f6;

--color-success-bg: rgba(34, 197, 94, 0.1);
--color-warning-bg: rgba(245, 158, 11, 0.1);
--color-error-bg:   rgba(239, 68, 68, 0.1);
--color-info-bg:    rgba(59, 130, 246, 0.1);
```

---

## Regras de uso

1. **Nunca use mais de 2 cores de destaque** — accent principal + accent secundario max
2. **Razao de contraste WCAG AA**: texto normal ≥ 4.5:1, texto grande ≥ 3:1
3. **Background hierarquico**: base → surface → elevated (tres niveis)
4. **Glow/neon**: use com moderacao — apenas 1-2 elementos por pagina
5. **Variaveis CSS**: SEMPRE use custom properties, nunca valores hardcoded no CSS
