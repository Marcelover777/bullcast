---
name: marketing-growth
description: >
  Marketing digital, growth engineering e otimizacao de conversao. Use esta skill quando
  o usuario pedir estrategias de marketing, SEO, copywriting, landing pages otimizadas,
  analytics, A/B testing, email marketing, ou growth hacking. Tambem use quando mencionar:
  "marketing", "SEO", "conversao", "CRO", "copywriting", "landing page", "growth",
  "analytics", "funnel", "CAC", "LTV", "churn", "onboarding", "retention", "viral",
  "referral", "email", "ads", "paid", "organic", "launch", "pricing".
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  - WebSearch
---

# Marketing & Growth Engineering

## Pipeline

### FASE 1 — PRODUCT-MARKET CONTEXT
Antes de qualquer acao de marketing, entenda:
1. **Produto**: o que faz? qual o core value?
2. **Audiencia**: quem compra? quem usa? (nem sempre sao os mesmos)
3. **Posicionamento**: como se diferencia? (formula: "Para [audiencia] que [problema], [produto] e [categoria] que [beneficio]")
4. **Stage**: pre-launch, launch, growth, maturity?
5. **Budget**: bootstrap, seed, funded?

---

### FASE 2 — CONVERSION OPTIMIZATION (CRO)
Para cada pagina/fluxo critico:

**Landing Page**
- Hero: headline (beneficio) + subheadline (como) + CTA unico
- Social proof: numeros, logos, testimonials
- Objection handling: FAQ, garantias
- CTA repetido: acima do fold + final
- Regra: 1 pagina = 1 objetivo = 1 CTA

**Signup Flow**
- Minimo de campos (email + password, ou magic link)
- Progress indicator se multi-step
- Value reminder em cada etapa
- Social login (Google, GitHub) quando fizer sentido

**Onboarding**
- Time-to-value < 60 segundos
- Guided tour do core feature
- Quick win imediato (template, demo data)
- Checkpoint: usuario usou o core feature?

---

### FASE 3 — SEO & CONTENT
**Technical SEO**
- Meta tags (title, description, og:image) em todas as paginas
- Sitemap.xml + robots.txt
- Schema markup (JSON-LD) para rich snippets
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Canonical URLs + hreflang se multi-idioma

**Content Strategy**
- Programmatic SEO: templates para paginas de alto volume
- Blog: resolver problemas do publico-alvo (bottom-of-funnel primeiro)
- AI SEO: otimizar para LLM citations (resposta clara, estruturada)

---

### FASE 4 — ANALYTICS & MEASUREMENT
Setup minimo:
- **PostHog** ou GA4 para product analytics
- **Event tracking**: signup, activation, core_action, conversion, churn
- **Funnel analysis**: onde usuarios desistem?
- **Cohort analysis**: retencao por semana de entrada

Metricas essenciais:
| Metrica | Formula | Target |
|---------|---------|--------|
| Activation Rate | users_activated / signups | > 40% |
| Retention D7 | users_active_d7 / signups | > 20% |
| Conversion | paid / free | > 2-5% |
| CAC | marketing_spend / new_customers | < LTV/3 |
| NPS | promoters - detractors | > 50 |

---

### FASE 5 — GROWTH LOOPS
Identifique e implemente pelo menos 1:

1. **Viral loop**: usuario convida → amigo entra → amigo convida
2. **Content loop**: usuario cria → Google indexa → novo usuario encontra
3. **Paid loop**: revenue → reinvest ads → more revenue
4. **Product loop**: uso gera dados → dados melhoram produto → mais uso

**Taticas rapidas:**
- Referral program (dar e receber)
- Public profiles/portfolios (SEO + social proof)
- Embeddable widgets (distribuicao gratuita)
- API/integrações (network effects)

---

### FASE 6 — LAUNCH CHECKLIST
- [ ] Landing page otimizada (CRO checklist acima)
- [ ] Analytics configurado (eventos + funnels)
- [ ] SEO basico (meta tags, sitemap, schema)
- [ ] Email de welcome + onboarding sequence
- [ ] Social proof (mesmo que early: beta users, metrics)
- [ ] Distribution channels mapeados (onde esta o publico?)
- [ ] Launch post preparado (Product Hunt, HN, Reddit, Twitter)
