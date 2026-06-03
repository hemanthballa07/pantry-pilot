import { test, expect, type Page, type Locator } from '@playwright/test';
import { settleFonts, waitForContent } from './_helpers';

// Visual-regression baselines for the 7 Phase-6 overlays (capture is split into
// its 3 kinds → 9 dialog baselines) + the CookReels feed = 10 total
// (OQ-015, VRT phase 2). Each case opens the overlay via its existing, already-
// passing e2e open-path (the same selectors as e2e/*.spec.ts), asserts the
// overlay is actually up, then ELEMENT-screenshots its [role=dialog] (the route
// behind is already covered by routes.vrt.ts; an element shot avoids full-page
// height nondeterminism). Captured at the inherited Desktop Chrome viewport
// (1280×720) with animations frozen (playwright.vrt.config.ts animations:disabled),
// which is what makes the full-viewport drawers and the reels feed deterministic.

const RECIPE = 'Schezwan Egg Fried Rice'; // r1 — its name labels the recipe + cook-mode dialogs

interface OverlayCase {
  name: string;
  route: string;
  /** Run the open-path and return the exact element to screenshot. */
  open: (page: Page) => Promise<Locator>;
}

const OVERLAYS: OverlayCase[] = [
  {
    name: 'recipe-detail',
    route: '/cook',
    open: async (page) => {
      await page.getByText(RECIPE, { exact: true }).first().click();
      const dialog = page.getByRole('dialog', { name: RECIPE });
      await expect(dialog.getByRole('button', { name: /start cooking/i })).toBeVisible();
      return dialog;
    },
  },
  {
    name: 'cook-mode',
    route: '/cook',
    open: async (page) => {
      await page.getByText(RECIPE, { exact: true }).first().click();
      await page.getByRole('button', { name: /start cooking/i }).click();
      await expect(page.getByText('Before you start', { exact: true })).toBeVisible();
      // CookMode shares its aria-label (recipe.name) with the still-open recipe
      // drawer (openCook does not clear recipeId), so disambiguate the full-screen
      // dialog by its setup-phase text rather than by name.
      return page.getByRole('dialog').filter({ hasText: 'Before you start' });
    },
  },
  {
    name: 'checkout',
    route: '/shop',
    open: async (page) => {
      await page
        .getByRole('button', { name: /check out/i })
        .first()
        .click();
      const dialog = page.getByRole('dialog', { name: /checkout/i });
      await expect(dialog.getByRole('button', { name: /place order/i })).toBeVisible();
      return dialog;
    },
  },
  {
    name: 'capture-receipt',
    route: '/imports',
    open: async (page) => {
      await page.getByText('Scan a receipt', { exact: true }).click();
      const dialog = page.getByRole('dialog', { name: /scan receipt/i });
      // Stop at the initial capture phase — clicking "Use camera" starts the
      // detecting timer (nondeterministic); assert it is present, do not click it.
      await expect(dialog.getByRole('button', { name: /use camera/i })).toBeVisible();
      return dialog;
    },
  },
  {
    name: 'capture-barcode',
    route: '/imports',
    open: async (page) => {
      await page.getByText('Scan barcodes', { exact: true }).click();
      const dialog = page.getByRole('dialog', { name: /scan barcode/i });
      await expect(dialog.getByRole('button', { name: /scan an item/i })).toBeVisible();
      return dialog;
    },
  },
  {
    name: 'capture-fridge',
    route: '/imports',
    open: async (page) => {
      await page.getByText('Photo of your fridge', { exact: true }).click();
      const dialog = page.getByRole('dialog', { name: /photo of fridge/i });
      await expect(dialog).toBeVisible();
      return dialog;
    },
  },
  {
    name: 'askpilot',
    route: '/dashboard',
    open: async (page) => {
      await page.getByLabel('Notifications').click();
      const dialog = page.getByRole('dialog', { name: /pilot/i });
      // Initial render is the canned OPENING bubble — the reply timer only fires
      // on send(), which we never trigger, so this is static.
      await expect(dialog.getByText(/knows your kitchen/i)).toBeVisible();
      return dialog;
    },
  },
  {
    name: 'additem',
    route: '/dashboard',
    open: async (page) => {
      await page.getByRole('button', { name: 'Add item', exact: true }).first().click();
      const dialog = page.getByRole('dialog', { name: 'Add item' });
      await expect(dialog.getByRole('heading', { name: /new item/i })).toBeVisible();
      return dialog;
    },
  },
  {
    name: 'inbox',
    route: '/dashboard',
    open: async (page) => {
      await page.getByRole('button', { name: 'Kitchen Inbox' }).first().click();
      const dialog = page.getByRole('dialog', { name: 'Kitchen Inbox' });
      await expect(dialog).toBeVisible();
      return dialog;
    },
  },
  {
    name: 'cook-reels',
    route: '/cook',
    open: async (page) => {
      await page.getByRole('button', { name: 'Reels' }).click();
      await expect(page.getByText('Cook Reels')).toBeVisible();
      await expect(page.getByText(/wok-hei fried rice/i)).toBeVisible();
      // Inline Cook tab (not a dialog); fixed-height scroll-snap feed, animations
      // frozen by config. Screenshot the testid root added in CookReels.tsx.
      return page.getByTestId('cook-reels');
    },
  },
];

for (const { name, route, open } of OVERLAYS) {
  test(`${name} overlay matches its visual baseline`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    // Gate the route's own Suspense chunk before opening the overlay — symmetry
    // with routes.vrt.ts and defense in depth (the open-path's auto-wait already
    // covers this transitively, but don't rely on a future open-path doing so).
    await waitForContent(page);
    const target = await open(page);
    await expect(target).toBeVisible();
    await settleFonts(page);
    await expect(target).toHaveScreenshot(`${name}.png`, { timeout: 15000 });
  });
}
