import { describe, it, expect } from 'vitest';
import { normalizeAddress, validateAddress } from '../src/services/account/addressService';
describe('address validation', () => {
  it('sanitizes text', () =>
    expect(normalizeAddress({ label: ' <b>Home</b> ' }).label).toBe('bHome/b'));
  it('requires delivery fields', () => {
    const r = validateAddress({});
    expect(r.valid).toBe(false);
    expect(r.errors.addressLine1).toBe('required');
  });
  it('validates US ZIP', () => {
    const base = {
      firstName: 'A',
      lastName: 'B',
      addressLine1: '1 Main',
      city: 'NY',
      region: 'NY',
      country: 'US',
    };
    expect(validateAddress({ ...base, postalCode: 'abc' }).errors.postalCode).toBe('invalid');
    expect(validateAddress({ ...base, postalCode: '10001' }).valid).toBe(true);
  });
});
