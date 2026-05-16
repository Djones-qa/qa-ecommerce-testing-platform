import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, expect } from '@playwright/test';
import { LoginPage } from '../../e2e/pages/LoginPage';
import { InventoryPage } from '../../e2e/pages/InventoryPage';

const BASE_URL = 'https://www.saucedemo.com';

let browser: Browser;
let context: BrowserContext;
let page: Page;
let loginPage: LoginPage;
let inventoryPage: InventoryPage;

Before(async () => {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ baseURL: BASE_URL });
  page = await context.newPage();
  loginPage = new LoginPage(page);
  inventoryPage = new InventoryPage(page);
});

After(async () => {
  await browser.close();
});

Given('I am on the login page', async () => {
  await loginPage.goto();
});

Given('I am logged in as a standard user', async () => {
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  await page.waitForURL(/inventory/);
});

When('I enter username {string} and password {string}', async (username: string, password: string) => {
  await loginPage.usernameInput.fill(username);
  await loginPage.passwordInput.fill(password);
});

When('I click the login button', async () => {
  await loginPage.loginButton.click();
});

When('I open the menu and click logout', async () => {
  await inventoryPage.logout();
});

Then('I should be on the inventory page', async () => {
  await expect(page).toHaveURL(/inventory/);
});

Then('I should see the product list', async () => {
  await expect(page.locator('.inventory_list')).toBeVisible();
});

Then('I should see a login error containing {string}', async (message: string) => {
  const error = await loginPage.getErrorMessage();
  expect(error).toContain(message);
});

Then('I should be on the login page', async () => {
  await expect(page).toHaveURL('/');
  await expect(loginPage.loginButton).toBeVisible();
});
