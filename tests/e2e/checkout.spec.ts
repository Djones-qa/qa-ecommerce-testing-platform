import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { USERS, CUSTOMER_INFO } from './fixtures/users';

/**
 * E2E: Checkout and order confirmation tests
 * Business risk: Checkout failures are the highest-impact conversion blocker.
 */
test.describe('Checkout Flow', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let confirmationPage: OrderConfirmationPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    confirmationPage = new OrderConfirmationPage(page);

    // Add item and navigate to checkout
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.cartLink.click();
    await cartPage.proceedToCheckout();
  });

  test('complete checkout with valid info shows confirmation', async ({ page }) => {
    const { firstName, lastName, postalCode } = CUSTOMER_INFO.valid;
    await checkoutPage.fillCustomerInfo(firstName, lastName, postalCode);
    await checkoutPage.finishOrder();

    const header = await confirmationPage.getConfirmationHeader();
    expect(header).toContain('Thank you for your order');
    await expect(page).toHaveURL(/checkout-complete/);
  });

  test('missing first name shows validation error', async () => {
    const { firstName, lastName, postalCode } = CUSTOMER_INFO.missingFirstName;
    await checkoutPage.fillCustomerInfo(firstName, lastName, postalCode);
    const error = await checkoutPage.getErrorMessage();
    expect(error).toContain('First Name is required');
  });

  test('missing last name shows validation error', async () => {
    const { firstName, lastName, postalCode } = CUSTOMER_INFO.missingLastName;
    await checkoutPage.fillCustomerInfo(firstName, lastName, postalCode);
    const error = await checkoutPage.getErrorMessage();
    expect(error).toContain('Last Name is required');
  });

  test('missing postal code shows validation error', async () => {
    const { firstName, lastName, postalCode } = CUSTOMER_INFO.missingPostalCode;
    await checkoutPage.fillCustomerInfo(firstName, lastName, postalCode);
    const error = await checkoutPage.getErrorMessage();
    expect(error).toContain('Postal Code is required');
  });

  test('order summary shows correct item and total', async ({ page }) => {
    const { firstName, lastName, postalCode } = CUSTOMER_INFO.valid;
    await checkoutPage.fillCustomerInfo(firstName, lastName, postalCode);

    await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
    const total = await checkoutPage.getTotalPrice();
    expect(total).toBeGreaterThan(0);
  });

  test('cancel checkout returns to cart', async ({ page }) => {
    await checkoutPage.cancelButton.click();
    await expect(page).toHaveURL(/cart/);
  });

  test('back to products after confirmation clears cart', async ({ page }) => {
    const { firstName, lastName, postalCode } = CUSTOMER_INFO.valid;
    await checkoutPage.fillCustomerInfo(firstName, lastName, postalCode);
    await checkoutPage.finishOrder();
    await confirmationPage.backToHome();

    await expect(page).toHaveURL(/inventory/);
    await expect(inventoryPage.cartBadge).not.toBeVisible();
  });
});
