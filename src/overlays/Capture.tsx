// Capture overlay — TypeScript port of the three legacy capture flows
// (window.PPScanReceipt / PPScanBarcode / PPScanFridge). Keyed on the existing
// captureKind nav-store slice ('receipt' | 'barcode' | 'fridge'); the <Overlays>
// host renders <Capture kind={captureKind} onClose={() => setCapture(null)} />.
//
// All three share the centered-card shell (the shared Modal), an accent + phase-
// pips header, and the expiry/box/barcode helpers + fixtures (src/lib/capture.ts,
// the OQ-003 lib precedent). One file holds all three flows + shared inline
// primitives (the ADR-004 multi-component precedent; OQ-011 defers shared-primitive
// extraction). Each flow is a self-contained phase machine.
//
// Deviation (documented, like the other overlays): router-free — the done-phase
// "View pantry" fires a toast + closes rather than navigating (useNavigate would
// break the router-free <Overlays> host + its tests). Backdrop/Escape dismiss +
// scroll-lock come from the shared Modal.
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Modal } from '@/components/Modal';
import { Illo } from '@/components/Illo';
import { Icon as UiIcon } from '@/components/ui';
import { useToastStore } from '@/stores';
import type { CaptureKind } from '@/stores/nav';
import {
  expiryLabel,
  expiryTone,
  boxColor,
  barcodeBars,
  RECEIPT,
  CATALOG,
  DETECTED,
  HIDDEN,
  type ReceiptLine,
  type CatalogProduct,
  type DetectedItem,
} from '@/lib/capture';

const fireToast = (msg: string) => useToastStore.getState().push(msg);

// ─── Icon (OQ-011b: shared components/ui primitive, decorative for the overlay layer) ───
function Icon(props: { name: string; size?: number; stroke?: string }) {
  return <UiIcon {...props} decorative />;
}

// ─── Pill ─────────────────────────────────────────────────────────────────
type PillTone = 'green' | 'amber' | 'tomato' | 'sky' | 'ghost';
const PILL_STYLES: Record<PillTone, { bg: string; color: string; border: string }> = {
  green: { bg: 'var(--green-tint)', color: 'var(--green-deep)', border: 'var(--green-soft)' },
  amber: { bg: 'var(--amber-soft)', color: 'var(--amber-ink)', border: 'var(--amber-line)' },
  tomato: { bg: 'var(--tomato-soft)', color: 'var(--tomato-ink)', border: 'var(--tomato-line)' },
  sky: { bg: 'var(--sky-soft)', color: 'var(--sky-ink)', border: 'var(--sky)' },
  ghost: { bg: 'rgba(0,0,0,.04)', color: 'var(--ink-muted)', border: 'transparent' },
};

function Pill({
  tone = 'green',
  size = 'sm',
  icon,
  children,
}: {
  tone?: PillTone;
  size?: 'sm' | 'md';
  icon?: string | null;
  children?: ReactNode;
}) {
  const s = PILL_STYLES[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: size === 'md' ? '4px 10px' : '3px 8px',
        fontSize: size === 'md' ? 12 : 11,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 999,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {icon && <Icon name={icon} size={11} />}
      {children}
    </span>
  );
}

// ─── Button ─────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost';
const BTN_STYLES: Record<BtnVariant, { bg: string; fg: string; bd: string }> = {
  primary: { bg: 'var(--ink)', fg: 'var(--paper-warm)', bd: 'none' },
  secondary: { bg: 'var(--paper-warm)', fg: 'var(--ink)', bd: '1px solid var(--line)' },
  ghost: { bg: 'transparent', fg: 'var(--ink-2)', bd: '1px solid var(--line)' },
};

function Button({
  variant = 'primary',
  size,
  icon,
  iconRight,
  full,
  disabled,
  onClick,
  children,
}: {
  variant?: BtnVariant;
  size?: 'sm' | 'lg';
  icon?: string;
  iconRight?: string;
  full?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const s = BTN_STYLES[variant];
  const pad = size === 'lg' ? '12px 22px' : size === 'sm' ? '6px 12px' : '10px 18px';
  const fs = size === 'lg' ? 14.5 : size === 'sm' ? 12 : 14;
  const isz = size === 'sm' ? 12 : 14;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: pad,
        fontSize: fs,
        fontWeight: 600,
        background: s.bg,
        color: s.fg,
        border: s.bd,
        borderRadius: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'inherit',
        width: full ? '100%' : undefined,
      }}
    >
      {icon && <Icon name={icon} size={isz} />}
      {children}
      {iconRight && <Icon name={iconRight} size={isz} />}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────
function Card({
  pad = 18,
  style,
  children,
}: {
  pad?: number;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 16,
        padding: pad,
        boxShadow: 'var(--sh-1)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────
function Section({
  title,
  count,
  subtitle,
  accent,
  defaultOpen,
  children,
}: {
  title: string;
  count: number;
  subtitle?: string;
  accent: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 0 10px',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid var(--line)',
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 999, background: accent }} />
        <span
          style={{
            fontSize: 11,
            letterSpacing: 0.6,
            fontWeight: 700,
            color: 'var(--ink)',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{count}</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: 'var(--ink-muted)' }}>
          <Icon name={open ? 'chevronUp' : 'chevronDown'} size={14} />
        </span>
      </button>
      {subtitle && (
        <div style={{ fontSize: 12, color: 'var(--ink-muted)', margin: '10px 0 12px' }}>
          {subtitle}
        </div>
      )}
      {open && children}
    </div>
  );
}

// ─── Shell — Modal + accent header with phase pips ──────────────────────────
const EYEBROW: CSSProperties = {
  fontSize: 11,
  letterSpacing: 0.6,
  fontWeight: 700,
  textTransform: 'uppercase',
};

