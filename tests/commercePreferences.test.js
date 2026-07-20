import { beforeEach, describe, expect, it } from 'vitest';
import {
  readCountryPreference,
  readCurrencyPreference,
  writeCountryPreference,
  writeCurrencyPreference,
} from '../src/services/commercePreferences';

describe('scoped commerce preferences', () => {
  beforeEach(() => localStorage.clear());

  it('keeps guest and account currency isolated', () => {
    writeCurrencyPreference(null, 'LYD');
    writeCurrencyPreference('account-a', 'USD');
    expect(readCurrencyPreference(null)).toBe('LYD');
    expect(readCurrencyPreference('account-a')).toBe('USD');
    expect(readCurrencyPreference('account-b')).toBe('USD');
  });

  it('recovers from unsupported currency values', () => {
    localStorage.setItem('lha-display-currency:guest', JSON.stringify('EUR'));
    expect(readCurrencyPreference(null)).toBe('USD');
  });

  it('keeps country preferences scoped and validates invalid values', () => {
    writeCountryPreference(null, 'US');
    writeCountryPreference('account-a', 'JP');
    expect(readCountryPreference(null)).toBe('US');
    expect(readCountryPreference('account-a')).toBe('JP');
    writeCountryPreference('account-a', 'BAD');
    expect(readCountryPreference('account-a')).toBe('LY');
  });
});

import {
  clearPendingCommercePreference,
  readPendingCommercePreference,
  resolveCountryPreference,
  writePendingCommercePreference,
} from '../src/services/commercePreferences';

describe('commerce preference synchronization helpers', () => {
  it('scopes pending cloud preference writes per authenticated user', () => {
    writePendingCommercePreference('account-a', {
      preferredCurrency: 'LYD',
      preferredCountry: 'US',
    });
    writePendingCommercePreference('account-b', {
      preferredCurrency: 'USD',
      preferredCountry: 'JP',
    });
    expect(readPendingCommercePreference('account-a')).toMatchObject({
      preferredCurrency: 'LYD',
      preferredCountry: 'US',
    });
    expect(readPendingCommercePreference('account-b')).toMatchObject({
      preferredCurrency: 'USD',
      preferredCountry: 'JP',
    });
    clearPendingCommercePreference('account-a');
    expect(readPendingCommercePreference('account-a')).toBeNull();
    expect(readPendingCommercePreference('account-b')).not.toBeNull();
  });

  it('resolves country priority without allowing stale profile values to override active choices', () => {
    expect(
      resolveCountryPreference({
        sessionCountry: 'GB',
        selectedAddressCountry: 'US',
        defaultAddressCountry: 'CA',
        profileCountry: 'LY',
      }),
    ).toBe('GB');
    expect(
      resolveCountryPreference({
        selectedAddressCountry: 'US',
        defaultAddressCountry: 'CA',
        profileCountry: 'LY',
      }),
    ).toBe('US');
    expect(resolveCountryPreference({ defaultAddressCountry: 'CA', profileCountry: 'US' })).toBe(
      'CA',
    );
    expect(resolveCountryPreference({ profileCountry: 'JP' })).toBe('JP');
    expect(resolveCountryPreference({ profileCountry: 'BAD' })).toBe('LY');
  });
});
