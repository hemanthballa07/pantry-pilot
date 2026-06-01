import { test, expect } from '@playwright/test';

// Phase 6 overlay #4 — capture/scan. The Imports method cards open the lazy
// capture overlay keyed on captureKind. Verifies all three kinds open + dismiss,
// and the receipt flow runs capture → detecting → review → done, with no app
// console errors.
test('capture overlays open from Imports for all three kinds (Phase 6)', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/favicon|Failed to load resource/i.test(t)) return;
    errors.push(t);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/imports', { waitUntil: 'networkidle' });
  await expect(page.getByLabel('Close capture')).toHaveCount(0);

  // ── Receipt: full capture → detecting → review → done flow ──
  await page.getByText('Scan a receipt', { exact: true }).click();
  await expect(page.getByRole('dialog', { name: /scan receipt/i })).toBeVisible();
  await page.getByRole('button', { name: /use camera/i }).click();
  // Detecting auto-advances to review; the confirm button appears there.
  await expect(page.getByRole('button', { name: /add \d+ to pantry/i })).toBeVisible({
    timeout: 10000,
  });
  await page.getByRole('button', { name: /add \d+ to pantry/i }).click();
  await expect(page.getByText(/pantry updated/i)).toBeVisible();
  await page.getByRole('button', { name: /^Done$/ }).click();
  await expect(page.getByRole('dialog', { name: /scan receipt/i })).toHaveCount(0);

  // ── Barcode: open, dismiss with Escape ──
  await page.getByText('Scan barcodes', { exact: true }).click();
  await expect(page.getByRole('dialog', { name: /scan barcode/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /scan an item/i })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: /scan barcode/i })).toHaveCount(0);

  // ── Fridge: open, dismiss with the close button ──
  await page.getByText('Photo of your fridge', { exact: true }).click();
  await expect(page.getByRole('dialog', { name: /photo of fridge/i })).toBeVisible();
  await page.getByLabel('Close capture').click();
  await expect(page.getByRole('dialog', { name: /photo of fridge/i })).toHaveCount(0);

  expect(errors).toEqual([]);
});
