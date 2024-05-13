import { Page, expect } from '@playwright/test';

export const waitForSpinnerNotVisible = async (page: Page, timeout = 250000) => {
  await expect(
    page.locator('div:nth-child(4) > div > .spinner')
  ).not.toBeVisible({ timeout: timeout });
};
