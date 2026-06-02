// src/screens/extras/Imports.tsx — the routed Imports screen (receipt / barcode / fridge
// capture entry points + recipe URL import). Split from src/screens/Extras.tsx (OQ-004 / ADR-004).
import { useNavStore, useToastStore } from '@/stores';
import type { CaptureKind } from '@/stores/nav';
import { Button, Card, Icon, Illo, Pill } from './shared';

const openCapture = (kind: CaptureKind) => useNavStore.getState().setCapture(kind);
const fireToast = (msg: string) => useToastStore.getState().push(msg);

// ═════════════ IMPORTS (routed) ════════════════════════════════════════════

function RecipeImport() {
  return (
    <Card pad={26}>
      <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 8 }}>
        Paste a recipe URL
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          defaultValue="https://www.seriouseats.com/schezwan-fried-rice-recipe"
          style={{
            flex: 1,
            height: 44,
            padding: '0 14px',
            border: '1px solid var(--line)',
            borderRadius: 12,
            background: 'var(--paper)',
            fontSize: 13.5,
            color: 'var(--ink-2)',
            fontFamily: 'inherit',
          }}
        />
        <Button
          variant="primary"
          iconRight="arrowRight"
          onClick={() => fireToast('Importing recipe… 12 ingredients detected')}
        >
          Import
        </Button>
      </div>
      <div
        style={{
          marginTop: 18,
          padding: 16,
          background: 'var(--paper-warm)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          display: 'flex',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--tomato) 0%, var(--orange) 100%)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Illo name="rice" size={42} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="serif" style={{ fontSize: 17 }}>
            Schezwan Fried Rice
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>
            12 ingredients · 4 already in your pantry · 8 missing
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
            <Pill tone="green" size="sm">
              Save recipe
            </Pill>
            <Pill tone="orange" size="sm">
              Add missing to grocery
            </Pill>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function Imports() {
  // The method cards open the capture overlay (Phase 6 overlay #4 —
  // src/overlays/Capture.tsx) via useNavStore.setCapture, keyed on captureKind.
  const methods: {
    kind: CaptureKind;
    icon: string;
    title: string;
    desc: string;
    soft: string;
    ink: string;
    meta: string;
  }[] = [
    {
      kind: 'receipt',
      icon: 'receipt',
      title: 'Scan a receipt',
      desc: 'Snap a grocery receipt — Pilot reads every line, matches the store catalog, and estimates expiry.',
      soft: 'var(--orange-tint)',
      ink: 'var(--orange-deep)',
      meta: 'Best after a shop',
    },
    {
      kind: 'barcode',
      icon: 'barcode',
      title: 'Scan barcodes',
      desc: 'Scan packaged items one by one. Pulls name, brand, size, nutrition, and shelf life.',
      soft: 'var(--sky-soft)',
      ink: 'var(--sky-ink)',
      meta: 'Great for staples',
    },
    {
      kind: 'fridge',
      icon: 'camera',
      title: 'Photo of your fridge',
      desc: "One open-fridge photo. Pilot detects what's inside and flags what to eat first.",
      soft: '#EDE2EA',
      ink: 'var(--plum)',
      meta: 'Fastest full refresh',
    },
  ];
  return (
    <div style={{ padding: '28px 28px 56px', display: 'grid', gap: 20 }}>
      <Card
        pad={24}
        style={{
          background: 'linear-gradient(150deg, var(--paper-warm) 0%, var(--green-tint) 100%)',
          borderColor: 'var(--green-soft)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: 0.6,
            color: 'var(--green-deep)',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Quick add
        </div>
        <h2 className="serif" style={{ margin: 0, fontSize: 28, letterSpacing: -0.4 }}>
          Skip the typing. Snap, scan, or paste.
        </h2>
        <p
          style={{
            margin: '8px 0 0',
            color: 'var(--ink-2)',
            fontSize: 14,
            maxWidth: 560,
            lineHeight: 1.55,
          }}
        >
          Three ways to fill your pantry in seconds. Pilot handles the matching, expiry estimates,
          and waste tracking for you.
        </p>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {methods.map((m) => (
          <Card
            key={m.kind}
            pad={0}
            hover
            style={{
              overflow: 'hidden',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => openCapture(m.kind)}
          >
            <div
              style={{
                height: 124,
                position: 'relative',
                borderBottom: '1px solid var(--line-soft)',
                background: `linear-gradient(140deg, ${m.soft} 0%, transparent 100%)`,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 16,
                  background: 'var(--paper)',
                  border: '1px solid var(--line-soft)',
                  display: 'grid',
                  placeItems: 'center',
                  color: m.ink,
                  boxShadow: 'var(--sh-1)',
                }}
              >
                <Icon name={m.icon} size={28} />
              </div>
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  color: m.ink,
                  background: 'var(--paper)',
                  padding: '3px 9px',
                  borderRadius: 999,
                  border: '1px solid var(--line-soft)',
                }}
              >
                {m.meta}
              </span>
            </div>
            <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div
                className="serif"
                style={{ fontSize: 19, letterSpacing: -0.2, color: 'var(--ink)' }}
              >
                {m.title}
              </div>
              <p
                style={{
                  margin: '6px 0 16px',
                  fontSize: 12.5,
                  color: 'var(--ink-muted)',
                  lineHeight: 1.5,
                }}
              >
                {m.desc}
              </p>
              <div style={{ marginTop: 'auto' }}>
                <Button
                  full
                  variant="primary"
                  iconRight="arrowRight"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCapture(m.kind);
                  }}
                >
                  Open
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recipe URL import */}
      <div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 0.6,
            color: 'var(--ink-muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Or import a recipe
        </div>
        <RecipeImport />
      </div>
    </div>
  );
}
