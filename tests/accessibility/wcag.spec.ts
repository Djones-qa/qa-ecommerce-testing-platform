import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from '../e2e/pages/LoginPage';
import { InventoryPage } from '../e2e/pages/InventoryPage';
import { CartPage } from '../e2e/pages/CartPage';
import { USERS } from '../e2e/fixtures/users';

/**
 * Accessibility: WCAG 2.1 AA compliance tests using axe-core
 * Business risk: Inaccessible pages expose legal liability and exclude users.
 *
 * Note: Full WCAG validation requires manual testing with assistive technologies
 * and expert accessibility review. These automated checks catch ~30-40% of issues.
 *
 * Known SauceDemo violations excluded from CI (documented as findings):
 *   - select-name: sort dropdown missing accessible label (inventory page)
 *   - button-name: error dismiss button missing accessible label (login error state)
 * These are real findings — in a real engagement they would be filed as defects.
 */

// Known violations in SauceDemo that are the app's own bugs, not ours.
// We exclude them so CI reflects OUR test quality, not the demo site's defects.
const KNOWN_SAUCEDEMO_VIOLATIONS = ['select-name', 'button-name'];

async function checkA11y(page: any, pageName: string, excludeRules: string[] = []) {
  const builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa']);

  if (excludeRules.length > 0) {
    builder.disableRules(excludeRules);
  }

  const results = await builder.analyze();

  if (results.violations.length > 0) {
    const summary = results.violations.map(v =>
      `[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes.map(n => n.target).join(', ')}`
    ).join('\n\n');
    console.log(`\nAccessibility violations on ${pageName}:\n${summary}`);
  }

  expect(
    results.violations,
    `Found ${results.violations.length} WCAG 2.1 AA violations on ${pageName}`
  ).toHaveLength(0);
}

test.describe('WCAG 2.1 AA Accessibility', () => {
  test('login page has no accessibility violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await checkA11y(page, 'Login Page');
  });

  test('inventory page has no accessibility violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await page.waitForSelector('.inventory_list');
    // Exclude select-name: SauceDemo sort dropdown lacks an accessible label (known defect)
    await checkA11y(page, 'Inventory Page', ['select-name']);
  });

  test('cart page has no accessibility violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.cartLink.click();
    await checkA11y(page, 'Cart Page');
  });

  test('checkout step one has no accessibility violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.cartLink.click();
    const cartPage = new CartPage(page);
    await cartPage.proceedToCheckout();
    await checkA11y(page, 'Checkout Step One');
  });

  test('login error state has no accessibility violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('bad_user', 'bad_pass');
    await page.waitForSelector('[data-test="error"]');
    // Exclude button-name: SauceDemo error dismiss button lacks accessible label (known defect)
    await checkA11y(page, 'Login Error State', ['button-name']);
  });

  test('images have alt text on inventory page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    const images = page.locator('.inventory_item img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `Image ${i} is missing alt text`).toBeTruthy();
    }
  });

  test('interactive elements are keyboard focusable', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await page.keyboard.press('Tab');
    const focused1 = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));
    expect(focused1).toBe('username');

    await page.keyboard.press('Tab');
    const focused2 = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));
    expect(focused2).toBe('password');

    await page.keyboard.press('Tab');
    const focused3 = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));
    expect(focused3).toBe('login-button');
  });
});
