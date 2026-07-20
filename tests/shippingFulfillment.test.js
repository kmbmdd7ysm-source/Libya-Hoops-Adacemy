import { describe, expect, it } from 'vitest';
import { resolveShipping, SHIPPING_MESSAGES } from '../src/config/shipping';
import { cartRequiresPhysicalShipping, requiresPhysicalShipping } from '../src/utils/fulfillment';

const physical = { type: 'product' };
const digital = { type: 'training' };

describe('digital, physical and mixed fulfillment shipping', () => {
  it.each(['LY', 'US', 'ZZ'])(
    'digital-only is free worldwide without a quote for %s',
    (country) => {
      expect(resolveShipping(country, { hasPhysical: false, subtotalUsd: 10 })).toMatchObject({
        status: 'no_physical_shipping',
        amount: 0,
        canonicalAmount: 0,
        reason: 'no_physical_shipping',
      });
    },
  );
  it('multiple digital items remain non-physical above and below the threshold', () => {
    expect(cartRequiresPhysicalShipping([digital, digital])).toBe(false);
    expect(resolveShipping('LY', { hasPhysical: false, subtotalUsd: 100 }).status).toBe(
      'no_physical_shipping',
    );
  });
  it('classifies physical and digital items centrally', () => {
    expect(requiresPhysicalShipping(physical)).toBe(true);
    expect(requiresPhysicalShipping(digital)).toBe(false);
  });
  it('preserves Libya physical threshold', () => {
    expect(
      resolveShipping('LY', { hasPhysical: true, subtotalUsd: 69.99, usdToLydRate: 9 }),
    ).toMatchObject({
      status: 'physical_paid',
      amount: 20,
    });
    expect(resolveShipping('LY', { hasPhysical: true, subtotalUsd: 70 })).toMatchObject({
      status: 'physical_free',
      amount: 0,
    });
  });
  it('uses the complete mixed merchandise subtotal', () => {
    expect(
      resolveShipping('LY', {
        hasPhysical: cartRequiresPhysicalShipping([physical, digital]),
        subtotalUsd: 75,
        usdToLydRate: 9,
      }).status,
    ).toBe('physical_free');
    expect(
      resolveShipping('LY', { hasPhysical: true, subtotalUsd: 50, usdToLydRate: 9 }).status,
    ).toBe('physical_paid');
  });
  it('never applies Libya promotion internationally', () => {
    expect(resolveShipping('US', { hasPhysical: true, subtotalUsd: 100 }).status).toBe(
      'quote_required',
    );
  });
  it('switches immediately when the last physical item is removed or added', () => {
    expect(
      resolveShipping('US', {
        hasPhysical: cartRequiresPhysicalShipping([physical, digital]),
        subtotalUsd: 75,
        usdToLydRate: 9,
      }).status,
    ).toBe('quote_required');
    expect(
      resolveShipping('US', {
        hasPhysical: cartRequiresPhysicalShipping([digital]),
        subtotalUsd: 45,
      }).status,
    ).toBe('no_physical_shipping');
  });
  it('contains English and Arabic digital delivery messaging', () => {
    expect(SHIPPING_MESSAGES.digitalDelivery.en).toBe('Digital delivery by email');
    expect(SHIPPING_MESSAGES.digitalDelivery.ar).toBe('توصيل رقمي عبر البريد الإلكتروني');
  });
});
