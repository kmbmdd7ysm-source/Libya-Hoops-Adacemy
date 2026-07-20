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
      reporter: ['text', 'json', 'html'],
      include: [
        'src/services/sync/**',
        'src/services/account/**',
        'src/services/money.js',
        'src/services/commercePreferences.js',
      ],
      thresholds: { lines: 70, functions: 65, branches: 50, statements: 65 },
    },
  },
});
