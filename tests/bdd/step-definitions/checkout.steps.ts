import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, expect } from '@playwright/test';
import { LoginPage } from '../../e2e/pages/LoginPage';
import { InventoryPage } from '../../e2e/pages/InventoryPage';
import { CartPage } from '../../e2e/pages/CartPage';
import { CheckoutPage } from '../../e2e/pages/CheckoutPage';
import { OrderConfirmationPage } from '../../e2e/pages/OrderConfirmationPage';

const BASE_URL = 'https://www.saucedemo.com';

let browser: Browser;
let context: BrowserContext;
let page: Page;
let inventoryPage: InventoryPage;
let cartPage: CartPage;
let checkoutPage: CheckoutPage;
let confirmationPage: OrderConfirmationPage;

Before(async () => {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ baseURL: BASE_URL });
  page = await context.newPage();
  const loginPage = new LoginPage(page);
  inventoryPage = new InventoryPage(page);
  cartPage = new CartPage(page);
  checkoutPage = new CheckoutPage(page);
  confirmationPage = new OrderConfirmationPage(page);

  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  await page.waitForURL(/inventory/);
});

After(async () => {
  await browser.close();
});

Given('I add {string} to my cart', async (productName: string) => {
  await inventoryPage.addItemToCartByName(productName);
});

When('I proceed to checkout', async () => {
  await inventoryPage.cartLink.click();
  await cartPage.proceedToCheckout();
});

When('I enter my shipping details as {string} {string} {string}', async (
  firstName: string,
  lastName: string,
  postalCode: string
) => {
  await checkoutPage.fillCustomerInfo(firstName, lastName, postalCode);
});

When('I confirm my order', async () => {
  await checkoutPage.finishOrder();
});

When('I cancel the checkout', async () => {
  await checkoutPage.cancelButton.click();
});

Then('I should see the order confirmation message {string}', async (message: string) => {
  const header = await confirmationPage.getConfirmationHeader();
  expect(header).toContain(message);
});

Then('my cart should be empty', async () => {
  await expect(inventoryPage.cartBadge).not.toBeVisible();
});

Then('I should see a checkout error containing {string}', async (message: string) => {
  const error = await checkoutPage.getErrorMessage();
  expect(error).toContain(message);
});

Then('I should be on the cart page', async () => {
  await expect(page).toHaveURL(/cart/);
});

Then('the order total should be greater than zero', async () => {
  const total = await checkoutPage.getTotalPrice();
  expect(total).toBeGreaterThan(0);
});

Then('the order total should include tax', async () => {
  const taxText = await checkoutPage.summaryTax.textContent();
  expect(taxText).toMatch(/Tax:/);
});
