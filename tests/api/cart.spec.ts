import { test, expect } from '@playwright/test';

/**
 * API: Cart / collection endpoint tests against JSONPlaceholder
 * Using /todos as a stand-in for cart items — same REST contract pattern.
 * Business risk: Cart API failures prevent users from completing purchases.
 *
 * Base URL: https://jsonplaceholder.typicode.com (configured in playwright.config.ts api project)
 */
test.describe('Cart API', () => {
  test('GET /todos returns all items', async ({ request }) => {
    const response = await request.get('/todos');
    expect(response.status()).toBe(200);

    const todos = await response.json();
    expect(Array.isArray(todos)).toBe(true);
    expect(todos.length).toBeGreaterThan(0);
  });

  test('each cart item has required fields', async ({ request }) => {
    const response = await request.get('/todos');
    const todos = await response.json();

    for (const item of todos.slice(0, 5)) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('userId');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('completed');
      expect(typeof item.id).toBe('number');
    }
  });

  test('GET /todos/:id returns single item', async ({ request }) => {
    const response = await request.get('/todos/1');
    expect(response.status()).toBe(200);

    const item = await response.json();
    expect(item.id).toBe(1);
  });

  test('GET /todos filtered by userId returns user items', async ({ request }) => {
    const response = await request.get('/todos?userId=1');
    expect(response.status()).toBe(200);

    const items = await response.json();
    expect(Array.isArray(items)).toBe(true);
    for (const item of items) {
      expect(item.userId).toBe(1);
    }
  });

  test('POST /todos creates a new cart item', async ({ request }) => {
    const newItem = {
      userId: 5,
      title: 'Buy Sauce Labs Backpack',
      completed: false,
    };

    const response = await request.post('/todos', { data: newItem });
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(created.id).toBeTruthy();
    expect(created.title).toBe(newItem.title);
  });

  test('PUT /todos/:id updates item', async ({ request }) => {
    const update = { userId: 1, id: 1, title: 'Updated cart item', completed: true };
    const response = await request.put('/todos/1', { data: update });
    expect(response.status()).toBe(200);

    const updated = await response.json();
    expect(updated.id).toBe(1);
  });

  test('DELETE /todos/:id removes item', async ({ request }) => {
    const response = await request.delete('/todos/1');
    expect(response.status()).toBe(200);
  });

  test('GET /todos with _limit filter', async ({ request }) => {
    const response = await request.get('/todos?_limit=5');
    expect(response.status()).toBe(200);

    const items = await response.json();
    expect(items.length).toBe(5);
  });
});
