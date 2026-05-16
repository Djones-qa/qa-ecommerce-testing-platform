/**
 * Performance: Checkout flow load test using k6
 * Business risk: Slow checkout under load causes cart abandonment.
 *
 * Run: k6 run tests/performance/checkout-load.js
 * Run with env: k6 run --env BASE_URL=https://www.saucedemo.com tests/performance/checkout-load.js
 *
 * Thresholds:
 *   - 95th percentile response time < 3s
 *   - Error rate < 1%
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration', true);
const inventoryDuration = new Trend('inventory_duration', true);
const cartDuration = new Trend('cart_duration', true);
const checkoutDuration = new Trend('checkout_duration', true);

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '2m', target: 50 },    // Hold at 50 users
    { duration: '30s', target: 100 },  // Spike to 100 users
    { duration: '1m', target: 100 },   // Hold spike
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% of requests under 3s
    http_req_failed: ['rate<0.01'],     // Error rate under 1%
    errors: ['rate<0.01'],
    login_duration: ['p(95)<2000'],
    inventory_duration: ['p(95)<2000'],
    checkout_duration: ['p(95)<3000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://www.saucedemo.com';

export default function () {
  group('Login', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/`);
    loginDuration.add(Date.now() - start);

    const loginOk = check(res, {
      'login page status 200': (r) => r.status === 200,
      'login page has username field': (r) => r.body.includes('data-test="username"'),
    });
    errorRate.add(!loginOk);
  });

  sleep(1);

  group('Browse Inventory', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/inventory.html`);
    inventoryDuration.add(Date.now() - start);

    const inventoryOk = check(res, {
      'inventory page status 200': (r) => r.status === 200,
      'inventory list present': (r) => r.body.includes('inventory_list'),
    });
    errorRate.add(!inventoryOk);
  });

  sleep(1);

  group('View Cart', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/cart.html`);
    cartDuration.add(Date.now() - start);

    const cartOk = check(res, {
      'cart page status 200': (r) => r.status === 200,
    });
    errorRate.add(!cartOk);
  });

  sleep(1);

  group('Checkout Step One', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/checkout-step-one.html`);
    checkoutDuration.add(Date.now() - start);

    const checkoutOk = check(res, {
      'checkout page status 200': (r) => r.status === 200,
    });
    errorRate.add(!checkoutOk);
  });

  sleep(Math.random() * 2 + 1); // Random think time 1-3s
}

export function handleSummary(data) {
  return {
    'tests/performance/results/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// Inline text summary helper (avoids external import)
function textSummary(data, opts) {
  const indent = opts?.indent || '';
  const lines = [`\n${indent}Performance Test Summary`];
  lines.push(`${indent}${'='.repeat(40)}`);

  const metrics = data.metrics || {};
  const interesting = [
    'http_req_duration',
    'http_req_failed',
    'login_duration',
    'inventory_duration',
    'checkout_duration',
    'errors',
  ];

  for (const name of interesting) {
    const m = metrics[name];
    if (!m) continue;
    if (m.type === 'trend') {
      lines.push(`${indent}${name}: avg=${m.values.avg?.toFixed(0)}ms p95=${m.values['p(95)']?.toFixed(0)}ms`);
    } else if (m.type === 'rate') {
      lines.push(`${indent}${name}: ${(m.values.rate * 100).toFixed(2)}%`);
    }
  }

  return lines.join('\n');
}
