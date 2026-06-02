import { useEffect, type RefObject } from 'react';

// Shared focus-trap hook (OQ-012) — the full keyboard-focus contract for a modal
// surface, hand-rolled (no dependency). While `active`, it:
//   1. moves focus into the panel (`ref.current`, which must be programmatically
//      focusable, e.g. tabIndex={-1}),
//   2. keeps Tab / Shift+Tab inside the panel — wrapping at the first/last
//      focusable so keyboard focus can't walk out to the background page, and
//   3. on deactivate/unmount restores focus to whatever was focused before.
//
// This consolidates the focus-in + focus-restore that Drawer/Modal previously did
// inline and adds the Tab containment they lacked; CookMode (which had no focus
// management) gains the whole contract. Body scroll-lock + Escape stay in each
// shell — they aren't focus concerns. Boundary-only interception: a Tab in the
// middle of the order is left to native tab order.
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Move focus into the panel itself (it carries tabIndex={-1}).
    node.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      // No focusables (or focus escaped the panel): keep focus pinned to the panel.
      if (focusables.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement;
      const outside = !node.contains(activeEl);

      if (e.shiftKey) {
        if (activeEl === first || activeEl === node || outside) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (activeEl === last || activeEl === node || outside) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [ref, active]);
}
