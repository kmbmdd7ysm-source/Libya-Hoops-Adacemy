import { test, expect } from '@playwright/test';

const pages = [
  '/', '/shop', '/shop/clothing', '/shop/accessories', '/programs',
  '/online-training', '/events', '/coaches', '/about', '/contact',
  '/help', '/faq', '/account', '/cart', '/checkout',
  '/order-tracking', '/favorites', '/compare', '/shipping-returns',
  '/refund-policy', '/privacy-policy', '/terms-of-service',
];

for (const width of [320, 390, 768, 1440]) {
  for (const locale of ['en', 'ar']) {
    test(`premium system: ${width}px ${locale}, core routes, photo and header integrity`, async ({ page }) => {
      test.setTimeout(160000);
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(lang => localStorage.setItem('lha-language', lang), locale);
      const broken = [];
      for (const url of pages) {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('main')).toBeVisible();
        const state = await page.evaluate(() => ({
          vw: document.documentElement.clientWidth,
          sw: document.documentElement.scrollWidth,
          dir: document.documentElement.dir,
          header: Boolean(document.querySelector('.site-header')),
          h1: [...document.querySelectorAll('main h1')].filter(el => getComputedStyle(el).display !== 'none').length,
          activeStyles: [...document.styleSheets].some(sheet => String(sheet.href || '').includes('final-editorial-system')),
        }));
        if (state.sw > state.vw + 2 || !state.header ||
            state.dir !== (locale === 'ar' ? 'rtl' : 'ltr') ||
            !state.activeStyles || state.h1 < 1) {
          broken.push({ url, ...state });
        }
      }
      expect(broken).toEqual([]);
    });
  }
}

test('new split cinema hero has loaded actual image and clear clothing/training routes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.hero.home-v2-hero')).toBeVisible();
  const media = page.locator('.home-v2-hero .hero-poster');
  await expect.poll(() => media.evaluate(e => e.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.home-v2-hero a[href="/programs"]')).toBeVisible();
  await expect(page.locator('.home-v2-hero a[href="/shop/clothing"]')).toBeVisible();
  const geometry = await page.evaluate(() => {
    const hero = document.querySelector('.home-v2-hero').getBoundingClientRect();
    const pane = document.querySelector('.home-v2-hero .hero-media').getBoundingClientRect();
    return { ratio: pane.width / hero.width, image: Boolean(document.querySelector('.home-v2-hero .hero-poster')) };
  });
  expect(geometry.ratio).toBeGreaterThan(.5);
  expect(geometry.ratio).toBeLessThan(.7);
  const cards = page.locator('.home-v2-path');
  await expect(cards).toHaveCount(3);
  await expect(page.locator('.home-v2-gear-tile')).toHaveCount(2);
  for (const tile of await page.locator('.home-v2-gear-tile img').all()) {
    await expect.poll(() => tile.evaluate(e => e.naturalWidth)).toBeGreaterThan(0);
  }
});

test('hero media is still readable, usable, and not horizontally clipped on a narrow phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 860 });
  await page.goto('/');
  await expect(page.locator('.home-v2-hero')).toBeVisible();
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    const headline = document.querySelector('.home-v2-hero .hero-title').getBoundingClientRect();
    return { pageWidth: root.scrollWidth, viewport: root.clientWidth, headlineLeft: headline.left, headlineRight: headline.right };
  });
  expect(overflow.pageWidth).toBeLessThanOrEqual(overflow.viewport + 2);
  expect(overflow.headlineLeft).toBeGreaterThanOrEqual(-2);
  expect(overflow.headlineRight).toBeLessThanOrEqual(overflow.viewport + 2);
  await expect(page.locator('.home-v2-hero a[href="/programs"]')).toBeVisible();
  await expect(page.locator('.home-v2-hero a[href="/shop/clothing"]')).toBeVisible();
});
