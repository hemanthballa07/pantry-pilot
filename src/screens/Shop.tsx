// src/screens/Shop.tsx — Phase 4 port of grocery.jsx (window.PPGrocery.Grocery)
//
// Modes: Plan · In store · Budget · Household. Exercises interactive checkbox/cart
// state with a live running total (toggling an item updates the budget bar,
// "items left", and the per-store totals in real time).
//
// All window.PP* globals removed: data from @/data/mock, actions from stores / router.
// Documented deviations from the legacy screen:
//   1. The ScanReceipt overlay (window.PPScanReceipt) is not yet converted — the
//      "Scan receipt" button opens the Inbox via useNavStore.openInbox, matching
//      Pantry.tsx. The standalone scan-receipt flow converts in a later phase.
//   2. The "Check out" button opens the checkout overlay via
//      useNavStore.openCheckout (Phase 6 overlay #3 — src/overlays/Checkout.tsx),
//      replacing the legacy window.PPCheckoutOpen / earlier placeholder toast.
//   3. The legacy toast `{ icon }` option is dropped — the toast store is
//      push(text, { tone? }) and derives its glyph from tone.
// onOpenRecipe / onCookNow navigate to /cook (recipe detail converts later).

import { useState, useMemo } from 'react';
import type { CSSProperties, ReactNode, MouseEventHandler, Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { mock } from '@/data/mock';
import { useToastStore, useNavStore } from '@/stores';
import type { GroceryItem } from '@/types';

// ─── Local types ────────────────────────────────────────────────────────────
// `GroceryItem` is the wide interface from @/types (bought: boolean). Deriving
// it from `mock.grocery` would inherit literal types (bought: false) via the
// mock's `satisfies PPData`, which breaks the cart toggle's `!i.bought` write.

type Mode = 'plan' | 'store' | 'budget' | 'household';
type Filter = 'all' | 'open' | 'done' | 'Produce' | 'Dairy' | 'Bakery' | 'Household';

// ─── Icon ─────────────────────────────────────────────────────────────────

const ICON_PATHS: Record<string, string> = {
  sparkles:
    'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M6 2l.8 2.2L9 5l-2.2.8L6 8l-.8-2.2L3 5l2.2-.8z M17 16l.6 1.8L19.4 18l-1.8.6L17 20.4l-.6-1.8L14.6 18l1.8-.6z',
  check: 'M20 6L9 17l-5-5',
  chevronRight: 'M9 18l6-6-6-6',
  alert:
    'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  wallet:
    'M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7zm14 5a1 1 0 110-2 1 1 0 010 2z',
  leaf: 'M17 8C8 10 5.9 16.17 3.82 22 8 22 12 21 14 18c2-3 0-7-3-7s-5 3-3 7',
  cart: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM16 10a4 4 0 01-8 0',
  plus: 'M12 5v14M5 12h14',
  info: 'M12 21a9 9 0 110-18 9 9 0 010 18z M12 16v-4 M12 8h.01',
  receipt: 'M6 2h12v19l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3V2z M9 7h6 M9 11h6 M9 15h4',
  snowflake: 'M12 2v20 M2 12h20 M5 5l14 14 M19 5L5 19',
  // Grocery-specific glyphs (single-path; multi-element legacy icons folded into one `d`)
  close: 'M6 6l12 12M18 6L6 18',
  chevronLeft: 'M15 6l-6 6 6 6',
  arrowRight: 'M5 12h14M13 5l7 7-7 7',
  house: 'M3 21V11l9-7 9 7v10 M9 21v-6h6v6',
  circle: 'M12 3a9 9 0 1 0 0 18 a9 9 0 1 0 0-18z',
  knife: 'M3 20l16-16 2 2L5 22z M14 9l4 4',
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
  onClick?: () => void;
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

// ─── Progress ─────────────────────────────────────────────────────────────

interface ProgressProps {
  value: number;
  max?: number;
  tone?: 'green' | 'amber' | 'tomato' | 'orange';
  height?: number;
}
const PROGRESS_COLOR: Record<string, string> = {
  green: 'var(--green, #3B6E3D)',
  amber: 'var(--amber, #C99325)',
  tomato: 'var(--tomato, #C73E2E)',
  orange: 'var(--orange, #D9722B)',
};
function Progress({ value, max = 100, tone = 'green', height = 8 }: ProgressProps) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      style={{
        height,
        borderRadius: 999,
        background: 'var(--bg-tint, rgba(0,0,0,.06))',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: PROGRESS_COLOR[tone],
          borderRadius: 999,
          transition: 'width 300ms',
        }}
      />
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
  onClick?: MouseEventHandler<HTMLButtonElement>;
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
  count?: number;
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
            {t.count != null && (
              <span style={{ marginLeft: 6, color: 'var(--ink-soft)', fontWeight: 600 }}>
                {t.count}
              </span>
            )}
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

// ─── Avatar (household contributors) ─────────────────────────────────────────

function Avatar({
  initials,
  color = 'var(--green)',
  size = 28,
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

// ─── SectionIcon ──────────────────────────────────────────────────────────

function SectionIcon({ name }: { name: string }) {
  const map: Record<string, { icon: string; bg: string; fg: string }> = {
    Produce: { icon: 'leaf', bg: 'var(--green-soft)', fg: 'var(--green-deep)' },
    Dairy: { icon: 'circle', bg: 'var(--amber-soft)', fg: 'var(--amber-ink)' },
    Bakery: { icon: 'bread', bg: 'var(--orange-soft)', fg: 'var(--orange-deep)' },
    Household: { icon: 'house', bg: 'var(--bg-tint)', fg: 'var(--ink-muted)' },
    Meat: { icon: 'circle', bg: 'var(--tomato-soft)', fg: 'var(--tomato-ink)' },
    Frozen: { icon: 'snowflake', bg: 'var(--sky-soft)', fg: 'var(--sky)' },
  };
  const m = map[name] ?? map.Household;
  return (
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        background: m.bg,
        color: m.fg,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Icon name={m.icon === 'bread' ? 'knife' : m.icon} size={13} />
    </div>
  );
}

// ─── GroceryRow ─────────────────────────────────────────────────────────────

function GroceryRow({
  item,
  onToggle,
  showOwner,
}: {
  item: GroceryItem;
  onToggle: () => void;
  showOwner: boolean;
}) {
  const reason = item.needed[0];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto auto',
        alignItems: 'center',
        gap: 14,
        padding: '12px 18px',
        borderBottom: '1px solid var(--line-soft)',
        opacity: item.bought ? 0.55 : 1,
        transition: 'opacity 200ms',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          border: `1.5px solid ${item.bought ? 'var(--green)' : 'var(--line-strong)'}`,
          background: item.bought ? 'var(--green)' : 'transparent',
          color: '#FDFAF3',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          padding: 0,
          transition: 'all 160ms',
        }}
      >
        {item.bought && <Icon name="check" size={13} />}
      </button>
      <div>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: 'var(--ink)',
            textDecoration: item.bought ? 'line-through' : 'none',
          }}
        >
          {item.name}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: 'var(--ink-muted)',
            marginTop: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{reason}</span>
          {showOwner && item.addedBy !== 'Pilot' && (
            <>
              <span>·</span>
              <span>{item.addedBy}</span>
            </>
          )}
          {item.addedBy === 'Pilot' && (
            <>
              <span>·</span>
              <span
                style={{
                  color: 'var(--ink-soft)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Icon name="sparkles" size={10} /> Pilot
              </span>
            </>
          )}
        </div>
      </div>
      <div className="tnum" style={{ fontSize: 12.5, color: 'var(--ink-muted)' }}>
        {item.qty}
      </div>
      {item.priority === 'high' && (
        <Pill tone="tomato" size="sm">
          Priority
        </Pill>
      )}
      {item.priority === 'medium' && (
        <Pill tone="neutral" size="sm">
          {item.section}
        </Pill>
      )}
      {item.priority === 'low' && (
        <Pill tone="ghost" size="sm">
          Low
        </Pill>
      )}
      <div className="tnum serif" style={{ fontSize: 16, color: 'var(--ink)' }}>
        ${item.price.toFixed(2)}
      </div>
    </div>
  );
}

// ─── Cook Before You Shop hero ────────────────────────────────────────────────

function CookBeforeShop({
  onDismiss,
  onCookNow,
  onOpenRecipe,
}: {
  onDismiss: () => void;
  onCookNow: (id: string) => void;
  onOpenRecipe: (id: string) => void;
}) {
  const cbs = mock.cookBeforeShop;
  const recipes = cbs.meals
    .map((m) => {
      const r = mock.recipes.find((rr) => rr.id === m.recipe);
      return r ? { ...r, reason: m.reason } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
  return (
    <Card
      pad={0}
      style={{
        overflow: 'hidden',
        background: 'linear-gradient(160deg, var(--orange-tint) 0%, var(--orange-soft) 100%)',
        borderColor: 'var(--orange-soft)',
      }}
    >
      <div
        style={{ padding: '22px 22px 18px', display: 'flex', alignItems: 'flex-start', gap: 16 }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 11,
            background: 'var(--on-tint-pad)',
            color: 'var(--orange-deep)',
            display: 'grid',
            placeItems: 'center',
            flex: '0 0 auto',
          }}
        >
          <Icon name="leaf" size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.6,
              color: 'var(--orange-deep)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Cook before you shop
          </div>
          <div
            className="serif"
            style={{ fontSize: 22, color: 'var(--ink)', marginTop: 4, letterSpacing: -0.3 }}
          >
            You can cook <strong style={{ color: 'var(--orange-deep)' }}>{cbs.can} meals</strong>{' '}
            from what's already in your pantry.
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
            That's ~
            <strong className="tnum" style={{ color: 'var(--green-deep)' }}>
              ${cbs.save.toFixed(2)}
            </strong>{' '}
            avoided and one less trip. Stretch the pantry first?
          </div>
        </div>
        <button
          onClick={onDismiss}
          style={{
            width: 28,
            height: 28,
            background: 'transparent',
            border: 'none',
            color: 'var(--ink-muted)',
            cursor: 'pointer',
          }}
        >
          <Icon name="close" size={14} />
        </button>
      </div>
      <div
        style={{
          padding: '0 22px 22px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}
      >
        {recipes.map((r) => (
          <div
            key={r.id}
            onClick={() => onOpenRecipe(r.id)}
            style={{
              display: 'flex',
              gap: 12,
              padding: '10px 12px',
              background: 'var(--on-tint-pad)',
              border: '1px solid var(--on-tint-border)',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'transform 160ms',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                flex: '0 0 auto',
                background: `linear-gradient(135deg, ${r.tone}E6 0%, ${r.tone}99 100%)`,
                borderRadius: 9,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Illo name="rice" size={26} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>
                {r.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>
                {r.reason}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: '12px 22px',
          borderTop: '1px solid var(--on-tint-divider)',
          background: 'var(--on-tint-pad-soft)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Continue shopping
        </Button>
        <Button
          size="sm"
          variant="primary"
          iconRight="arrowRight"
          onClick={() => {
            if (recipes[0]) onCookNow(recipes[0].id);
          }}
        >
          Cook these first
        </Button>
      </div>
    </Card>
  );
}

// ─── Auto-restock strip ──────────────────────────────────────────────────────

function AutoRestockStrip({
  onToast,
  onNav,
}: {
  onToast: (msg: string) => void;
  onNav: (id: string) => void;
}) {
  const pending = mock.autoRestockRules
    .filter((r) => r.on && /day|Mon|Sun/.test(r.next))
    .slice(0, 3);
  if (!pending.length) return null;
  return (
    <Card pad={16}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Icon name="sparkles" size={16} stroke="var(--green-deep)" />
        <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>
          Auto-restock will add these on Sunday:
        </span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {pending.map((p) => (
            <Pill key={p.id} tone="green" size="sm">
              {p.item} · {p.next}
            </Pill>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <Button size="sm" variant="ghost" onClick={() => onNav('pantry')}>
          Rules
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onToast('Added now to your list')}>
          Add now
        </Button>
      </div>
    </Card>
  );
}

// ─── Store Mode (large touch UI) ─────────────────────────────────────────────

function StoreMode({
  items,
  setItems,
  onExit,
  onToast,
}: {
  items: GroceryItem[];
  setItems: Dispatch<SetStateAction<GroceryItem[]>>;
  onExit: () => void;
  onToast: (msg: string) => void;
}) {
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const list = items.filter((i) => (filter === 'open' ? !i.bought : true));
  const sections = useMemo<[string, GroceryItem[]][]>(() => {
    const map: Record<string, GroceryItem[]> = {};
    list.forEach((i) => {
      (map[i.section] = map[i.section] || []).push(i);
    });
    return Object.entries(map);
  }, [list]);
  const toggle = (id: string) => {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, bought: !i.bought } : i)));
  };
  const open = items.filter((i) => !i.bought).length;
  const bought = items.filter((i) => i.bought).length;
  const totalLeft = items.filter((i) => !i.bought).reduce((s, i) => s + i.price, 0);
  const modeTabs = [
    { l: 'To buy', v: 'open' },
    { l: 'All', v: 'all' },
  ] as const;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        padding: '20px 16px 80px',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button
          onClick={onExit}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            color: 'var(--ink-2)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Icon name="chevronLeft" size={14} /> Exit store mode
        </button>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: 'flex',
            gap: 4,
            background: 'var(--bg-tint)',
            padding: 3,
            borderRadius: 9,
            border: '1px solid var(--line)',
          }}
        >
          {modeTabs.map((t) => (
            <button
              key={t.v}
              onClick={() => setFilter(t.v)}
              style={{
                padding: '5px 10px',
                fontSize: 12,
                fontWeight: 600,
                background: filter === t.v ? 'var(--paper)' : 'transparent',
                color: filter === t.v ? 'var(--ink)' : 'var(--ink-muted)',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                boxShadow: filter === t.v ? 'var(--sh-1)' : 'none',
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <Card
        pad={20}
        style={{
          marginBottom: 20,
          background: 'var(--ink)',
          color: 'var(--paper-warm)',
          borderColor: 'var(--ink)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              Store mode · Aldi
            </div>
            <div
              className="serif"
              style={{ fontSize: 30, marginTop: 6, letterSpacing: -0.3, lineHeight: 1 }}
            >
              {open}{' '}
              <span style={{ color: 'rgba(253,250,243,.55)', fontSize: 22 }}>· {bought} done</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(253,250,243,.6)',
                fontWeight: 600,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              Running total
            </div>
            <div
              className="serif tnum"
              style={{ fontSize: 28, color: 'var(--amber)', marginTop: 4 }}
            >
              ${totalLeft.toFixed(2)}
            </div>
          </div>
        </div>
      </Card>

      {sections.map(([section, rows]) => (
        <div key={section} style={{ marginBottom: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              background: 'var(--paper-warm)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              marginBottom: 8,
            }}
          >
            <span
              style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.1 }}
            >
              {section}
            </span>
            <Pill tone="neutral" size="sm">
              {rows.length}
            </Pill>
          </div>
          {rows.map((it) => (
            <button
              key={it.id}
              onClick={() => toggle(it.id)}
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                marginBottom: 6,
                borderRadius: 12,
                background: it.bought ? 'var(--paper-warm)' : 'var(--paper)',
                border: `1px solid ${it.bought ? 'var(--line-soft)' : 'var(--line)'}`,
                cursor: 'pointer',
                textAlign: 'left',
                opacity: it.bought ? 0.55 : 1,
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  border: `2px solid ${it.bought ? 'var(--green)' : 'var(--line-strong)'}`,
                  background: it.bought ? 'var(--green)' : 'transparent',
                  color: '#FDFAF3',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {it.bought && <Icon name="check" size={18} />}
              </span>
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    textDecoration: it.bought ? 'line-through' : 'none',
                  }}
                >
                  {it.name}
                </div>
                <div
                  className="tnum"
                  style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}
                >
                  {it.qty}
                </div>
              </div>
              <div className="serif tnum" style={{ fontSize: 20, color: 'var(--ink)' }}>
                ${it.price.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      ))}

      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--ink)',
          color: 'var(--paper-warm)',
          padding: '12px 20px',
          borderRadius: 14,
          boxShadow: 'var(--sh-lift)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 30,
        }}
      >
        <div style={{ fontSize: 12 }}>
          <span style={{ opacity: 0.6 }}>Trip · </span>
          <span className="tnum" style={{ fontWeight: 700 }}>
            ${totalLeft.toFixed(2)}
          </span>
        </div>
        <Button
          size="sm"
          variant="orange"
          onClick={() => {
            onToast('Trip complete · synced to pantry');
            onExit();
          }}
        >
          Finish trip
        </Button>
      </div>
    </div>
  );
}

// ─── Store comparison (static recommendation) ────────────────────────────────

const STORE_COMPARISON = [
  { name: 'Aldi', price: 38.2, fav: true, miss: 0, dist: '1.4 mi' },
  { name: 'Walmart', price: 42.8, fav: false, miss: 0, dist: '2.8 mi' },
  { name: "Trader Joe's", price: 46.1, fav: false, miss: 1, dist: '3.1 mi' },
  { name: 'Publix', price: 49.1, fav: false, miss: 0, dist: '1.2 mi' },
];

// ─── Root ─────────────────────────────────────────────────────────────────

export default function Shop() {
  const navigate = useNavigate();
  const pushToast = useToastStore((s) => s.push);
  const openAddItem = useNavStore((s) => s.openAddItem);
  const openAskPilot = useNavStore((s) => s.openAskPilot);
  const openInbox = useNavStore((s) => s.openInbox);
  const openCheckout = useNavStore((s) => s.openCheckout);

  const [mode, setMode] = useState<Mode>('plan');
  const [items, setItems] = useState<GroceryItem[]>(mock.grocery);
  const [filter, setFilter] = useState<Filter>('all');
  const [showCBS, setShowCBS] = useState(true);

  const onNav = (id: string) => navigate('/' + id);
  const onToast = (msg: string) => pushToast(msg);
  const onOpenRecipe = (_id: string) => navigate('/cook');
  const onCookNow = (_id: string) => navigate('/cook');

  const filtered = items.filter((i) => {
    if (filter === 'all') return true;
    if (filter === 'open') return !i.bought;
    if (filter === 'done') return i.bought;
    return i.section === filter;
  });

  const sectioned = useMemo<[string, GroceryItem[]][]>(() => {
    const map: Record<string, GroceryItem[]> = {};
    filtered.forEach((i) => {
      (map[i.section] = map[i.section] || []).push(i);
    });
    return Object.entries(map);
  }, [filtered]);

  const totalOpen = items.filter((i) => !i.bought).reduce((s, i) => s + i.price, 0);
  const totalDone = items.filter((i) => i.bought).reduce((s, i) => s + i.price, 0);
  const totalAll = totalOpen + totalDone;
  const budgetUsed = totalAll;
  const budgetCap = 60;

  const toggle = (id: string) => {
    const it = items.find((i) => i.id === id);
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, bought: !i.bought } : i)));
    if (it && !it.bought) onToast(`Added ${it.name} to inventory`);
  };

  // ── STORE MODE: simplified, large-touch, "in store" UI ─────────────────
  if (mode === 'store') {
    return (
      <StoreMode
        items={items}
        setItems={setItems}
        onExit={() => setMode('plan')}
        onToast={onToast}
      />
    );
  }

  return (
    <div
      style={{
        padding: '28px 28px 56px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 340px',
        gap: 18,
      }}
    >
      <div style={{ display: 'grid', gap: 18, minWidth: 0 }}>
        {/* Cook Before You Shop hero — dismissable */}
        {showCBS && (
          <CookBeforeShop
            onDismiss={() => setShowCBS(false)}
            onCookNow={onCookNow}
            onOpenRecipe={onOpenRecipe}
          />
        )}

        {/* Header */}
        <Card pad={22}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
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
                This week's run
              </div>
              <h2
                className="serif"
                style={{ margin: '6px 0 4px', fontSize: 26, letterSpacing: -0.4 }}
              >
                {items.filter((i) => !i.bought).length} items left to buy · est. $
                {totalOpen.toFixed(2)}
              </h2>
              <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                Cheapest at <strong style={{ color: 'var(--ink-2)' }}>Aldi</strong> — about $10.90
                less than Publix.
              </div>
            </div>
            <Tabs
              tabs={[
                { label: 'Plan', value: 'plan' },
                { label: 'In store', value: 'store' },
                { label: 'Budget', value: 'budget' },
                { label: 'Household', value: 'household' },
              ]}
              value={mode}
              onChange={(v) => setMode(v as Mode)}
            />
            <button
              onClick={openInbox}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                background: 'var(--orange-tint)',
                color: 'var(--orange-deep)',
                border: '1px solid var(--orange-soft)',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: 12.5,
                whiteSpace: 'nowrap',
                transition: 'transform 120ms, background 160ms',
              }}
            >
              <Icon name="receipt" size={14} />
              Scan receipt
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  background: 'var(--orange)',
                  color: '#FDFAF3',
                  padding: '1px 6px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                }}
              >
                New
              </span>
            </button>
          </div>
        </Card>

        {/* Warnings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Card
            pad={16}
            style={{ background: 'var(--amber-soft)', borderColor: 'var(--amber-line)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: 'var(--on-tint-pad)',
                  color: 'var(--amber-ink)',
                  display: 'grid',
                  placeItems: 'center',
                  flex: '0 0 auto',
                }}
              >
                <Icon name="alert" size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber-ink)' }}>
                  Duplicate warning · 2 items
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: 'var(--amber-ink)',
                    opacity: 0.85,
                    lineHeight: 1.5,
                    marginTop: 2,
                  }}
                >
                  You already have eggs (8 left) and an unopened jar of peanut butter. Pilot grayed
                  them out.
                </div>
              </div>
            </div>
          </Card>
          <Card
            pad={16}
            style={{ background: 'var(--green-tint)', borderColor: 'var(--green-soft)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: 'var(--on-tint-pad)',
                  color: 'var(--green-deep)',
                  display: 'grid',
                  placeItems: 'center',
                  flex: '0 0 auto',
                }}
              >
                <Icon name="sparkles" size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-deep)' }}>
                  Save $4.20 with bulk yogurt
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: 'var(--green-deep)',
                    opacity: 0.85,
                    lineHeight: 1.5,
                    marginTop: 2,
                  }}
                >
                  32oz tub at Aldi is $1.04/serving vs. $1.64 for the 12oz. You use yogurt 3x/wk.
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Auto-restock pending */}
        <AutoRestockStrip onToast={onToast} onNav={onNav} />

        {/* Filter chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </Chip>
          <Chip active={filter === 'open'} onClick={() => setFilter('open')}>
            To buy
          </Chip>
          <Chip active={filter === 'done'} onClick={() => setFilter('done')}>
            Bought
          </Chip>
          <div
            style={{ width: 1, height: 22, background: 'var(--line-strong)', margin: '0 4px' }}
          />
          {(['Produce', 'Dairy', 'Bakery', 'Household'] as const).map((s) => (
            <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>
              {s}
            </Chip>
          ))}
          <div style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" icon="sparkles" onClick={openAskPilot}>
            Pilot suggest
          </Button>
          <Button variant="primary" size="sm" icon="plus" onClick={openAddItem}>
            Add item
          </Button>
        </div>

        {/* Sections */}
        <div style={{ display: 'grid', gap: 14 }}>
          {sectioned.map(([section, list]) => (
            <Card key={section} pad={0} style={{ overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  background: 'var(--paper-warm)',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SectionIcon name={section} />
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      letterSpacing: -0.1,
                    }}
                  >
                    {section}
                  </span>
                  <Pill tone="neutral" size="sm">
                    {list.length}
                  </Pill>
                </div>
                <div
                  className="tnum"
                  style={{ fontSize: 12.5, color: 'var(--ink-muted)', fontWeight: 600 }}
                >
                  ${list.reduce((s, i) => s + i.price, 0).toFixed(2)}
                </div>
              </div>
              <div>
                {list.map((it) => (
                  <GroceryRow
                    key={it.id}
                    item={it}
                    onToggle={() => toggle(it.id)}
                    showOwner={mode === 'household'}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
        {/* Budget */}
        <Card pad={20}>
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
            This trip
          </div>
          <div className="serif tnum" style={{ fontSize: 32, color: 'var(--ink)', lineHeight: 1 }}>
            ${totalAll.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4, marginBottom: 14 }}>
            of <strong style={{ color: 'var(--ink-2)' }}>${budgetCap}</strong> trip budget
          </div>
          <Progress
            value={budgetUsed}
            max={budgetCap}
            tone={budgetUsed > budgetCap ? 'tomato' : 'green'}
            height={8}
          />
          <div
            className="tnum"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
              fontSize: 11,
              color: 'var(--ink-muted)',
            }}
          >
            <span>{Math.round((budgetUsed / budgetCap) * 100)}% used</span>
            <span>${(budgetCap - budgetUsed).toFixed(2)} left</span>
          </div>
          <div style={{ height: 1, background: 'var(--line-soft)', margin: '16px 0' }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: 'var(--ink-muted)',
              marginBottom: 6,
            }}
          >
            <span>To buy</span>
            <span className="tnum">${totalOpen.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: 'var(--ink-muted)',
            }}
          >
            <span>Already bought</span>
            <span className="tnum">${totalDone.toFixed(2)}</span>
          </div>
          <Button
            full
            variant="primary"
            icon="cart"
            style={{ marginTop: 16 }}
            onClick={openCheckout}
          >
            Check out · ${totalOpen.toFixed(2)}
          </Button>
        </Card>

        {/* Store comparison */}
        <Card pad={20}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--ink-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Where to shop
            </div>
            <Icon name="info" size={14} stroke="var(--ink-soft)" />
          </div>
          {STORE_COMPARISON.map((s) => (
            <div
              key={s.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '10px 12px',
                marginBottom: 6,
                borderRadius: 10,
                background: s.fav ? 'var(--green-tint)' : 'var(--paper-warm)',
                border: `1px solid ${s.fav ? 'var(--green-soft)' : 'var(--line-soft)'}`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                    {s.name}
                  </span>
                  {s.fav && (
                    <Pill tone="green" size="sm">
                      Best
                    </Pill>
                  )}
                  {s.miss > 0 && (
                    <Pill tone="amber" size="sm">
                      {s.miss} missing
                    </Pill>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>
                  {s.dist} · pickup available
                </div>
              </div>
              <div className="serif tnum" style={{ fontSize: 17, color: 'var(--ink)' }}>
                ${s.price.toFixed(2)}
              </div>
            </div>
          ))}
          <div
            style={{ marginTop: 10, fontSize: 11.5, color: 'var(--ink-muted)', lineHeight: 1.5 }}
          >
            Pilot says: Aldi saves <strong style={{ color: 'var(--green-deep)' }}>~$10.90</strong>,
            but Publix is closer and stocks everything.
          </div>
        </Card>

        {/* Household contributors */}
        <Card pad={20}>
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
            Added by
          </div>
          {mock.household.map((p) => {
            const count = items.filter((i) => i.addedBy === p.name.split(' ')[0]).length;
            return (
              <div
                key={p.id}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}
              >
                <Avatar initials={p.initials} color={p.color} size={26} />
                <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>
                  {p.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>{count} items</div>
              </div>
            );
          })}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 999,
                background: 'var(--ink)',
                color: 'var(--amber)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Icon name="sparkles" size={12} />
            </div>
            <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>Pilot</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>
              {items.filter((i) => i.addedBy === 'Pilot').length} items
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
