import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { LanguageProvider } from '../src/context/LanguageContext';
import SearchOverlay from '../src/components/layout/SearchOverlay';
import Accordion from '../src/components/common/Accordion';
import { searchSite } from '../src/utils/search';

vi.mock('../src/components/common/Price', () => ({
  default: ({ amount }) => <span>${amount.toFixed(2)}</span>,
}));

function SearchHarness() {
  const [open, setOpen] = useState(true);
  return open ? <SearchOverlay open onClose={() => setOpen(false)} /> : <p>closed</p>;
}

function renderSearch() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <SearchHarness />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('final focused visual corrections', () => {
  it('uses white footer brand assets and supplied Apple Pay asset while preserving black header branding', () => {
    const footer = readFileSync('src/components/layout/Footer.jsx', 'utf8');
    const header = readFileSync('src/components/layout/Header.jsx', 'utf8');
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(footer).not.toContain('src={SITE.logoLight}');
    expect(footer).toContain('src={SITE.wordmarkLight}');
    expect(footer.match(/footer-brand-wordmark/g)).toHaveLength(1);
    expect(footer).toContain("['apple-pay', 'Apple Pay']");
    expect(header).toContain('src={SITE.logo}');
    expect(css).not.toMatch(/payment-logo--apple-pay\s*\{[^}]*background:\s*#fff/s);
  });

  it('opens a visible functional search, focuses input, returns real products and closes with Escape', async () => {
    document.body.style.overflow = 'auto';
    renderSearch();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('open');
    const input = screen.getByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus());
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.change(input, { target: { value: 'hoopers' } });
    expect(screen.getByRole('link', { name: /Hoopers Tee/i })).toHaveAttribute(
      'href',
      '/products/core-logo-tee',
    );
    expect(screen.getByText('$34.00')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByText('closed')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('shows a proper empty search state and supports Arabic product matching', () => {
    renderSearch();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzzz-no-product' } });
    expect(screen.getByText(/No results/i)).toBeInTheDocument();
    expect(searchSite('هوبرز').products.some((p) => p.slug === 'core-logo-tee')).toBe(true);
  });

  it('renders exactly one FAQ state icon and updates aria-expanded', () => {
    render(
      <Accordion
        items={[{ title: 'A long question that must remain readable', content: 'Answer' }]}
      />,
    );
    const button = screen.getByRole('button', { name: /A long question/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button.querySelectorAll('.accordion-icon')).toHaveLength(1);
    expect(button.querySelector('.accordion-icon')).toBeEmptyDOMElement();
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button.querySelectorAll('.accordion-icon')).toHaveLength(1);
  });

  it('keeps compare controls separate from badges and favorites using logical positioning', () => {
    const card = readFileSync('src/components/shop/ProductCard.jsx', 'utf8');
    const css = readFileSync('src/styles/premium.css', 'utf8');
    expect(card).toContain('product-card-badges');
    expect(card).toContain('wishlist-btn');
    expect(card).toContain('compare-btn');
    expect(css).toMatch(/\.compare-btn\s*\{[^}]*inset-inline-end:\s*8px;[^}]*top:\s*52px;/s);
    expect(css).not.toMatch(/\.compare-btn\s*\{[^}]*inset-inline-start/s);
  });
});
