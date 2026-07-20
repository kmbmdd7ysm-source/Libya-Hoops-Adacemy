import { describe, expect, it } from 'vitest';
import { commerceConfig } from '../src/config/commerce';
import { validateUsdToLydRate } from '../src/services/commerceSettings';
import { Money, convertPrice, formatMoney } from '../src/services/money';
import {
  getAddressRequirements,
  isCashEligibleCountry,
  isSupportedCountryCode,
  normalizeCountryCode,
} from '../src/data/countries';

describe('manual currency system', () => {
  it('uses USD as canonical currency and the configured 1 USD = 9 LYD rate', () => {
    expect(commerceConfig.baseCurrency).toBe('USD');
    expect(convertPrice(10, 'USD', 'LYD', 9)).toBe(90);
    expect(convertPrice(90, 'LYD', 'USD', 9)).toBe(10);
  });

  it('changes every conversion when the supplied centralized rate changes', () => {
    expect(convertPrice(10, 'USD', 'LYD', 7.5)).toBe(75);
  });

  it('does not double convert and rejects unsupported currencies', () => {
    expect(Money.fromMajor(45, 'USD').convert('USD').toMajor()).toBe(45);
    expect(() => convertPrice(10, 'USD', 'EUR')).toThrow(/Unsupported/);
  });

  it('rounds intentionally to two minor units and handles zero', () => {
    expect(convertPrice(10.005, 'USD', 'USD')).toBe(10.01);
    expect(formatMoney(0, 'LYD', 'en')).toContain('0.00');
  });

  it('rejects invalid rates without a client-side fallback', () => {
    expect(() => validateUsdToLydRate(0)).toThrow('invalid_exchange_rate');
    expect(() => validateUsdToLydRate(-1)).toThrow('invalid_exchange_rate');
    expect(() => validateUsdToLydRate(Number.POSITIVE_INFINITY)).toThrow('invalid_exchange_rate');
  });
});

describe('country and cash eligibility', () => {
  it('defaults invalid values to Libya and supports international countries', () => {
    expect(normalizeCountryCode('')).toBe('LY');
    expect(isSupportedCountryCode('US')).toBe(true);
    expect(isSupportedCountryCode('JP')).toBe(true);
  });

  it('makes cash eligibility depend only on the delivery country code', () => {
    expect(isCashEligibleCountry('LY')).toBe(true);
    expect(isCashEligibleCountry('US')).toBe(false);
    expect(isCashEligibleCountry('BAD')).toBe(false);
  });

  it('does not require a postal code for Libya but does for the United States', () => {
    expect(getAddressRequirements('LY').postalCodeRequired).toBe(false);
    expect(getAddressRequirements('US').postalCodeRequired).toBe(true);
    expect(getAddressRequirements('BAD')).toBeNull();
  });
});
