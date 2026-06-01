// src/screens/Extras.tsx — Phase 4 port of extras.jsx (window.PPExtras.*)
//
// Four routed screens, kept in one file per ADR-004 (split into separate files is a
// v1.1 cleanup):
//   • Insights  — tabbed: Budget · Food waste · Nutrition · Memory · Takeout swap
//   • Household — roommates, shared shelf, activity
//   • Imports   — receipt / barcode / fridge capture entry points + recipe URL import
//   • Settings  — profile, diet prefs, equipment
//
// All read-only over @/data/mock (the only mutable state — DietPrefs toggles and the
// Settings sidebar selection — is local UI state, NOT mock-derived, so ADR-010 N/A).
//
// All window.PP* globals removed. Documented deviations from the legacy module:
//   1. NOT ported: `Expiry` and `Leftovers` (exported by legacy PPExtras but never
//      routed — their content lives in Pantry.tsx's tabs in the converted app).
//   2. NOT ported: the ReceiptScanner / BarcodeScanner / FridgeScanner capture views —
//      they are capture-overlay content (legacy window.PPCapture), not part of the
//      Imports screen. The Imports method cards show a placeholder toast until the
//      capture overlay converts.
//   3. window.PPToast → fireToast (useToastStore.getState().push); window.PPNav('pantry')
//      → navigate('/pantry'); window.PPCookNow → placeholder toast (CookNow overlay
//      deferred, matches Cook.tsx). The toast `{ icon }` option is dropped.

import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { mock } from '@/data/mock';
import { useToastStore, useNavStore } from '@/stores';
import type { CaptureKind } from '@/stores/nav';
import type { ActivityEntry } from '@/types';

const fireToast = (msg: string) => useToastStore.getState().push(msg);
const openCapture = (kind: CaptureKind) => useNavStore.getState().setCapture(kind);

// ─── Icon ─────────────────────────────────────────────────────────────────

const ICON_PATHS: Record<string, string> = {
  sparkles:
    'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M6 2l.8 2.2L9 5l-2.2.8L6 8l-.8-2.2L3 5l2.2-.8z M17 16l.6 1.8L19.4 18l-1.8.6L17 20.4l-.6-1.8L14.6 18l1.8-.6z',
  check: 'M20 6L9 17l-5-5',
  alert:
    'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  wallet:
    'M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7zm14 5a1 1 0 110-2 1 1 0 010 2z',
  leaf: 'M17 8C8 10 5.9 16.17 3.82 22 8 22 12 21 14 18c2-3 0-7-3-7s-5 3-3 7',
  cart: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM16 10a4 4 0 01-8 0',
  plus: 'M12 5v14M5 12h14',
  arrowRight: 'M5 12h14M13 5l7 7-7 7',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  arrowDown: 'M12 5v14M5 12l7 7 7-7',
  chevronRight: 'M9 6l6 6-6 6',
  save: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8',
  trash:
    'M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14',
  edit: 'M14 4l6 6L9 21H3v-6z',
  heart: 'M12 21s-7-4.5-9-9c-1.5-3 1-7 5-7 2 0 3 1 4 2 1-1 2-2 4-2 4 0 6.5 4 5 7-2 4.5-9 9-9 9z',
  timer: 'M12 6a8 8 0 110 16 8 8 0 010-16z M10 2h4 M12 10v4',
  // chef / scan / camera / bag — multi-element legacy glyphs folded into one stroked `d`
  chef: 'M6 13a4 4 0 1 1 2-7.5 4 4 0 0 1 8 0A4 4 0 1 1 18 13v4H6z M6 17h12v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z',
  scan: 'M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2 M7 12h10',
  bag: 'M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z M9 7a3 3 0 1 1 6 0',
  camera:
    'M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z M8.5 13a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0',
  barcode: 'M4 5v14M7 5v14M10 5v14M14 5v14M17 5v14M20 5v14',
  receipt: 'M6 2h12v19l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3V2z M9 7h6 M9 11h6 M9 15h4',
};

interface IconProps {
  name: string;
  size?: number;
  stroke?: string;
}
function Icon({ name, size = 18, stroke = 'currentColor' }: IconProps) {
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
    >
      <path d={ICON_PATHS[name] ?? ''} />
    </svg>
  );
}

// ─── Illo ─────────────────────────────────────────────────────────────────

const ILLO_COLORS: Record<string, string> = {
  rice: '#E8D9A8',
  bread: '#D4A853',
  chicken: '#C9884A',
  carrot: '#E07840',
  beans: '#8B6040',
  frozenveg: '#7ABFA8',
  berries: '#8E4A8E',
  chili: '#C93A3A',
  banana: '#E8C840',
  milk: '#F0EAD6',
  tofu: '#F0EDD8',
  oats: '#C8A878',
  oil: '#C8B860',
  coffee: '#6B4226',
  salt: '#E8E8E0',
  pasta: '#E8CF88',
  cheese: '#E8B840',
  ricebag: '#D4C090',
  peanutbutter: '#C8904A',
  soy: '#8B7340',
  onion: '#C8A8C8',
  garlic: '#E8D8C0',
  tomato: '#C83A3A',
  pepper: '#3A9848',
  spinach: '#3B6E3D',
  egg: '#C99325',
  yogurt: '#E8DCC8',
  apple: '#C73E2E',
};

