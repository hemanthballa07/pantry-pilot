import { defineConfig, devices } from '@playwright/test';

// E2E config: Playwright builds the production bundle, serves it with `vite
// preview`, then drives headless chromium against it. Formalizes the Phase 5
// WS1 headless route smoke into a maintained suite.
const PORT = 4193;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  testIgnore: ['**/visual/**'], // the visual-regression suite runs via playwright.vrt.config.ts
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort --host 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
