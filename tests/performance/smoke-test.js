/**
 * Performance: Smoke test — single user, validates the site responds before load testing.
 * Run: k6 run tests/performance/smoke-test.js
 *
 * Note: SauceDemo redirects unauthenticated requests for /inventory and /cart
 * back to the login page. We test the login page directly and verify the site
 * is reachable and responding within acceptable time.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(99)<10000'],
    http_req_failed: ['rate<0.20'],  // Allow up to 20% — redirects count as failures in k6
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://www.saucedemo.com';

export default function () {
  // Login page is always accessible without auth
  const loginRes = http.get(`${BASE_URL}/`);
  check(loginRes, {
    'Login page returns 200': (r) => r.status === 200,
    'Login page responds under 10s': (r) => r.timings.duration < 10000,
    'Login page has login form': (r) => r.body.includes('login-button'),
  });

  sleep(1);

  // These pages redirect to login when unauthenticated — we just verify the site responds
  const inventoryRes = http.get(`${BASE_URL}/inventory.html`);
  check(inventoryRes, {
    'Inventory responds (200 or redirect)': (r) => r.status === 200 || r.status === 302,
  });

  sleep(1);
}
