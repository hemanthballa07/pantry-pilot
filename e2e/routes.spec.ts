import { test, expect } from '@playwright/test';
import { ROUTES } from './routes';

// Every route must code-split cleanly: its lazy chunk resolves through the
// Suspense boundary into real content, with no app console errors. Mirrors the
// WS1 headless smoke; baseURL + preview server come from playwright.config.ts.
for (const { path, label } of ROUTES) {
  test(`${path} (${label}) resolves its lazy chunk and renders without console errors`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const t = m.text();
      if (/favicon|Failed to load resource/i.test(t)) return; // asset 404s ≠ app errors
      errors.push(t);
    });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

    await page.goto(path, { waitUntil: 'networkidle' });

    // The Suspense fallback ("Loading…") must resolve into real content.
    await page.waitForFunction(() => {
      const t = (document.body.innerText || '').trim();
      return t.length > 15 && !/^loading…?$/i.test(t);
    });

    const text = (await page.locator('body').innerText()).trim();
    expect(text.length).toBeGreaterThan(15);
    expect(errors).toEqual([]);
  });
}

test('unknown route renders the 404 page', async ({ page }) => {
  await page.goto('/zzz-no-such-route', { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toContainText('404');
});

test('TopBar search filters the Cook screen end-to-end (WS3)', async ({ page }) => {
  await page.goto('/cook', { waitUntil: 'networkidle' });
  // Typing in the shell TopBar search writes the search store, which Cook reads.
  await page.getByPlaceholder(/search or ask/i).fill('zzzznomatchqimpossible');
  await expect(page.getByText(/no dishes match that search/i)).toBeVisible();
});
