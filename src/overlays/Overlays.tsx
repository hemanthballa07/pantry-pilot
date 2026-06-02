import { lazy, Suspense } from 'react';
import { useNavStore } from '@/stores/nav';

// Top-level overlay host — mounted once in RootLayout, above the shell chrome.
// Reads modal/overlay state from useNavStore and renders the active overlay(s).
// Mirrors the legacy src/app.jsx, which mounted window.PPOverlays at the app
// root. Each new Phase 6 overlay (cook-mode, checkout, capture, …) is wired in
// here as it lands, reading its own slice of the store.
//
// Overlays are React.lazy code-split (ADR-011 discipline): the chunk loads only
// when the overlay opens, so the ~3.4k LOC of Phase 6 overlays never weigh down
// the initial-route bundle. The fallback is null — an opening drawer shouldn't
// flash a route spinner over the page.
const RecipeDetail = lazy(() =>
  import('./RecipeDetail').then((m) => ({ default: m.RecipeDetail })),
);
const CookMode = lazy(() => import('./CookMode').then((m) => ({ default: m.CookMode })));
const Checkout = lazy(() => import('./Checkout').then((m) => ({ default: m.Checkout })));
const Capture = lazy(() => import('./Capture').then((m) => ({ default: m.Capture })));
const AskPilot = lazy(() => import('./AskPilot').then((m) => ({ default: m.AskPilot })));
const AddItem = lazy(() => import('./AddItem').then((m) => ({ default: m.AddItem })));
const Inbox = lazy(() => import('./Inbox').then((m) => ({ default: m.Inbox })));

export function Overlays() {
  const recipeId = useNavStore((s) => s.recipeId);
  const closeRecipe = useNavStore((s) => s.closeRecipe);
  const cookId = useNavStore((s) => s.cookId);
  const closeCook = useNavStore((s) => s.closeCook);
  const checkoutOpen = useNavStore((s) => s.checkoutOpen);
  const closeCheckout = useNavStore((s) => s.closeCheckout);
  const captureKind = useNavStore((s) => s.captureKind);
  const setCapture = useNavStore((s) => s.setCapture);
  const askPilotOpen = useNavStore((s) => s.askPilotOpen);
  const closeAskPilot = useNavStore((s) => s.closeAskPilot);
  const addItemOpen = useNavStore((s) => s.addItemOpen);
  const closeAddItem = useNavStore((s) => s.closeAddItem);
  const inboxOpen = useNavStore((s) => s.inboxOpen);
  const closeInbox = useNavStore((s) => s.closeInbox);

  return (
    <Suspense fallback={null}>
      {recipeId && <RecipeDetail recipeId={recipeId} onClose={closeRecipe} />}
      {cookId && <CookMode recipeId={cookId} onExit={closeCook} />}
      {checkoutOpen && <Checkout onClose={closeCheckout} />}
      {captureKind && <Capture kind={captureKind} onClose={() => setCapture(null)} />}
      {askPilotOpen && <AskPilot onClose={closeAskPilot} />}
      {addItemOpen && <AddItem onClose={closeAddItem} />}
      {inboxOpen && <Inbox onClose={closeInbox} />}
    </Suspense>
  );
}
