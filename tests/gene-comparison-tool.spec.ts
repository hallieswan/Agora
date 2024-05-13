import { test, expect } from '@playwright/test';

test.describe('specific viewport block', () => {
  test.slow();
  test.use({ viewport: { width: 1600, height: 1200 } });

  test('has title', async ({ page }) => {
    await page.goto('/genes/comparison?category=Protein+-+Differential+Expression');

    // wait for page to load (i.e. spinner to disappear)
    await expect(page.locator('div:nth-child(4) > div > .spinner'))
      .not.toBeVisible({ timeout: 250000});

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Gene Comparison | Visual comparison tool for AD genes');
  });

  test('sub-category is SRM by default', async ({ page }) => {
    // set category for Protein - Differential Expression
    await page.goto('/genes/comparison?category=Protein+-+Differential+Expression');

    // wait for page to load (i.e. spinner to disappear)
    await expect(page.locator('div:nth-child(4) > div > .spinner'))
      .not.toBeVisible({ timeout: 150000});
  
    // expect sub-category dropdown to be SRM
    const dropdown = page.locator('#subCategory');
    await expect(dropdown).toHaveText('Targeted Selected Reaction Monitoring (SRM)');
  });

  test('switching from RNA to Protein with RNA-specific column ordering reverts back to Risk Score descending', async ({ page }) => {
    // set category for Protein - Differential Expression
    await page.goto('/genes/comparison?sortField=FP&sortOrder=1');

    // wait for page to load (i.e. spinner to disappear)
    await expect(page.locator('div:nth-child(4) > div > .spinner'))
      .not.toBeVisible({ timeout: 150000});

    // Gene Comparison Overview tutorial modal
    const tutorialModal = page.getByText('Gene Comparison Overview');
    await expect(tutorialModal).toBeVisible({ timeout: 10000});

    // close the Gene Comparison Overview tutorial modal
    const closeButton = page.locator('.p-dialog-header-close-icon');
    await closeButton.click();

    // Gene Comparison Overview tutorial modal
    await expect(tutorialModal).not.toBeVisible({ timeout: 10000});

    // sort by FP ascending
    const FPColumn = page.getByText('FP');
    // first click sorts descending
    await FPColumn.click();
    // second click sorts ascending
    await FPColumn.click();

    // expect url to be correct
    expect(page.url()).toBe('http://localhost:8080/genes/comparison?sortField=FP&sortOrder=1');

    // change category to Protein
    await page.locator('p-dropdown').filter({ hasText: 'RNA - Differential Expression' }).getByLabel('dropdown trigger').click();
    await page.getByText('Protein - Differential Expression').click();

    // expect url to be correct
    expect(page.url()).toBe('http://localhost:8080/genes/comparison?category=Protein+-+Differential+Expression');
  });
});
