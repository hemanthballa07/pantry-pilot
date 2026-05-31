import { useLayoutEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { mock } from '@/data/mock';
import { useToastStore, useNavStore } from '@/stores';

interface Props { screenId: string; }

// Maps router screenId → { globalKey, componentName } matching src/app.jsx:6-19
const SCREEN_MAP: Record<string, { global: string; comp: string }> = {
  cook:      { global: 'PPRecipes',   comp: 'Cook'      },
  insights:  { global: 'PPExtras',    comp: 'Insights'  },
  household: { global: 'PPExtras',    comp: 'Household' },
  settings:  { global: 'PPExtras',    comp: 'Settings'  },
  imports:   { global: 'PPExtras',    comp: 'Imports'   },
};

// D1 legacy bridge — mirrors src/app.jsx:66-77 useEffect.
// On mount: exposes typed mock data + store actions as window.PP* so unconverted
// .jsx screens continue to work byte-for-byte. Each Phase 4 screen conversion
// removes one entry from SCREEN_MAP and deletes this bridge for that route.
// Pre-flight grep confirmed zero D.* mutations in .jsx screens (phase-3.md).
export function LegacyBridge({ screenId }: Props) {
  const navigate = useNavigate();
  // useLayoutEffect fires synchronously before browser paint, ensuring globals are
  // installed before any legacy child's useEffect can read window.PP_DATA.
  const [globalsReady, setGlobalsReady] = useState(false);

  useLayoutEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    // Single source of truth: typed mock const literal → window.PP_DATA reference.
    w.PP_DATA = mock;
    w.PPToast = useToastStore.getState().push;
    w.PPNav = (id: string) => navigate('/' + id);
    w.PPAskPilot = () => useNavStore.getState().openAskPilot();
    w.PPAddItem = () => useNavStore.getState().openAddItem();
    w.PPInbox = () => useNavStore.getState().openInbox();
    w.PPCapture = (kind: string) =>
      useNavStore.getState().setCapture(kind as 'receipt' | 'barcode' | 'fridge');
    w.PPCookNow = (_rid: string) => { /* Phase 4: navigate(`/cook/${_rid}`) */ };
    w.PPCheckoutOpen = () => { /* Phase 4: open checkout overlay */ };
    setGlobalsReady(true);
  }, [navigate]);

  const info = SCREEN_MAP[screenId];
  const w = window as unknown as Record<string, Record<string, ComponentType>>;
  const LegacyComponent = globalsReady && info ? w[info.global]?.[info.comp] : undefined;

  if (LegacyComponent) {
    return <LegacyComponent />;
  }

  // Graceful fallback while legacy scripts aren't loaded (Phase 3 → Phase 4 gap).
  const label = screenId.charAt(0).toUpperCase() + screenId.slice(1);
  return (
    <div
      style={{
        padding: 48,
        fontFamily: 'var(--font-sans, system-ui)',
        color: 'var(--ink, #1a1814)',
        background: 'var(--bg, #fafaf7)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          fontSize: 11.5,
          color: 'var(--ink-muted, #8a8374)',
          letterSpacing: 1,
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        Converting in Phase 4
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display, Newsreader, serif)',
          fontSize: 38,
          letterSpacing: -0.5,
          color: 'var(--ink, #1a1814)',
        }}
      >
        {label}
      </div>
      <p
        style={{
          fontSize: 15,
          color: 'var(--ink-2, #4a4535)',
          maxWidth: 440,
          textAlign: 'center',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        Bridge wired — <code style={{ fontSize: 12 }}>window.PP_DATA</code> is live with
        typed mock data from <code style={{ fontSize: 12 }}>@/data/mock</code>.
        This screen converts in Phase 4 via{' '}
        <code style={{ fontSize: 12 }}>window.{info?.global}.{info?.comp}</code>.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: 8,
          padding: '10px 22px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          background: 'var(--ink, #1a1814)',
          color: 'var(--paper-warm, #fdfaf3)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        ← Landing
      </button>
    </div>
  );
}
