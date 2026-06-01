import { test, expect } from '@playwright/test';

// Phase 6 overlay #2 — Cook Mode. Verifies the full handoff chain:
// Cook screen → recipe-detail drawer → "Start cooking" → full-screen Cook Mode
// (setup → step deck), then exit, with no app console errors.
const RECIPE = 'Schezwan Egg Fried Rice'; // r1 — has a full step script

test('cook mode opens from recipe detail and runs the step deck (Phase 6)', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/favicon|Failed to load resource/i.test(t)) return;
    errors.push(t);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/cook', { waitUntil: 'networkidle' });

  // Open the recipe drawer, then hand off to Cook Mode.
  await page.getByText(RECIPE, { exact: true }).first().click();
  await page.getByRole('button', { name: /start cooking/i }).click();

  // Cook Mode setup (its lazy chunk resolves).
  await expect(page.getByText('Before you start', { exact: true })).toBeVisible();

  // Begin cooking → the step deck.
  await page.getByRole('button', { name: /start cooking/i }).click();
  await expect(page.getByText(/now cooking/i)).toBeVisible();
  await expect(page.getByText(/^Step 1$/)).toBeVisible();

  // Advance a step, then leave.
  await page
    .getByRole('button', { name: /next step/i })
    .first()
    .click();
  await page.getByRole('button', { name: /exit cook mode/i }).click();
  await expect(page.getByText(/now cooking/i)).toHaveCount(0);

  expect(errors).toEqual([]);
});
