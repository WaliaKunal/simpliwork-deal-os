
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration for Simpliwork Deal OS
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:9002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before starting tests if needed
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:9002',
  //   reuseExistingServer: !process.env.CI,
  // },
});
