import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/**/*.test.{js,jsx,mjs}'],
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage-critical',
      reporter: ['text', 'text-summary', 'json', 'json-summary', 'html', 'lcov'],
      include: [
        'src/services/sync/**',
        'src/services/account/**',
        'src/services/money.js',
        'src/services/commercePreferences.js',
        'src/config/commerce.js',
        'src/utils/payments.js',
        'src/utils/analytics.js',
        'src/utils/errors.js',
        'src/utils/registerPwa.js',
      ],
      thresholds: {
        lines: 99,
        functions: 100,
        branches: 90,
        statements: 95,
        'src/services/account/addressService.js': {
          lines: 100,
          functions: 100,
          statements: 95,
          branches: 90,
        },
        'src/services/sync/cloudState.js': {
          lines: 100,
          functions: 100,
          statements: 95,
          branches: 90,
        },
        'src/services/sync/merge.js': { lines: 100, functions: 100, statements: 95, branches: 90 },
        'src/services/sync/offlineQueue.js': {
          lines: 98,
          functions: 95,
          statements: 92,
          branches: 90,
        },
        'src/services/sync/protocol.js': { lines: 98, functions: 95, statements: 92, branches: 90 },
        'src/services/sync/storage.js': { lines: 98, functions: 95, statements: 92, branches: 90 },
        'src/services/commercePreferences.js': {
          lines: 98,
          functions: 95,
          statements: 92,
          branches: 90,
        },
        'src/services/money.js': { lines: 98, functions: 95, statements: 92, branches: 90 },
        'src/config/commerce.js': { lines: 98, functions: 95, statements: 92, branches: 85 },
        'src/utils/analytics.js': { lines: 98, functions: 95, statements: 92, branches: 90 },
        'src/utils/errors.js': { lines: 98, functions: 95, statements: 92, branches: 90 },
        'src/utils/payments.js': { lines: 98, functions: 95, statements: 92, branches: 90 },
        'src/utils/registerPwa.js': { lines: 98, functions: 95, statements: 92, branches: 90 },
      },
    },
  },
});
