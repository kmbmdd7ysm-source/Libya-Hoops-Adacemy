import { describe, expect, it } from 'vitest';
import { SITE } from '../src/config';
import { footerContacts } from '../src/data/footerSocial';

describe('official contact configuration', () => {
  it('contains the exact official destinations', () => {
    expect(SITE.email).toBe('Libyahoopsacademy@gmail.com');
    expect(SITE.emailLink).toBe('mailto:Libyahoopsacademy@gmail.com');
    expect(SITE.social).toMatchObject({
      instagram: 'https://www.instagram.com/libyahoopsacademy',
      facebook: 'https://www.facebook.com/share/19EM6Pz1n3/?mibextid=wwXIfr',
      tiktok: 'https://www.tiktok.com/@libyahoopsacademy?_r=1&_t=ZS-987u4toLwAR',
    });
  });

  it('drives all four existing footer contact destinations from SITE', () => {
    expect(footerContacts.map(({ id, href }) => [id, href])).toEqual([
      ['instagram', SITE.social.instagram],
      ['facebook', SITE.social.facebook],
      ['tiktok', SITE.social.tiktok],
      ['email', SITE.emailLink],
    ]);
  });

  it('does not invent optional business information', () => {
    expect(SITE.phone).toBe('');
    expect(SITE.whatsapp).toBe('');
    expect(SITE.address).toEqual({ en: '', ar: '' });
    expect(SITE.hours).toEqual({ en: '', ar: '' });
  });
});
