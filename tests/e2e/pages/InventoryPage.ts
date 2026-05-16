import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the SauceDemo inventory/products page.
 */
export class InventoryPage {
  readonly page: Page;
  readonly inventoryItems: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly sortDropdown: Locator;
  readonly burgerMenu: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inventoryItems = page.locator('.inventory_item');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.sortDropdown = page.locator('[data-test="product_sort_container"]');
    this.burgerMenu = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  async addItemToCartByName(name: string) {
    const item = this.page.locator('.inventory_item', { hasText: name });
    await item.locator('button').click();
  }

  async removeItemFromCartByName(name: string) {
    const item = this.page.locator('.inventory_item', { hasText: name });
    await item.locator('button').click();
  }

  async getCartCount(): Promise<number> {
    const text = await this.cartBadge.textContent();
    return text ? parseInt(text, 10) : 0;
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.waitFor({ state: 'visible' });
    await this.sortDropdown.selectOption(option);
    // Wait for the inventory list to re-render after sort
    await this.page.waitForFunction(() => {
      const items = document.querySelectorAll('.inventory_item');
      return items.length > 0;
    });
  }

  async getItemNames(): Promise<string[]> {
    return this.page.locator('.inventory_item_name').allTextContents();
  }

  async getItemPrices(): Promise<number[]> {
    const priceTexts = await this.page.locator('.inventory_item_price').allTextContents();
    return priceTexts.map(p => parseFloat(p.replace('$', '')));
  }

  async logout() {
    await this.burgerMenu.click();
    await this.logoutLink.click();
  }
}
