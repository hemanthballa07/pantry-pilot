import { test, expect } from '@playwright/test';
import { ROUTES } from '../routes';

// One full-page screenshot per route, compared to a committed Linux/amd64
// baseline. Mirrors routes.spec.ts's lazy-chunk readiness wait. `/insights`
// re-randomizes a heat-map every render (Insights.tsx CookHeatmap) — its grid
// (data-testid="cook-heatmap") is masked so the rest of the screen still gates.
for (const { path, name } of ROUTES) {
  test(`${name} (${path}) matches its visual baseline`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });

    // Suspense fallback ("Loading…") must resolve into real content first.
    await page.waitForFunction(() => {
      const t = (document.body.innerText || '').trim();
      return t.length > 15 && !/^loading…?$/i.test(t);
    });

    // Ensure web fonts are settled before capture (avoids FOUT-induced diffs).
    // Force-load BOTH families first — they load lazily on use, so a route with
    // no .serif text would otherwise never fetch Newsreader and check() would
    // false-fail. Then assert they resolved, turning a CDN failure into one clear
    // error instead of spurious diffs across every text-bearing route.
    const fontsLoaded = await page.evaluate(async () => {
      try {
        await Promise.all([
          document.fonts.load('1em "Geist"'),
          document.fonts.load('1em "Newsreader"'),
        ]);
      } catch {
        return false;
      }
      await document.fonts.ready;
      return document.fonts.check('1em "Geist"') && document.fonts.check('1em "Newsreader"');
    });
    expect(fontsLoaded, 'web fonts (Geist/Newsreader) failed to load — check network/CDN').toBe(
      true,
    );

    // Wait for the full-page height to stop growing before capturing. Heavy
    // screens (dashboard/pantry/cook) mount content in stages after first paint,
    // so an early full-page screenshot catches a still-expanding layout and
    // Playwright fails to take two consecutive stable shots.
    await page.evaluate(async () => {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      let last = -1;
      let stable = 0;
      for (let i = 0; i < 60 && stable < 3; i++) {
        const h = document.documentElement.scrollHeight;
        if (h === last) stable += 1;
        else {
          stable = 0;
          last = h;
        }
        await sleep(100);
      }
    });

    const mask = name === 'insights' ? [page.locator('[data-testid="cook-heatmap"]')] : [];
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true, mask, timeout: 15000 });
  });
}
