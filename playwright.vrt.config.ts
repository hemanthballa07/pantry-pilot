import { defineConfig, devices } from '@playwright/test';

// Visual-regression config — isolated from the functional e2e suite
// (playwright.config.ts). Baselines are pixel-sensitive to OS + CPU arch, so
// they are generated and compared ONLY inside the pinned Playwright Linux/amd64
// image (locally via scripts/vrt-docker.sh, in CI via the `visual` job's
// container). Running `npm run vrt` on a bare Mac will NOT match the committed
// Linux baselines — that is expected; use `npm run vrt:docker` locally.
const PORT = 4194;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e/visual',
  testMatch: '**/*.vrt.ts', // default testMatch is .spec/.test only; our specs are *.vrt.ts
  fullyParallel: true,
  workers: 2, // cap parallelism so heavy full-page renders (e.g. /cook, 5375px) aren't CPU-starved into capturing a half-mounted layout
  forbidOnly: !!process.env.CI,
  retries: 0, // a visual flake is a signal, not something to paper over with retries
  reporter: 'list',
  use: { baseURL },
  expect: {
    toHaveScreenshot: {
      animations: 'disabled', // freezes ppSteam / ken-burns / ppPop / transitions
      caret: 'hide',
      maxDiffPixelRatio: 0.002, // tight AA-noise guard; baselines are byte-stable in the pinned image so this rarely bites
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort --host 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
