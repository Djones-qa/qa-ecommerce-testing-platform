import { test, expect } from '@playwright/test';

/**
 * API: Products endpoint tests against JSONPlaceholder
 * Using /posts as a stand-in for "products" — same REST contract pattern.
 * Business risk: Broken product API means no inventory displayed — zero sales.
 *
 * Base URL: https://jsonplaceholder.typicode.com (configured in playwright.config.ts api project)
 */
test.describe('Products API', () => {
  test('GET /posts returns 200 with array of items', async ({ request }) => {
    const response = await request.get('/posts');
    expect(response.status()).toBe(200);

    const posts = await response.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  test('each product has required fields', async ({ request }) => {
    const response = await request.get('/posts');
    const posts = await response.json();

    for (const post of posts.slice(0, 5)) {
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('body');
      expect(post).toHaveProperty('userId');
      expect(typeof post.id).toBe('number');
      expect(post.title).toBeTruthy();
    }
  });

  test('GET /posts/:id returns single item', async ({ request }) => {
    const response = await request.get('/posts/1');
    expect(response.status()).toBe(200);

    const post = await response.json();
    expect(post.id).toBe(1);
    expect(post.title).toBeTruthy();
  });

  test('GET /posts/:id with invalid id returns 404', async ({ request }) => {
    const response = await request.get('/posts/99999');
    expect(response.status()).toBe(404);
  });

  test('GET /posts with _limit query param respects limit', async ({ request }) => {
    const response = await request.get('/posts?_limit=3');
    expect(response.status()).toBe(200);

    const posts = await response.json();
    expect(posts.length).toBe(3);
  });

  test('GET /posts filtered by userId', async ({ request }) => {
    const response = await request.get('/posts?userId=1');
    expect(response.status()).toBe(200);

    const posts = await response.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(post.userId).toBe(1);
    }
  });

  test('POST /posts creates a new item', async ({ request }) => {
    const newPost = {
      title: 'Test Product',
      body: 'A test product for API validation',
      userId: 1,
    };

    const response = await request.post('/posts', { data: newPost });
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(created.id).toBeTruthy();
    expect(created.title).toBe(newPost.title);
  });

  test('PUT /posts/:id updates an item', async ({ request }) => {
    const update = { id: 1, title: 'Updated Title', body: 'Updated body', userId: 1 };
    const response = await request.put('/posts/1', { data: update });
    expect(response.status()).toBe(200);

    const updated = await response.json();
    expect(updated.title).toBe(update.title);
  });

  test('PATCH /posts/:id partially updates an item', async ({ request }) => {
    const response = await request.patch('/posts/1', { data: { title: 'Patched Title' } });
    expect(response.status()).toBe(200);

    const patched = await response.json();
    expect(patched.title).toBe('Patched Title');
  });

  test('DELETE /posts/:id returns 200', async ({ request }) => {
    const response = await request.delete('/posts/1');
    expect(response.status()).toBe(200);
  });

  test('GET /posts response has correct Content-Type', async ({ request }) => {
    const response = await request.get('/posts/1');
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });
});
