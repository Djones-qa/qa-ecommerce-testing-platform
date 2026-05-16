import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { USERS } from './fixtures/users';

/**
 * E2E: Login flow tests
 * Business risk: Users unable to authenticate cannot purchase — direct revenue impact.
 */
test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('standard user can log in successfully', async ({ page }) => {
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('locked out user sees error message', async () => {
    await loginPage.login(USERS.locked.username, USERS.locked.password);
    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Sorry, this user has been locked out');
  });

  test('invalid credentials show error', async () => {
    await loginPage.login('bad_user', 'wrong_password');
    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Username and password do not match');
  });

  test('empty username shows validation error', async () => {
    await loginPage.login('', USERS.standard.password);
    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Username is required');
  });

  test('empty password shows validation error', async () => {
    await loginPage.login(USERS.standard.username, '');
    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Password is required');
  });

  test('user can log out after login', async ({ page }) => {
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.logout();
    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('login page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Swag Labs/);
  });
});
