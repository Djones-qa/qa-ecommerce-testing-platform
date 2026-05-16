import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the SauceDemo order confirmation page.
 */
export class OrderConfirmationPage {
  readonly page: Page;
  readonly confirmationHeader: Locator;
  readonly confirmationText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmationHeader = page.locator('.complete-header');
    this.confirmationText = page.locator('.complete-text');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async getConfirmationHeader(): Promise<string> {
    return (await this.confirmationHeader.textContent()) ?? '';
  }

  async getConfirmationText(): Promise<string> {
    return (await this.confirmationText.textContent()) ?? '';
  }

  async backToHome() {
    await this.backHomeButton.click();
  }
}
