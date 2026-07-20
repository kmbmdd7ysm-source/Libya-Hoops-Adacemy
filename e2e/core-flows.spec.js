import { test, expect } from '@playwright/test';

async function dismissCookie(page) {
  const reject = page.getByRole('button', { name: /reject|رفض/i });
  if (await reject.isVisible().catch(() => false)) await reject.click();
}

async function chooseCurrency(page, currency) {
  const selectors = page.locator('select[aria-label*="currency" i], select[aria-label*="عملة" i]');
  await expect(selectors.first()).toBeVisible();
  await selectors.first().selectOption(currency);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');
  await dismissCookie(page);
});

test('homepage, currency persistence, RTL, deep links and 404', async ({ page }) => {
  await expect(page.getByText('OWN THE GAME.')).toBeVisible();
  await chooseCurrency(page, 'LYD');
  await expect(page.locator('body')).toContainText('LYD');
  await page.reload();
  await dismissCookie(page);
  await expect(
    page
      .locator('select')
      .filter({ has: page.locator('option[value="LYD"]') })
      .first(),
  ).toHaveValue('LYD');

  const languageButton = page
    .getByRole('button', { name: /العربية|Arabic|English|الإنجليزية/i })
    .first();
  if (await languageButton.isVisible().catch(() => false)) await languageButton.click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  await page.goto('/products/core-logo-tee');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goto('/definitely-not-a-real-route');
  await expect(page.locator('main')).toBeVisible();
});

test('shop, wishlist, comparison, cart and checkout country/cash flows', async ({ page }) => {
  await page.goto('/shop');
  await dismissCookie(page);
  const card = page.locator('.product-card').first();
  await expect(card).toBeVisible();
  await card.locator('.wishlist-btn').click();
  await expect(card.locator('.wishlist-btn')).toHaveAttribute('aria-pressed', 'true');
  await card.locator('.compare-btn').click();
  await expect(card.locator('.compare-btn')).toHaveAttribute('aria-pressed', 'true');
  await card.locator('.quick-add').click();
  const drawer = page.locator('.cart-drawer');
  if (await drawer.isVisible().catch(() => false)) {
    const close = drawer.getByRole('button', { name: /close|إغلاق/i });
    if (await close.isVisible().catch(() => false)) await close.click();
  }
  await page.goto('/cart');
  await expect(page.locator('main')).toContainText(/Core Logo Tee|تيشيرت الشعار الأساسي/i);
  await page.goto('/checkout');
  await expect(
    page.locator('input[name="country"], button[aria-haspopup="listbox"]').first(),
  ).toBeVisible();

  const countryTrigger = page.locator('button[aria-haspopup="listbox"]').first();
  await countryTrigger.click();
  const search = page.locator('[role="combobox"]').first();
  await search.fill('United States');
  await page.getByRole('option', { name: /United States/i }).click();
  await expect(page.locator('body')).toContainText(
    /Cash payment is available only|الدفع النقدي متاح فقط/i,
  );
  const cash = page.getByRole('radio', { name: /Cash|نقد/i });
  if (await cash.count()) await expect(cash).not.toBeChecked();

  await countryTrigger.click();
  await search.fill('Libya');
  await page.getByRole('option', { name: /Libya|ليبيا/i }).click();
  if (await cash.count()) await expect(cash).toBeChecked();
});

test('favorite state is immediate, persistent and reversible', async ({ page }) => {
  await page.goto('/shop');
  await dismissCookie(page);
  const card = page.locator('.product-card').first();
  const button = card.locator('.wishlist-btn');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(button).toHaveClass(/active/);
  await expect(button.locator('svg')).toHaveCSS('fill', 'rgb(17, 17, 17)');
  await page.reload();
  await dismissCookie(page);
  const persisted = page.locator('.product-card').first().locator('.wishlist-btn');
  await expect(persisted).toHaveAttribute('aria-pressed', 'true');
  await persisted.click();
  await expect(persisted).toHaveAttribute('aria-pressed', 'false');
});

