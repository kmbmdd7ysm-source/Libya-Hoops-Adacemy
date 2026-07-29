import { describe, expect, it } from 'vitest';
import { validateAddress } from '../src/services/account/addressService';
import { FORMSPREE_ENDPOINT } from '../src/services/formspree';
describe('account reliability', () => {
  it('accepts a valid US delivery address', () => {
    expect(validateAddress({firstName:'Digo',lastName:'Etorki',addressLine1:'531 E 5th St',city:'New York',region:'NY',postalCode:'10009',country:'US'}).valid).toBe(true);
  });
  it('uses the production order notification endpoint', () => {
    expect(FORMSPREE_ENDPOINT).toContain('mqerbqvd');
  });
});
