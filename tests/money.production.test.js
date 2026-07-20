import { describe, expect, it } from 'vitest';
import { Money, convertPrice, formatMoney, sumMoney } from '../src/services/money';
import { validateUsdToLydRate } from '../src/services/commerceSettings';

describe('production money invariants', () => {
  it.each([
    [0, 0],
    [0.01, 0.09],
    [1.11, 9.99],
    [45, 405],
    [999999.99, 8999999.91],
  ])('converts USD %s to LYD %s without drift', (usd, lyd) => {
    expect(convertPrice(usd, 'USD', 'LYD', 9)).toBe(lyd);
  });

  it('round-trips repeatedly without cumulative drift', () => {
    let value = Money.fromMajor(19.99, 'USD');
    for (let i = 0; i < 50; i += 1) value = value.convert('LYD', 9).convert('USD', 9);
    expect(value.toMajor()).toBe(19.99);
  });

  it('calculates percentage and fixed discounts in canonical units', () => {
    const subtotal = Money.fromMajor(99.99, 'USD');
    expect(subtotal.percent(15).toMajor()).toBe(15);
    expect(subtotal.add(Money.fromMajor(-10, 'USD')).toMajor()).toBe(89.99);
  });

  it('calculates shipping and free-shipping thresholds deterministically', () => {
    const threshold = Money.fromMajor(100, 'USD');
    const subtotal = sumMoney([Money.fromMajor(39.99, 'USD'), Money.fromMajor(60.01, 'USD')]);
    expect(subtotal.minorUnits).toBe(threshold.minorUnits);
    const shipping =
      subtotal.minorUnits >= threshold.minorUnits
        ? Money.fromMajor(0, 'USD')
        : Money.fromMajor(7.5, 'USD');
    expect(shipping.toMajor()).toBe(0);
  });

  it('rejects mixed-currency arithmetic and invalid values', () => {
    expect(() => Money.fromMajor(NaN, 'USD')).toThrow();
    expect(() => Money.fromMajor(Infinity, 'USD')).toThrow();
    expect(() => Money.fromMajor(1, 'USD').add(Money.fromMajor(1, 'LYD'))).toThrow();
  });

  it('rejects invalid runtime rates instead of silently falling back', () => {
    for (const invalid of [undefined, 0, -1, NaN, Infinity, 'bad']) {
      expect(() => validateUsdToLydRate(invalid)).toThrow('invalid_exchange_rate');
    }
  });

  it('formats all supported language/currency combinations safely', () => {
    expect(formatMoney(45, 'USD', 'en')).toBe('$45.00');
    expect(formatMoney(405, 'LYD', 'en')).toContain('405.00 LYD');
    expect(formatMoney(45, 'USD', 'ar')).toContain('USD');
    expect(formatMoney(405, 'LYD', 'ar')).toContain('د.ل');
    expect(formatMoney(NaN, 'USD', 'en')).toBe('Price unavailable');
  });
});
