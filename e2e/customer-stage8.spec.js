import { test, expect } from '@playwright/test';

const sizes = [390, 1440];
const locales = ['en', 'ar'];

for (const lang of locales) for (const width of sizes) {
  test(`account and support stay usable and bilingual ${lang} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript((selected) => localStorage.setItem('lha-language', selected), lang);
    await page.goto('/account?mode=signup', { waitUntil: 'load' });
    await expect(page.locator('.account-access-layout')).toBeVisible();
    await expect(page.locator('.account-access-art img')).toHaveJSProperty('naturalWidth', 1312);
    await expect(page.locator('form.auth-form')).toBeVisible();
    await expect(page.locator('.account-access-guest-note a[href="/shop"]')).toBeVisible();
    await expect(page.locator('.account-access-art-content strong')).toBeVisible();
    await page.goto('/help');
    await expect(page.locator('.help-featured-links a')).toHaveCount(3);
    await expect(page.locator('.help-featured-link[href="/order-tracking"]')).toBeVisible();
    await expect(page.locator('.help-featured-link[href="/account?section=orders"]')).toBeVisible();
    const search = page.locator('#help-search-input');
    await expect(search).toBeVisible();
    await search.fill('shipping');
    await expect(page.locator('.help-topic')).not.toHaveCount(0);
    await search.fill('الشحن');
    await expect(page.locator('.help-topic')).not.toHaveCount(0);
    await page.goto('/faq');
    await expect(page.locator('.faq-jump-nav a').first()).toBeVisible();
    const sections = await page.locator('.faq-jump-nav a').count();
    expect(sections).toBeGreaterThan(0);
    const layout = await page.evaluate(() => ({
      w: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      dir: document.documentElement.dir,
    }));
    expect(layout.scroll).toBeLessThanOrEqual(layout.w + 2);
    expect(layout.dir).toBe(lang === 'ar' ? 'rtl' : 'ltr');
  });
}

test('help category index follows actual FAQ category and does not require sign in', async ({ page }) => {
  await page.goto('/faq');
  const first = page.locator('.faq-jump-nav a').first();
  const destination = await first.getAttribute('href');
  expect(destination).toMatch(/^#faq-/);
  await first.click();
  await expect(page.locator(destination)).toBeVisible();
  await page.goto('/help');
  await expect(page.locator('.help-featured-links')).toBeVisible();
  await page.locator('.help-featured-link[href="/order-tracking"]').click();
  await expect(page).toHaveURL(/\/order-tracking$/);
});

test('signed out visitors can choose account sign-in and guest shop independently', async ({ page }) => {
  await page.goto('/account?mode=signup');
  await expect(page.locator('.auth-form h1')).toContainText('Create account');
  await page.locator('.account-access-guest-note a[href="/shop"]').click();
  await expect(page).toHaveURL(/\/shop$/);
  await page.goto('/account?mode=signin');
  await expect(page.locator('.auth-form h1')).toContainText('Sign in');
});
