import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { USERS } from './fixtures/users';

/**
 * E2E: Product sorting tests
 * Business risk: Broken sorting degrades product discovery and reduces conversion.
 */
test.describe('Product Sorting', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await page.waitForSelector('.inventory_list');
    inventoryPage = new InventoryPage(page);
  });

  test('sort A to Z is default order', async () => {
    const names = await inventoryPage.getItemNames();
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  test('sort Z to A reverses alphabetical order', async ({ page }) => {
    await inventoryPage.sortBy('za');
    // Wait for the DOM to reflect the new sort order
    await page.waitForTimeout(500);
    const names = await inventoryPage.getItemNames();
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });

  test('sort low to high orders by ascending price', async ({ page }) => {
    await inventoryPage.sortBy('lohi');
    await page.waitForTimeout(500);
    const prices = await inventoryPage.getItemPrices();
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('sort high to low orders by descending price', async ({ page }) => {
    await inventoryPage.sortBy('hilo');
    await page.waitForTimeout(500);
    const prices = await inventoryPage.getItemPrices();
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
    }
  });
});
