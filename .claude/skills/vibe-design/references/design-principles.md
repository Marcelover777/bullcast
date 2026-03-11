# Princípios de Design Visual Premium

## Os 6 Princípios Fundamentais

### 1. Hierarquia Visual
Guie o olhar do usuário na ordem certa.
- **Tamanho:** Maior = mais importante
- **Peso:** Bold para destaque, light para suporte
- **Cor:** Cores quentes/saturadas atraem atenção
- **Espaço:** Isolamento = importância (Apple usa isso magistralmente)

### 2. Contraste
Sem contraste, sem design.
- **WCAG AA:** 4.5:1 para texto normal, 3:1 para texto grande
- Não apenas cor/cor — também peso, tamanho, estilo
- Dark mode: backgrounds escuros não são `#000000` — são `#0a0a0a` a `#1a1a1a`

### 3. Whitespace (Espaço Negativo)
O que você não coloca é tão importante quanto o que você coloca.
- Marcas premium usam mais whitespace que marcas populares
- Padding generoso = respiração e luxo
- Nunca lute contra o espaço em branco — use-o

### 4. Consistência
Crie um sistema, não uma coleção.
- Mesmo spacing scale em todo o projeto
- Mesmas sombras em todos os cards
- Mesma cor de hover em todos os botões primários
- Tipografia usada apenas em combinações definidas

### 5. Movimento Intencional
Animação é comunicação, não decoração.
- **Micro-interações:** 100-200ms (hover, click feedback)
- **Transições de estado:** 200-350ms (menus, modais)
- **Scroll animations:** 400-600ms (reveals, parallax)
- Sempre: `prefers-reduced-motion` media query

### 6. Tipografia como Design
Em designs premium, a tipografia é o design.
- Combinação ideal: serif para display + sans para body
- Line-height generoso (1.6-1.8) para legibilidade
- Letter-spacing negativo em headlines grandes (-0.02 a -0.04em)

---

## Glassmorphism

### CSS Padrão
```css
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
}
```

### Dark Glassmorphism
```css
.glass-dark {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### Regras de Uso
- Funciona apenas sobre backgrounds com textura/gradiente/imagem
- Não exagere: 2-3 elementos de glass por página max
- Sempre com sombra sutil para depth
- Contraste de texto: mínimo WCAG AA garantido

---

## Animações com GSAP

```javascript
// Reveal ao scroll
gsap.registerPlugin(ScrollTrigger)

gsap.from('.hero-title', {
  scrollTrigger: {
    trigger: '.hero',
    start: 'top 80%',
  },
  y: 60,
  opacity: 0,
  duration: 0.9,
  ease: 'power3.out',
})

// Stagger em cards
gsap.from('.card', {
  scrollTrigger: '.cards-section',
  y: 40,
  opacity: 0,
  duration: 0.6,
  stagger: 0.15,
  ease: 'power2.out',
})
```

---

## Paletas por Estilo

| Estilo | Background | Accent | Texto |
|-------|-----------|--------|-------|
| Luxury dark | #0a0a0a | #d4af37 | #f5f5f0 |
| Neon cyber | #050510 | #00f5ff | #e0e0ff |
| Editorial clean | #fafafa | #18181b | #18181b |
| Glassmorphism | gradient mesh | rgba white | #1a1a2e |
| Brutalist | #ffffff | #ff0000 | #000000 |
