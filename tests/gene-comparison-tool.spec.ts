import { test, expect } from '@playwright/test';
import { URL_GCT_PROTEIN } from './helpers/constants';
import { waitForSpinnerNotVisible } from './helpers/utils';

test.describe('specific viewport block', () => {
  test.slow();
  test.use({ viewport: { width: 1600, height: 1200 } });

  test('has title', async ({ page }) => {
    await page.goto(URL_GCT_PROTEIN);

    // wait for page to load (i.e. spinner to disappear)
    await waitForSpinnerNotVisible(page, 250000);

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Gene Comparison | Visual comparison tool for AD genes');
  });

  test('sub-category is SRM by default', async ({ page }) => {
    // set category for Protein - Differential Expression
    await page.goto(URL_GCT_PROTEIN);

    // wait for page to load (i.e. spinner to disappear)
    await waitForSpinnerNotVisible(page, 150000);
  
    // expect sub-category dropdown to be SRM
    const dropdown = page.locator('#subCategory');
    await expect(dropdown).toHaveText('Targeted Selected Reaction Monitoring (SRM)');
  });
});