test('physical product keeps its variant through cart drawer checkout', async ({ page }) => {
  await page.goto('/products/hoopers-long-sleeve');
  await dismissCookie(page);
  const availableSize = page.locator('.size-pill:not(:disabled)').first();
  if (await availableSize.count()) await availableSize.click();
  const availableColor = page
    .locator('.color-swatch:not(:disabled), .color-pill:not(:disabled)')
    .first();
  if (await availableColor.count()) await availableColor.click();
  await page.locator('.purchase-primary').click();
  const drawer = page.locator('.cart-drawer');
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('.cart-line')).toHaveCount(1);
  const sizeText = await drawer.locator('.cart-line-variant').first().textContent();
  await drawer.getByRole('button', { name: /checkout|الدفع|إتمام الشراء/i }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.locator('main')).toBeVisible();
  if (sizeText) await expect(page.locator('main')).toContainText(sizeText.split(':').pop().trim());
  await expect(
    page.locator('input[name="country"], button[aria-haspopup="listbox"]').first(),
  ).toBeVisible();
});

test('search, comparison, recently viewed and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/search?q=tee');
  await dismissCookie(page);
  await expect(page.locator('main')).toContainText(/tee|تيشيرت/i);
  await page.goto('/products/core-logo-tee');
  await page.goto('/products/practice-training-tee');
  await page.goto('/compare');
  await expect(page.locator('main')).toBeVisible();
});

