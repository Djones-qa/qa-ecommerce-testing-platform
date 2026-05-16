/**
 * Performance: Smoke test — single user, validates the site is up before load testing.
 * Run: k6 run tests/performance/smoke-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(99)<1500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://www.saucedemo.com';

export default function () {
  const pages = [
    { url: '/', name: 'Login' },
    { url: '/inventory.html', name: 'Inventory' },
    { url: '/cart.html', name: 'Cart' },
  ];

  for (const page of pages) {
    const res = http.get(`${BASE_URL}${page.url}`);
    check(res, {
      [`${page.name} returns 200`]: (r) => r.status === 200,
      [`${page.name} responds under 1.5s`]: (r) => r.timings.duration < 1500,
    });
    sleep(0.5);
  }
}