interface IlloProps {
  name: string;
  size?: number;
}
function Illo({ name, size = 48 }: IlloProps) {
  const bg = ILLO_COLORS[name] ?? 'var(--line, rgba(0,0,0,.1))';
  return (
    <div
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
        background: bg,
        opacity: 0.82,
        flexShrink: 0,
      }}
    />
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────

interface CardProps {
  pad?: number;
  style?: CSSProperties;
  children?: ReactNode;
  hover?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}
function Card({ pad = 20, style, children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--paper, #fff)',
        border: '1px solid var(--line, rgba(0,0,0,.1))',
        borderRadius: 16,
        padding: pad,
        boxShadow: 'var(--sh-1, 0 1px 4px rgba(0,0,0,.06))',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────

type PillTone = 'green' | 'orange' | 'tomato' | 'amber' | 'sky' | 'ink' | 'neutral' | 'ghost';

interface PillProps {
  tone?: PillTone;
  size?: 'sm' | 'md';
  children?: ReactNode;
  dot?: boolean;
  icon?: string;
}

const PILL_STYLES: Record<PillTone, { bg: string; color: string; border: string }> = {
  green: {
    bg: 'var(--green-tint, #eef7ee)',
    color: 'var(--green-deep, #2a5a2a)',
    border: 'var(--green-soft, rgba(59,110,61,.2))',
  },
  orange: {
    bg: 'var(--orange-tint, #fff3e8)',
    color: 'var(--orange-deep, #b05a10)',
    border: 'rgba(176,90,16,.2)',
  },
  tomato: {
    bg: 'var(--tomato-soft, #fff0ee)',
    color: 'var(--tomato-ink, #b02020)',
    border: 'var(--tomato-line, rgba(176,32,32,.2))',
  },
  amber: {
    bg: 'var(--amber-soft, #fff8e8)',
    color: 'var(--amber-ink, #9a6a00)',
    border: 'var(--amber-line, rgba(154,106,0,.2))',
  },
  sky: {
    bg: 'var(--sky-soft, #d9e4ec)',
    color: 'var(--sky-ink, #1f3b52)',
    border: 'var(--sky, #3a5f7a)',
  },
  ink: {
    bg: 'var(--ink, #1a1814)',
    color: 'var(--paper-warm, #fdfaf3)',
    border: 'var(--ink, #1a1814)',
  },
  neutral: { bg: 'rgba(0,0,0,.05)', color: 'var(--ink-muted, #8a8374)', border: 'transparent' },
  ghost: { bg: 'rgba(0,0,0,.04)', color: 'var(--ink-muted, #8a8374)', border: 'transparent' },
};

function Pill({ tone = 'neutral', size = 'sm', children, dot, icon }: PillProps) {
  const s = PILL_STYLES[tone];
  const pad = size === 'md' ? '4px 10px' : '3px 8px';
  const fs = size === 'md' ? 12 : 11;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: pad,
        fontSize: fs,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 999,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: 999,
            background: 'currentColor',
            flexShrink: 0,
          }}
        />
      )}
      {icon && <Icon name={icon} size={11} />}
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft' | 'orange';
  size?: 'sm';
  icon?: string;
  iconRight?: string;
  full?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
  children?: ReactNode;
}

const BTN_STYLES: Record<string, { bg: string; fg: string; bd: string }> = {
  primary: { bg: 'var(--ink, #1a1814)', fg: 'var(--paper-warm, #fdfaf3)', bd: 'none' },
  secondary: {
    bg: 'var(--paper-warm, #fdfaf3)',
    fg: 'var(--ink, #1a1814)',
    bd: '1px solid var(--line, rgba(0,0,0,.12))',
  },
  ghost: {
    bg: 'transparent',
    fg: 'var(--ink-2, #4a4535)',
    bd: '1px solid var(--line, rgba(0,0,0,.12))',
  },
  soft: {
    bg: 'var(--paper-warm, #fdfaf3)',
    fg: 'var(--ink-2, #4a4535)',
    bd: '1px solid var(--line-soft, rgba(0,0,0,.06))',
  },
  orange: { bg: 'var(--orange, #D9722B)', fg: '#FDFAF3', bd: 'none' },
};

function Button({
  variant = 'primary',
  size,
  icon,
  iconRight,
  full,
  onClick,
  style,
  children,
}: ButtonProps) {
  const s = BTN_STYLES[variant] ?? BTN_STYLES.primary;
  const pad = size === 'sm' ? '6px 12px' : '10px 18px';
  const fs = size === 'sm' ? 12 : 14;
  return (
    <button
      onClick={onClick}
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
        cursor: 'pointer',
        fontFamily: 'inherit',
        width: full ? '100%' : undefined,
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 12 : 14} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 12 : 14} />}
    </button>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────

interface TabDef {
  label: string;
  value: string;
}

function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: TabDef[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 4,
        background: 'var(--bg-tint)',
        padding: 4,
        borderRadius: 12,
        border: '1px solid var(--line)',
        flexWrap: 'wrap',
      }}
    >
      {tabs.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            style={{
              padding: '7px 14px',
              fontSize: 12.5,
              fontWeight: 600,
              background: active ? 'var(--paper)' : 'transparent',
              color: active ? 'var(--ink)' : 'var(--ink-muted)',
              border: 'none',
              borderRadius: 8,
              boxShadow: active ? 'var(--sh-1)' : 'none',
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        height: 30,
        background: active ? 'var(--ink)' : 'var(--paper)',
        color: active ? 'var(--paper-warm)' : 'var(--ink-2)',
        border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'all 160ms ease',
      }}
    >
      {children}
    </button>
  );
}

