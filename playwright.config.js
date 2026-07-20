import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';
const launchOptions = {
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
};

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'reports/playwright', open: 'never' }]],
  outputDir: 'reports/playwright-artifacts',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    browserName: 'chromium',
    launchOptions,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'reduced-motion', use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' } },
    { name: 'arabic-rtl', use: { ...devices['Desktop Chrome'], locale: 'ar-LY' } },
  ],
});
