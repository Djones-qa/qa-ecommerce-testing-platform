# QA E-Commerce Testing Platform

A production-grade, multi-layer test suite for an e-commerce application. Built to demonstrate a complete test strategy — not just individual test scripts.

**Live targets:** [SauceDemo](https://www.saucedemo.com) (UI) · [FakeStoreAPI](https://fakestoreapi.com) (API)

---

## Test Architecture

| Layer | What It Tests | Stack | Business Risk Covered |
|---|---|---|---|
| **E2E** | Login, cart, checkout, order confirmation | Playwright + POM | Broken flows = zero revenue |
| **API** | Products, cart, orders REST endpoints | Playwright API | Bad data = broken UI |
| **Performance** | Checkout flow under load | k6 | Slow checkout = cart abandonment |
| **Accessibility** | WCAG 2.1 AA on all pages | axe-core + Playwright | Legal liability + excluded users |
| **Visual** | Screenshot regression on key pages | Playwright snapshots | UI regressions erode trust |
| **Security** | Auth bypass, XSS, IDOR attempts | Pytest + Requests | Account takeover, data exposure |
| **BDD** | Business-readable checkout scenarios | Cucumber.js | Stakeholder alignment |
| **CI/CD** | All layers run in parallel jobs | GitHub Actions matrix | Catch regressions before merge |

---

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+ (security tests)
- [k6](https://k6.io/docs/get-started/installation/) (performance tests)

### Install

```bash
git clone https://github.com/YOUR_USERNAME/qa-ecommerce-testing-platform.git
cd qa-ecommerce-testing-platform
npm install
npx playwright install --with-deps
pip install -r tests/security/requirements.txt
```

### Run All Tests

```bash
npm test
```

### Run Individual Layers

```bash
# E2E — all browsers
npm run test:e2e

# E2E — specific browser
npx playwright test tests/e2e --project=chromium
npx playwright test tests/e2e --project=firefox
npx playwright test tests/e2e --project=mobile-chrome

# API
npm run test:api

# Accessibility
npm run test:accessibility

# Visual regression
npm run test:visual
# Update baselines after intentional UI changes:
npx playwright test tests/visual --update-snapshots

# BDD
npm run test:bdd

# Security
npm run test:security

# Performance — smoke test (single user)
k6 run tests/performance/smoke-test.js

# Performance — load test (ramp to 100 users)
npm run test:performance
```

### View Reports

```bash
npm run report
```

---

## Project Structure

```
qa-ecommerce-testing-platform/
├── tests/
│   ├── e2e/
│   │   ├── pages/              # Page Object Models
│   │   │   ├── LoginPage.ts
│   │   │   ├── InventoryPage.ts
│   │   │   ├── CartPage.ts
│   │   │   ├── CheckoutPage.ts
│   │   │   └── OrderConfirmationPage.ts
│   │   ├── fixtures/
│   │   │   └── users.ts        # Test data
│   │   ├── login.spec.ts
│   │   ├── cart.spec.ts
│   │   ├── checkout.spec.ts
│   │   └── sorting.spec.ts
│   ├── api/
│   │   ├── products.spec.ts    # Full CRUD coverage
│   │   ├── cart.spec.ts
│   │   └── auth.spec.ts
│   ├── accessibility/
│   │   └── wcag.spec.ts        # axe-core WCAG 2.1 AA
│   ├── visual/
│   │   └── visual-regression.spec.ts
│   ├── performance/
│   │   ├── checkout-load.js    # k6 ramp to 100 users
│   │   └── smoke-test.js       # k6 single-user smoke
│   ├── security/
│   │   ├── conftest.py
│   │   ├── test_auth_bypass.py
│   │   ├── test_idor.py
│   │   └── test_xss.py
│   └── bdd/
│       ├── features/
│       │   ├── checkout.feature
│       │   └── login.feature
│       └── step-definitions/
│           ├── login.steps.ts
│           └── checkout.steps.ts
├── .github/
│   └── workflows/
│       └── test-matrix.yml     # Parallel CI matrix
├── playwright.config.ts
├── cucumber.js
├── tsconfig.json
└── pytest.ini
```

---

## Design Decisions

### Page Object Model (POM)
All E2E tests use POM. Selectors live in one place — when the UI changes, you update one file, not 20 tests.

### Why Playwright for API tests?
Keeps the toolchain unified. One `npm test` runs everything. No context-switching between tools.

### Why k6 for performance?
k6 scripts are JavaScript, version-controlled alongside the rest of the suite. Results include p95 latency and error rate thresholds that fail the CI job if breached.

### Why pytest for security?
Python's `requests` library gives fine-grained HTTP control for crafting malicious payloads. The security tests document findings even when the target API doesn't enforce controls — this mirrors real-world security testing where you report what you found, not just what failed.

### BDD as living documentation
The `.feature` files are readable by non-engineers. A product manager can verify the checkout scenarios match the acceptance criteria without reading TypeScript.

### CI Matrix Strategy
Each test layer runs as an independent parallel job. The `all-tests-passed` summary job aggregates results — a single green check on a PR means every layer passed.

---

## CI/CD Pipeline

```
push/PR
  │
  ├── E2E (chromium) ──┐
  ├── E2E (firefox) ───┤
  ├── E2E (mobile) ────┤
  ├── API ─────────────┤──► all-tests-passed ✓
  ├── Accessibility ───┤
  ├── Visual ──────────┤
  ├── BDD ─────────────┤
  ├── Security ────────┤
  └── Performance ─────┘
```

All jobs run in parallel. Artifacts (HTML reports, screenshots, JSON results) are uploaded for every run and retained for 14–30 days.

---

## Performance Thresholds

| Metric | Threshold |
|---|---|
| p95 response time | < 3000ms |
| p95 login duration | < 2000ms |
| p95 checkout duration | < 3000ms |
| Error rate | < 1% |

The load test ramps from 10 → 50 → 100 virtual users with a spike phase, then ramps down.

---

## Security Test Coverage

| Attack Vector | Test File | Status |
|---|---|---|
| SQL Injection in login | `test_auth_bypass.py` | ✅ Covered |
| XSS in product fields | `test_xss.py` | ✅ Covered |
| IDOR on cart/orders | `test_idor.py` | ✅ Covered |
| User enumeration | `test_auth_bypass.py` | ✅ Covered |
| Auth bypass (empty/null creds) | `test_auth_bypass.py` | ✅ Covered |
| Long input / DoS | `test_auth_bypass.py` | ✅ Covered |

---

## Accessibility Coverage

Tests run axe-core with `wcag2a`, `wcag2aa`, and `wcag21aa` tags across:
- Login page (including error state)
- Inventory/product listing
- Cart
- Checkout step one

Additional manual checks documented:
- Keyboard navigation (Tab order through login form)
- Image alt text presence

> Full WCAG 2.1 AA validation requires manual testing with assistive technologies (NVDA, VoiceOver) and expert accessibility review. Automated tools catch approximately 30–40% of issues.

---

## Contributing

1. Branch from `develop`
2. Add tests for any new feature or bug fix
3. Run `npm test` locally before pushing
4. PRs require the `all-tests-passed` check to be green
