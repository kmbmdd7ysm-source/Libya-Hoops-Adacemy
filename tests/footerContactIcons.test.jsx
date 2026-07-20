import { readFileSync } from 'node:fs';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Footer from '../src/components/layout/Footer';
import { LanguageProvider } from '../src/context/LanguageContext';
import { CookieProvider } from '../src/context/CookieContext';

vi.mock('../src/components/common/Newsletter', () => ({
  default: () => <form aria-label="newsletter" />,
}));

function renderFooter(language = 'en') {
  localStorage.setItem('lha-language', language);
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <CookieProvider>
          <Footer />
        </CookieProvider>
      </LanguageProvider>
    </MemoryRouter>,
  );
}

const expected = {
  instagram: {
    label: 'Follow Libya Hoops Academy on Instagram',
    href: 'https://www.instagram.com/libyahoopsacademy',
  },
  facebook: {
    label: 'Follow Libya Hoops Academy on Facebook',
    href: 'https://www.facebook.com/share/19EM6Pz1n3/?mibextid=wwXIfr',
  },
  tiktok: {
    label: 'Follow Libya Hoops Academy on TikTok',
    href: 'https://www.tiktok.com/@libyahoopsacademy?_r=1&_t=ZS-987u4toLwAR',
  },
  email: {
    label: 'Email Libya Hoops Academy',
    href: 'mailto:Libyahoopsacademy@gmail.com',
  },
};

describe('Footer contact icons', () => {
  it('renders exactly one accessible link for each exact destination', () => {
    renderFooter();
    const footer = screen.getByRole('contentinfo');
    for (const [id, item] of Object.entries(expected)) {
      const links = within(footer).getAllByRole('link', { name: item.label });
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute('href', item.href);
      expect(links[0].querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      if (id === 'email') {
        expect(links[0]).not.toHaveAttribute('target');
        expect(links[0]).not.toHaveAttribute('rel');
      } else {
        expect(links[0]).toHaveAttribute('target', '_blank');
        expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  it('contains the exact English and Arabic translated labels', () => {
    const translations = readFileSync('src/data/translations.js', 'utf8');
    expect(translations).toContain('Follow Libya Hoops Academy on Instagram');
    expect(translations).toContain('Follow Libya Hoops Academy on Facebook');
    expect(translations).toContain('Follow Libya Hoops Academy on TikTok');
    expect(translations).toContain('Email Libya Hoops Academy');
    expect(translations).toContain('تابع أكاديمية ليبيا هوبس على إنستغرام');
    expect(translations).toContain('تابع أكاديمية ليبيا هوبس على فيسبوك');
    expect(translations).toContain('تابع أكاديمية ليبيا هوبس على تيك توك');
    expect(translations).toContain('راسل أكاديمية ليبيا هوبس عبر البريد الإلكتروني');
  });

  it('has one social row, one brand lockup, no placeholders, and preserves payments/navigation', () => {
    const footer = readFileSync('src/components/layout/Footer.jsx', 'utf8');
    const socialData = readFileSync('src/data/footerSocial.jsx', 'utf8');
    expect(footer.match(/className="footer-social"/g)).toHaveLength(1);
    expect(footer.match(/className="brand footer-brand"/g)).toHaveLength(1);
    expect(socialData).not.toMatch(/href:\s*['"]#['"]/);
    expect(footer).toContain("['visa', 'Visa']");
    expect(footer).toContain("['mastercard', 'Mastercard']");
    expect(footer).toContain("['apple-pay', 'Apple Pay']");
    expect(footer).toContain("['google-pay', 'Google Pay']");
    expect(footer).toContain("['samsung-pay', 'Samsung Pay']");
    expect(footer).toContain('footerNav.shop');
    expect(footer).toContain('footerNav.academy');
    expect(footer).toContain('footerNav.help');
    expect(footer).toContain('footerNav.legal');
  });
});
