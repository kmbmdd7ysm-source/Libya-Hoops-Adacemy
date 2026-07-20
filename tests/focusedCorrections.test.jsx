import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LanguageProvider, useLanguage } from '../src/context/LanguageContext';
import { BRAND, brandAsset } from '../src/config/brand';
import { SITE } from '../src/config';
import { getCompareAction } from '../src/utils/productOptions';
import { validateProfileImage } from '../src/utils/profileImage';
import Avatar, { getInitials } from '../src/components/common/Avatar';

function LanguageProbe() {
  const { lang, dir, setLang, pick } = useLanguage();
  return (
    <div>
      <output data-testid="state">{`${lang}:${dir}:${pick({ en: 'English', ar: 'العربية' })}`}</output>
      <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>switch</button>
    </div>
  );
}

describe('focused production corrections', () => {
  it('switches repeatedly without losing the final language or direction', () => {
    localStorage.setItem('lha-language', 'en');
    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>,
    );
    const button = screen.getByRole('button', { name: 'switch' });
    for (let index = 0; index < 10; index += 1) fireEvent.click(button);
    expect(screen.getByTestId('state')).toHaveTextContent('en:ltr:English');
    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
  });

  it('updates html lang and dir in Arabic', () => {
    localStorage.setItem('lha-language', 'en');
    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'switch' }));
    expect(document.documentElement).toHaveAttribute('lang', 'ar');
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByTestId('state')).toHaveTextContent('ar:rtl:العربية');
  });

  it('maps real black and white wordmarks to different transparent assets', () => {
    expect(BRAND.assets.horizontal.black).toBe('/brand/lha-wordmark-black.svg');
    expect(BRAND.assets.horizontal.white).toBe('/brand/lha-wordmark-white.svg');
    expect(brandAsset('horizontal', 'black')).not.toBe(brandAsset('horizontal', 'white'));
  });

  it('uses the corrected mark for light and dark surfaces', () => {
    expect(SITE.logo).toBe('/brand/lha-mark-black.png');
    expect(SITE.logoLight).toBe('/brand/lha-mark-white.png');
    expect(existsSync('public/brand/lha-mark-black.png')).toBe(true);
    expect(existsSync('public/brand/lha-mark-white.png')).toBe(true);
  });

  it('removes obsolete visible logo files and references', () => {
    expect(existsSync('public/brand/logo-mark-black.svg')).toBe(false);
    expect(existsSync('public/brand/logo-mark-white.svg')).toBe(false);
    const source = [
      readFileSync('src/pages/OfflinePage.jsx', 'utf8'),
      readFileSync('public/sw.js', 'utf8'),
      readFileSync('src/config.js', 'utf8'),
    ].join('\n');
    expect(source).not.toMatch(/logo-mark-(black|white)\.svg|lha-wordmark\.svg/);
  });

  it('uses the corrected white logo on the offline page', () => {
    const source = readFileSync('src/pages/OfflinePage.jsx', 'utf8');
    expect(source).toContain('/brand/lha-mark-white.png');
  });

  it('uses corrected logo assets in the service-worker cache', () => {
    const source = readFileSync('public/sw.js', 'utf8');
    expect(source).toContain('/brand/lha-mark-black.png');
    expect(source).toContain('/brand/lha-mark-white.png');
  });

  it('has no conflicting global body overflow-x declaration', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).not.toMatch(/body\s*\{[^}]*overflow-x\s*:/s);
  });

  it('contains complete localized Create Account labels and photo cleanup', () => {
    const source = readFileSync('src/pages/AccountPage.jsx', 'utf8');
    expect(source).toContain("en: 'Create Account'");
    expect(source).toContain("ar: 'إنشاء الحساب'");
    expect(source).toContain("en: 'Please wait…'");
    expect(source).toContain('URL.revokeObjectURL');
    expect(readFileSync('src/utils/profileImage.js', 'utf8')).toContain(
      "'image/jpeg', 'image/png', 'image/webp'",
    );
  });

  it('does not consume a nonexistent language property from LanguageContext', () => {
    const account = readFileSync('src/pages/AccountPage.jsx', 'utf8');
    expect(account).not.toMatch(/\{\s*pick,\s*language\s*\}\s*=\s*useLanguage/);
    expect(account).toContain('const { pick, lang } = useLanguage()');
  });
  it('does not silently select required product options', () => {
    const product = {
      variants: [
        { size: 'S', color: 'black', stock: 2 },
        { size: 'M', color: 'black', stock: 2 },
      ],
    };
    expect(getCompareAction(product)).toEqual({ type: 'choose-options', variant: null });
  });

  it('allows a decision-free variant and blocks unavailable stock', () => {
    const variant = { size: 'One Size', color: 'black', stock: 2 };
    expect(getCompareAction({ variants: [variant] })).toEqual({ type: 'add', variant });
    expect(getCompareAction({ variants: [{ ...variant, stock: 0 }] }).type).toBe('unavailable');
  });

  it('validates real image signatures rather than extensions alone', async () => {
    const fake = new File(['not an image'], 'avatar.png', { type: 'image/png' });
    await expect(validateProfileImage(fake)).resolves.toEqual({
      valid: false,
      reason: 'signature',
    });
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    const valid = new File([bytes], 'avatar.png', { type: 'image/png' });
    await expect(validateProfileImage(valid)).resolves.toEqual({ valid: true });
  });

  it('renders safe initials and falls back after a broken avatar image', () => {
    expect(getInitials('Ahmed Jamal')).toBe('AJ');
    expect(getInitials('أحمد جمال')).toBe('أج');
    render(
      <LanguageProvider>
        <Avatar name="Ahmed Jamal" src="/broken.jpg" />
      </LanguageProvider>,
    );
    fireEvent.error(screen.getByRole('img').querySelector('img'));
    expect(screen.getByText('AJ')).toBeInTheDocument();
  });
});
