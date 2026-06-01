import { test, expect } from '@playwright/test';

// Phase 6 overlay #5 — Cook Reels. The Cook screen's Reels tab renders the reel
// feed; saving updates the counter and "Cook this now" opens the Cook Mode overlay.
test('Cook Reels feed: save a clip and cook from it (Phase 6)', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/favicon|Failed to load resource/i.test(t)) return;
    errors.push(t);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/cook', { waitUntil: 'networkidle' });

  await page.getByRole('button', { name: 'Reels' }).click();
  await expect(page.getByText('Cook Reels')).toBeVisible();
  await expect(page.getByText(/wok-hei fried rice/i)).toBeVisible();

  // Saving the first reel bumps the counter.
  await expect(page.getByText('0 saved')).toBeVisible();
  await page.getByRole('button', { name: 'Save' }).first().click();
  await expect(page.getByText('1 saved')).toBeVisible();

  // "Cook this now" opens the full-screen Cook Mode overlay; cancel returns.
  await page
    .getByRole('button', { name: /cook this now/i })
    .first()
    .click();
  await expect(page.getByRole('button', { name: /start cooking/i })).toBeVisible();
  await page.getByRole('button', { name: /cancel/i }).click();
  await expect(page.getByRole('button', { name: /start cooking/i })).toHaveCount(0);

  expect(errors).toEqual([]);
});
