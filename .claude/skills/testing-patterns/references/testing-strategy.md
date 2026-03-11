# Estratégia de Testes

## Pirâmide de Testes

```
        /\
       /E2E\          ← Poucos, lentos, alto valor
      /------\
     /Integração\     ← Moderados, testam camadas juntas
    /------------\
   / Unit Tests  \    ← Muitos, rápidos, isolados
  /--------------\
```

---

## Vitest — Configuração

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
      }
    }
  }
})
```

---

## Padrões de Testes Unitários

```typescript
// __tests__/discount.test.ts
import { describe, it, expect } from 'vitest'
import { calculateDiscount } from '../discount'

describe('calculateDiscount', () => {
  describe('sem desconto', () => {
    it('retorna 0 para valores abaixo de R$100', () => {
      expect(calculateDiscount(99.99)).toBe(0)
    })
  })

  describe('desconto de 10%', () => {
    it('aplica 10% no boundary exato de R$100', () => {
      expect(calculateDiscount(100)).toBe(10)
    })

    it('aplica 10% para valores entre R$100 e R$299.99', () => {
      expect(calculateDiscount(200)).toBe(20)
    })
  })

  describe('desconto de 20%', () => {
    it('aplica 20% no boundary exato de R$300', () => {
      expect(calculateDiscount(300)).toBe(60)
    })
  })
})
```

---

## Playwright — Page Object Model

```typescript
// tests/pages/checkout.page.ts
import { Page } from '@playwright/test'

export class CheckoutPage {
  constructor(private page: Page) {}

  async addToCart(productId: string) {
    await this.page.click(`[data-testid="add-to-cart-${productId}"]`)
    await this.page.waitForSelector('[data-testid="cart-count"]')
  }

  async checkout() {
    await this.page.click('[data-testid="checkout-btn"]')
    await this.page.waitForURL('**/checkout')
  }

  async fillPayment(card: { number: string; expiry: string; cvv: string }) {
    await this.page.fill('[data-testid="card-number"]', card.number)
    await this.page.fill('[data-testid="card-expiry"]', card.expiry)
    await this.page.fill('[data-testid="card-cvv"]', card.cvv)
  }

  async submit() {
    await this.page.click('[data-testid="pay-btn"]')
    await this.page.waitForURL('**/order-confirmation')
  }
}

// tests/checkout.spec.ts
import { test, expect } from '@playwright/test'
import { CheckoutPage } from './pages/checkout.page'

test('completa fluxo de compra', async ({ page }) => {
  const checkout = new CheckoutPage(page)

  await page.goto('/products/sneaker-1')
  await checkout.addToCart('sneaker-1')
  await checkout.checkout()
  await checkout.fillPayment({ number: '4111111111111111', expiry: '12/28', cvv: '123' })
  await checkout.submit()

  await expect(page).toHaveURL(/order-confirmation/)
  await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
})
```

---

## MSW — Mock Service Worker

```typescript
// src/test/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/products', () => {
    return HttpResponse.json([
      { id: '1', name: 'Product A', price: 99.90 }
    ])
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json()

    if (password === 'wrong') {
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    return HttpResponse.json({ access_token: 'mock-token' })
  }),
]

// src/test/setup.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```
