import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    reducedMotion: 'reduce',
    launchOptions: {
      executablePath: '/home/apm/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
      args: ['--no-sandbox'],
    },
  },
  projects: [
    { name: 'iphone-15-pro', use: { ...devices['iPhone 15 Pro'] } },
    { name: 'ipad-pro-11', use: { ...devices['iPad Pro 11'] } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
  },
});
