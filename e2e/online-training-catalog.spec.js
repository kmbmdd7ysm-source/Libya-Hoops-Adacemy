import { test, expect } from '@playwright/test';

// Regression: the training listing must not hide the academy's existing
// purchasable training systems when new supplied source files are added.
test('training catalogue separates available systems from draft file previews', async ({ page }) => {
  await page.goto('/online-training');
  const availableHeading = page.getByRole('heading', { name: 'Training programs' });
  await expect(availableHeading).toBeVisible();
  const availableContainer = availableHeading.locator('..');
  await expect(availableContainer.locator('.training-card')).toHaveCount(10);
  await expect(availableContainer.locator('a[href="/online-training/vert-code-elite"]').first()).toBeVisible();

  const upcoming = page.getByRole('region', { name: 'Upcoming training systems' });
  await expect(upcoming).toBeVisible();
  await expect(upcoming.locator('.training-card')).toHaveCount(6);
  await expect(upcoming.locator('a[href="/online-training/source-pro-split"]').first()).toBeVisible();

  await page.goto('/online-training/source-pro-split');
  await expect(page.getByRole('heading', { level: 1, name: 'PRO SPLIT' })).toBeVisible();
  await expect(page.locator('body')).toContainText('Coming Soon');
  await expect(page.getByRole('button', { name: /add to bag|add to cart/i })).toHaveCount(0);
});
