import { useEffect, useRef, type ReactNode } from 'react';
import { useFocusTrap } from './useFocusTrap';

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
// On open it traps keyboard focus inside the panel and locks body scroll; on
// close it restores both — the modal baseline every Phase 6 overlay inherits.
// Focus-in, Tab/Shift+Tab containment, and focus-restore live in the shared
// useFocusTrap hook (OQ-012); this effect owns only scroll-lock + Escape.
export function Drawer({ open, onClose, children, width = 480, label }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
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
