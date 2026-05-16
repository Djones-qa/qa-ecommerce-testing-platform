import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';
import { USERS } from './fixtures/users';

/**
 * E2E: Shopping cart tests
 * Business risk: Cart errors cause abandoned purchases and lost revenue.
 */
test.describe('Shopping Cart', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
  });

  test('add single item to cart updates badge', async () => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    const count = await inventoryPage.getCartCount();
    expect(count).toBe(1);
  });

  test('add multiple items to cart', async () => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
    const count = await inventoryPage.getCartCount();
    expect(count).toBe(2);
  });

  test('cart persists items after navigation', async ({ page }) => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await page.goto('/about');
    await page.goBack();
    const count = await inventoryPage.getCartCount();
    expect(count).toBe(1);
  });

  test('remove item from cart page', async () => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.cartLink.click();
    await cartPage.removeItem('Sauce Labs Backpack');
    const itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBe(0);
  });

  test('cart shows correct item names', async () => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
    await inventoryPage.cartLink.click();
    const names = await cartPage.getCartItemNames();
    expect(names).toContain('Sauce Labs Backpack');
    expect(names).toContain('Sauce Labs Bike Light');
  });

  test('continue shopping returns to inventory', async ({ page }) => {
    await inventoryPage.cartLink.click();
    await cartPage.continueShoppingButton.click();
    await expect(page).toHaveURL(/inventory/);
  });

  test('remove button changes to add after removal', async ({ page }) => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    const item = page.locator('.inventory_item', { hasText: 'Sauce Labs Backpack' });
    const button = item.locator('button');
    await expect(button).toHaveText('Remove');
    await button.click();
    await expect(button).toHaveText('Add to cart');
  });
});
