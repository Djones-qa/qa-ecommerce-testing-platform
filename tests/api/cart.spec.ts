import { test, expect } from '@playwright/test';

/**
 * API: Cart endpoint tests against FakeStoreAPI
 * Business risk: Cart API failures prevent users from completing purchases.
 */
test.describe('Cart API', () => {
  test('GET /carts returns all carts', async ({ request }) => {
    const response = await request.get('/carts');
    expect(response.status()).toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts)).toBe(true);
    expect(carts.length).toBeGreaterThan(0);
  });

  test('each cart has required fields', async ({ request }) => {
    const response = await request.get('/carts');
    const carts = await response.json();

    for (const cart of carts) {
      expect(cart).toHaveProperty('id');
      expect(cart).toHaveProperty('userId');
      expect(cart).toHaveProperty('date');
      expect(cart).toHaveProperty('products');
      expect(Array.isArray(cart.products)).toBe(true);
    }
  });

  test('GET /carts/:id returns single cart', async ({ request }) => {
    const response = await request.get('/carts/1');
    expect(response.status()).toBe(200);

    const cart = await response.json();
    expect(cart.id).toBe(1);
    expect(cart.products.length).toBeGreaterThan(0);
  });

  test('GET /carts/user/:userId returns user carts', async ({ request }) => {
    const response = await request.get('/carts/user/1');
    expect(response.status()).toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts)).toBe(true);
    for (const cart of carts) {
      expect(cart.userId).toBe(1);
    }
  });

  test('POST /carts creates a new cart', async ({ request }) => {
    const newCart = {
      userId: 5,
      date: new Date().toISOString().split('T')[0],
      products: [
        { productId: 1, quantity: 2 },
        { productId: 3, quantity: 1 },
      ],
    };

    const response = await request.post('/carts', { data: newCart });
    expect(response.status()).toBe(200);

    const created = await response.json();
    expect(created.id).toBeTruthy();
  });

  test('PUT /carts/:id updates cart', async ({ request }) => {
    const update = {
      userId: 3,
      date: '2024-01-01',
      products: [{ productId: 2, quantity: 5 }],
    };

    const response = await request.put('/carts/1', { data: update });
    expect(response.status()).toBe(200);

    const updated = await response.json();
    expect(updated.id).toBe(1);
  });

  test('DELETE /carts/:id removes cart', async ({ request }) => {
    const response = await request.delete('/carts/1');
    expect(response.status()).toBe(200);
  });

  test('GET /carts with date range filter', async ({ request }) => {
    const response = await request.get('/carts?startdate=2020-01-01&enddate=2020-12-31');
    expect(response.status()).toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts)).toBe(true);
  });
});
