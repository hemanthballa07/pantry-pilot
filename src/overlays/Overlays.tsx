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

export function Overlays() {
  const recipeId = useNavStore((s) => s.recipeId);
  const closeRecipe = useNavStore((s) => s.closeRecipe);

  return (
    <Suspense fallback={null}>
      {recipeId && <RecipeDetail recipeId={recipeId} onClose={closeRecipe} />}
    </Suspense>
  );
}
