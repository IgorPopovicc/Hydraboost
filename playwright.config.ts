import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: true,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4000',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview:static',
    url: 'http://127.0.0.1:4000',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
