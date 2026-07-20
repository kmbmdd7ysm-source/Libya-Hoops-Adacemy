import { describe, expect, it } from 'vitest';
import { safeInternalReturnPath } from '../src/utils/safeReturnPath';
describe('safeInternalReturnPath', () => {
  it.each(['/checkout', '/shop', '/products/core-logo-tee', '/order-tracking?x=1'])(
    `accepts %s`,
    (p) => expect(safeInternalReturnPath(p, '/')).toBe(p),
  );
  it.each([
    '//evil.example',
    'https://evil.example',
    '%2F%2Fevil.example',
    '/%5Cevil',
    ' /checkout ',
    '%E0%A4%A',
    '/admin-secret',
  ])(`rejects %s`, (p) => expect(safeInternalReturnPath(p, '/')).toBe('/'));
});
