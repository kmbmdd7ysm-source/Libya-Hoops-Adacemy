import { test, expect } from '@playwright/test';

const routes = [
  ['shop', '/shop', '/images/categories/clothing-hero-player.webp'],
  ['programs', '/programs', '/images/programs/elite-development.webp'],
  ['training', '/online-training', '/images/training/full-body-strength.webp'],
  ['about', '/about', '/images/programs/youth-development.webp'],
  ['events', '/events', '/images/programs/camps.webp'],
  ['coaches', '/coaches', '/images/programs/guard-development.webp'],
  ['contact', '/contact', '/images/training/basketball-iq.webp'],
];

for (const locale of ['en', 'ar'])
  for (const width of [390, 1440]) {
    test(`editorial heroes and layouts ${locale} ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((lang) => localStorage.setItem('lha-language', lang), locale);
      const failures = [];
      for (const [name, href, src] of routes) {
        await page.goto(href, { waitUntil: 'domcontentloaded' });
        const hero = page.locator('.page-hero--media');
        await expect(hero).toBeVisible();
        const img = hero.locator('img');
        await expect(img).toHaveAttribute('src', src);
        await expect.poll(() => img.evaluate((el) => el.naturalWidth)).toBeGreaterThan(0);
        await expect(hero.locator('h1')).toBeVisible();
        const o = await page.evaluate(() => ({
          vw: document.documentElement.clientWidth,
          sw: document.documentElement.scrollWidth,
          dir: document.documentElement.dir,
        }));
        if (o.sw > o.vw + 2 || o.dir !== (locale === 'ar' ? 'rtl' : 'ltr'))
          failures.push({ name, ...o });
      }
      expect(failures).toEqual([]);
    });
  }

test('shop mega menu stays available by keyboard and mouse, including category links', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const reject = page.getByRole('button', { name: /reject|رفض/i });
  if (await reject.isVisible().catch(() => false)) await reject.click();
  const shop = page.locator('.desktop-nav a[href="/shop"]');
  await shop.focus();
  const mega = page.locator('#shop-mega-menu');
  await shop.press('ArrowDown');
  await expect(mega).toBeVisible();
  await expect(shop).toHaveAttribute('aria-expanded', 'true');
  await expect(mega.locator('a').first()).toBeFocused();
  await mega.locator('a[href="/shop/clothing/t-shirts"]').focus();
  await expect(mega).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(mega).toBeHidden();
});

test('no unverified events or fabricated coach profiles are promoted', async ({ page }) => {
  await page.goto('/events');
  await expect(page.getByText('NO CONFIRMED DATES YET')).toBeVisible();
  await expect(page.locator('.event-card')).toHaveCount(0);
  await page.goto('/coaches');
  await expect(page.getByText('THE WORK COMES FIRST.')).toBeVisible();
  await expect(page.locator('.coach-card')).toHaveCount(0);
  await expect(page.locator('.academy-editorial-card')).toHaveCount(3);
  await page.goto('/about');
  await expect(page.locator('.academy-about-story')).toBeVisible();
  await expect(page.locator('.prose-grid')).toHaveCount(2);
});
