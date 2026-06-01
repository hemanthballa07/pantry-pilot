import { test, expect } from '@playwright/test';

// Phase 6 overlay #3 — checkout. The Shop "Check out" button must open the lazy
// checkout modal over the route, run the cart → placing → done flow, and dismiss
// cleanly (close button + Escape), with no app console errors.
test('checkout overlay opens from Shop, places an order, and closes (Phase 6)', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/favicon|Failed to load resource/i.test(t)) return;
    errors.push(t);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/shop', { waitUntil: 'networkidle' });

  // No overlay until the button is clicked.
  await expect(page.getByLabel('Close checkout')).toHaveCount(0);

  await page
    .getByRole('button', { name: /check out/i })
    .first()
    .click();

  // The lazy overlay chunk resolves into the modal over the route.
  await expect(page.getByRole('dialog', { name: /checkout/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /place order/i })).toBeVisible();

  // Close button dismisses it.
  await page.getByLabel('Close checkout').click();
  await expect(page.getByRole('button', { name: /place order/i })).toHaveCount(0);

  // Re-open, then dismiss with Escape.
  await page
    .getByRole('button', { name: /check out/i })
    .first()
    .click();
  await expect(page.getByRole('button', { name: /place order/i })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /place order/i })).toHaveCount(0);

  // Re-open and run the full place-order flow through to the summary.
  await page
    .getByRole('button', { name: /check out/i })
    .first()
    .click();
  await page.getByRole('button', { name: /place order/i }).click();
  await expect(page.getByText(/placing your order/i)).toBeVisible();
  await expect(page.getByText(/order placed/i)).toBeVisible();

  // The summary's primary action closes the modal.
  await page.getByRole('button', { name: /view pantry/i }).click();
  await expect(page.getByRole('dialog', { name: /checkout/i })).toHaveCount(0);

  expect(errors).toEqual([]);
});