function Shell({
  title,
  icon,
  ink,
  accent,
  phases,
  phase,
  onClose,
  children,
}: {
  title: string;
  icon: string;
  ink: string;
  accent: string;
  phases: string[];
  phase: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal open onClose={onClose} label={title} width={880}>
      <div
        style={{
          padding: '14px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          borderBottom: '1px solid var(--line)',
          background: 'var(--paper-warm)',
          flex: '0 0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: ink }}>
            <Icon name={icon} size={16} />
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{title}</span>
          <span style={{ marginLeft: 14, display: 'flex', gap: 4 }}>
            {phases.map((p) => (
              <span
                key={p}
                style={{
                  width: phase === p ? 22 : 6,
                  height: 6,
                  borderRadius: 999,
                  background:
                    phases.indexOf(p) <= phases.indexOf(phase) ? accent : 'var(--line-strong)',
                  transition: 'width 200ms ease, background 200ms ease',
                }}
              />
            ))}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close capture"
          style={{
            width: 30,
            height: 30,
            display: 'grid',
            placeItems: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--ink-muted)',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          <Icon name="close" size={16} />
        </button>
      </div>
      {children}
    </Modal>
  );
}

// ─── Shared done phase ──────────────────────────────────────────────────────
interface SoonItem {
  name: string;
  illo: string;
  expDays: number;
}
function DonePhase({
  heading,
  blurb,
  soonLabel,
  soon,
  onClose,
}: {
  heading: string;
  blurb: string;
  soonLabel: string;
  soon: SoonItem[];
  onClose: () => void;
}) {
  const viewPantry = () => {
    fireToast('Pantry updated · scanned items added');
    onClose();
  };
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '44px 32px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 999,
          background: 'var(--green-tint)',
          border: '3px solid var(--green)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--green-deep)',
          animation: 'ppPop 320ms ease-out',
        }}
      >
        <Icon name="check" size={44} />
      </div>
      <div>
        <h2 className="serif" style={{ margin: 0, fontSize: 28, letterSpacing: -0.4 }}>
          {heading}
        </h2>
        <div style={{ fontSize: 14, color: 'var(--ink-muted)', marginTop: 8, lineHeight: 1.5 }}>
          {blurb}
        </div>
      </div>
      {soon.length > 0 && (
        <Card
          style={{
            width: '100%',
            maxWidth: 460,
            background: 'var(--amber-soft)',
            borderColor: 'var(--amber-line)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ color: 'var(--amber-ink)' }}>
              <Icon name="alert" size={14} />
            </span>
            <span style={{ ...EYEBROW, fontSize: 11.5, color: 'var(--amber-ink)' }}>
              {soonLabel}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {soon.map((it) => (
              <div key={it.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--on-tint-pad)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Illo name={it.illo} size={22} />
                </div>
                <div style={{ flex: 1, textAlign: 'left', fontSize: 13, color: 'var(--ink-2)' }}>
                  {it.name}
                </div>
                <Pill tone={expiryTone(it.expDays)} size="sm">
                  {expiryLabel(it.expDays)}
                </Pill>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <Button variant="secondary" onClick={onClose}>
          Done
        </Button>
        <Button variant="primary" iconRight="arrowRight" onClick={viewPantry}>
          View pantry
        </Button>
      </div>
    </div>
  );
}

// ─── Corner brackets (capture viewfinders) ──────────────────────────────────
function CornerBrackets({
  color = 'var(--amber)',
  inset = 16,
}: {
  color?: string;
  inset?: number;
}) {
  const corners = [
    { vertical: 'top' as const, horizontal: 'left' as const },
    { vertical: 'top' as const, horizontal: 'right' as const },
    { vertical: 'bottom' as const, horizontal: 'left' as const },
    { vertical: 'bottom' as const, horizontal: 'right' as const },
  ];
  return (
    <>
      {corners.map((c, i) => {
        const bt = c.vertical === 'top';
        const bl = c.horizontal === 'left';
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              [c.vertical]: inset,
              [c.horizontal]: inset,
              width: 26,
              height: 26,
              borderTop: bt ? `3px solid ${color}` : undefined,
              borderBottom: !bt ? `3px solid ${color}` : undefined,
              borderLeft: bl ? `3px solid ${color}` : undefined,
              borderRight: !bl ? `3px solid ${color}` : undefined,
              borderTopLeftRadius: bt && bl ? 6 : 0,
              borderTopRightRadius: bt && !bl ? 6 : 0,
              borderBottomLeftRadius: !bt && bl ? 6 : 0,
              borderBottomRightRadius: !bt && !bl ? 6 : 0,
            }}
          />
        );
      })}
    </>
  );
}

function SummaryDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
      {label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  RECEIPT FLOW
// ════════════════════════════════════════════════════════════════════════════
type ReceiptRow = ReceiptLine & { _checked: boolean };

function ReceiptConfidenceBadge({ c }: { c: 'auto' | 'guess' }) {
  return c === 'auto' ? (
    <Pill tone="green" size="sm" icon="check">
      Auto-matched
    </Pill>
  ) : (
    <Pill tone="amber" size="sm" icon="alert">
      Needs a look
    </Pill>
  );
}

function ReceiptRowView({
  line,
  checked,
  onToggle,
  onSwap,
}: {
  line: ReceiptRow;
  checked: boolean;
  onToggle: () => void;
  onSwap?: (alt: string) => void;
}) {
  const m = line.match;
  if (!m) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 14px',
          background: 'var(--paper-warm)',
          border: '1px solid var(--tomato-line)',
          borderRadius: 12,
          borderLeft: '3px solid var(--tomato)',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 9,
            flex: '0 0 auto',
            background: 'var(--tomato-soft)',
            color: 'var(--tomato-ink)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon name="alert" size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
            Couldn't match this line
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--ink-muted)',
              marginTop: 3,
            }}
          >
            {line.raw} · {line.qty} · ${line.price.toFixed(2)}
          </div>
        </div>
        <Button size="sm" variant="secondary" icon="plus">
          Add manually
        </Button>
      </div>
    );
  }
  const expanded = m.confidence === 'guess';
  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderLeft: m.confidence === 'guess' ? '3px solid var(--amber)' : '1px solid var(--line)',
        borderRadius: 12,
        padding: '12px 14px',
        opacity: checked ? 1 : 0.55,
        transition: 'opacity 160ms',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onToggle}
          aria-label={checked ? `Deselect ${m.name}` : `Select ${m.name}`}
          style={{
            width: 22,
            height: 22,
            borderRadius: 7,
            border: `1.5px solid ${checked ? 'var(--green)' : 'var(--line-strong)'}`,
            background: checked ? 'var(--green)' : 'transparent',
            color: '#FDFAF3',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            padding: 0,
            flex: '0 0 auto',
          }}
        >
          {checked && <Icon name="check" size={12} />}
        </button>
        <div
          style={{
            width: 38,
            height: 38,
            flex: '0 0 auto',
            borderRadius: 9,
            background: 'var(--bg-tint)',
            border: '1px solid var(--line-soft)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Illo name={m.illo} size={26} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{m.name}</span>
            {m.note && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: 'var(--orange-deep)',
                  background: 'var(--orange-tint)',
                  padding: '2px 7px',
                  borderRadius: 999,
                }}
              >
                {m.note}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-muted)',
              marginTop: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)' }}>{line.raw}</span>
            <span>·</span>
            <span>{line.qty}</span>
            <span>·</span>
            <span className="tnum">${line.price.toFixed(2)}</span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
            flex: '0 0 auto',
          }}
        >
          <Pill tone={expiryTone(m.expDays)} size="sm" icon={m.expDays === 0 ? null : 'timer'}>
            {expiryLabel(m.expDays)}
          </Pill>
          <ReceiptConfidenceBadge c={m.confidence} />
        </div>
      </div>
      {expanded && m.alternates && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 12px',
            background: 'var(--amber-soft)',
            borderRadius: 9,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--amber-ink)', fontWeight: 600 }}>
            Pilot's guess — or:
          </span>
          {m.alternates.map((alt) => (
            <button
              key={alt}
              onClick={() => onSwap?.(alt)}
              style={{
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 600,
                background: 'var(--paper)',
                border: '1px solid var(--amber-line)',
                borderRadius: 999,
                color: 'var(--ink-2)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {alt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReceiptCapture({ onCapture }: { onCapture: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        padding: '32px 32px 28px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...EYEBROW, color: 'var(--orange-deep)' }}>Scan receipt</div>
        <h2 className="serif" style={{ margin: '8px 0 6px', fontSize: 26, letterSpacing: -0.4 }}>
          Snap your receipt — Pilot does the rest.
        </h2>
        <div style={{ fontSize: 13.5, color: 'var(--ink-muted)', lineHeight: 1.5, maxWidth: 460 }}>
          Pilot reads each line, matches it against the store's catalog, and estimates when it'll
          expire so your pantry stays accurate.
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          width: 320,
          height: 380,
          background: 'var(--ink)',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: 'var(--sh-lift)',
        }}
      >
        <CornerBrackets />
        <div
          style={{
            position: 'absolute',
            top: 38,
            left: 60,
            right: 60,
            bottom: 38,
            background: 'rgba(253, 250, 243, 0.18)',
            borderRadius: 4,
            padding: '14px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div
            style={{
              height: 8,
              width: '60%',
              margin: '0 auto',
              background: 'rgba(253,250,243,0.35)',
              borderRadius: 2,
            }}
          />
          <div
            style={{
              height: 4,
              width: '40%',
              margin: '0 auto 8px',
              background: 'rgba(253,250,243,0.2)',
              borderRadius: 2,
            }}
          />
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 6 }}>
              <div
                style={{
                  height: 4,
                  flex: 1,
                  background: 'rgba(253,250,243,0.16)',
                  borderRadius: 2,
                }}
              />
              <div
                style={{
                  height: 4,
                  width: 22,
                  background: 'rgba(253,250,243,0.2)',
                  borderRadius: 2,
                }}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 50,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
            color: 'rgba(253, 250, 243, 0.7)',
            textTransform: 'uppercase',
          }}
        >
          Hold steady · receipt in frame
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <Button variant="primary" icon="camera" onClick={onCapture}>
          Use camera
        </Button>
        <Button variant="secondary" icon="upload" onClick={onCapture}>
          Upload photo
        </Button>
      </div>
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '14px 16px',
          background: 'var(--green-tint)',
          border: '1px solid var(--green-soft)',
          borderRadius: 12,
          display: 'flex',
          gap: 12,
        }}
      >
        <span style={{ color: 'var(--green-deep)', flex: '0 0 auto', marginTop: 2 }}>
          <Icon name="sparkles" size={16} />
        </span>
        <div>
          <div
            style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 4 }}
          >
            How Pilot matches receipts
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.55 }}>
            Reads abbreviated line items, looks each up in {RECEIPT.store}'s catalog, and estimates
            expiry from category averages (milk ~7d, eggs ~28d, pantry shelf-stable). Anything
            ambiguous, it asks.
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptDetecting({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const total = RECEIPT.items.length;
  useEffect(() => {
    if (step >= total) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 350 : 180);
    return () => clearTimeout(t);
  }, [step, total, onDone]);

  return (
    <div
      style={{
        padding: '28px 32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...EYEBROW, color: 'var(--orange-deep)' }}>Reading receipt</div>
        <h2 className="serif" style={{ margin: '6px 0', fontSize: 22, letterSpacing: -0.3 }}>
          {step >= total
            ? 'Got everything. Matching against the catalog…'
            : `${step} of ${total} line items read…`}
        </h2>
      </div>
      <div
        style={{
          position: 'relative',
          width: 300,
          maxHeight: 380,
          overflow: 'hidden',
          background: '#FBF6E8',
          color: '#3B342A',
          fontFamily: 'var(--font-mono)',
          padding: '20px 22px 26px',
          borderRadius: 4,
          boxShadow: '0 10px 28px -10px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            paddingBottom: 8,
            borderBottom: '1px dashed rgba(59,52,42,0.3)',
          }}
        >
          <div className="serif" style={{ fontSize: 16, color: '#2A2520', letterSpacing: 1 }}>
            {RECEIPT.store.toUpperCase()}
          </div>
          <div style={{ fontSize: 9, color: '#7A6F5D', marginTop: 2 }}>{RECEIPT.address}</div>
          <div style={{ fontSize: 9, color: '#7A6F5D', marginTop: 1 }}>{RECEIPT.when}</div>
        </div>
        <div style={{ paddingTop: 8 }}>
          {RECEIPT.items.map((line, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                padding: '3px 0',
                opacity: i < step ? 1 : 0.18,
                transition: 'opacity 200ms',
                color: i < step ? '#2A2520' : '#7A6F5D',
              }}
            >
              <span>{line.raw}</span>
              <span>${line.price.toFixed(2)}</span>
              {i === step - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: -1,
                    left: -6,
                    right: -6,
                    background: 'rgba(217, 114, 43, 0.18)',
                    borderRadius: 3,
                    pointerEvents: 'none',
                    animation: 'ppDetectPulse 600ms ease-out',
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: '1px dashed rgba(59,52,42,0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            fontWeight: 700,
            color: '#2A2520',
            opacity: step >= total ? 1 : 0.2,
            transition: 'opacity 400ms',
          }}
        >
          <span>TOTAL</span>
          <span>${RECEIPT.total.toFixed(2)}</span>
        </div>
        {step < total && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${20 + Math.min(step, total) * 18 + 50}px`,
              height: 2,
              background: 'linear-gradient(90deg, transparent, var(--orange) 50%, transparent)',
              boxShadow: '0 0 10px 2px rgba(217, 114, 43, 0.5)',
              transition: 'top 180ms ease-out',
            }}
          />
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 6 }}>
        <span style={{ color: 'var(--orange-deep)' }}>
          <Icon name="sparkles" size={12} />
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--ink-muted)', fontWeight: 600 }}>
          {step >= total
            ? 'Matching to catalog…'
            : `OCR pass · ${Math.round((step / total) * 100)}%`}
        </span>
      </div>
    </div>
  );
}

function ReceiptReview({
  onConfirm,
  onClose,
}: {
  onConfirm: (items: ReceiptRow[]) => void;
  onClose: () => void;
}) {
  const [lines, setLines] = useState<ReceiptRow[]>(
    RECEIPT.items.map((l) => ({ ...l, _checked: !!l.match })),
  );
  const [showHow, setShowHow] = useState(false);

  const summary = useMemo(() => {
    let auto = 0;
    let guess = 0;
    let none = 0;
    lines.forEach((l) => {
      if (!l.match) none++;
      else if (l.match.confidence === 'auto') auto++;
      else guess++;
    });
    return { auto, guess, none };
  }, [lines]);

  const confirmCount = lines.filter((l) => l._checked && l.match).length;
  const toggle = (i: number) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, _checked: !l._checked } : l)));
  const swap = (i: number, altName: string) =>
    setLines((ls) =>
      ls.map((l, idx) =>
        idx === i && l.match
          ? { ...l, match: { ...l.match, name: altName, confidence: 'auto' as const } }
          : l,
      ),
    );

  const indexed = lines.map((l, i) => ({ l, i }));
  const guessRows = indexed.filter(({ l }) => l.match && l.match.confidence === 'guess');
  const noneRows = indexed.filter(({ l }) => !l.match);
  const autoRows = indexed.filter(({ l }) => l.match && l.match.confidence === 'auto');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div
        style={{
          padding: '22px 28px 18px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--paper-warm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: 'var(--orange-tint)',
              color: 'var(--orange-deep)',
              display: 'grid',
              placeItems: 'center',
              flex: '0 0 auto',
            }}
          >
            <Icon name="receipt" size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...EYEBROW, color: 'var(--ink-muted)' }}>
              {RECEIPT.store} · {RECEIPT.when}
            </div>
            <div
              className="serif"
              style={{ fontSize: 22, color: 'var(--ink)', marginTop: 4, letterSpacing: -0.3 }}
            >
              {lines.length} items found · <span className="tnum">${RECEIPT.total.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 14,
                marginTop: 6,
                fontSize: 12,
                color: 'var(--ink-muted)',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <SummaryDot color="var(--green)" label={`${summary.auto} auto-matched`} />
              <SummaryDot color="var(--amber)" label={`${summary.guess} need a look`} />
              <SummaryDot color="var(--tomato)" label={`${summary.none} couldn't match`} />
              <button
                onClick={() => setShowHow((v) => !v)}
                style={{
                  marginLeft: 'auto',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ink-soft)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: 'inherit',
                }}
              >
                <Icon name="info" size={13} /> How it works
              </button>
            </div>
          </div>
        </div>
        {showHow && (
          <div
            style={{
              marginTop: 14,
              padding: '12px 14px',
              background: 'var(--green-tint)',
              border: '1px solid var(--green-soft)',
              borderRadius: 10,
              fontSize: 12.5,
              color: 'var(--ink-2)',
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: 'var(--green-deep)' }}>Pilot's matching:</strong> receipt lines
            are abbreviated, so each runs through {RECEIPT.store}'s catalog (or PLU codes for
            produce) plus fuzzy text matching. Expiry uses category averages. You can always edit
            before saving.
          </div>
        )}
      </div>

      <div
        style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px', background: 'var(--bg)' }}
      >
        {guessRows.length > 0 && (
          <Section
            title="Needs a look"
            count={guessRows.length}
            subtitle="Pilot's best guess — tap to swap if it's wrong."
            accent="var(--amber)"
            defaultOpen
          >
            <div style={{ display: 'grid', gap: 10 }}>
              {guessRows.map(({ l, i }) => (
                <ReceiptRowView
                  key={i}
                  line={l}
                  checked={l._checked}
                  onToggle={() => toggle(i)}
                  onSwap={(alt) => swap(i, alt)}
                />
              ))}
            </div>
          </Section>
        )}
        {noneRows.length > 0 && (
          <Section
            title="Couldn't match"
            count={noneRows.length}
            subtitle="Pilot didn't recognize this line. Add it yourself or skip."
            accent="var(--tomato)"
            defaultOpen
          >
            <div style={{ display: 'grid', gap: 10 }}>
              {noneRows.map(({ l, i }) => (
                <ReceiptRowView key={i} line={l} checked={false} onToggle={() => {}} />
              ))}
            </div>
          </Section>
        )}
        <Section
          title="Auto-matched"
          count={autoRows.length}
          subtitle="Pilot is confident on these — expiry estimated from category averages."
          accent="var(--green)"
          defaultOpen
        >
          <div style={{ display: 'grid', gap: 8 }}>
            {autoRows.map(({ l, i }) => (
              <ReceiptRowView key={i} line={l} checked={l._checked} onToggle={() => toggle(i)} />
            ))}
          </div>
        </Section>
      </div>

      <div
        style={{
          padding: '14px 28px',
          borderTop: '1px solid var(--line)',
          background: 'var(--paper-warm)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ ...EYEBROW, color: 'var(--ink-muted)' }}>Ready to save</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>
            {confirmCount} of {lines.length} items will be added to your pantry
          </div>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          iconRight="arrowRight"
          size="lg"
          onClick={() => onConfirm(lines.filter((l) => l._checked && l.match))}
        >
          Add {confirmCount} to pantry
        </Button>
      </div>
    </div>
  );
}

function ReceiptFlow({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'capture' | 'detecting' | 'review' | 'done'>('capture');
  const [confirmed, setConfirmed] = useState<ReceiptRow[]>([]);
  const soon = confirmed
    .filter((l) => l.match && l.match.expDays > 0 && l.match.expDays <= 7)
    .map((l) => ({ name: l.match!.name, illo: l.match!.illo, expDays: l.match!.expDays }));

  return (
    <Shell
      title="Scan receipt"
      icon="receipt"
      ink="var(--orange-deep)"
      accent="var(--orange)"
      phases={['capture', 'detecting', 'review', 'done']}
      phase={phase}
      onClose={onClose}
    >
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
          display: phase === 'review' ? 'flex' : 'block',
          flexDirection: 'column',
        }}
      >
        {phase === 'capture' && <ReceiptCapture onCapture={() => setPhase('detecting')} />}
        {phase === 'detecting' && <ReceiptDetecting onDone={() => setPhase('review')} />}
        {phase === 'review' && (
          <ReceiptReview
            onClose={onClose}
            onConfirm={(items) => {
              setConfirmed(items);
              setPhase('done');
              fireToast(`${items.length} items added to pantry`);
            }}
          />
        )}
        {phase === 'done' && (
          <DonePhase
            heading={`Pantry updated · ${confirmed.length} items added`}
            blurb="Each item has an estimated expiry. Pilot will nudge you when something's about to turn."
            soonLabel="Eat first"
            soon={soon}
            onClose={onClose}
          />
        )}
      </div>
    </Shell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  BARCODE FLOW
// ════════════════════════════════════════════════════════════════════════════
const QTY_BTN: CSSProperties = {
  width: 26,
  height: 26,
  display: 'grid',
  placeItems: 'center',
  background: 'var(--bg-tint)',
  border: '1px solid var(--line)',
  borderRadius: 7,
  color: 'var(--ink-2)',
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: 600,
  fontFamily: 'inherit',
  lineHeight: 1,
  padding: 0,
};

type TrayItem = CatalogProduct & { qty: number };

function BarcodeGlyph({ seed, height = 54 }: { seed: string; height?: number }) {
  const widths = useMemo(() => barcodeBars(seed), [seed]);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height }}>
      {widths.map((w, i) => (
        <div
          key={i}
          style={{
            width: w,
            height: i % 7 === 0 ? height : height - 6,
            background: i % 2 ? 'transparent' : 'var(--ink)',
          }}
        />
      ))}
    </div>
  );
}

function BarcodeScan({
  tray,
  setTray,
  onReview,
  onClose,
}: {
  tray: TrayItem[];
  setTray: React.Dispatch<React.SetStateAction<TrayItem[]>>;
  onReview: () => void;
  onClose: () => void;
}) {
  const [decoding, setDecoding] = useState(false);
  const [flash, setFlash] = useState<CatalogProduct | null>(null);
  const nextIdx = tray.length;
  const done = nextIdx >= CATALOG.length;

  // Track the decode/flash timers so they're cleared if the overlay closes
  // mid-scan — otherwise the callbacks fire setState on an unmounted tree.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const scanNext = () => {
    if (decoding || done) return;
    setDecoding(true);
    const decode = setTimeout(() => {
      const p = CATALOG[nextIdx];
      setFlash(p);
      setTray((t) => [...t, { ...p, qty: 1 }]);
      setDecoding(false);
      const clear = setTimeout(() => setFlash((f) => (f === p ? null : f)), 1100);
      timers.current.push(clear);
    }, 700);
    timers.current.push(decode);
  };
  const setQty = (i: number, d: number) =>
    setTray((t) => t.map((it, idx) => (idx === i ? { ...it, qty: Math.max(1, it.qty + d) } : it)));
  const remove = (i: number) => setTray((t) => t.filter((_, idx) => idx !== i));

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1fr 360px', minHeight: 0, height: '100%' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          padding: '26px 26px 22px',
          borderRight: '1px solid var(--line)',
          overflowY: 'auto',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...EYEBROW, color: 'var(--sky-ink)' }}>Barcode scan</div>
          <h2 className="serif" style={{ margin: '8px 0 4px', fontSize: 23, letterSpacing: -0.3 }}>
            Scan packaged items one by one.
          </h2>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5, maxWidth: 380 }}>
            Pilot looks up the product database for name, brand, size, nutrition, and shelf life.
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            width: 340,
            height: 250,
            background: 'var(--ink)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: 'var(--sh-lift)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '38px 40px',
              border: '2px solid rgba(253,250,243,.25)',
              borderRadius: 10,
            }}
          />
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <div
              style={{
                background: '#FBF6E8',
                padding: '16px 20px 10px',
                borderRadius: 6,
                transform: 'rotate(-1.5deg)',
                boxShadow: '0 8px 24px rgba(0,0,0,.4)',
              }}
            >
              <BarcodeGlyph seed={done ? 'done' : CATALOG[nextIdx].upc} height={56} />
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: '#3B342A',
                  textAlign: 'center',
                  marginTop: 6,
                  letterSpacing: 2,
                }}
              >
                {done ? '— — — — —' : CATALOG[nextIdx].upc}
              </div>
            </div>
          </div>
          {!done && (
            <div
              style={{
                position: 'absolute',
                left: 40,
                right: 40,
                top: '50%',
                height: 2,
                background: 'var(--tomato)',
                boxShadow: '0 0 12px 2px rgba(199,62,46,.7)',
                animation: 'ppBarLaser 1.8s ease-in-out infinite',
              }}
            />
          )}
          {decoding && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(122,162,192,.18)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Pill tone="sky" size="md" icon="barcode">
                Decoding…
              </Pill>
            </div>
          )}
          {flash && !decoding && (
            <div
              style={{
                position: 'absolute',
                left: 14,
                right: 14,
                bottom: 14,
                background: 'var(--paper)',
                borderRadius: 12,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: 'var(--sh-2)',
                animation: 'ppPop 240ms ease-out',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'var(--bg-tint)',
                  display: 'grid',
                  placeItems: 'center',
                  flex: '0 0 auto',
                }}
              >
                <Illo name={flash.illo} size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                  {flash.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                  {flash.brand} · {flash.size}
                </div>
              </div>
              <span style={{ color: 'var(--green)' }}>
                <Icon name="checkCircle" size={20} />
              </span>
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: 0.5,
              color: 'rgba(253,250,243,.6)',
              textTransform: 'uppercase',
            }}
          >
            {done ? 'All sample items scanned' : 'Align the barcode in frame'}
          </div>
        </div>
        <Button
          variant="primary"
          icon="barcode"
          size="lg"
          onClick={scanNext}
          disabled={done || decoding}
        >
          {done
            ? 'Nothing left to scan'
            : decoding
              ? 'Decoding…'
              : nextIdx === 0
                ? 'Scan an item'
                : 'Scan next item'}
        </Button>
        <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
          Demo · each tap reveals the next sample product
        </div>
      </div>

      <div
        style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--bg)' }}
      >
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ ...EYEBROW, color: 'var(--ink-muted)' }}>Scanned</div>
          <div className="serif" style={{ fontSize: 20, color: 'var(--ink)', marginTop: 2 }}>
            {tray.length} {tray.length === 1 ? 'item' : 'items'}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 14,
            display: 'grid',
            gap: 8,
            alignContent: 'start',
          }}
        >
          {tray.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: '40px 16px' }}>
              <div style={{ opacity: 0.5, marginBottom: 10 }}>
                <Icon name="barcode" size={34} />
              </div>
              <div style={{ fontSize: 13 }}>Scan your first item to build the batch.</div>
            </div>
          )}
          {tray.map((it, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 11,
                padding: '9px 10px',
                animation: 'ppPop 200ms ease-out',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'var(--bg-tint)',
                  border: '1px solid var(--line-soft)',
                  display: 'grid',
                  placeItems: 'center',
                  flex: '0 0 auto',
                }}
              >
                <Illo name={it.illo} size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {it.name}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-muted)' }}>
                  {it.brand} · {it.size}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: '0 0 auto' }}>
                <button
                  onClick={() => setQty(i, -1)}
                  aria-label={`Decrease ${it.name}`}
                  style={QTY_BTN}
                >
                  −
                </button>
                <span
                  className="tnum"
                  style={{
                    minWidth: 18,
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--ink-2)',
                  }}
                >
                  {it.qty}
                </span>
                <button
                  onClick={() => setQty(i, 1)}
                  aria-label={`Increase ${it.name}`}
                  style={QTY_BTN}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => remove(i)}
                aria-label={`Remove ${it.name}`}
                style={{ ...QTY_BTN, color: 'var(--ink-soft)' }}
              >
                <Icon name="trash" size={13} />
              </button>
            </div>
          ))}
        </div>
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--line)',
            background: 'var(--paper-warm)',
            display: 'flex',
            gap: 10,
          }}
        >
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            iconRight="arrowRight"
            full
            onClick={onReview}
            disabled={tray.length === 0}
          >
            Review {tray.length || ''}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BarcodeReview({
  tray,
  setTray,
  onConfirm,
  onBack,
}: {
  tray: TrayItem[];
  setTray: React.Dispatch<React.SetStateAction<TrayItem[]>>;
  onConfirm: (items: TrayItem[]) => void;
  onBack: () => void;
}) {
  const totalUnits = tray.reduce((s, it) => s + it.qty, 0);
  const totalCost = tray.reduce((s, it) => s + it.qty * it.price, 0);
  const setQty = (i: number, d: number) =>
    setTray((t) => t.map((it, idx) => (idx === i ? { ...it, qty: Math.max(1, it.qty + d) } : it)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div
        style={{
          padding: '22px 28px 16px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--paper-warm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: '#E4EDF3',
              color: 'var(--sky-ink)',
              display: 'grid',
              placeItems: 'center',
              flex: '0 0 auto',
            }}
          >
            <Icon name="barcode" size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...EYEBROW, color: 'var(--ink-muted)' }}>Confirm your batch</div>
            <div
              className="serif"
              style={{ fontSize: 22, color: 'var(--ink)', marginTop: 3, letterSpacing: -0.3 }}
            >
              {tray.length} products · {totalUnits} units ·{' '}
              <span className="tnum">${totalCost.toFixed(2)}</span>
            </div>
          </div>
          <Pill tone="green" size="md" icon="check">
            Matched in catalog
          </Pill>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 28px 28px',
          background: 'var(--bg)',
          display: 'grid',
          gap: 10,
        }}
      >
        {tray.map((it, i) => (
          <Card key={i} pad={14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  background: 'var(--bg-tint)',
                  border: '1px solid var(--line-soft)',
                  display: 'grid',
                  placeItems: 'center',
                  flex: '0 0 auto',
                }}
              >
                <Illo name={it.illo} size={32} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>
                  {it.name}{' '}
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 500 }}>· {it.brand}</span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-muted)',
                    marginTop: 3,
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{it.upc}</span>
                  <span>·</span>
                  <span>{it.cat}</span>
                  <span>·</span>
                  <span>{it.size}</span>
                  <span>·</span>
                  <span className="tnum">{it.kcal} cal</span>
                </div>
              </div>
              <Pill
                tone={expiryTone(it.expDays)}
                size="sm"
                icon={it.expDays === 0 ? null : 'timer'}
              >
                {expiryLabel(it.expDays)}
              </Pill>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: '0 0 auto' }}>
                <button
                  onClick={() => setQty(i, -1)}
                  aria-label={`Decrease ${it.name}`}
                  style={QTY_BTN}
                >
                  −
                </button>
                <span
                  className="tnum"
                  style={{
                    minWidth: 20,
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--ink-2)',
                  }}
                >
                  {it.qty}
                </span>
                <button
                  onClick={() => setQty(i, 1)}
                  aria-label={`Increase ${it.name}`}
                  style={QTY_BTN}
                >
                  +
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div
        style={{
          padding: '14px 28px',
          borderTop: '1px solid var(--line)',
          background: 'var(--paper-warm)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ ...EYEBROW, color: 'var(--ink-muted)' }}>Shelf life estimated</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>
            From product category averages — edit any item after saving.
          </div>
        </div>
        <Button variant="ghost" icon="chevronLeft" onClick={onBack}>
          Scan more
        </Button>
        <Button variant="primary" iconRight="arrowRight" size="lg" onClick={() => onConfirm(tray)}>
          Add {totalUnits} to pantry
        </Button>
      </div>
    </div>
  );
}