// ─── Ring (nestable via children) ──────────────────────────────────────────

interface RingProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
}
function Ring({
  value,
  size = 64,
  stroke = 8,
  color = 'var(--green)',
  trackColor = 'rgba(0,0,0,.06)',
  children,
}: RingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.min(100, value) / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </svg>
      {children && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Avatar / AvatarStack ───────────────────────────────────────────────────

function Avatar({
  initials,
  color = 'var(--green)',
  size = 32,
}: {
  initials: string;
  color?: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: color,
        color: '#FDFAF3',
        display: 'grid',
        placeItems: 'center',
        fontSize: size * 0.4,
        fontWeight: 700,
        letterSpacing: 0.3,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function AvatarStack({
  people,
  size = 32,
}: {
  people: Array<{ initials: string; color?: string }>;
  size?: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {people.map((p, i) => (
        <div
          key={i}
          style={{
            marginLeft: i === 0 ? 0 : -(size * 0.3),
            zIndex: people.length - i,
            width: size,
            height: size,
            borderRadius: 999,
            background: p.color ?? 'var(--ink, #1a1814)',
            color: '#FDFAF3',
            display: 'grid',
            placeItems: 'center',
            fontSize: size * 0.38,
            fontWeight: 700,
            border: '2px solid var(--paper-warm, #fdfaf3)',
          }}
        >
          {p.initials}
        </div>
      ))}
    </div>
  );
}

// ─── ActivityRow ──────────────────────────────────────────────────────────

function ActivityRow({ act }: { act: ActivityEntry }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '8px 0',
        borderBottom: '1px solid var(--line-soft)',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          flexShrink: 0,
          background: 'var(--bg-tint)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--ink-muted)',
        }}
      >
        <Icon name={act.icon} size={13} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.3 }}>
          <strong style={{ fontWeight: 600 }}>{act.who}</strong> {act.action}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{act.when}</div>
      </div>
    </div>
  );
}

// ─── SectionHead ──────────────────────────────────────────────────────────

function SectionHead({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10.5,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: 'var(--ink-muted)',
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          {eyebrow}
        </div>
        <h3 className="serif" style={{ margin: 0, fontSize: 20, color: 'var(--ink)' }}>
          {title}
        </h3>
      </div>
      {action}
    </div>
  );
}

// ═════════════ BUDGET ═══════════════════════════════════════════════════════

function BudgetStat({
  label,
  value,
  sub,
  tone,
  icon,
  up,
  down,
}: {
  label: string;
  value: string;
  sub: string;
  tone: 'green' | 'tomato' | 'amber' | 'neutral';
  icon: string;
  up?: boolean;
  down?: boolean;
}) {
  const fg =
    tone === 'green'
      ? 'var(--green)'
      : tone === 'tomato'
        ? 'var(--tomato)'
        : tone === 'amber'
          ? 'var(--amber)'
          : 'var(--ink-muted)';
  return (
    <Card pad={20}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span style={{ color: fg }}>
          <Icon name={icon} size={16} />
        </span>
        {up && (
          <Pill tone="green" size="sm" icon="arrowUp">
            Saved
          </Pill>
        )}
        {down && (
          <Pill tone="green" size="sm" icon="arrowDown">
            -28%
          </Pill>
        )}
      </div>
      <div className="serif tnum" style={{ fontSize: 28, color: 'var(--ink)', lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: 'var(--ink-muted)',
          marginTop: 4,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 4 }}>{sub}</div>
    </Card>
  );
}

