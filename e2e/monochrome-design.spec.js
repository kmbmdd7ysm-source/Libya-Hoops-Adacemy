import { test, expect } from '@playwright/test';
const paths = [
  '/',
  '/shop',
  '/online-training',
  '/programs',
  '/events',
  '/about',
  '/coaches',
  '/contact',
  '/account',
  '/help',
  '/cart',
  '/checkout',
  '/order-tracking',
];
test('the same neutral tokens apply across thirteen core routes', async ({ page }) => {
  for (const path of paths) {
    await page.goto(path);
    await expect(page.locator('body')).toBeVisible();
    const tokens = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement),
        keys = ['--bg', '--surface', '--border', '--text', '--accent', '--muted', '--warn', '--ok'];
      return Object.fromEntries(keys.map((k) => [k, s.getPropertyValue(k).trim()]));
    });
    for (const [key, value] of Object.entries(tokens)) {
      expect(value, path + ' ' + key).toBeTruthy();
      expect(value.startsWith('#'), path + ' ' + key).toBe(true);
      const h = value.slice(1);
      const parts = h.length === 3 ? h.split('') : h.match(/../g);
      expect(new Set(parts).size, path + ' ' + key + ' ' + value).toBe(1);
    }
  }
});
test('typography and essential interactions remain accessible with RTL', async ({ page }) => {
  await page.goto('/');
  const primary = page.locator('.btn-primary:visible').first();
  if (await primary.count())
    expect((await primary.boundingBox())?.height).toBeGreaterThanOrEqual(43);
  const toggle = page.getByRole('button', { name: /العربية|Arabic|English|الإنجليزية/i }).first();
  if (await toggle.count()) {
    if (!(await page.locator('html').getAttribute('lang'))?.startsWith('ar')) await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const heading = page.locator('h1').first();
    if (await heading.count())
      await expect
        .poll(async () =>
          heading.evaluate((el) => getComputedStyle(el).letterSpacing).catch(() => null),
        )
        .toMatch(/^(normal|0px)$/);
  }
});
