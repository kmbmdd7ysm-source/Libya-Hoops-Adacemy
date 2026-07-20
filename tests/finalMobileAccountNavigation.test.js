import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const premiumCss = fs.readFileSync(path.resolve('src/styles/premium.css'), 'utf8');

describe('final mobile account navigation and tap-state regression guards', () => {
  it('keeps account tabs in a dedicated horizontal scrollport without shrinking labels', () => {
    expect(premiumCss).toContain('.account-nav::-webkit-scrollbar');
    expect(premiumCss).toMatch(/\.account-nav\s*\{[\s\S]*?flex-flow:\s*row nowrap;/);
    expect(premiumCss).toMatch(/\.account-nav\s*\{[\s\S]*?overflow-x:\s*auto;/);
    expect(premiumCss).toMatch(/\.account-nav button\s*\{[\s\S]*?flex:\s*0 0 auto;/);
    expect(premiumCss).toMatch(/\.account-nav button\s*\{[\s\S]*?min-width:\s*max-content;/);
    expect(premiumCss).toMatch(/\.account-nav button\s*\{[\s\S]*?white-space:\s*nowrap;/);
  });

  it('removes sticky iOS tap paint from the mobile menu trigger and drawer logo', () => {
    expect(premiumCss).toContain('@media (hover: none) and (pointer: coarse)');
    expect(premiumCss).toContain(".header-actions .mobile-more-action[aria-expanded='true']");
    expect(premiumCss).toContain('.mobile-menu-head .brand:active');
    expect(premiumCss).toMatch(/mobile-more-action[\s\S]*?background:\s*transparent !important;/);
    expect(premiumCss).toMatch(/mobile-menu-head \.brand[\s\S]*?outline:\s*0 !important;/);
  });
});
