import { expect, type Page } from '@playwright/test';

// Shared settle helpers for the visual-regression suites (routes.vrt.ts +
// overlays.vrt.ts). Extracted verbatim from the v1 routes.vrt.ts inline logic so
// the committed route baselines stay byte-identical after the refactor. The
// underscore-prefixed name keeps this out of the `**/*.vrt.ts` testMatch — it is
// a helper module, not a spec.

/** Suspense fallback ("Loading…") must resolve into real content before capture. */
export async function waitForContent(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const t = (document.body.innerText || '').trim();
    return t.length > 15 && !/^loading…?$/i.test(t);
  });
}

/**
 * Ensure web fonts are settled before capture (avoids FOUT-induced diffs).
 * Force-load BOTH families first — they load lazily on use, so a screen with no
 * .serif text would otherwise never fetch Newsreader and check() would
 * false-fail. Then assert they resolved, turning a CDN failure into one clear
 * error instead of spurious diffs across every text-bearing screen.
 */
export async function settleFonts(page: Page): Promise<void> {
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
  expect(fontsLoaded, 'web fonts (Geist/Newsreader) failed to load — check network/CDN').toBe(true);
}

/**
 * Wait for the full-page height to stop growing before capturing. Heavy screens
 * (dashboard/pantry/cook) mount content in stages after first paint, so an early
 * full-page screenshot catches a still-expanding layout and Playwright fails to
 * take two consecutive stable shots. Full-page route shots only — dialogs and the
 * reels feed are fixed-height inner containers whose content does not grow the
 * document height (they use a content-present wait instead).
 */
export async function settleHeight(page: Page): Promise<void> {
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
}
