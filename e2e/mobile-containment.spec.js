import { test, expect } from '@playwright/test';

const widths = [320, 340, 360, 375, 390, 393, 414, 430, 768, 1024, 1280, 1440];
const routes = [
  '/',
  '/shop',
  '/shop/clothing',
  '/shop/accessories',
  '/products/core-logo-tee',
  '/products/academy-backpack',
  '/online-training/complete-ball-handling',
  '/cart',
  '/favorites',
  '/compare',
  '/search?q=tee',
  '/account',
  '/help',
  '/contact',
  '/orders',
  '/not-a-real-route',
];

async function dismissCookie(page) {
  const button = page.getByRole('button', { name: /reject|رفض/i });
  if (await button.isVisible().catch(() => false)) await button.click();
}

async function overflowSnapshot(page) {
  return page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll('body *')]
      .filter((element) => {
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        if (element.closest('[hidden]')) return false;
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return false;
        const scrollport = element.closest(
          '.shop-category-scroll,.shop-subcategory-scroll,.mobile-filter-pills',
        );
        if (scrollport && scrollport !== element) return false;
        return rect.left < -1 || rect.right > viewportWidth + 1;
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName,
          id: element.id,
          className: String(element.className || ''),
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
        };
      });
    return {
      viewportWidth,
      htmlScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      offenders,
    };
  });
}

for (const width of widths) {
  for (const direction of ['en', 'ar']) {
    test.describe(`${direction} ${width}px containment`, () => {
      for (const route of routes) {
        test(`${route} stays in one viewport`, async ({ page }) => {
          await page.setViewportSize({ width, height: 844 });
          await page.addInitScript((language) => {
            localStorage.setItem('lha-language', language);
          }, direction);
          await page.goto(route);
          await dismissCookie(page);
          await page.evaluate(() => document.fonts?.ready);
          const result = await overflowSnapshot(page);
          expect(result.htmlScrollWidth, JSON.stringify(result, null, 2)).toBeLessThanOrEqual(
            result.viewportWidth + 1,
          );
          expect(result.bodyScrollWidth, JSON.stringify(result, null, 2)).toBeLessThanOrEqual(
            result.viewportWidth + 1,
          );
          expect(result.offenders, JSON.stringify(result, null, 2)).toEqual([]);
        });
      }
    });
  }
}

test('mobile header geometry is edge aligned and non-overlapping in both directions', async ({
  page,
}) => {
  for (const language of ['en', 'ar']) {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.addInitScript((value) => localStorage.setItem('lha-language', value), language);
    await page.goto('/');
    await dismissCookie(page);
    const geometry = await page.evaluate(() => {
      const rect = (selector) => document.querySelector(selector).getBoundingClientRect();
      const brand = rect('.header-inner > .brand');
      const actions = rect('.header-actions');
      const header = rect('.header-inner');
      return { brand, actions, header, dir: document.documentElement.dir };
    });
    expect(geometry.brand.width).toBeGreaterThan(0);
    expect(geometry.actions.width).toBeGreaterThan(0);
    expect(
      geometry.brand.right <= geometry.actions.left + 1 ||
        geometry.actions.right <= geometry.brand.left + 1,
    ).toBe(true);
    if (language === 'en') {
      expect(geometry.brand.left - geometry.header.left).toBeLessThanOrEqual(12);
      expect(geometry.header.right - geometry.actions.right).toBeLessThanOrEqual(12);
    } else {
      expect(geometry.header.right - geometry.brand.right).toBeLessThanOrEqual(12);
      expect(geometry.actions.left - geometry.header.left).toBeLessThanOrEqual(12);
    }
  }
});

test('contact page has no horizontal overflow at critical mobile widths in both languages', async ({
  page,
}) => {
  for (const width of [320, 360, 390, 430]) {
    for (const language of ['en', 'ar']) {
      await page.setViewportSize({ width, height: 844 });
      await page.addInitScript((value) => localStorage.setItem('lha-language', value), language);
      await page.goto('/contact');
      await dismissCookie(page);
      const result = await overflowSnapshot(page);
      expect(result.htmlScrollWidth, JSON.stringify(result, null, 2)).toBeLessThanOrEqual(
        width + 1,
      );
      expect(result.bodyScrollWidth, JSON.stringify(result, null, 2)).toBeLessThanOrEqual(
        width + 1,
      );
      expect(result.offenders, JSON.stringify(result, null, 2)).toEqual([]);
    }
  }
});

test('document remains horizontally anchored through route, language and overlay transitions', async ({
  page,
}) => {
  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/shop');
    await dismissCookie(page);

    const assertAnchored = async (stage) => {
      const state = await page.evaluate(() => ({
        windowX: window.scrollX,
        htmlX: document.documentElement.scrollLeft,
        bodyX: document.body.scrollLeft,
        htmlWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(state.windowX, `${stage}: ${JSON.stringify(state)}`).toBe(0);
      expect(state.htmlX, `${stage}: ${JSON.stringify(state)}`).toBe(0);
      expect(state.bodyX, `${stage}: ${JSON.stringify(state)}`).toBe(0);
      expect(state.htmlWidth, `${stage}: ${JSON.stringify(state)}`).toBeLessThanOrEqual(
        state.clientWidth + 1,
      );
    };

    await assertAnchored('initial');
    await page.locator('.mobile-filter-pills button').first().click();
    await expect(page.locator('.filters-drawer-panel')).toBeVisible();
    await assertAnchored('filter open');
    await page.keyboard.press('Escape');
    await assertAnchored('filter closed');

    await page.locator('.mobile-more-action').click();
    await expect(page.locator('#mobile-menu')).toHaveClass(/open/);
    await assertAnchored('menu open');
    await page.getByRole('button', { name: /close menu|إغلاق القائمة/i }).click();

    await page.goto('/account');
    await assertAnchored('route change');
    await page.evaluate(() => {
      document.documentElement.scrollLeft = 50;
      document.body.scrollLeft = 50;
      window.dispatchEvent(new Event('orientationchange'));
    });
    await page.waitForTimeout(50);
    await assertAnchored('orientation recovery');
  }
});
