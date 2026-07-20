import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');

describe('mobile viewport stability hardening', () => {
  it('mounts a route and language aware document viewport guard', () => {
    const app = read('src/App.jsx');
    const guard = read('src/components/layout/ViewportGuard.jsx');
    expect(app).toContain('<ViewportGuard />');
    expect(guard).toContain('document.documentElement.scrollLeft = 0');
    expect(guard).toContain('document.body.scrollLeft = 0');
    expect(guard).toContain("window.addEventListener('orientationchange'");
    expect(guard).toContain('location.pathname');
    expect(guard).toContain('location.search');
    expect(guard).toContain('lang');
  });

  it('clips only the document shell while preserving intentional horizontal scrollers', () => {
    const css = read('src/styles/global.css');
    expect(css).toContain('FINAL MOBILE VIEWPORT STABILITY');
    expect(css).toMatch(
      /#root,[\s\S]*\.site-shell,[\s\S]*#main-content\s*\{[\s\S]*overflow-x:\s*clip/,
    );
    expect(css).toContain('.shop-category-scroll');
    expect(css).toContain('.shop-subcategory-scroll');
    expect(css).toContain('.mobile-filter-pills');
    expect(css).toContain('.compare-scroll');
    expect(css).toContain('overscroll-behavior-inline: contain');
    expect(css).toContain('touch-action: pan-y pinch-zoom');
  });
});
