// src/screens/extras/shared.tsx — shared UI primitives for the Extras quartet.
//
// Extracted verbatim from the former monolithic src/screens/Extras.tsx as part of the
// OQ-004 / ADR-004 split (Insights / Household / Imports / Settings each became their own
// module). These mirror the per-file inline-primitive convention used elsewhere (Cook,
// Landing); an app-wide consolidation is tracked as OQ-011.
import type { CSSProperties, ReactNode } from 'react';
import type { ActivityEntry } from '@/types';

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
export function Icon({ name, size = 18, stroke = 'currentColor' }: IconProps) {
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
export function Illo({ name, size = 48 }: IlloProps) {
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
export function Card({ pad = 20, style, children, onClick }: CardProps) {
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

export function Pill({ tone = 'neutral', size = 'sm', children, dot, icon }: PillProps) {
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

export function Button({
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

export function Tabs({
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

export function Chip({
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
export function Ring({
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

export function Avatar({
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

export function AvatarStack({
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

export function ActivityRow({ act }: { act: ActivityEntry }) {
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

export function SectionHead({
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
