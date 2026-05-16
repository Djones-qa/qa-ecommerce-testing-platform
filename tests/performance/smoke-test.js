/**
 * Performance: Smoke test — validates the login page is reachable and fast.
 * Run: k6 run tests/performance/smoke-test.js
 *
 * Scope: login page only (no auth required).
 * SauceDemo redirects unauthenticated requests for /inventory and /cart,
 * so we only assert on the publicly accessible login page.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const loginDuration = new Trend('login_page_duration', true);

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    // Only threshold the login page — the one page we can reliably hit without auth
    login_page_duration: ['p(95)<10000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://www.saucedemo.com';

export default function () {
  const start = Date.now();
  const res = http.get(`${BASE_URL}/`);
  loginDuration.add(Date.now() - start);

  check(res, {
    'Login page status 200': (r) => r.status === 200,
    'Login page has username field': (r) => r.body.includes('data-test="username"'),
    'Login page responds under 10s': (r) => r.timings.duration < 10000,
  });

  sleep(1);
}
