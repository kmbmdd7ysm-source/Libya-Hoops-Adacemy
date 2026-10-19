import { test, expect } from '@playwright/test';

// The 10 existing programs are listed separately from one academy launch
// preview and five unlicensed/unverified source-file previews.
test('training catalogue separates available systems from draft file previews', async ({ page }) => {
  await page.goto('/online-training');
  const ready = page.locator('.training-discovery');
  await expect(ready.getByRole('heading', { level: 2 })).toBeVisible();
  await expect(ready.locator('.training-card')).toHaveCount(10);
  await expect(ready.locator('a[href="/online-training/vert-code-elite"]').first()).toBeVisible();

  const upcoming = page.locator('.training-preview-section').first();
  await expect(upcoming.locator('.training-card')).toHaveCount(1);
  const review = page.locator('.training-preview-section').last();
  await expect(review.locator('.training-card')).toHaveCount(5);
  await expect(review.locator('a[href="/online-training/source-pro-split"]').first()).toBeVisible();

  await page.goto('/online-training/source-pro-split');
  await expect(page.getByRole('heading', { level: 1, name: 'PRO SPLIT' })).toBeVisible();
  await expect(page.locator('body')).toContainText('Coming Soon');
  await expect(page.getByRole('button', { name: /add to bag|add to cart/i })).toHaveCount(0);
});
