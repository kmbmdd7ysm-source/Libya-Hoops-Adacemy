import { test, expect } from '@playwright/test';

for (const lang of ['en', 'ar']) {
  test(`training filters and exact purchase tiers in ${lang}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((locale) => localStorage.setItem('lha-language', locale), lang);
    await page.goto('/online-training');
    const training = page.locator('.training-discovery');
    await expect(training.locator('.training-card')).toHaveCount(10);
    const groups = training.locator('.training-filter-options');

    // A skill system is four weeks and cannot masquerade as a three-month plan.
    await groups.nth(0).getByRole('button', { name: lang === 'ar' ? 'مهارات كرة السلة' : 'Basketball Skills' }).click();
    await groups.nth(1).getByRole('button', { name: lang === 'ar' ? '3 أشهر' : '3 Months' }).click();
    await expect(training.locator('.training-card')).toHaveCount(0);
    await expect(training.locator('.training-filter-empty')).toBeVisible();
    await training.locator('.training-filter-empty button').click();
    await expect(training.locator('.training-card')).toHaveCount(10);
    await expect(page.locator('.training-preview-section')).toHaveCount(2);
    await expect(page.locator('.training-preview-section').last().locator('.training-card')).toHaveCount(5);

    await page.goto('/online-training/bodyweight-work');
    const options = page.locator('.training-purchase-options');
    await expect(options.getByRole('radio')).toHaveCount(3);
    await options.getByRole('radio').nth(1).click();
    await expect(options.getByRole('radio').nth(1)).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('.training-delivery-note')).toBeVisible();
    await page.goto('/online-training/source-pro-split');
    await expect(page.locator('.training-delivery-note')).toContainText(
      lang === 'ar' ? 'لا يمكن شراء' : 'cannot be purchased',
    );
    await expect(page.getByRole('button', { name: /add to bag|add to cart|أضف/i })).toHaveCount(0);
  });
}

for (const width of [375, 1024, 1440]) {
  test(`homepage has distinct prominent apparel and accessories at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const gear = page.locator('.home-v2-gear-editorial');
    await gear.scrollIntoViewIfNeeded();
    await expect(gear.locator('.home-v2-gear-tile')).toHaveCount(2);
    await expect(gear.locator('a[href="/shop/clothing"]')).toBeVisible();
    await expect(gear.locator('a[href="/shop/accessories"]')).toBeVisible();
    for (const image of await gear.locator('img').all()) {
      await expect.poll(() => image.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width + 2);
  });
}

test('selected training tier and exact price reach the cart', async ({ page }) => {
  await page.goto('/online-training/bodyweight-work');
  const options = page.locator('.training-purchase-options');
  await expect(options.getByRole('radio')).toHaveCount(3);
  await options.getByRole('radio').nth(1).click();
  await expect(options.getByRole('radio').nth(1)).toHaveAttribute('aria-checked', 'true');
  await page.locator('.purchase-primary').click();
  await expect(page.locator('.cart-drawer.open')).toBeVisible();
  await expect(page.locator('.cart-drawer .cart-line-name')).toContainText('3 Months');
  await expect(page.locator('.cart-drawer .cart-line-price')).toContainText('40');
});
