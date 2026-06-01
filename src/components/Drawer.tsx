import { useEffect, useRef, type ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  /** Accessible name for the dialog (announced by screen readers). */
  label?: string;
}

// Shared overlay shell — ported from the prototype src/components.jsx Drawer.
// Slides in from the right over a click-to-dismiss backdrop; Escape closes.
// Uses the styles.css .pp-overlay / .pp-drawer tokens verbatim. Mounted above
// the shell chrome (RootLayout), so its position:fixed anchors to the viewport.
// On open it moves focus into the panel, locks body scroll, and on close
// restores both — the modal baseline every Phase 6 overlay inherits.
export function Drawer({ open, onClose, children, width = 480, label }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className="pp-overlay" onClick={onClose} />
      <div
        ref={panelRef}
        className="pp-drawer"
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
      >
        {children}
      </div>
    </>
  );
}
