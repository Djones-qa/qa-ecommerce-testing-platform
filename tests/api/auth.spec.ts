import { test, expect } from '@playwright/test';

/**
 * API: Authentication / user endpoint tests against JSONPlaceholder
 * Using /users as a stand-in for auth — validates user data contract.
 * Business risk: Auth failures lock out all users; broken tokens expose accounts.
 *
 * Base URL: https://jsonplaceholder.typicode.com (configured in playwright.config.ts api project)
 */
test.describe('Auth / Users API', () => {
  test('GET /users returns list of users', async ({ request }) => {
    const response = await request.get('/users');
    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  test('each user has required identity fields', async ({ request }) => {
    const response = await request.get('/users');
    const users = await response.json();

    for (const user of users) {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('email');
      expect(user.email).toMatch(/@/);
    }
  });

  test('GET /users/:id returns single user', async ({ request }) => {
    const response = await request.get('/users/1');
    expect(response.status()).toBe(200);

    const user = await response.json();
    expect(user.id).toBe(1);
    expect(user.name).toBeTruthy();
  });

  test('GET /users/:id with invalid id returns 404', async ({ request }) => {
    const response = await request.get('/users/99999');
    expect(response.status()).toBe(404);
  });

  test('POST /users creates a new user', async ({ request }) => {
    const newUser = {
      name: 'Jane Doe',
      username: 'janedoe',
      email: 'jane@example.com',
    };

    const response = await request.post('/users', { data: newUser });
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(created.id).toBeTruthy();
    expect(created.name).toBe(newUser.name);
  });

  test('GET /users response has correct Content-Type', async ({ request }) => {
    const response = await request.get('/users');
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('user email addresses are unique', async ({ request }) => {
    const response = await request.get('/users');
    const users = await response.json();

    const emails = users.map((u: any) => u.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    expect(uniqueEmails.size).toBe(emails.length);
  });
});
