import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import Icon from '../src/components/icons/Icon';

const read = (file) => fs.readFileSync(`${process.cwd()}/${file}`, 'utf8');

describe('mandatory final correction contracts', () => {
  it('uses the internal SVG system for all required interaction icons', () => {
    const names = [
      'menu',
      'back',
      'close',
      'check',
      'filter',
      'sort',
      'search',
      'user',
      'bag',
      'orders',
      'help',
      'chevron',
      'plus',
      'minus',
      'heart',
      'compare',
      'ruler',
      'play',
      'pause',
      'previous',
      'next',
    ];
    const { container } = render(
      <>
        {names.map((name) => (
          <Icon key={name} name={name} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg')).toHaveLength(names.length);
    container.querySelectorAll('svg').forEach((svg) => {
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('integrates account access into the continuous mobile menu', () => {
    const header = read('src/components/layout/Header.jsx');
    expect(header).toContain('mobile-menu-integrated-account');
    expect(header).toContain('mobile-menu-divider');
    expect(header).not.toContain('<div className="mobile-account-panel">');
  });

  it('guarantees 44px header hit areas even at narrow breakpoints', () => {
    const css = read('src/styles/global.css');
    expect(css).toMatch(
      /\.header-actions \.icon-btn[\s\S]*width: 44px !important;[\s\S]*height: 44px !important;/,
    );
    expect(css).not.toMatch(/\.header-actions \.icon-btn\s*\{[^}]*width: 36px;/);
    expect(css).not.toMatch(/\.header-actions \.icon-btn\s*\{[^}]*width: 40px;/);
  });

  it('keeps search white, internally scrollable, body locked and neutral-highlighted', () => {
    const search = read('src/components/layout/SearchOverlay.jsx');
    const css = read('src/styles/global.css');
    expect(search).toContain("document.body.style.overflow = 'hidden'");
    expect(search).toContain("window.addEventListener('popstate'");
    expect(search).toContain("event.key === 'Escape'");
    expect(css).toMatch(/\.search-overlay[\s\S]*background:\s*#fff/);
    expect(css).toMatch(/\.search-screen-content[\s\S]*overflow-y:\s*auto/);
    expect(css).toMatch(/\.search-overlay mark[\s\S]*background:\s*transparent/);
  });

  it('keeps product purchase actions full width and guarded against duplicate add', () => {
    const product = read('src/pages/ProductPage.jsx');
    const css = read('src/styles/global.css');
    expect(product).toContain('aria-busy={adding}');
    expect(product).toContain('disabled={adding || !matchedVariant');
    expect(product).toContain('<Icon name="ruler"');
    expect(css).toMatch(/\.purchase-primary,[\s\S]*\.favorite-product[\s\S]*width:\s*100%/);
    expect(css).toMatch(/\.size-pill[\s\S]*min-height:\s*58px/);
  });
});
