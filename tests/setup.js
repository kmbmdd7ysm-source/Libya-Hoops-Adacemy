import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

let warnSpy;
beforeAll(() => {
  const originalWarn = console.warn;
  warnSpy = vi.spyOn(console, 'warn').mockImplementation((...args) => {
    if (String(args[0]).startsWith('Invalid USD_TO_LYD exchange rate;')) return;
    originalWarn(...args);
  });
});
afterEach(() => cleanup());
afterAll(() => warnSpy?.mockRestore());
