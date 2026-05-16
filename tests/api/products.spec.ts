import { test, expect } from '@playwright/test';

/**
 * API: Products endpoint tests against FakeStoreAPI
 * Business risk: Broken product API means no inventory displayed — zero sales.
 *
 * Base URL: https://fakestoreapi.com (configured in playwright.config.ts api project)
 */
test.describe('Products API', () => {
  test('GET /products returns 200 with array of products', async ({ request }) => {
    const response = await request.get('/products');
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  test('each product has required fields', async ({ request }) => {
    const response = await request.get('/products');
    const products = await response.json();

    for (const product of products) {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('image');
      expect(typeof product.price).toBe('number');
      expect(product.price).toBeGreaterThan(0);
    }
  });

  test('GET /products/:id returns single product', async ({ request }) => {
    const response = await request.get('/products/1');
    expect(response.status()).toBe(200);

    const product = await response.json();
    expect(product.id).toBe(1);
    expect(product.title).toBeTruthy();
  });

  test('GET /products/:id with invalid id returns 404 or null', async ({ request }) => {
    const response = await request.get('/products/99999');
    // FakeStoreAPI returns null for missing products
    const body = await response.json();
    expect(response.status() === 404 || body === null).toBeTruthy();
  });

  test('GET /products/categories returns category list', async ({ request }) => {
    const response = await request.get('/products/categories');
    expect(response.status()).toBe(200);

    const categories = await response.json();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  test('GET /products/category/:name filters correctly', async ({ request }) => {
    const categoriesRes = await request.get('/products/categories');
    const categories = await categoriesRes.json();
    const category = categories[0];

    const response = await request.get(`/products/category/${encodeURIComponent(category)}`);
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    for (const product of products) {
      expect(product.category).toBe(category);
    }
  });

  test('GET /products with limit query param respects limit', async ({ request }) => {
    const response = await request.get('/products?limit=3');
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(products.length).toBe(3);
  });

  test('GET /products with sort=desc returns products in descending id order', async ({ request }) => {
    const response = await request.get('/products?sort=desc');
    expect(response.status()).toBe(200);

    const products = await response.json();
    for (let i = 1; i < products.length; i++) {
      expect(products[i].id).toBeLessThan(products[i - 1].id);
    }
  });

  test('POST /products creates a new product', async ({ request }) => {
    const newProduct = {
      title: 'Test Product',
      price: 29.99,
      description: 'A test product for API validation',
      image: 'https://fakestoreapi.com/img/placeholder.jpg',
      category: 'electronics',
    };

    const response = await request.post('/products', { data: newProduct });
    expect(response.status()).toBe(200);

    const created = await response.json();
    expect(created.id).toBeTruthy();
    expect(created.title).toBe(newProduct.title);
    expect(created.price).toBe(newProduct.price);
  });

  test('PUT /products/:id updates a product', async ({ request }) => {
    const update = { title: 'Updated Title', price: 99.99 };
    const response = await request.put('/products/1', { data: update });
    expect(response.status()).toBe(200);

    const updated = await response.json();
    expect(updated.title).toBe(update.title);
  });

  test('DELETE /products/:id returns success', async ({ request }) => {
    const response = await request.delete('/products/1');
    expect(response.status()).toBe(200);
  });
});
