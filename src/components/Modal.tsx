import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Max width of the centered panel in px. */
  width?: number;
  /** Accessible name for the dialog (announced by screen readers). */
  label?: string;
}

// Shared centered-modal shell — the modal-shaped sibling of Drawer, for overlays
// that present a card over the page rather than a side panel (checkout; later the
// AddItem / AskPilot / Inbox chrome). Carries the same modal contract Drawer does:
// Escape + backdrop-click dismiss, focus-into-panel on open + focus-restore on
// close, body scroll-lock, role="dialog" aria-modal with an accessible name.
//
// The panel is nested inside the .pp-overlay backdrop, which acts as a grid
// centering container (as the legacy checkout.jsx did) — this keeps the ppPop
// scale animation free of styles.css's .pp-modal transform-centering, which would
// otherwise fight the keyframe. A stopPropagation on the panel means only true
// backdrop clicks dismiss. Full focus-trap is still deferred (OQ-012).
export function Modal({ open, onClose, children, width = 480, label }: ModalProps) {
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
    <div
      className="pp-overlay"
      onClick={onClose}
      style={{ display: 'grid', placeItems: 'center', padding: '5vh 5vw' }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: width,
          maxHeight: '90vh',
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 18,
          boxShadow: 'var(--sh-lift)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'ppPop 200ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
