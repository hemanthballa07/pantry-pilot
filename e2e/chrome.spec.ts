import { test, expect, type Page } from '@playwright/test';

// Phase 6 chrome overlays — AskPilot / AddItem / KitchenInbox. Each opens from a
// TopBar action over the current route and dismisses cleanly (close button +
// Escape), with no app console errors. Triggers live in ShellLayout's TopBar
// (IconBtn aria-labels: "Add item", "Kitchen Inbox", "Notifications" → AskPilot).

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/favicon|Failed to load resource/i.test(t)) return;
    errors.push(t);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

test('Add item overlay opens from the top bar and closes (Phase 6)', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/dashboard', { waitUntil: 'networkidle' });

  const dialog = page.getByRole('dialog', { name: 'Add item' });
  await expect(dialog).toHaveCount(0);

  await page.getByRole('button', { name: 'Add item', exact: true }).first().click();
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('heading', { name: /new item/i })).toBeVisible();

  await page.getByLabel('Close add item').click();
  await expect(dialog).toHaveCount(0);

  // Re-open, dismiss with Escape.
  await page.getByRole('button', { name: 'Add item', exact: true }).first().click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  expect(errors).toEqual([]);
});

test('Kitchen Inbox overlay opens from the top bar and closes (Phase 6)', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/dashboard', { waitUntil: 'networkidle' });

  const dialog = page.getByRole('dialog', { name: 'Kitchen Inbox' });
  await expect(dialog).toHaveCount(0);

  await page.getByRole('button', { name: 'Kitchen Inbox' }).first().click();
  await expect(dialog).toBeVisible();

  await page.getByLabel('Close inbox').click();
  await expect(dialog).toHaveCount(0);

  // Re-open, dismiss with Escape.
  await page.getByRole('button', { name: 'Kitchen Inbox' }).first().click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  expect(errors).toEqual([]);
});

test('Ask Pilot overlay opens from the top bar and closes (Phase 6)', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/dashboard', { waitUntil: 'networkidle' });

  const dialog = page.getByRole('dialog', { name: /pilot/i });
  await expect(dialog).toHaveCount(0);

  await page.getByLabel('Notifications').click();
  await expect(dialog).toBeVisible();

  await page.getByLabel('Close Pilot').click();
  await expect(dialog).toHaveCount(0);

  // Re-open, dismiss with Escape.
  await page.getByLabel('Notifications').click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  expect(errors).toEqual([]);
});
