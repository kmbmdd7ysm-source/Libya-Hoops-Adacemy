import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const files = [
  '../src/styles/global.css',
  '../src/styles/premium.css',
  '../src/styles/account-sync.css',
  '../src/styles/design-system.css',
];
describe('global black-white-neutral design contract', () => {
  it('all CSS literal colors are neutrals', () => {
    for (const f of files) {
      const hexes = [...read(f).matchAll(/#[\da-f]{3,8}(?![\da-f])/gi)].map((m) => m[0]);
      for (const h of hexes) {
        const s = h.slice(1),
          rgb =
            s.length === 3 || s.length === 4
              ? [...s.slice(0, 3)].map((x) => x + x)
              : s.match(/../g).slice(0, 3);
        expect(new Set(rgb.map((x) => x.toLowerCase())).size, f + ' ' + h).toBe(1);
      }
    }
  });
  it('authoritative design file is loaded last', () => {
    const entry = read('../src/main.jsx');
    const positions = files.map((f) => entry.indexOf('./styles/' + f.split('/').at(-1)));
    expect(positions.every((x) => x >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
  it('covers inputs, cards, language and reduced motion', () => {
    const ds = read('../src/styles/design-system.css');
    [
      '--bg:',
      '--border:',
      '--accent:',
      '--ds-radius-card:',
      'focus-visible',
      '.product-card',
      '.training-card',
      "html[lang^='ar']",
      'prefers-reduced-motion',
    ].forEach((x) => expect(ds).toContain(x));
  });
});
