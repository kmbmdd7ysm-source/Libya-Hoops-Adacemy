import { test, expect } from '@playwright/test';

const widths = [320, 390, 768, 1440];
const paths = [
  { id: 'court', href: '/programs' },
  { id: 'digital', href: '/online-training' },
  { id: 'culture', href: '/shop' },
];

for (const width of widths) {
  for (const lang of ['en', 'ar']) {
    test(`homepage routes, imagery and geometry: ${width}px / ${lang}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((value) => localStorage.setItem('lha-language', value), lang);
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      await expect(page.locator('.home-v2-hero h1')).toBeVisible();
      await expect(page.locator('.home-v2-hero-actions a[href="/online-training"]')).toBeVisible();
      await expect(page.locator('.home-v2-hero-actions a[href="/programs"]')).toBeVisible();
      await expect(page.locator('.home-v2-hero-actions a[href="/shop"]')).toBeVisible();

      const section = page.locator('#home-paths');
      await section.scrollIntoViewIfNeeded();
      await expect(section.locator('.home-v2-path')).toHaveCount(3);
      for (const path of paths) {
        const card = section.locator(`.home-v2-path[data-path="${path.id}"]`);
        await expect(card).toHaveAttribute('href', path.href);
        await expect(card.locator('img')).toHaveJSProperty('complete', true);
        expect(await card.locator('img').evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
      }

      const overflow = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.width + 2);
    });
  }
}

test('home shows verified offers, no empty coaching or expired event placeholders', async ({ page }) => {
  await page.goto('/');
  await page.locator('.home-deferred-anchor').scrollIntoViewIfNeeded();
  await expect(page.locator('.home-v2-deferred')).toBeVisible();
  await expect(page.locator('.home-v2-deferred .program-card').first()).toBeVisible();
  await expect(page.locator('.home-v2-deferred .training-card').first()).toBeVisible();
  await expect(page.locator('.home-v2-deferred .product-card').first()).toBeVisible();
  await expect(page.locator('.home-v2-deferred .coach-card')).toHaveCount(0);
  await expect(page.locator('.home-v2-deferred .event-card')).toHaveCount(0);
  await expect(page.getByText(/Coach profiles will appear here soon/i)).toHaveCount(0);
});

test('hero has a pause/resume control while video is enabled', async ({ page }) => {
  await page.goto('/');
  const control = page.locator('.home-v2-video-toggle');
  await expect(control).toBeVisible();
  await expect(control).toHaveAttribute('aria-label', /Pause background video/);
  await control.click();
  await expect(control).toHaveAttribute('aria-label', /Play background video/);
  await expect(page.locator('.home-v2-hero video')).toHaveJSProperty('paused', true);
});

test('reduced motion visitors get the static hero poster', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.home-v2-hero .hero-poster')).toBeVisible();
  await expect(page.locator('.home-v2-hero video')).toHaveCount(0);
  await expect(page.locator('.home-v2-video-toggle')).toHaveCount(0);
});
