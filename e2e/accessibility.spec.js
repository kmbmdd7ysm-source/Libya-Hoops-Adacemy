import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function assertAxe(page, label) {
  const results = await new AxeBuilder({ page }).analyze();
  const severe = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  expect(severe, `${label}: ${JSON.stringify(severe, null, 2)}`).toEqual([]);
}

async function prepare(page, route = '/') {
  await page.addInitScript(() =>
    localStorage.setItem(
      'lha-cookie-consent',
      JSON.stringify({ essential: true, analytics: false }),
    ),
  );
  await page.goto(route);
}

for (const route of [
  '/',
  '/shop',
  '/products/core-logo-tee',
  '/cart',
  '/checkout',
  '/account',
  '/help',
  '/order-tracking',
  '/order-tracking/LHA-DEMO',
]) {
  test(`axe has no serious or critical violations on ${route}`, async ({ page }) => {
    await prepare(page, route);
    await assertAxe(page, route);
  });
}

test('interactive open states are accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page, '/');
  await page.locator('.mobile-more-action').click();
  await assertAxe(page, 'mobile menu open');
  await page.getByRole('button', { name: /close menu|إغلاق القائمة/i }).click();
  await page.getByRole('button', { name: /open search|فتح البحث/i }).click();
  await assertAxe(page, 'search open');
  await page.getByRole('combobox').fill('tee');
  await assertAxe(page, 'search with results');
  await page.keyboard.press('Escape');

  await page.goto('/shop');
  await page.locator('.mobile-filter-pills button').first().click();
  await assertAxe(page, 'filters main sheet');
  await page.getByRole('button', { name: /Size|المقاس/i }).click();
  await assertAxe(page, 'size filter group');
  await page.getByRole('button', { name: /close|إغلاق/i }).click();
  await page.getByRole('button', { name: /Sort By|ترتيب/i }).click();
  await assertAxe(page, 'sort sheet');

  await page.goto('/products/core-logo-tee');
  await assertAxe(page, 'product options');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await assertAxe(page, 'footer');
});

test('Arabic home, search and footer are accessible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await prepare(page, '/');
  const language = page.getByRole('button', { name: /العربية/i }).first();
  if (await language.isVisible().catch(() => false)) await language.click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await assertAxe(page, 'Arabic home');
  await page.getByRole('button', { name: /فتح البحث/i }).click();
  await page.getByRole('combobox').fill('تدريب');
  await assertAxe(page, 'Arabic search');
  await page.keyboard.press('Escape');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await assertAxe(page, 'Arabic footer');
});
