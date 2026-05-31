import { useEffect } from 'react';
import { useToastStore } from '@/stores';

export function ToastBanner() {
  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismiss, 3000);
    return () => clearTimeout(t);
    // Re-arm only when a new toast arrives (its key changes); depending on the
    // whole `current` object would be equivalent but noisier. Intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.key, dismiss]);

  if (!current) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--ink, #1a1814)',
        color: 'var(--paper-warm, #fdfaf3)',
        padding: '12px 22px',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 4px 20px rgba(0,0,0,.22)',
        zIndex: 1000,
        maxWidth: 480,
        textAlign: 'center',
        whiteSpace: 'pre-wrap',
      }}
    >
      {current.text}
    </div>
  );
}
