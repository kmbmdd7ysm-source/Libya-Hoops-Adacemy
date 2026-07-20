import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { normalizeOrder } from '../src/services/orders';

const read = (file) => fs.readFileSync(file, 'utf8');

describe('final order email, tracking currency and RTL corrections', () => {
  it('keeps canonical and display prices separately for order tracking', () => {
    const order = normalizeOrder({
      orderNumber: 'LHA-TEST',
      email: 'customer@example.com',
      currency: 'USD',
      displayCurrency: 'LYD',
      subtotal: 34,
      displaySubtotal: 306,
      shippingTotal: 20 / 9,
      displayShippingTotal: 20,
      total: 36.2222,
      displayTotal: 326,
      items: [
        {
          id: 'tee',
          name: 'Hoopers Tee',
          quantity: 1,
          unitPrice: 34,
          lineTotal: 34,
          displayUnitPrice: 306,
          displayLineTotal: 306,
        },
      ],
    });
    expect(order.subtotal).toBe(34);
    expect(order.displaySubtotal).toBe(306);
    expect(order.displayShippingTotal).toBe(20);
    expect(order.displayTotal).toBe(326);
    expect(order.items[0].displayUnitPrice).toBe(306);
  });

  it('migrates older local LYD orders using the stored shipping-rate snapshot', () => {
    const order = normalizeOrder({
      orderNumber: 'LHA-OLD',
      email: 'customer@example.com',
      currency: 'USD',
      displayCurrency: 'LYD',
      subtotal: 34,
      shippingTotal: 20 / 9,
      total: 34 + 20 / 9,
      shippingRate: { originalAmount: 20, originalCurrency: 'LYD' },
      items: [{ id: 'tee', name: 'Hoopers Tee', quantity: 1, unitPrice: 34, lineTotal: 34 }],
    });
    expect(order.displaySubtotal).toBeCloseTo(306, 2);
    expect(order.displayShippingTotal).toBeCloseTo(20, 2);
    expect(order.displayTotal).toBeCloseTo(326, 2);
    expect(order.items[0].displayUnitPrice).toBeCloseTo(306, 2);
  });

  it('does not show order success when Formspree delivery fails', () => {
    const checkout = read('src/pages/CheckoutPage.jsx');
    expect(checkout).toContain('Order email notification failed');
    expect(checkout).toContain('Press Place Order again to retry delivery');
    const failureIndex = checkout.indexOf('Order email notification failed');
    const confirmationIndex = checkout.indexOf('setOrderConfirmed(confirmedNumber)');
    expect(failureIndex).toBeGreaterThan(-1);
    expect(confirmationIndex).toBeGreaterThan(failureIndex);
  });

  it('keeps the html RTL attribute while forcing Safari viewport geometry to LTR', () => {
    const language = read('src/context/LanguageContext.jsx');
    const css = read('src/styles/global.css');
    expect(language).toContain("document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'");
    expect(css).toContain('html {\n  direction: ltr !important;');
    expect(css).toContain("#root[dir='rtl']");
  });
});