function Donut({
  segments,
  size = 160,
}: {
  segments: { start: number; end: number; color: string }[];
  size?: number;
}) {
  const r = size / 2 - 16;
  const cx = size / 2,
    cy = size / 2;
  const toXY = (a: number): [number, number] => [
    cx + r * Math.cos(((a - 90) * Math.PI) / 180),
    cy + r * Math.sin(((a - 90) * Math.PI) / 180),
  ];
  return (
    <svg width={size} height={size}>
      {segments.map((s, i) => {
        const [x1, y1] = toXY(s.start);
        const [x2, y2] = toXY(s.end);
        const large = s.end - s.start > 180 ? 1 : 0;
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={s.color}
            stroke="var(--paper)"
            strokeWidth="3"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--paper)" />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="20"
        fill="var(--ink)"
        fontWeight="500"
      >
        $184
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="10.5"
        fill="var(--ink-muted)"
        fontWeight="600"
        style={{ letterSpacing: 0.5 }}
      >
        SPENT
      </text>
    </svg>
  );
}

function Budget() {
  const b = mock.budget;
  const total = b.byCategory.reduce((s, c) => s + c.amount, 0);
  let cumAngle = 0;
  const segments = b.byCategory.map((c) => {
    const pct = c.amount / total;
    const start = cumAngle;
    cumAngle += pct * 360;
    return { ...c, start, end: cumAngle, pct };
  });
  const weeklyMax = Math.max(...b.weekly);
  const storeMax = Math.max(...b.stores.map((x) => x.amount));

  return (
    <div style={{ padding: '28px 28px 56px', display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <BudgetStat
          label="Spent this month"
          value={`$${b.spent.toFixed(0)}`}
          sub={`of $${b.monthly} budget`}
          tone="green"
          icon="wallet"
        />
        <BudgetStat
          label="Saved from pantry"
          value={`$${b.savedFromPantry}`}
          sub="vs. takeout average"
          tone="green"
          icon="leaf"
          up
        />
        <BudgetStat
          label="Food waste"
          value={`$${b.waste.toFixed(2)}`}
          sub="3 items · -28% MoM"
          tone="tomato"
          icon="trash"
          down
        />
        <BudgetStat
          label="Avg meal cost"
          value="$1.85"
          sub="based on 19 meals"
          tone="neutral"
          icon="chef"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Spending trend */}
        <Card pad={22}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 0.6,
                  color: 'var(--ink-muted)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Weekly spend · November
              </div>
              <div
                className="serif tnum"
                style={{ fontSize: 30, color: 'var(--ink)', marginTop: 6, lineHeight: 1 }}
              >
                ${b.spent.toFixed(2)}
              </div>
            </div>
            <Pill tone="green" size="sm" icon="arrowDown">
              12% vs October
            </Pill>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              alignItems: 'end',
              height: 200,
            }}
          >
            {b.weekly.map((w, i) => {
              const h = (w / weeklyMax) * 160;
              return (
                <div
                  key={i}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                >
                  <div
                    className="tnum"
                    style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 600 }}
                  >
                    ${w.toFixed(0)}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: h,
                      borderRadius: '12px 12px 4px 4px',
                      background:
                        i === 3
                          ? 'var(--green)'
                          : 'linear-gradient(180deg, var(--orange) 0%, var(--orange-deep) 100%)',
                      opacity: i === 3 ? 1 : 0.85 - i * 0.05,
                      transition: 'height 600ms cubic-bezier(.2,.8,.2,1)',
                    }}
                  />
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 600 }}>
                    W{i + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Donut by category */}
        <Card pad={22}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.6,
              color: 'var(--ink-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 18,
            }}
          >
            Where it goes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Donut segments={segments} size={170} />
            <div style={{ flex: 1, display: 'grid', gap: 6 }}>
              {b.byCategory.map((c) => (
                <div key={c.cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>
                    {c.cat}
                  </span>
                  <span className="tnum" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                    ${c.amount.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Stores + Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18 }}>
        <Card pad={22}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--ink-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              By store
            </span>
            <Pill tone="green" size="sm">
              Aldi · best value
            </Pill>
          </div>
          {b.stores.map((s) => {
            const pct = (s.amount / storeMax) * 100;
            return (
              <div
                key={s.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--line-soft)',
                }}
              >
                <div style={{ flex: '0 0 110px', fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, background: 'var(--line-soft)', borderRadius: 999 }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--green) 0%, var(--basil) 100%)',
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
                <div
                  className="tnum"
                  style={{
                    flex: '0 0 60px',
                    fontSize: 12.5,
                    color: 'var(--ink-2)',
                    textAlign: 'right',
                    fontWeight: 600,
                  }}
                >
                  ${s.amount.toFixed(0)}
                </div>
                <div
                  style={{
                    flex: '0 0 60px',
                    fontSize: 11.5,
                    color: 'var(--ink-muted)',
                    textAlign: 'right',
                  }}
                >
                  {s.trips} trip{s.trips > 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </Card>

        <Card
          pad={22}
          style={{
            background: 'var(--ink)',
            color: 'var(--paper-warm)',
            borderColor: 'var(--ink)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ color: 'var(--amber)' }}>
              <Icon name="sparkles" size={14} />
            </span>
            <span
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'rgba(253,250,243,.6)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Pilot's insights
            </span>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { t: '$42 saved this week', b: 'Four pantry-based meals instead of takeout.' },
              {
                t: 'Spinach: 60% of waste',
                b: "You've tossed it twice. Try the smaller bag — or freeze on day 4.",
              },
              {
                t: 'Milk every 6 days',
                b: 'You buy half-gallons every 6 days. Pilot pre-staged that on the list.',
              },
            ].map((i) => (
              <div
                key={i.t}
                style={{
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--paper-warm)',
                    marginBottom: 4,
                  }}
                >
                  {i.t}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(253,250,243,.65)', lineHeight: 1.45 }}>
                  {i.b}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═════════════ WASTE ═════════════════════════════════════════════════════════

function Waste() {
  const monthCost = mock.wasteLog.reduce((s, x) => s + x.cost, 0);
  const byReason: Record<string, number> = {};
  mock.wasteLog.forEach((l) => {
    byReason[l.reason] = (byReason[l.reason] || 0) + l.cost;
  });
  const reasons = Object.entries(byReason).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ padding: '0 28px 28px', display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <BudgetStat
          label="Wasted this month"
          value={`$${monthCost.toFixed(2)}`}
          sub="5 items · -28% MoM"
          tone="tomato"
          icon="trash"
        />
        <BudgetStat
          label="Items rescued"
          value="3"
          sub="cooked before expiry"
          tone="green"
          icon="leaf"
          up
        />
        <BudgetStat
          label="Most wasted"
          value="Spinach"
          sub="60% of produce waste"
          tone="amber"
          icon="alert"
        />
        <BudgetStat
          label="No-waste days"
          value="7"
          sub="current streak"
          tone="green"
          icon="sparkles"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        <Card pad={22}>
          <SectionHead title="Waste log" eyebrow="Last 30 days" />
          <div style={{ marginTop: 10, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-tint)' }}>
                  {['Item', 'Reason', 'Qty', 'Cost', 'Date'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: 11,
                        color: 'var(--ink-muted)',
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mock.wasteLog.map((l, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--ink)' }}>
                      {l.item}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Pill tone="ghost" size="sm">
                        {l.reason}
                      </Pill>
                    </td>
                    <td
                      style={{ padding: '10px 14px', color: 'var(--ink-muted)' }}
                      className="tnum"
                    >
                      {l.qty}
                    </td>
                    <td
                      style={{ padding: '10px 14px', color: 'var(--tomato)', fontWeight: 600 }}
                      className="tnum"
                    >
                      ${l.cost.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--ink-soft)' }} className="tnum">
                      {l.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <Card pad={22}>
            <SectionHead title="Why food is dying" eyebrow="By reason" />
            <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
              {reasons.map(([r, c]) => (
                <div key={r}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}
                  >
                    <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>
                      {r}
                    </span>
                    <span className="tnum" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                      ${c.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ height: 5, background: 'var(--line-soft)', borderRadius: 999 }}>
                    <div
                      style={{
                        width: `${(c / monthCost) * 100}%`,
                        height: '100%',
                        background: 'var(--tomato)',
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            pad={22}
            style={{ background: 'var(--green-tint)', borderColor: 'var(--green-soft)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon name="sparkles" size={14} stroke="var(--green-deep)" />
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: 0.6,
                  color: 'var(--green-deep)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Pilot's tip
              </span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>
              You waste fresh produce most often when you buy bunches over 6oz. Try smaller bags or
              use frozen — the math says you'd save <strong className="tnum">~$11/month</strong>.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═════════════ MEMORY ═════════════════════════════════════════════════════════

function CookHeatmap() {
  const days: number[] = [];
  for (let i = 0; i < 84; i++) {
    days.push(Math.random() > 0.45 ? Math.floor(Math.random() * 4) + 1 : 0);
  }
  const colors = ['var(--line-soft)', '#D2DFB6', '#A8C68A', '#6B8E4E', 'var(--green-deep)'];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        {Array.from({ length: 12 }, (_, w) => (
          <div key={w} style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: 3 }}>
            {Array.from({ length: 7 }, (_, d) => (
              <div
                key={d}
                style={{ aspectRatio: '1', borderRadius: 3, background: colors[days[w * 7 + d]] }}
              />
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 14,
          fontSize: 11.5,
          color: 'var(--ink-muted)',
        }}
      >
        <span>Less</span>
        {colors.map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
        ))}
        <span>More</span>
        <span style={{ marginLeft: 'auto' }}>12 weeks</span>
      </div>
    </div>
  );
}

function MemoryDeep() {
  return (
    <div style={{ padding: '0 28px 28px', display: 'grid', gap: 18 }}>
      <Card
        pad={26}
        style={{ background: 'var(--ink)', color: 'var(--paper-warm)', borderColor: 'var(--ink)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(255,255,255,.06)',
              color: 'var(--amber)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="sparkles" size={22} />
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'rgba(253,250,243,.6)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Kitchen memory · 90 days
            </div>
            <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 28, letterSpacing: -0.4 }}>
              The patterns that quietly run your kitchen.
            </h2>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <Card pad={22}>
          <SectionHead title="Insights" eyebrow="What Pilot has learned" />
          <div style={{ display: 'grid', gap: 10 }}>
            {mock.kitchenMemory.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: 14,
                  background: 'var(--paper-warm)',
                  border: '1px solid var(--line-soft)',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--bg-tint)',
                    color: 'var(--ink-2)',
                    display: 'grid',
                    placeItems: 'center',
                    flex: '0 0 auto',
                  }}
                >
                  <Icon name={m.icon} size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.25 }}
                  >
                    {m.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'var(--ink-muted)',
                      marginTop: 4,
                      lineHeight: 1.5,
                    }}
                  >
                    {m.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card pad={22}>
          <SectionHead title="Cooking calendar" eyebrow="Days you actually cooked" />
          <CookHeatmap />
        </Card>
      </div>
    </div>
  );
}

// ═════════════ TAKEOUT SWAP ════════════════════════════════════════════════

function TakeoutSwap() {
  const totalSaved = mock.takeoutSwaps.reduce((s, x) => s + x.save, 0);
  return (
    <div style={{ padding: '0 28px 28px', display: 'grid', gap: 18 }}>
      <Card
        pad={26}
        style={{
          background: 'linear-gradient(160deg, var(--orange-tint) 0%, #F2C99C 100%)',
          borderColor: 'var(--orange-soft)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'var(--on-tint-pad)',
              color: 'var(--orange-deep)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="bag" size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--orange-deep)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Takeout swap
            </div>
            <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 26, letterSpacing: -0.4 }}>
              Tonight's craving, homemade —{' '}
              <em style={{ color: 'var(--tomato)', fontStyle: 'italic' }}>
                save ${totalSaved.toFixed(2)}
              </em>
              .
            </h2>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
              When the takeout app calls, Pilot points out the home version you have ingredients
              for.
            </div>
          </div>
        </div>
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: 14,
        }}
      >
        {mock.takeoutSwaps.map((s) => (
          <Card key={s.id} pad={0} hover style={{ overflow: 'hidden' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <div style={{ padding: '16px 18px', background: 'var(--tomato-soft)' }}>
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--tomato-ink)',
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                  }}
                >
                  Takeout
                </div>
                <div
                  className="serif"
                  style={{ fontSize: 18, color: 'var(--ink)', marginTop: 4, lineHeight: 1.2 }}
                >
                  {s.takeout}
                </div>
                <div
                  className="serif tnum"
                  style={{ fontSize: 24, color: 'var(--tomato-ink)', marginTop: 6, lineHeight: 1 }}
                >
                  ${s.takeoutCost.toFixed(2)}
                </div>
                <div
                  style={{ fontSize: 11, color: 'var(--tomato-ink)', opacity: 0.7, marginTop: 4 }}
                >
                  ~35 min · delivery fee + tip
                </div>
              </div>
              <div style={{ padding: '16px 18px', background: 'var(--green-tint)' }}>
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--green-deep)',
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                  }}
                >
                  Pilot's home swap
                </div>
                <div
                  className="serif"
                  style={{ fontSize: 18, color: 'var(--ink)', marginTop: 4, lineHeight: 1.2 }}
                >
                  {s.home}
                </div>
                <div
                  className="serif tnum"
                  style={{ fontSize: 24, color: 'var(--green-deep)', marginTop: 6, lineHeight: 1 }}
                >
                  ${s.homeCost.toFixed(2)}
                </div>
                <div
                  style={{ fontSize: 11, color: 'var(--green-deep)', opacity: 0.8, marginTop: 4 }}
                >
                  {s.time} min · ingredients in pantry
                </div>
              </div>
            </div>
            <div
              style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-muted)',
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                  }}
                >
                  You save
                </div>
                <div
                  className="serif tnum"
                  style={{ fontSize: 22, color: 'var(--green-deep)', lineHeight: 1, marginTop: 4 }}
                >
                  ${s.save.toFixed(2)}
                </div>
              </div>
              <Button
                variant="primary"
                iconRight="arrowRight"
                onClick={() => fireToast('Cook Mode opens in a later update')}
              >
                Cook the swap
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═════════════ NUTRITION ════════════════════════════════════════════════════

function NutLine({
  label,
  v,
  unit,
  color,
}: {
  label: string;
  v: { value: number; target: number; unit?: string };
  unit?: string;
  color: string;
}) {
  const pct = (v.value / v.target) * 100;
  const u = v.unit ?? unit ?? '';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 600 }}>{label}</span>
        <span className="tnum" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
          <strong style={{ color: 'var(--ink)' }}>
            {v.value}
            {u}
          </strong>
          <span style={{ marginLeft: 4 }}>
            / {v.target}
            {u}
          </span>
        </span>
      </div>
      <div
        style={{ height: 6, background: 'var(--line-soft)', borderRadius: 999, overflow: 'hidden' }}
      >
        <div
          style={{
            width: `${Math.min(100, pct)}%`,
            height: '100%',
            background: color,
            borderRadius: 999,
            transition: 'width 600ms cubic-bezier(.2,.8,.2,1)',
          }}
        />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11.5,
        color: 'var(--ink-muted)',
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      {label}
    </div>
  );
}

function Nutrition() {
  const n = mock.nutrition;
  const ringPct = (s: { value: number; target: number }) => (s.value / s.target) * 100;
  return (
    <div style={{ padding: '28px 28px 56px', display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <Card pad={26}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.6,
              color: 'var(--ink-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 18,
            }}
          >
            Today · Wednesday
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              <Ring
                value={ringPct(n.cals)}
                size={200}
                stroke={16}
                color="var(--orange)"
                trackColor="var(--bg-tint)"
              >
                <Ring
                  value={ringPct(n.protein)}
                  size={158}
                  stroke={14}
                  color="var(--tomato)"
                  trackColor="var(--bg-tint)"
                >
                  <Ring
                    value={ringPct(n.fiber)}
                    size={118}
                    stroke={12}
                    color="var(--green)"
                    trackColor="var(--bg-tint)"
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div
                        className="serif tnum"
                        style={{ fontSize: 24, color: 'var(--ink)', lineHeight: 1 }}
                      >
                        {Math.round(ringPct(n.cals))}%
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: 'var(--ink-muted)',
                          marginTop: 3,
                          fontWeight: 600,
                          letterSpacing: 0.4,
                        }}
                      >
                        OF TARGET
                      </div>
                    </div>
                  </Ring>
                </Ring>
              </Ring>
            </div>
            <div style={{ flex: 1, display: 'grid', gap: 12 }}>
              <NutLine label="Calories" v={n.cals} unit="" color="var(--orange)" />
              <NutLine label="Protein" v={n.protein} color="var(--tomato)" />
              <NutLine label="Fiber" v={n.fiber} color="var(--green)" />
              <NutLine label="Carbs" v={n.carbs} color="var(--amber)" />
              <NutLine label="Fat" v={n.fat} color="var(--basil)" />
            </div>
          </div>
        </Card>

        <Card
          pad={22}
          style={{ background: 'var(--green-tint)', borderColor: 'var(--green-soft)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ color: 'var(--green-deep)' }}>
              <Icon name="sparkles" size={14} />
            </span>
            <span
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--green-deep)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Pilot suggests
            </span>
          </div>
          <div
            className="serif"
            style={{
              fontSize: 22,
              color: 'var(--ink)',
              letterSpacing: -0.3,
              lineHeight: 1.2,
              marginBottom: 10,
            }}
          >
            Dinner is light on protein. Want to add eggs or tofu to your fried rice?
          </div>
          <p
            style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: '0 0 16px', lineHeight: 1.55 }}
          >
            You're 22g under target. A 3-egg add-in covers 18g without extending cook time.
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {[
              { l: '+3 eggs', p: '+18g', c: '+0.50' },
              { l: '+½ tofu block', p: '+10g', c: '+0.80' },
              { l: '+Greek yogurt', p: '+12g', c: '+0.90' },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  padding: '8px 10px',
                  background: 'var(--on-tint-pad)',
                  border: '1px solid var(--green-soft)',
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{s.l}</div>
                <div style={{ fontSize: 10.5, color: 'var(--green-deep)', marginTop: 2 }}>
                  {s.p} · ${s.c}
                </div>
              </div>
            ))}
          </div>
          <Button size="sm" variant="primary" onClick={() => fireToast('+3 eggs added to dinner')}>
            Apply suggestion
          </Button>
        </Card>
      </div>

      {/* Weekly trend */}
      <Card pad={22}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--ink-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              This week · protein
            </div>
            <div
              className="serif tnum"
              style={{ fontSize: 26, color: 'var(--ink)', marginTop: 6, lineHeight: 1 }}
            >
              72g <span style={{ fontSize: 14, color: 'var(--ink-muted)' }}>avg / day</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Legend color="var(--tomato)" label="Protein" />
            <Legend color="var(--green)" label="Fiber" />
            <Legend color="var(--orange-soft)" label="Target" />
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 12,
            alignItems: 'end',
            height: 180,
          }}
        >
          {[68, 84, 72, 90, 65, 76, 60].map((v, i) => (
            <div
              key={i}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 140,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${140 - (90 / 100) * 140}px`,
                    height: 1,
                    borderTop: '1px dashed var(--orange)',
                  }}
                />
                <div
                  style={{
                    height: `${(v / 100) * 140}px`,
                    borderRadius: '8px 8px 3px 3px',
                    background: v >= 90 ? 'var(--green)' : 'var(--tomato)',
                    opacity: i === 2 ? 1 : 0.55,
                    transition: 'height 600ms cubic-bezier(.2,.8,.2,1)',
                  }}
                />
              </div>
              <div
                className="tnum"
                style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 600 }}
              >
                {v}g
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{mock.days[i]}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Meals breakdown */}
      <Card pad={22}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 0.6,
            color: 'var(--ink-muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Today's meals
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {[
            {
              meal: 'Breakfast',
              name: 'Banana Oat Pancakes',
              cal: 320,
              p: 14,
              c: 52,
              f: 6,
              color: 'var(--amber)',
            },
            {
              meal: 'Lunch',
              name: 'Chickpea Rice Bowl',
              cal: 560,
              p: 22,
              c: 88,
              f: 12,
              color: 'var(--green)',
            },
            {
              meal: 'Dinner',
              name: 'Schezwan Fried Rice',
              cal: 480,
              p: 18,
              c: 62,
              f: 14,
              color: 'var(--tomato)',
            },
            {
              meal: 'Snack',
              name: 'Greek Yogurt Parfait',
              cal: 290,
              p: 18,
              c: 38,
              f: 6,
              color: 'var(--plum)',
            },
          ].map((m) => (
            <div
              key={m.meal}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr repeat(4, 70px)',
                gap: 12,
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 10,
                background: 'var(--paper-warm)',
                border: '1px solid var(--line-soft)',
              }}
            >
              <div
                style={{
                  fontSize: 11.5,
                  color: m.color,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                {m.meal}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{m.name}</div>
              {[`${m.cal} cal`, `${m.p}g pro`, `${m.c}g car`, `${m.f}g fat`].map((vv, i) => (
                <div
                  key={i}
                  className="tnum"
                  style={{ fontSize: 12, color: 'var(--ink-muted)', textAlign: 'right' }}
                >
                  {vv}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═════════════ INSIGHTS (routed) ═══════════════════════════════════════════

type InsightsTab = 'budget' | 'waste' | 'nutrition' | 'memory' | 'takeout';

export function Insights() {
  const [tab, setTab] = useState<InsightsTab>('budget');
  return (
    <div style={{ padding: '28px 28px 0' }}>
      <div style={{ marginBottom: 18 }}>
        <Tabs
          tabs={[
            { label: 'Budget', value: 'budget' },
            { label: 'Food waste', value: 'waste' },
            { label: 'Nutrition', value: 'nutrition' },
            { label: 'Memory', value: 'memory' },
            { label: 'Takeout swap', value: 'takeout' },
          ]}
          value={tab}
          onChange={(v) => setTab(v as InsightsTab)}
        />
      </div>
      <div style={{ paddingBottom: 56, margin: '0 -28px' }}>
        {tab === 'budget' && <Budget />}
        {tab === 'nutrition' && <Nutrition />}
        {tab === 'waste' && <Waste />}
        {tab === 'memory' && <MemoryDeep />}
        {tab === 'takeout' && <TakeoutSwap />}
      </div>
    </div>
  );
}

// ═════════════ HOUSEHOLD (routed) ══════════════════════════════════════════

export function Household() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '28px 28px 56px', display: 'grid', gap: 18 }}>
      <Card pad={26}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <AvatarStack people={mock.household} size={48} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--ink-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Apartment 4B
            </div>
            <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 26, letterSpacing: -0.4 }}>
              Three roommates, one shared pantry.
            </h2>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
              12 shared items · $254 spent together this month · 0 duplicate-buy mishaps.
            </div>
          </div>
          <Button
            variant="primary"
            icon="plus"
            onClick={() => fireToast('Invite link copied to clipboard')}
          >
            Invite a roommate
          </Button>
        </div>
      </Card>

      {/* Members */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {mock.household.map((p) => (
          <Card key={p.id} pad={22}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <Avatar initials={p.initials} color={p.color} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>{p.role}</div>
              </div>
              <Pill tone="green" size="sm" dot>
                Online
              </Pill>
            </div>
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}
            >
              <div>
                <div
                  className="serif tnum"
                  style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}
                >
                  {p.added}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 2 }}>
                  items added
                </div>
              </div>
              <div>
                <div
                  className="serif tnum"
                  style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}
                >
                  ${p.spent.toFixed(0)}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 2 }}>
                  spent this month
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Shared pantry preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <Card pad={22}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <span className="serif" style={{ fontSize: 18 }}>
              Shared shelf · 12 items
            </span>
            <Button
              variant="ghost"
              size="sm"
              iconRight="chevronRight"
              onClick={() => navigate('/pantry')}
            >
              Open pantry
            </Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {mock.items
              .filter((i) => i.owner === 'Shared')
              .slice(0, 8)
              .map((it) => (
                <div
                  key={it.id}
                  style={{
                    padding: 12,
                    background: 'var(--paper-warm)',
                    border: '1px solid var(--line-soft)',
                    borderRadius: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Illo name={it.illo} size={36} />
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {it.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--ink-muted)' }}>
                    {it.qty.split(' ')[0]}
                  </div>
                </div>
              ))}
          </div>
        </Card>
        <Card pad={22}>
          <span className="serif" style={{ fontSize: 18 }}>
            Activity
          </span>
          <div style={{ marginTop: 10 }}>
            {mock.activity.slice(0, 6).map((a, i) => (
              <ActivityRow key={i} act={a} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

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

// ═════════════ SETTINGS (routed) ═══════════════════════════════════════════

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--ink-muted)',
          fontWeight: 600,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div className="serif" style={{ fontSize: 18, color: 'var(--ink)', marginTop: 3 }}>
        {value}
      </div>
    </div>
  );
}

function DietPrefs() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    'High protein': true,
    'Budget friendly': true,
    Vegetarian: false,
    Vegan: false,
    'Gluten-free': false,
    'Dairy-free': false,
    'No pork': true,
  });
  const toggle = (k: string) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {Object.keys(prefs).map((k) => (
        <Chip key={k} active={prefs[k]} onClick={() => toggle(k)}>
          {k}
        </Chip>
      ))}
    </div>
  );
}

export function Settings() {
  const [section, setSection] = useState('Profile');
  return (
    <div
      style={{
        padding: '28px 28px 56px',
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: 22,
      }}
    >
      <aside>
        {[
          'Profile',
          'Preferences',
          'Equipment',
          'Notifications',
          'Household',
          'Connections',
          'Privacy',
        ].map((s) => {
          const active = section === s;
          return (
            <button
              key={s}
              onClick={() => setSection(s)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '9px 14px',
                borderRadius: 10,
                background: active ? 'var(--paper)' : 'transparent',
                border: '1px solid',
                borderColor: active ? 'var(--line)' : 'transparent',
                color: active ? 'var(--ink)' : 'var(--ink-muted)',
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                marginBottom: 2,
                boxShadow: active ? 'var(--sh-1)' : 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {s}
            </button>
          );
        })}
      </aside>
      <div style={{ display: 'grid', gap: 18 }}>
        <Card pad={26}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <Avatar initials="HB" color="var(--green)" size={64} />
            <div style={{ flex: 1 }}>
              <div className="serif" style={{ fontSize: 22 }}>
                Hemanth Balla
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-muted)' }}>
                hemanth@apt4b.house · Graduate student
              </div>
            </div>
            <Button
              variant="secondary"
              icon="edit"
              onClick={() => fireToast('Editing your profile')}
            >
              Edit profile
            </Button>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 14,
              padding: 16,
              background: 'var(--paper-warm)',
              borderRadius: 12,
              border: '1px solid var(--line-soft)',
            }}
          >
            <Field label="Monthly budget" value="$250" />
            <Field label="Cooking skill" value="Intermediate" />
            <Field label="Household members" value="3" />
          </div>
        </Card>
        <Card pad={26}>
          <div className="serif" style={{ fontSize: 18, marginBottom: 14 }}>
            Diet & allergies
          </div>
          <div style={{ marginBottom: 18 }}>
            <div
              style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 8, fontWeight: 600 }}
            >
              Preferences
            </div>
            <DietPrefs />
          </div>
          <div>
            <div
              style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 8, fontWeight: 600 }}
            >
              Avoid
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Pill tone="tomato" size="md" icon="alert">
                Shellfish
              </Pill>
            </div>
          </div>
        </Card>
        <Card pad={26}>
          <div className="serif" style={{ fontSize: 18, marginBottom: 14 }}>
            Kitchen equipment
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {[
              { l: 'Stove', on: true },
              { l: 'Microwave', on: true },
              { l: 'Air fryer', on: true },
              { l: 'Rice cooker', on: true },
              { l: 'Oven', on: false },
              { l: 'Blender', on: false },
              { l: 'Instant Pot', on: false },
              { l: 'Grill', on: false },
              { l: 'Toaster', on: true },
              { l: 'Coffee maker', on: true },
            ].map((e) => (
              <div
                key={e.l}
                style={{
                  padding: '12px 10px',
                  borderRadius: 10,
                  textAlign: 'center',
                  background: e.on ? 'var(--green-tint)' : 'var(--paper-warm)',
                  border: `1px solid ${e.on ? 'var(--green-soft)' : 'var(--line-soft)'}`,
                  color: e.on ? 'var(--green-deep)' : 'var(--ink-soft)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600 }}>{e.l}</div>
                <div style={{ fontSize: 9.5, marginTop: 3, opacity: 0.7 }}>
                  {e.on ? 'Available' : 'Not yet'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
