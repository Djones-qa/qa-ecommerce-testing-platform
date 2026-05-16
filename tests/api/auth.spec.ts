import { test, expect } from '@playwright/test';

/**
 * API: Authentication endpoint tests against FakeStoreAPI
 * Business risk: Auth failures lock out all users; broken tokens expose accounts.
 */
test.describe('Auth API', () => {
  test('POST /auth/login with valid credentials returns token', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: { username: 'mor_2314', password: '83r5^_' },
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.token).toBeTruthy();
    expect(typeof body.token).toBe('string');
  });

  test('POST /auth/login with invalid credentials returns 401', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: { username: 'invalid_user', password: 'wrong_password' },
    });
    // FakeStoreAPI returns 401 for bad credentials
    expect([400, 401]).toContain(response.status());
  });

  test('POST /auth/login with missing username returns error', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: { password: 'secret' },
    });
    expect([400, 401]).toContain(response.status());
  });

  test('POST /auth/login with missing password returns error', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: { username: 'mor_2314' },
    });
    expect([400, 401]).toContain(response.status());
  });

  test('token is a valid JWT format', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: { username: 'mor_2314', password: '83r5^_' },
    });
    const body = await response.json();
    // JWT has 3 base64url parts separated by dots
    const jwtParts = body.token.split('.');
    expect(jwtParts.length).toBe(3);
  });
});
