import { test, expect } from '@playwright/test';

// Phase 6 overlay #1 — recipe-detail. Opening a recipe from the Cook screen must
// resolve the lazy overlay chunk into the Drawer over the route, then dismiss
// cleanly (close button + Escape), with no app console errors.
const RECIPE = 'Schezwan Egg Fried Rice'; // r1 — present in the Explore tab

test('recipe-detail overlay opens from Cook and closes (Phase 6)', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/favicon|Failed to load resource/i.test(t)) return;
    errors.push(t);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/cook', { waitUntil: 'networkidle' });

  // No overlay until a recipe is opened.
  await expect(page.getByLabel('Close recipe')).toHaveCount(0);

  await page.getByText(RECIPE, { exact: true }).first().click();

  // The lazy overlay chunk resolves into the drawer over the route.
  await expect(page.getByRole('button', { name: /start cooking/i })).toBeVisible();
  await expect(page.getByText(/ingredient match/i)).toBeVisible();

  // Close button dismisses it.
  await page.getByLabel('Close recipe').click();
  await expect(page.getByRole('button', { name: /start cooking/i })).toHaveCount(0);

  // Re-open, then dismiss with Escape.
  await page.getByText(RECIPE, { exact: true }).first().click();
  await expect(page.getByRole('button', { name: /start cooking/i })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /start cooking/i })).toHaveCount(0);

  expect(errors).toEqual([]);
});
