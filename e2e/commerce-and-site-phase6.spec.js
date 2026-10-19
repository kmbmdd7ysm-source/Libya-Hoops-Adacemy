import { test, expect } from '@playwright/test';

test('digital training checkout never presents physical cash-on-delivery as payment', async ({ page }) => {
  await page.goto('/online-training/bodyweight-work');
  await expect(page.locator('.purchase-primary')).toBeVisible();
  await page.locator('.purchase-primary').click();
  await expect(page.locator('.cart-drawer.open')).toBeVisible();
  await page.locator('.cart-drawer.open').getByRole('button', { name: /checkout|الدفع|إتمام الشراء/i }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  const guest = page.getByRole('button', { name: /Checkout as Guest|الدفع كضيف/i });
  if (await guest.isVisible().catch(() => false)) await guest.click();
  const methods = page.locator('.payment-methods');
  await expect(methods).toBeVisible();
  await expect(methods.getByRole('radio', { name: /Cash on Delivery|الدفع نقداً/i })).toHaveCount(0);
  await expect(methods).toContainText(/Cash on delivery is for physical goods|الدفع عند الاستلام للمنتجات المادية/i);
  await expect(methods.getByRole('radio', { name: /online payment|الدفع الإلكتروني/i })).toBeVisible();
});

for (const width of [390, 1440]) {
  for (const language of ['en', 'ar']) {
    test(`shared premium site surfaces stay inside viewport: ${width} ${language}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 880 });
      await page.addInitScript((lang) => localStorage.setItem('lha-language', lang), language);
      const routes = ['/', '/shop', '/shop/clothing', '/online-training', '/programs', '/cart', '/checkout', '/order-tracking', '/about', '/contact', '/help'];
      const errors = [];
      for (const path of routes) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('main')).toBeVisible();
        const scan = await page.evaluate(() => ({
          width: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth,
          footer: Boolean(document.querySelector('.site-footer')),
          logo: Boolean(document.querySelector('.site-header .brand-logo')),
          dir: document.documentElement.dir,
        }));
        if (scan.scroll > scan.width + 2 || !scan.logo || !scan.footer ||
          scan.dir !== (language === 'ar' ? 'rtl' : 'ltr')) errors.push({ path, ...scan });
      }
      expect(errors).toEqual([]);
    });
  }
}

test('order tracking does not claim carrier tracking exists', async ({ page }) => {
  await page.goto('/order-tracking');
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('.site-header')).toBeVisible();
  await expect(page.locator('.site-footer')).toBeVisible();
});