test.describe('final mobile hardening', () => {
  for (const width of [320, 390]) {
    test(`mobile header, search history and footer at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      await dismissCookie(page);
      await expect(page.locator('.mobile-more-action')).toHaveCount(1);
      await expect(page.locator('.mobile-account-action')).toBeVisible();
      await expect(page.locator('.cart-btn')).toBeVisible();
      await page.locator('.mobile-more-action').click();
      await expect(page.locator('#mobile-menu')).toHaveClass(/open/);
      await expect(
        page.locator('#mobile-menu .mobile-quick-actions a[href="/account"]'),
      ).toHaveCount(1);
      await page.getByRole('button', { name: /close menu|إغلاق القائمة/i }).click();

      const searchTrigger = page.getByRole('button', { name: /open search|فتح البحث/i });
      await searchTrigger.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      const input = dialog.getByRole('combobox');
      await expect(input).toBeFocused();
      await input.fill('hoopers');
      await expect(dialog.getByText(/Top Suggestions|أفضل الاقتراحات/i)).toBeVisible();
      await page.goBack();
      await expect(dialog).toBeHidden();
      await expect(page).toHaveURL(/\/$/);

      await page.locator('footer').scrollIntoViewIfNeeded();
      await expect(page.locator('footer .footer-brand-wordmark')).toHaveCount(1);
      await expect(page.locator('footer .footer-brand-mark')).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
    });
  }

  test('help search and accordion use translated explicit links', async ({ page }) => {
    await page.goto('/help');
    await dismissCookie(page);
    const search = page.locator('#help-search-input');
    await search.fill('refund');
    await expect(page.getByRole('button', { name: /Returns & Exchanges/i })).toBeVisible();
    await page.getByRole('button', { name: /Returns & Exchanges/i }).click();
    await expect(page.getByRole('link', { name: 'Refund Policy' })).toHaveAttribute(
      'href',
      '/refund-policy',
    );
  });

  test('guest order detail requires email verification', async ({ page }) => {
    await page.goto('/order-tracking/LHA-NOT-VERIFIED');
    await dismissCookie(page);
    await expect(page.getByRole('heading', { name: /Order Details|تفاصيل الطلب/i })).toBeVisible();
    await expect(page.getByLabel(/Order email|بريد الطلب/i)).toBeVisible();
  });
});

test('footer contact icons stay visible and accessible at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/');
  await dismissCookie(page);
  const footer = page.locator('footer');
  await footer.scrollIntoViewIfNeeded();
  const links = footer.locator('.footer-social a');
  await expect(links).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    await expect(links.nth(index)).toBeVisible();
    const box = await links.nth(index).boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(40);
    expect(box.height).toBeGreaterThanOrEqual(40);
  }
  await expect(
    footer.getByRole('link', { name: 'Follow Libya Hoops Academy on Instagram' }),
  ).toHaveAttribute('target', '_blank');
  await expect(
    footer.getByRole('link', { name: 'Follow Libya Hoops Academy on Instagram' }),
  ).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(footer.getByRole('link', { name: 'Email Libya Hoops Academy' })).toHaveAttribute(
    'href',
    'mailto:Libyahoopsacademy@gmail.com',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test.describe('mandatory production mobile flows', () => {
  for (const width of [320, 375, 390, 414]) {
    test(`header targets, integrated menu and search surface at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      await dismissCookie(page);
      for (const target of ['.header-actions .icon-btn']) {
        const buttons = page.locator(target);
        for (let index = 0; index < (await buttons.count()); index += 1) {
          const box = await buttons.nth(index).boundingBox();
          expect(box?.width).toBeGreaterThanOrEqual(44);
          expect(box?.height).toBeGreaterThanOrEqual(44);
        }
      }
      await page.locator('.mobile-more-action').click();
      await expect(page.locator('.mobile-menu-integrated-account')).toBeVisible();
      await expect(page.locator('.mobile-account-panel')).toHaveCount(0);
      await expect(page.locator('.mobile-menu-foot')).toBeVisible();
      await page.getByRole('button', { name: /close menu|إغلاق القائمة/i }).click();

      await page.getByRole('button', { name: /open search|فتح البحث/i }).click();
      const overlay = page.locator('.search-overlay');
      await expect(overlay).toBeVisible();
      await expect(overlay).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
      const input = overlay.getByRole('combobox');
      await input.fill('tee');
      await expect(overlay.locator('mark').first()).toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0)',
      );
      await expect(overlay).not.toContainText(/CategoryProduct|ProductCategory|topsCategory/i);
      await page.keyboard.press('Escape');
      await expect(overlay).toBeHidden();
    });
  }

  test('shop filter hierarchy, URL sync and sorting', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/shop');
    await dismissCookie(page);
    await expect(page.locator('.shop-category-scroll')).toBeVisible();
    await expect(page.locator('.mobile-filter-pills')).toBeVisible();
    await page.locator('.mobile-filter-pills button').first().click();
    await expect(page.locator('.filter-group-list')).toBeVisible();
    await page.getByRole('button', { name: /Size|المقاس/i }).click();
    await page.locator('.sheet-option-grid button').first().click();
    await expect(page).toHaveURL(/size=/);
    await page.getByRole('button', { name: /Back|رجوع/i }).click();
    await page.getByRole('button', { name: /Color|اللون/i }).click();
    await page.locator('.sheet-color-list button').first().click();
    await expect(page).toHaveURL(/color=/);
    await page.getByRole('button', { name: /Back|رجوع/i }).click();
    await page.getByRole('button', { name: /Price Range|نطاق السعر/i }).click();
    await page.locator('.sheet-radio-list button').nth(1).click();
    await expect(page).toHaveURL(/min=0/);
    await expect(page).toHaveURL(/max=25/);
    await page.getByRole('button', { name: /Back|رجوع/i }).click();
    await page.getByRole('button', { name: /Availability|التوفر/i }).click();
    await page.locator('.sheet-toggle-list input[type="checkbox"]').first().check();
    await expect(page).toHaveURL(/instock=1/);
    await expect(page.locator('.filters-drawer')).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    await page.getByRole('button', { name: /close|إغلاق/i }).click();
    await expect(page.locator('.filters-drawer')).toBeHidden();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    await page.getByRole('button', { name: /Sort By|ترتيب/i }).click();
    await page.getByRole('radio', { name: /Low to High|من الأقل/i }).click();
    await expect(page).toHaveURL(/sort=price-asc/);
  });

  test('product purchase controls and Arabic rendering', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/products/hoopers-long-sleeve');
    await dismissCookie(page);
    const sizes = page.locator('.size-pill');
    await expect(sizes.first()).toBeVisible();
    const available = sizes.filter({ hasNot: page.locator(':disabled') }).first();
    if (await available.count()) await available.click();
    await expect(page.locator('.purchase-primary')).toHaveCSS('width', /\d+px/);
    const addBox = await page.locator('.purchase-primary').boundingBox();
    const infoBox = await page.locator('.product-info').boundingBox();
    expect(addBox.width).toBeGreaterThan(infoBox.width * 0.9);
    await expect(page.locator('.favorite-product')).toHaveAttribute('aria-pressed');
    await expect(page.locator('.compare-product')).toBeVisible();

    await page.goto('/');
    const lang = page.getByRole('button', { name: /العربية/i }).first();
    if (await lang.isVisible().catch(() => false)) await lang.click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const hero = page.locator('.hero-title').first();
    if (await hero.count()) {
      const box = await hero.boundingBox();
      expect(box.width).toBeLessThanOrEqual(390);
    }
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('footer .footer-brand')).toHaveCSS('direction', 'ltr');
  });
});
