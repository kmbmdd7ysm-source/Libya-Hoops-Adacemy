import { describe, expect, it } from 'vitest';
import { readFileSync, statSync } from 'node:fs';

const read = (file) => readFileSync(file, 'utf8');

describe('final mobile performance hardening', () => {
  it('keeps below-the-fold home content out of the initial route graph', () => {
    const home = read('src/pages/HomePage.jsx');
    const deferred = read('src/pages/HomeDeferredContent.jsx');
    expect(home).toContain("lazy(() => import('./HomeDeferredContent'))");
    expect(home).toContain('IntersectionObserver');
    expect(home).not.toContain("from '../data/products'");
    expect(deferred).toContain("from '../data/products'");
  });

  it('loads search, cart drawer and footer only when they are needed', () => {
    const header = read('src/components/layout/Header.jsx');
    const app = read('src/App.jsx');
    expect(header).toContain("lazy(() => import('./SearchOverlay'))");
    expect(app).toContain('<DeferredCartDrawer />');
    expect(app).toContain('<DeferredFooter />');
  });

  it('uses a lightweight mobile hero and never downloads the hero video on phones', () => {
    const hero = read('src/components/experience/CinematicHero.jsx');
    expect(hero).toContain('lha-hero-poster-mobile.webp');
    expect(hero).toContain('(min-width: 900px) and (hover: hover) and (pointer: fine)');
    expect(hero).toContain('preload="none"');
    expect(statSync('public/media/hero/lha-hero-poster-mobile.webp').size).toBeLessThan(30000);
  });

  it('defers cloud, geo and offline-shell work for anonymous first paint', () => {
    const auth = read('src/context/AuthContext.jsx');
    const commerce = read('src/context/CommerceContext.jsx');
    const main = read('src/main.jsx');
    expect(auth).toContain("globalThis.addEventListener?.('pointerdown', startBootstrap");
    expect(commerce).toContain("currency !== 'LYD' && !userId");
    expect(commerce).toContain("globalThis.addEventListener?.('pointerdown', startGeoLookup");
    expect(main).toContain('window.setTimeout(startBackgroundTasks, 20000)');
  });

  it('keeps the mobile menu home link descriptive', () => {
    const header = read('src/components/layout/Header.jsx');
    expect(header).toContain('onClick={close} aria-label={SITE.name}');
  });
});