function BarcodeFlow({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'scan' | 'review' | 'done'>('scan');
  const [tray, setTray] = useState<TrayItem[]>([]);
  const soon = tray
    .filter((it) => it.expDays > 0 && it.expDays <= 9)
    .map((it) => ({ name: it.name, illo: it.illo, expDays: it.expDays }));
  const units = tray.reduce((s, it) => s + it.qty, 0);

  return (
    <Shell
      title="Scan barcode"
      icon="barcode"
      ink="var(--sky-ink)"
      accent="var(--sky)"
      phases={['scan', 'review', 'done']}
      phase={phase}
      onClose={onClose}
    >
      <style>{`@keyframes ppBarLaser { 0%,100% { transform: translateY(-70px); } 50% { transform: translateY(70px); } }`}</style>
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {phase === 'scan' && (
          <BarcodeScan
            tray={tray}
            setTray={setTray}
            onReview={() => setPhase('review')}
            onClose={onClose}
          />
        )}
        {phase === 'review' && (
          <BarcodeReview
            tray={tray}
            setTray={setTray}
            onBack={() => setPhase('scan')}
            onConfirm={(items) => {
              const u = items.reduce((s, it) => s + it.qty, 0);
              setPhase('done');
              fireToast(`${u} units added to pantry`);
            }}
          />
        )}
        {phase === 'done' && (
          <DonePhase
            heading={`${units} units added to your pantry`}
            blurb="Nutrition and shelf life came straight from the product database. Pilot's tracking them now."
            soonLabel="Use soon"
            soon={soon}
            onClose={onClose}
          />
        )}
      </div>
    </Shell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  FRIDGE FLOW
// ════════════════════════════════════════════════════════════════════════════
function FridgeView({ revealed = 0 }: { revealed?: number }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4/3',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #E9EFF1 0%, #CBDAE0 55%, #B3C6CE 100%)',
        boxShadow: 'inset 0 0 60px rgba(40,60,70,.25)',
      }}
    >
      {[39, 86].map((top, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '3%',
            right: '3%',
            top: `${top}%`,
            height: 5,
            background: 'rgba(255,255,255,.55)',
            borderRadius: 3,
            boxShadow: '0 3px 6px rgba(40,60,70,.18)',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 0 6px rgba(255,255,255,.18)',
        }}
      />
      {DETECTED.map((d) => (
        <div
          key={d.name}
          style={{
            position: 'absolute',
            left: `${d.box.x}%`,
            top: `${d.box.y}%`,
            width: `${d.box.w}%`,
            height: `${d.box.h}%`,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Illo name={d.illo} size={54} />
        </div>
      ))}
      {DETECTED.slice(0, revealed).map((d, i) => (
        <div
          key={'box' + i}
          style={{
            position: 'absolute',
            left: `${d.box.x}%`,
            top: `${d.box.y}%`,
            width: `${d.box.w}%`,
            height: `${d.box.h}%`,
            border: `2px solid ${boxColor(d.conf)}`,
            borderRadius: 6,
            boxShadow: `0 0 0 1px rgba(255,255,255,.4), 0 0 14px ${boxColor(d.conf)}55`,
            animation: 'ppBoxIn 280ms cubic-bezier(.2,.8,.2,1)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -19,
              left: -2,
              background: boxColor(d.conf),
              color: '#FDFAF3',
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: 0.2,
              padding: '2px 6px',
              borderRadius: 5,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {d.name}
            <span style={{ opacity: 0.85 }}>{d.conf === 'auto' ? '✓' : '?'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

type FridgeRow = DetectedItem & { _checked: boolean };

function FridgeItemRow({
  item,
  checked,
  onToggle,
  onSwap,
}: {
  item: FridgeRow;
  checked: boolean;
  onToggle: () => void;
  onSwap?: (alt: string) => void;
}) {
  const expanded = item.conf === 'guess';
  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderLeft: item.conf === 'guess' ? '3px solid var(--amber)' : '1px solid var(--line)',
        borderRadius: 12,
        padding: '12px 14px',
        opacity: checked ? 1 : 0.55,
        transition: 'opacity 160ms',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onToggle}
          aria-label={checked ? `Deselect ${item.name}` : `Select ${item.name}`}
          style={{
            width: 22,
            height: 22,
            borderRadius: 7,
            border: `1.5px solid ${checked ? 'var(--green)' : 'var(--line-strong)'}`,
            background: checked ? 'var(--green)' : 'transparent',
            color: '#FDFAF3',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            padding: 0,
            flex: '0 0 auto',
          }}
        >
          {checked && <Icon name="check" size={12} />}
        </button>
        <div
          style={{
            width: 38,
            height: 38,
            flex: '0 0 auto',
            borderRadius: 9,
            background: 'var(--bg-tint)',
            border: '1px solid var(--line-soft)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Illo name={item.illo} size={26} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{item.name}</span>
            {item.note && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: 'var(--amber-ink)',
                  background: 'var(--amber-soft)',
                  padding: '2px 7px',
                  borderRadius: 999,
                }}
              >
                {item.note}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-muted)',
              marginTop: 3,
              display: 'flex',
              gap: 8,
            }}
          >
            <span>{item.cat}</span>
            <span>·</span>
            <span>{item.qty}</span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
            flex: '0 0 auto',
          }}
        >
          <Pill
            tone={expiryTone(item.expDays)}
            size="sm"
            icon={item.expDays === 0 ? null : 'timer'}
          >
            {expiryLabel(item.expDays)}
          </Pill>
          {item.conf === 'auto' ? (
            <Pill tone="green" size="sm" icon="check">
              Recognized
            </Pill>
          ) : (
            <Pill tone="amber" size="sm" icon="alert">
              Needs a look
            </Pill>
          )}
        </div>
      </div>
      {expanded && item.alternates && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 12px',
            background: 'var(--amber-soft)',
            borderRadius: 9,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--amber-ink)', fontWeight: 600 }}>
            Pilot's guess — or:
          </span>
          {item.alternates.map((alt) => (
            <button
              key={alt}
              onClick={() => onSwap?.(alt)}
              style={{
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 600,
                background: 'var(--paper)',
                border: '1px solid var(--amber-line)',
                borderRadius: 999,
                color: 'var(--ink-2)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {alt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FridgeReview({
  onConfirm,
  onClose,
}: {
  onConfirm: (items: SoonItem[]) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<FridgeRow[]>(DETECTED.map((d) => ({ ...d, _checked: true })));
  const [added, setAdded] = useState<Set<string>>(() => new Set());

  const toggle = (i: number) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, _checked: !it._checked } : it)));
  const swap = (i: number, alt: string) =>
    setItems((arr) =>
      arr.map((it, idx) =>
        idx === i ? { ...it, name: alt, conf: 'auto' as const, note: undefined } : it,
      ),
    );

  const indexed = items.map((it, i) => ({ it, i }));
  const autoRows = indexed.filter(({ it }) => it.conf === 'auto');
  const guessRows = indexed.filter(({ it }) => it.conf === 'guess');
  const confirmCount = items.filter((it) => it._checked).length + added.size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div
        style={{
          padding: '20px 28px 16px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--paper-warm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: '#EDE2EA',
              color: 'var(--plum)',
              display: 'grid',
              placeItems: 'center',
              flex: '0 0 auto',
            }}
          >
            <Icon name="camera" size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...EYEBROW, color: 'var(--ink-muted)' }}>What Pilot saw</div>
            <div
              className="serif"
              style={{ fontSize: 22, color: 'var(--ink)', marginTop: 3, letterSpacing: -0.3 }}
            >
              {items.length} items detected
            </div>
            <div
              style={{
                display: 'flex',
                gap: 14,
                marginTop: 6,
                fontSize: 12,
                color: 'var(--ink-muted)',
              }}
            >
              <SummaryDot color="var(--green)" label={`${autoRows.length} recognized`} />
              <SummaryDot color="var(--amber)" label={`${guessRows.length} need a look`} />
            </div>
          </div>
        </div>
      </div>
      <div
        style={{ flex: 1, overflowY: 'auto', padding: '18px 28px 28px', background: 'var(--bg)' }}
      >
        {guessRows.length > 0 && (
          <Section
            title="Needs a look"
            count={guessRows.length}
            subtitle="Pilot isn't sure — confirm or swap before saving."
            accent="var(--amber)"
            defaultOpen
          >
            <div style={{ display: 'grid', gap: 10 }}>
              {guessRows.map(({ it, i }) => (
                <FridgeItemRow
                  key={i}
                  item={it}
                  checked={it._checked}
                  onToggle={() => toggle(i)}
                  onSwap={(alt) => swap(i, alt)}
                />
              ))}
            </div>
          </Section>
        )}
        <Section
          title="Recognized"
          count={autoRows.length}
          subtitle="High-confidence matches — freshness estimated from type."
          accent="var(--green)"
          defaultOpen
        >
          <div style={{ display: 'grid', gap: 8 }}>
            {autoRows.map(({ it, i }) => (
              <FridgeItemRow key={i} item={it} checked={it._checked} onToggle={() => toggle(i)} />
            ))}
          </div>
        </Section>
        <Section
          title="Pilot can't see these"
          count={HIDDEN.length}
          subtitle="Often stocked but hidden in a photo. Tap to add if you have them."
          accent="var(--sky)"
          defaultOpen
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {HIDDEN.map((h) => {
              const on = added.has(h.name);
              return (
                <button
                  key={h.name}
                  onClick={() =>
                    setAdded((s) => {
                      const n = new Set(s);
                      if (on) n.delete(h.name);
                      else n.add(h.name);
                      return n;
                    })
                  }
                  aria-label={on ? `Remove ${h.name}` : `Add ${h.name}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 40,
                    padding: '0 14px 0 8px',
                    borderRadius: 999,
                    background: on ? 'var(--green)' : 'var(--paper)',
                    color: on ? '#FDFAF3' : 'var(--ink-2)',
                    border: `1px solid ${on ? 'var(--green)' : 'var(--line)'}`,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      background: on ? 'rgba(255,255,255,.18)' : 'var(--bg-tint)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Illo name={h.illo} size={18} />
                  </span>
                  {h.name}
                  <Icon name={on ? 'check' : 'plus'} size={13} />
                </button>
              );
            })}
          </div>
        </Section>
      </div>
      <div
        style={{
          padding: '14px 28px',
          borderTop: '1px solid var(--line)',
          background: 'var(--paper-warm)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ ...EYEBROW, color: 'var(--ink-muted)' }}>Ready to save</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>
            {confirmCount} items will be added to your pantry
          </div>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          iconRight="arrowRight"
          size="lg"
          onClick={() =>
            onConfirm([
              ...items
                .filter((it) => it._checked)
                .map((it) => ({ name: it.name, illo: it.illo, expDays: it.expDays })),
              ...HIDDEN.filter((h) => added.has(h.name)).map((h) => ({
                name: h.name,
                illo: h.illo,
                expDays: h.expDays,
              })),
            ])
          }
        >
          Add {confirmCount} to pantry
        </Button>
      </div>
    </div>
  );
}

function FridgeFlow({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'capture' | 'detecting' | 'review' | 'done'>('capture');
  // Confirmed = the checked detections + any "can't see these" HIDDEN items the
  // user added, so the count, toast, and done-screen all agree.
  const [confirmed, setConfirmed] = useState<SoonItem[]>([]);
  const soon = confirmed.filter((it) => it.expDays > 0 && it.expDays <= 7);

  return (
    <Shell
      title="Photo of fridge"
      icon="camera"
      ink="var(--plum)"
      accent="var(--plum)"
      phases={['capture', 'detecting', 'review', 'done']}
      phase={phase}
      onClose={onClose}
    >
      <style>{`@keyframes ppBoxIn { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: scale(1); } }`}</style>
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
          display: phase === 'review' ? 'flex' : 'block',
          flexDirection: 'column',
        }}
      >
        {phase === 'capture' && <FridgeCapture onCapture={() => setPhase('detecting')} />}
        {phase === 'detecting' && <FridgeDetecting onDone={() => setPhase('review')} />}
        {phase === 'review' && (
          <FridgeReview
            onClose={onClose}
            onConfirm={(items) => {
              setConfirmed(items);
              setPhase('done');
              fireToast(`${items.length} items added to pantry`);
            }}
          />
        )}
        {phase === 'done' && (
          <DonePhase
            heading={`Pantry updated · ${confirmed.length} items added`}
            blurb="Pilot's watching freshness now and will nudge you before anything turns."
            soonLabel="Eat first"
            soon={soon}
            onClose={onClose}
          />
        )}
      </div>
    </Shell>
  );
}

function FridgeCapture({ onCapture }: { onCapture: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
        padding: '30px 32px 26px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...EYEBROW, color: 'var(--plum)' }}>Fridge photo</div>
        <h2 className="serif" style={{ margin: '8px 0 6px', fontSize: 26, letterSpacing: -0.4 }}>
          Open your fridge. Pilot reads the shelves.
        </h2>
        <div style={{ fontSize: 13.5, color: 'var(--ink-muted)', lineHeight: 1.5, maxWidth: 460 }}>
          One photo. Pilot spots what's inside, estimates how fresh each thing is, and flags
          anything you've forgotten about.
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          width: 420,
          maxWidth: '100%',
          padding: 10,
          background: 'var(--ink)',
          borderRadius: 18,
          boxShadow: 'var(--sh-lift)',
        }}
      >
        <FridgeView revealed={0} />
        <CornerBrackets inset={20} />
        <div
          style={{
            position: 'absolute',
            bottom: 22,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: 0.5,
            color: 'rgba(253,250,243,.8)',
            textTransform: 'uppercase',
            textShadow: '0 1px 3px rgba(0,0,0,.5)',
          }}
        >
          Fit the open fridge in frame
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="primary" icon="camera" onClick={onCapture}>
          Take photo
        </Button>
        <Button variant="secondary" icon="upload" onClick={onCapture}>
          Upload photo
        </Button>
      </div>
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          padding: '14px 16px',
          background: 'var(--green-tint)',
          border: '1px solid var(--green-soft)',
          borderRadius: 12,
          display: 'flex',
          gap: 12,
        }}
      >
        <span style={{ color: 'var(--green-deep)', flex: '0 0 auto', marginTop: 2 }}>
          <Icon name="sparkles" size={16} />
        </span>
        <div>
          <div
            style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 4 }}
          >
            How Pilot reads a fridge
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.55 }}>
            A vision model boxes each item it recognizes, then estimates freshness from type and
            typical storage life. Unlabeled containers and anything hidden, it asks about.
          </div>
        </div>
      </div>
    </div>
  );
}

function FridgeDetecting({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);
  const total = DETECTED.length;
  useEffect(() => {
    if (n >= total) {
      const t = setTimeout(onDone, 650);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((x) => x + 1), n === 0 ? 500 : 420);
    return () => clearTimeout(t);
  }, [n, total, onDone]);

  return (
    <div
      style={{
        padding: '26px 32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...EYEBROW, color: 'var(--plum)' }}>Detecting items</div>
        <h2 className="serif" style={{ margin: '6px 0', fontSize: 22, letterSpacing: -0.3 }}>
          {n >= total ? 'Got it — estimating freshness…' : `${n} item${n === 1 ? '' : 's'} found…`}
        </h2>
      </div>
      <div
        style={{
          position: 'relative',
          width: 420,
          maxWidth: '100%',
          padding: 10,
          background: 'var(--ink)',
          borderRadius: 18,
          boxShadow: 'var(--sh-lift)',
        }}
      >
        <FridgeView revealed={n} />
        {n < total && (
          <div
            style={{
              position: 'absolute',
              left: 10,
              right: 10,
              top: `${10 + (n / total) * 78}%`,
              height: 3,
              background: 'linear-gradient(90deg, transparent, var(--plum), transparent)',
              boxShadow: '0 0 14px 2px rgba(110,58,79,.6)',
              transition: 'top 380ms ease-out',
            }}
          />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'var(--plum)' }}>
          <Icon name="sparkles" size={12} />
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--ink-muted)', fontWeight: 600 }}>
          {n >= total
            ? 'Matching to your pantry…'
            : `Vision pass · ${Math.round((n / total) * 100)}%`}
        </span>
      </div>
    </div>
  );
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────
export function Capture({ kind, onClose }: { kind: CaptureKind; onClose: () => void }) {
  if (kind === 'receipt') return <ReceiptFlow onClose={onClose} />;
  if (kind === 'barcode') return <BarcodeFlow onClose={onClose} />;
  return <FridgeFlow onClose={onClose} />;
}
