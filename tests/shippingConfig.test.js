import { describe, expect, it } from 'vitest';
import {
  getLibyaFreeShippingProgress,
  resolveShipping,
  shippingConfig,
  SHIPPING_MESSAGES,
} from '../src/config/shipping';

describe('production Libya-only shipping policy', () => {
  it.each([
    [0, 'physical_paid', 20],
    [69.99, 'physical_paid', 20],
    [70, 'physical_free', 0],
    [100, 'physical_free', 0],
  ])('resolves Libya subtotal %s correctly', (subtotalUsd, status, amount) => {
    expect(resolveShipping('LY', { subtotalUsd, usdToLydRate: 9 })).toMatchObject({
      status,
      countryCode: 'LY',
      amount,
      currency: 'LYD',
    });
  });

  it('uses integer minor units at the exact rounding boundary', () => {
    expect(getLibyaFreeShippingProgress(69.994).eligible).toBe(false);
    expect(getLibyaFreeShippingProgress(69.995).eligible).toBe(true);
    expect(getLibyaFreeShippingProgress(70).remainingUsd).toBe(0);
  });

  it('treats an LYD-displayed cart by its canonical USD subtotal', () => {
    expect(resolveShipping('LY', { subtotalUsd: 70, usdToLydRate: 9 }).status).toBe(
      'physical_free',
    );
  });

  it.each([10, 100])('never applies Libya pricing to another country at %s USD', (subtotalUsd) => {
    const result = resolveShipping('US', { subtotalUsd });
    expect(result).toMatchObject({
      status: 'quote_required',
      amount: null,
      canonicalAmount: null,
      freeShippingEligible: false,
    });
  });

  it('switching countries cannot retain stale free shipping', () => {
    expect(resolveShipping('LY', { subtotalUsd: 70, usdToLydRate: 9 }).status).toBe(
      'physical_free',
    );
    expect(resolveShipping('US', { subtotalUsd: 70 }).status).toBe('quote_required');
    expect(resolveShipping('LY', { subtotalUsd: 69.99, usdToLydRate: 9 }).status).toBe(
      'physical_paid',
    );
  });

  it('keeps totals finite and non-negative for invalid subtotals', () => {
    for (const subtotalUsd of [undefined, Number.NaN, -10]) {
      const result = resolveShipping('LY', { subtotalUsd, usdToLydRate: 9 });
      expect(result.status).toBe('physical_paid');
      expect(Number.isFinite(result.canonicalAmount)).toBe(true);
      expect(result.canonicalAmount).toBeGreaterThanOrEqual(0);
    }
  });

  it('requires no shipping for digital-only carts', () => {
    expect(resolveShipping('US', { hasPhysical: false, subtotalUsd: 999 })).toEqual({
      status: 'no_physical_shipping',
      amount: 0,
      currency: null,
      canonicalAmount: 0,
      reason: 'no_physical_shipping',
    });
  });

  it('exposes one explicit policy source and bilingual Libya-only messaging', () => {
    expect(shippingConfig.freeShipping).toMatchObject({
      countryCode: 'LY',
      threshold: { amount: 70, currency: 'USD' },
      reason: 'libya_free_shipping_threshold',
    });
    expect(shippingConfig.countryRates.LY.amount).toBe(20);
    expect(SHIPPING_MESSAGES.announcement.en).toBe(
      'Free delivery in Libya on orders of $70 or more.',
    );
    expect(SHIPPING_MESSAGES.announcement.ar).toBe(
      'توصيل مجاني داخل ليبيا للطلبات بقيمة 70 دولاراً أو أكثر.',
    );
  });
});
