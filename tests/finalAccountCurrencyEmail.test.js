import { describe, expect, it } from 'vitest';
import { normalizeOrder } from '../src/services/orders';
import { convertPrice } from '../src/services/money';

describe('final account, currency, and order delivery corrections', () => {
  it('converts USD prices to LYD using the trusted/fallback rate', () => {
    expect(convertPrice(34, 'USD', 'LYD', 9)).toBe(306);
  });

  it('repairs legacy orders that only changed the currency label to LYD', () => {
    const order = normalizeOrder({
      currency: 'USD',
      displayCurrency: 'LYD',
      subtotal: 34,
      displaySubtotal: 34,
      shippingTotal: 2.22,
      displayShippingTotal: 2.22,
      total: 36.22,
      displayTotal: 36.22,
      shippingRate: { originalAmount: 20 },
      items: [
        {
          name: 'Hoopers Tee',
          quantity: 1,
          unitPrice: 34,
          lineTotal: 34,
          displayUnitPrice: 34,
          displayLineTotal: 34,
        },
      ],
    });
    expect(order.displaySubtotal).toBeCloseTo(306.31, 1);
    expect(order.displayShippingTotal).toBeCloseTo(20, 2);
    expect(order.displayTotal).toBeCloseTo(326.31, 1);
    expect(order.items[0].displayUnitPrice).toBeCloseTo(306.31, 1);
  });

  it('keeps already converted order snapshots unchanged', () => {
    const order = normalizeOrder({
      currency: 'USD',
      displayCurrency: 'LYD',
      subtotal: 34,
      displaySubtotal: 306,
      shippingTotal: 2.22,
      displayShippingTotal: 20,
      total: 36.22,
      displayTotal: 326,
      shippingRate: { originalAmount: 20 },
      items: [],
    });
    expect(order.displaySubtotal).toBe(306);
    expect(order.displayTotal).toBe(326);
  });
});
