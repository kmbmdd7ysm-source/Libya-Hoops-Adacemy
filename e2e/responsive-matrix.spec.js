import { test, expect } from '@playwright/test';
const widths = [320, 375, 390, 430, 768, 1024, 1440, 1920];
const routes = [
  '/', '/shop', '/online-training', '/programs', '/events', '/products/core-logo-tee',
  '/account', '/cart', '/checkout', '/contact', '/help', '/search?q=tee', '/order-tracking',
];
for (const width of widths) {
  for (const lang of ['en', 'ar']) {
    test(width + 'px ' + lang + ': responsive routes contain no viewport overflow', async ({ page }) => {
      test.setTimeout(150_000);
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((locale) => localStorage.setItem('lha-language', locale), lang);
      const failures = [];
      for (const path of routes) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await page.locator('main').first().waitFor({ state: 'visible' });
        const snap = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const offenders = [];
          for (const element of document.querySelectorAll('main *, .site-header *, footer *')) {
            const css = getComputedStyle(element);
            if (css.display === 'none' || css.visibility === 'hidden' || css.position === 'fixed') continue;
            const rect = element.getBoundingClientRect();
            if (!rect.height || !rect.width) continue;
            if (element.closest('.shop-category-scroll,.shop-subcategory-scroll,.mobile-filter-pills,.carousel-track,.product-carousel,.cart-drawer,.search-overlay')) continue;
            if (rect.width > vw + 6 || rect.left < -6 || rect.right > vw + 6) {
              if (offenders.length < 6) offenders.push({ cls: String(element.className).slice(0,65), left: Math.round(rect.left), right: Math.round(rect.right) });
            }
          }
          return { viewport: vw, doc: document.documentElement.scrollWidth, body: document.body.scrollWidth, offenders,
            lang: document.documentElement.lang, dir: document.documentElement.dir };
        });
        if (snap.doc > snap.viewport + 2 || snap.body > snap.viewport + 2 || snap.offenders.length || snap.dir !== (lang === 'ar' ? 'rtl' : 'ltr')) failures.push({ path, ...snap });
      }
      expect(failures, width + 'px ' + lang + ': ' + JSON.stringify(failures)).toEqual([]);
    });
  }
}
