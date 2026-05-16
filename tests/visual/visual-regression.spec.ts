import { test, expect } from '@playwright/test';
import { LoginPage } from '../e2e/pages/LoginPage';
import { InventoryPage } from '../e2e/pages/InventoryPage';
import { CartPage } from '../e2e/pages/CartPage';
import { USERS } from '../e2e/fixtures/users';

/**
 * Visual Regression: Screenshot comparison tests
 * Business risk: UI regressions erode user trust and brand consistency.
 *
 * First run generates baseline snapshots in tests/visual/snapshots/.
 * Subsequent runs compare against those baselines.
 * Update baselines with: npx playwright test --update-snapshots
 */
test.describe('Visual Regression', () => {
  test('login page matches baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('inventory page matches baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await page.waitForSelector('.inventory_list');
    await expect(page).toHaveScreenshot('inventory-page.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('cart page with items matches baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.cartLink.click();
    await expect(page).toHaveScreenshot('cart-with-items.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('checkout step one matches baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.cartLink.click();
    const cartPage = new CartPage(page);
    await cartPage.proceedToCheckout();
    await expect(page).toHaveScreenshot('checkout-step-one.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('login error state matches baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('bad_user', 'bad_pass');
    await page.waitForSelector('[data-test="error"]');
    await expect(page).toHaveScreenshot('login-error.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('product detail page matches baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await page.locator('.inventory_item_name').first().click();
    await page.waitForSelector('.inventory_details');
    await expect(page).toHaveScreenshot('product-detail.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
