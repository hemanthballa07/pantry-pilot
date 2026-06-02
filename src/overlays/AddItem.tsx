// Add-item overlay — TypeScript port of the legacy AddItemModal (src/overlays.jsx:554-633).
// Presentational centered dialog in the shared Modal shell (width 560, faithful to the
// legacy). Takes only an onClose from the Overlays glue (which reads
// useNavStore.addItemOpen); the form is local, ephemeral state.
//
// Deliberate deviations from the legacy: (1) the legacy header had no close affordance
// (only Cancel/backdrop) — a labelled "Close add item" button is added to match the
// modal contract every other overlay carries. (2) The three quick-capture chips toasted
// "coming up" placeholders in the prototype; now that the Capture overlay exists they
// close this modal and open the matching scanner via useNavStore.setCapture (the
// non-reactive .getState() handoff, as RecipeDetail does for Start cooking). Primitives
// (Icon) are inlined per the per-file convention; Modal comes from the shared components/ layer.
import { useState, type ReactNode } from 'react';
import { Modal } from '@/components/Modal';
import { useNavStore, useToastStore } from '@/stores';
import type { CaptureKind } from '@/stores/nav';

const fireToast = (msg: string) => useToastStore.getState().push(msg);
const openCapture = (kind: CaptureKind) => useNavStore.getState().setCapture(kind);

// ─── Icon ───────────────────────────────────────────────────────────────────
const ICON_PATHS: Record<string, string> = {
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M4 12l5 5L20 6',
  receipt: 'M6 2h12v19l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3V2z M9 7h6 M9 11h6 M9 15h4',
  barcode: 'M3 5v14M6 5v14M9.5 5v14M12 5v14M15 5v14M18.5 5v14M21 5v14',
  scan: 'M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2',
  sparkles:
    'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M6 2l.8 2.2L9 5l-2.2.8L6 8l-.8-2.2L3 5l2.2-.8z M17 16l.6 1.8L19.4 18l-1.8.6L17 20.4l-.6-1.8L14.6 18l1.8-.6z',
};

function Icon({
  name,
  size = 18,
  stroke = 'currentColor',
}: {
  name: string;
  size?: number;
  stroke?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name] ?? ''} />
    </svg>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────
const BTN_STYLES = {
  primary: { bg: 'var(--ink, #1a1814)', fg: 'var(--paper-warm, #fdfaf3)', bd: 'none' },
  ghost: { bg: 'transparent', fg: 'var(--ink-2, #3a352c)', bd: 'none' },
} as const;

function Button({
  variant = 'primary',
  iconRight,
  onClick,
  children,
}: {
  variant?: keyof typeof BTN_STYLES;
  iconRight?: string;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const s = BTN_STYLES[variant];
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: '10px 18px',
        fontSize: 14,
        fontWeight: 600,
        background: s.bg,
        color: s.fg,
        border: s.bd,
        borderRadius: 10,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
      {iconRight && <Icon name={iconRight} size={14} />}
    </button>
  );
}

// ─── Form atoms ─────────────────────────────────────────────────────────────
const Label = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      fontSize: 11,
      letterSpacing: 0.5,
      color: 'var(--ink-muted)',
      fontWeight: 700,
      textTransform: 'uppercase',
      marginBottom: 6,
    }}
  >
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 40,
  padding: '0 14px',
  border: '1px solid var(--line)',
  borderRadius: 10,
  background: 'var(--paper)',
  fontSize: 13.5,
  color: 'var(--ink)',
  fontFamily: 'inherit',
};

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '12px 8px',
        background: 'var(--paper-warm)',
        border: '1px solid var(--line-soft)',
        borderRadius: 10,
        cursor: 'pointer',
        color: 'var(--ink-2)',
      }}
    >
      <Icon name={icon} size={18} />
      <span style={{ fontSize: 11.5, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

const CATEGORIES = [
  'Vegetables',
  'Dairy',
  'Meat',
  'Grains',
  'Frozen',
  'Canned',
  'Sauces',
  'Oils',
  'Fruits',
];
const LOCATIONS = ['Fridge', 'Freezer', 'Pantry', 'Counter'];
const QUICK: { icon: string; label: string; kind: CaptureKind }[] = [
  { icon: 'receipt', label: 'Scan receipt', kind: 'receipt' },
  { icon: 'barcode', label: 'Scan barcode', kind: 'barcode' },
  { icon: 'scan', label: 'Photo of fridge', kind: 'fridge' },
];

export function AddItem({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [cat, setCat] = useState('Vegetables');
  const [loc, setLoc] = useState('Fridge');
  const [qty, setQty] = useState('1');

  const handle = () => {
    // Presentational mock (no backend in v1, ADR-003): the toast confirms the action as in
    // the legacy; category/quantity/expires are collected for fidelity but not persisted.
    fireToast(`Added ${name || 'item'} to ${loc}`);
    onClose();
  };

  const handleQuick = (kind: CaptureKind) => {
    // Hand off to the Capture overlay (close this modal first so they don't stack).
    onClose();
    openCapture(kind);
  };

  return (
    <Modal open onClose={onClose} label="Add item" width={560}>
      <div
        style={{
          padding: '22px 26px 18px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.6,
              color: 'var(--ink-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Add to pantry
          </div>
          <h2 className="serif" style={{ margin: 0, fontSize: 22, letterSpacing: -0.3 }}>
            New item
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close add item"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--bg-tint)',
            color: 'var(--ink-muted)',
            border: '1px solid var(--line)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="close" size={15} />
        </button>
      </div>

      <div style={{ padding: 26, overflowY: 'auto' }}>
        {/* Quick capture */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {QUICK.map((q) => (
            <QuickAction
              key={q.kind}
              icon={q.icon}
              label={q.label}
              onClick={() => handleQuick(q.kind)}
            />
          ))}
        </div>

        <Label>Item name</Label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Spinach"
          autoFocus
          style={inputStyle}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <div>
            <Label>Category</Label>
            <select value={cat} onChange={(e) => setCat(e.target.value)} style={inputStyle}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Location</Label>
            <select value={loc} onChange={(e) => setLoc(e.target.value)} style={inputStyle}>
              {LOCATIONS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <div>
            <Label>Quantity</Label>
            <input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="1 bag"
              style={inputStyle}
            />
          </div>
          <div>
            <Label>Expires</Label>
            <input placeholder="Pilot will estimate" style={inputStyle} />
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            padding: '10px 14px',
            background: 'var(--green-tint)',
            border: '1px solid var(--green-soft)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon name="sparkles" size={14} stroke="var(--green-deep)" />
          <span style={{ fontSize: 12, color: 'var(--green-deep)' }}>
            Pilot will estimate the expiry date and grocery section for you.
          </span>
        </div>
      </div>

      <div
        style={{
          padding: '14px 26px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
        }}
      >
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" iconRight="check" onClick={handle}>
          Add item
        </Button>
      </div>
    </Modal>
  );
}
