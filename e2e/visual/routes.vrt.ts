import { test, expect } from '@playwright/test';
import { ROUTES } from '../routes';
import { waitForContent, settleFonts, settleHeight } from './_helpers';

// One full-page screenshot per route, compared to a committed Linux/amd64
// baseline. Mirrors routes.spec.ts's lazy-chunk readiness wait. `/insights`
// re-randomizes a heat-map every render (Insights.tsx CookHeatmap) — its grid
// (data-testid="cook-heatmap") is masked so the rest of the screen still gates.
// The settle helpers (waitForContent → settleFonts → settleHeight) are shared
// with overlays.vrt.ts via ./_helpers; the capture sequence is unchanged from v1.
for (const { path, name } of ROUTES) {
  test(`${name} (${path}) matches its visual baseline`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    await waitForContent(page);
    await settleFonts(page);
    await settleHeight(page);

    const mask = name === 'insights' ? [page.locator('[data-testid="cook-heatmap"]')] : [];
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true, mask, timeout: 15000 });
  });
}
