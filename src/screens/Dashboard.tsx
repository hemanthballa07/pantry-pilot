// src/screens/Dashboard.tsx — Phase 4 port of dashboard.jsx

import { useNavigate } from 'react-router-dom';
import { Fragment } from 'react';
import type { CSSProperties, ReactNode, MouseEventHandler } from 'react';
import { mock } from '@/data/mock';
import { useToastStore, useNavStore } from '@/stores';
import { Icon } from '@/components/ui';

// ─── Derived types ────────────────────────────────────────────────────────

type TodaySlot = (typeof mock.todayPlan.slots)[number];
type Item = (typeof mock.items)[number];
type WasteEntry = (typeof mock.wasteRescue.plan)[number];
type PilotSug = (typeof mock.pilotSuggestions)[number];
type Win = (typeof mock.kitchenWins)[number];
type GroceryItem = (typeof mock.grocery)[number];
type Leftover = (typeof mock.leftovers)[number];
type ActivityEntry = (typeof mock.activity)[number];

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

type PillTone = 'green' | 'orange' | 'tomato' | 'amber' | 'neutral' | 'ghost';

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

// ─── Ring ─────────────────────────────────────────────────────────────────

interface RingProps {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
}
function Ring({
  value,
  max,
  size = 64,
  stroke = 8,
  color = 'var(--green)',
  trackColor = 'rgba(0,0,0,.06)',
  children,
}: RingProps) {
  const pct = max !== undefined ? (value / max) * 100 : value;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.min(100, pct) / 100);
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

// ─── Progress ─────────────────────────────────────────────────────────────

interface ProgressProps {
  value: number;
  max: number;
  tone?: 'green' | 'amber';
  height?: number;
}
function Progress({ value, max, tone = 'green', height = 8 }: ProgressProps) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const color = tone === 'green' ? 'var(--green, #3B6E3D)' : 'var(--amber, #C99325)';
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
          background: color,
          borderRadius: 999,
          transition: 'width 300ms',
        }}
      />
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft';
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
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
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
          {eyebrow}
        </div>
        <div className="serif" style={{ fontSize: 17, color: 'var(--ink)', marginTop: 3 }}>
          {title}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── IngredientTile ───────────────────────────────────────────────────────

function IngredientTile({ item, onClick }: { item: Item; compact?: boolean; onClick: () => void }) {
  const expDays = item.expDays;
  const expLabel = expDays === 0 ? 'Today' : expDays === 1 ? 'Tomorrow' : `${expDays}d`;
  const expColor =
    expDays <= 1 ? 'var(--tomato)' : expDays <= 3 ? 'var(--amber)' : 'var(--ink-muted)';
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 12px',
        borderRadius: 12,
        cursor: 'pointer',
        background: 'var(--paper-warm)',
        border: '1px solid var(--line-soft)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Illo name={item.illo} size={32} />
      <div
        style={{
          fontSize: 11.5,
          color: 'var(--ink-2)',
          fontWeight: 600,
          textAlign: 'center',
          lineHeight: 1.25,
          width: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {item.name}
      </div>
      <div style={{ fontSize: 10, color: expColor, fontWeight: 700 }}>{expLabel}</div>
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

// ─── Module constant ──────────────────────────────────────────────────────

const linkBtn: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: 'var(--ink-muted)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
};

// ─── PlanSlot ─────────────────────────────────────────────────────────────

const SLOT_LABEL: Record<string, string> = { B: 'Breakfast', L: 'Lunch', D: 'Dinner', S: 'Snack' };

function PlanSlot({
  slot,
  onOpen,
  onCook,
  onToast,
}: {
  slot: TodaySlot;
  onOpen: () => void;
  onCook: () => void;
  onToast: (msg: string) => void;
}) {
  const slotLabel = SLOT_LABEL[slot.slot] ?? slot.slot;
  const isCook = slot.status === 'tonight';
  return (
    <div
      className="lift"
      onClick={onOpen}
      style={{
        cursor: 'pointer',
        background: 'var(--paper)',
        borderRadius: 14,
        border: '1px solid var(--line)',
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: 6, background: slot.tone }} />
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              color: slot.tone,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            {slotLabel}
          </span>
          <span
            className="tnum"
            style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600 }}
          >
            {slot.time}
          </span>
        </div>
        <div
          className="serif"
          style={{
            fontSize: 17,
            color: 'var(--ink)',
            lineHeight: 1.2,
            letterSpacing: -0.2,
            marginBottom: 6,
          }}
        >
          {slot.name}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginBottom: 10 }}>
          {slot.kind}
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
          {slot.uses.slice(0, 3).map((u) => (
            <span
              key={u}
              style={{
                fontSize: 10,
                color: 'var(--ink-muted)',
                background: 'var(--bg-tint)',
                padding: '2px 6px',
                borderRadius: 999,
              }}
            >
              {u}
            </span>
          ))}
        </div>
        <div
          className="tnum"
          style={{
            marginTop: 'auto',
            display: 'flex',
            gap: 10,
            fontSize: 11,
            color: 'var(--ink-soft)',
          }}
        >
          <span>{slot.cal} cal</span>
          <span>·</span>
          <span>{slot.p}g protein</span>
        </div>
        <Button
          size="sm"
          variant={isCook ? 'primary' : 'secondary'}
          full
          iconRight={isCook ? 'arrowRight' : undefined}
          onClick={(e) => {
            e.stopPropagation();
            if (isCook) {
              onCook();
            } else {
              onToast(`${slotLabel} ready`);
            }
          }}
          style={{ marginTop: 10 }}
        >
          {slot.status === 'tonight'
            ? 'Start cooking'
            : slot.status === 'leftover'
              ? 'Reheat'
              : slot.status === 'ready'
                ? 'Mark eaten'
                : 'Open'}
        </Button>
      </div>
    </div>
  );
}

// ─── TodayPlan ────────────────────────────────────────────────────────────

function TodayPlan({
  onOpenRecipe,
  onCookNow,
  onToast,
}: {
  onOpenRecipe: (_id: string) => void;
  onCookNow: (_id: string) => void;
  onToast: (msg: string) => void;
}) {
  const tp = mock.todayPlan;
  return (
    <Card
      pad={0}
      style={{
        overflow: 'hidden',
        background: 'linear-gradient(165deg, var(--green-tint) 0%, #F2EBD1 100%)',
        borderColor: 'var(--green-soft)',
      }}
    >
      <div
        style={{
          padding: '26px 28px 20px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.6,
              color: 'var(--green-deep)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Today · Wednesday, Nov 25
          </div>
          <h2
            className="serif"
            style={{ margin: '6px 0 6px', fontSize: 32, letterSpacing: -0.6, lineHeight: 1.1 }}
          >
            What you'll eat today.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--ink-2)',
              maxWidth: 520,
              lineHeight: 1.5,
            }}
          >
            {tp.summary}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <Pill tone="green" size="md" icon="check">
            No shopping needed
          </Pill>
          <Pill tone="orange" size="md" icon="alert">
            Uses spinach
          </Pill>
        </div>
      </div>
      <div
        style={{
          padding: '0 28px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
      >
        {tp.slots.map((s) => (
          <PlanSlot
            key={s.slot}
            slot={s}
            onOpen={() => s.recipe && onOpenRecipe(s.recipe)}
            onCook={() => s.recipe && onCookNow(s.recipe)}
            onToast={onToast}
          />
        ))}
      </div>
    </Card>
  );
}

// ─── CoverageScore ────────────────────────────────────────────────────────

function CoverageScore({ onNav }: { onNav: (id: string) => void }) {
  const c = mock.mealCoverage;
  return (
    <Card pad={22}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 0.6,
            color: 'var(--ink-muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Pantry coverage
        </div>
        <button onClick={() => onNav('pantry')} style={linkBtn}>
          Open pantry
          <Icon name="chevronRight" size={12} />
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14 }}>
        <Ring value={c.days} max={7} size={92} stroke={10} color="var(--green)">
          <div style={{ textAlign: 'center' }}>
            <div
              className="serif tnum"
              style={{ fontSize: 26, color: 'var(--ink)', lineHeight: 1 }}
            >
              {c.days}
            </div>
            <div
              style={{
                fontSize: 9.5,
                color: 'var(--ink-muted)',
                marginTop: 2,
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              days
            </div>
          </div>
        </Ring>
        <div style={{ flex: 1, display: 'grid', gap: 6 }}>
          {[
            { l: 'Breakfasts', v: c.breakfasts, max: 7, c: 'var(--amber)' },
            { l: 'Lunches', v: c.lunches, max: 7, c: 'var(--green)' },
            { l: 'Dinners', v: c.dinners, max: 7, c: 'var(--tomato)' },
            { l: 'Snacks', v: c.snacks, max: 7, c: 'var(--orange)' },
          ].map((r) => (
            <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: '0 0 76px', fontSize: 11.5, color: 'var(--ink-muted)' }}>
                {r.l}
              </div>
              <div
                style={{ flex: 1, height: 4, background: 'var(--line-soft)', borderRadius: 999 }}
              >
                <div
                  style={{
                    width: `${(r.v / r.max) * 100}%`,
                    height: '100%',
                    background: r.c,
                    borderRadius: 999,
                  }}
                />
              </div>
              <div
                className="tnum"
                style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 600 }}
              >
                {r.v}
              </div>
            </div>
          ))}
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
        <span style={{ fontSize: 12, color: 'var(--green-deep)', fontWeight: 600, flex: 1 }}>
          Buy <strong>tortillas</strong> and <strong>canned tomatoes</strong> to unlock 5 more
          meals.
        </span>
      </div>
    </Card>
  );
}

// ─── WasteRescue ─────────────────────────────────────────────────────────

function WasteRescue({
  onCookNow,
  onOpenRecipe,
}: {
  onCookNow: (_id: string) => void;
  onOpenRecipe: (_id: string) => void;
}) {
  const wr = mock.wasteRescue;
  return (
    <Card pad={22}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.6,
              color: 'var(--tomato)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            3-Day Waste Rescue
          </div>
          <div className="serif" style={{ fontSize: 19, color: 'var(--ink)', marginTop: 4 }}>
            Save ~<span className="tnum">${(wr.risk / 100).toFixed(2)}</span> this week
          </div>
        </div>
        <Pill tone="tomato" size="sm" dot>
          3 actions
        </Pill>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {wr.plan.map((p: WasteEntry) => (
          <div
            key={p.day}
            onClick={() => onOpenRecipe(p.recipe)}
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr auto',
              gap: 10,
              alignItems: 'center',
              padding: '10px 12px',
              background: 'var(--paper-warm)',
              border: '1px solid var(--line-soft)',
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: 'var(--tomato)',
                fontWeight: 700,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
              }}
            >
              {p.day}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600, lineHeight: 1.25 }}>
                {p.action}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{p.why}</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {p.illos.map((i) => (
                <div
                  key={i}
                  style={{
                    width: 26,
                    height: 26,
                    background: 'var(--paper)',
                    border: '1px solid var(--line-soft)',
                    borderRadius: 7,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Illo name={i} size={18} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button
        full
        variant="primary"
        iconRight="arrowRight"
        style={{ marginTop: 14 }}
        onClick={() => onCookNow('r1')}
      >
        Start tonight's rescue
      </Button>
    </Card>
  );
}

// ─── ExpiringCard ────────────────────────────────────────────────────────

function ExpiringCard({
  onOpenItem,
  onNav,
}: {
  onOpenItem: (_id: string) => void;
  onNav: (id: string) => void;
}) {
  const expiring = mock.items
    .filter((i) => ['today', 'tomorrow', 'week'].includes(i.status))
    .sort((a, b) => a.expDays - b.expDays)
    .slice(0, 6);
  return (
    <Card pad={22}>
      <SectionHead
        title="Expiring soon"
        eyebrow={`${expiring.length} items`}
        action={
          <button onClick={() => onNav('pantry')} style={linkBtn}>
            Use first
            <Icon name="chevronRight" size={12} />
          </button>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {expiring.map((it) => (
          <IngredientTile key={it.id} item={it} compact onClick={() => onOpenItem(it.id)} />
        ))}
      </div>
    </Card>
  );
}

// ─── PilotCard ────────────────────────────────────────────────────────────

const PILOT_TONE_COLOR: Record<string, string> = {
  green: 'var(--green)',
  tomato: 'var(--tomato)',
  orange: 'var(--orange)',
  amber: 'var(--amber)',
};

const PILOT_ICON_MAP: Record<string, string> = {
  spark: 'sparkles',
  wallet: 'wallet',
  leaf: 'leaf',
  alert: 'alert',
};

function PilotSuggestion({ s }: { s: PilotSug }) {
  const toneColor = PILOT_TONE_COLOR[s.tone] ?? 'var(--green)';
  const iconName = PILOT_ICON_MAP[s.icon] ?? 'alert';
  return (
    <div
      style={{
        padding: '12px 14px',
        background: 'rgba(255,255,255,.04)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 12,
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: `${toneColor}40`,
          color: toneColor,
          display: 'grid',
          placeItems: 'center',
          flex: '0 0 auto',
        }}
      >
        <Icon name={iconName} size={13} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper-warm)', marginBottom: 3 }}>
          {s.title}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(253,250,243,.65)', lineHeight: 1.45 }}>
          {s.body}
        </div>
      </div>
    </div>
  );
}

function PilotCard({ onAskPilot }: { onAskPilot: () => void }) {
  return (
    <Card
      pad={22}
      style={{ background: 'var(--ink)', color: 'var(--paper-warm)', borderColor: 'var(--ink)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            background: 'rgba(255,255,255,.06)',
            color: 'var(--amber)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon name="sparkles" size={15} />
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.8,
              color: 'rgba(253,250,243,.6)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Pilot
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>4 nudges for today</div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {mock.pilotSuggestions.slice(0, 3).map((s) => (
          <PilotSuggestion key={s.id} s={s} />
        ))}
      </div>
      <Button
        full
        variant="ghost"
        iconRight="arrowRight"
        onClick={onAskPilot}
        style={{
          marginTop: 14,
          color: 'var(--paper-warm)',
          borderColor: 'rgba(255,255,255,.12)',
          background: 'rgba(255,255,255,.03)',
        }}
      >
        Ask Pilot anything
      </Button>
    </Card>
  );
}

// ─── KitchenWins ─────────────────────────────────────────────────────────

const WIN_TONE: Record<string, { bg: string; fg: string }> = {
  green: { bg: 'var(--green-tint)', fg: 'var(--green-deep)' },
  orange: { bg: 'var(--orange-tint)', fg: 'var(--orange-deep)' },
  amber: { bg: 'var(--amber-soft)', fg: 'var(--amber-ink)' },
  tomato: { bg: 'var(--tomato-soft)', fg: 'var(--tomato-ink)' },
};

function WinCard({ win }: { win: Win }) {
  const tone = WIN_TONE[win.tone] ?? WIN_TONE.green;
  return (
    <div
      style={{
        padding: '14px 16px',
        background: tone.bg,
        borderRadius: 12,
        border: `1px solid ${tone.fg}22`,
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, color: tone.fg, marginBottom: 8 }}
      >
        <Icon name={win.icon} size={14} />
        <span
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}
        >
          {win.title}
        </span>
      </div>
      <div
        className="serif tnum"
        style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1.1, letterSpacing: -0.3 }}
      >
        {win.value}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 4, lineHeight: 1.4 }}>
        {win.sub}
      </div>
    </div>
  );
}

function KitchenWins() {
  return (
    <Card pad={22}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
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
            Kitchen wins
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>
            Quiet bragging rights · this month
          </div>
        </div>
        <Pill tone="green" size="sm" icon="sparkles">
          On a streak
        </Pill>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {mock.kitchenWins.map((w) => (
          <WinCard key={w.id} win={w} />
        ))}
      </div>
    </Card>
  );
}

// ─── WeekPreview ─────────────────────────────────────────────────────────

function WeekPreview({
  onNav,
  onOpenRecipe,
}: {
  onNav: (id: string) => void;
  onOpenRecipe: (_id: string) => void;
}) {
  const mealPlan = mock.mealPlan;
  const recipeById = (id: string) => mock.recipes.find((r) => r.id === id);
  return (
    <Card pad={22}>
      <SectionHead
        title="This week"
        eyebrow="Mon · Nov 23 — Sun · Nov 29"
        action={
          <button onClick={() => onNav('plan')} style={linkBtn}>
            Open plan
            <Icon name="chevronRight" size={12} />
          </button>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(7, 1fr)', gap: 6 }}>
        <div />
        {mock.days.map((d) => (
          <div
            key={d}
            style={{
              fontSize: 11,
              color: d === 'Wed' ? 'var(--ink)' : 'var(--ink-muted)',
              fontWeight: 700,
              textAlign: 'center',
              padding: '4px 0',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            {d}
          </div>
        ))}
        {(['B', 'L', 'D'] as const).map((slot) => (
          <Fragment key={slot}>
            <div
              style={{
                fontSize: 10,
                color: 'var(--ink-soft)',
                padding: '8px 8px 0 0',
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              {slot === 'B' ? 'Br' : slot === 'L' ? 'Lun' : 'Din'}
            </div>
            {mock.days.map((d) => {
              const rid = mealPlan[d]?.[slot];
              const r = rid ? recipeById(rid) : null;
              return (
                <div
                  key={d + slot}
                  onClick={() => r && onOpenRecipe(r.id)}
                  style={{
                    minHeight: 44,
                    borderRadius: 8,
                    padding: '6px 8px',
                    cursor: r ? 'pointer' : 'default',
                    background: r ? 'var(--paper-warm)' : 'var(--bg-tint)',
                    border: '1px solid var(--line-soft)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {r ? (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 2,
                          height: '100%',
                          background: r.tone,
                        }}
                      />
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: 'var(--ink-2)',
                          lineHeight: 1.2,
                          paddingLeft: 4,
                        }}
                      >
                        {r.name.split(' ').slice(0, 2).join(' ')}
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        fontSize: 9.5,
                        color: 'var(--ink-soft)',
                        textAlign: 'center',
                        paddingTop: 6,
                        fontStyle: 'italic',
                      }}
                    >
                      {slot === 'L' ? 'leftover' : '—'}
                    </div>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </Card>
  );
}

// ─── BudgetMini ───────────────────────────────────────────────────────────

function BudgetMini({ onNav }: { onNav: (id: string) => void }) {
  const b = mock.budget;
  const pct = (b.spent / b.monthly) * 100;
  return (
    <Card pad={22} hover onClick={() => onNav('insights')} style={{ cursor: 'pointer' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
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
          Budget · November
        </div>
        <Pill tone="green" size="sm" icon="check">
          On track
        </Pill>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
        <span className="serif tnum" style={{ fontSize: 30, color: 'var(--ink)', lineHeight: 1 }}>
          ${b.spent.toFixed(0)}
        </span>
        <span className="tnum" style={{ fontSize: 14, color: 'var(--ink-muted)' }}>
          / ${b.monthly}
        </span>
      </div>
      <Progress value={pct} max={100} tone="green" height={8} />
      <div
        className="tnum"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8,
          fontSize: 11.5,
          color: 'var(--ink-muted)',
        }}
      >
        <span>{Math.round(pct)}% used</span>
        <span style={{ color: 'var(--green-deep)', fontWeight: 600 }}>+$42 saved this week</span>
      </div>
    </Card>
  );
}

// ─── NutritionMini ────────────────────────────────────────────────────────

function NutritionMini({ onNav }: { onNav: (id: string) => void }) {
  const n = mock.nutrition;
  return (
    <Card pad={22} hover onClick={() => onNav('insights')} style={{ cursor: 'pointer' }}>
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
          Today's plate
        </div>
        <Pill tone="amber" size="sm">
          + protein
        </Pill>
      </div>
      <div
        style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-around' }}
      >
        {[
          { label: 'Cals', v: n.cals.value, max: n.cals.target, color: 'var(--orange)', unit: '' },
          {
            label: 'Protein',
            v: n.protein.value,
            max: n.protein.target,
            color: 'var(--tomato)',
            unit: 'g',
          },
          {
            label: 'Fiber',
            v: n.fiber.value,
            max: n.fiber.target,
            color: 'var(--green)',
            unit: 'g',
          },
        ].map((it) => (
          <Ring key={it.label} value={it.v} max={it.max} size={60} stroke={6} color={it.color}>
            <div style={{ textAlign: 'center' }}>
              <div
                className="tnum"
                style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 700, lineHeight: 1 }}
              >
                {it.v}
                {it.unit}
              </div>
              <div
                style={{
                  fontSize: 8.5,
                  color: 'var(--ink-muted)',
                  marginTop: 2,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                }}
              >
                {it.label.toUpperCase()}
              </div>
            </div>
          </Ring>
        ))}
      </div>
    </Card>
  );
}

// ─── GroceryMini ─────────────────────────────────────────────────────────

function GroceryMini({ onNav }: { onNav: (id: string) => void }) {
  const items = mock.grocery.filter((g: GroceryItem) => !g.bought);
  const total = items.reduce((s, g) => s + g.price, 0);
  return (
    <Card pad={22} hover onClick={() => onNav('shop')} style={{ cursor: 'pointer' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
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
          Grocery list
        </div>
        <Pill tone="neutral" size="sm">
          {items.length} items
        </Pill>
      </div>
      <div
        className="serif tnum"
        style={{ fontSize: 26, color: 'var(--ink)', lineHeight: 1, marginBottom: 4 }}
      >
        ${total.toFixed(2)}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 14 }}>
        Cheapest at Aldi · ~$10.90 less
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        {items.slice(0, 4).map((g) => (
          <div
            key={g.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 0',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 5,
                border: '1.5px solid var(--line-strong)',
                flex: '0 0 auto',
              }}
            />
            <div
              style={{
                flex: 1,
                fontSize: 13,
                color: 'var(--ink-2)',
                minWidth: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {g.name}
            </div>
            <div
              className="tnum"
              style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 600 }}
            >
              ${g.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      <Button
        full
        variant="soft"
        iconRight="arrowRight"
        onClick={(e) => {
          e.stopPropagation();
          onNav('shop');
        }}
        style={{ marginTop: 12 }}
      >
        Open list
      </Button>
    </Card>
  );
}

// ─── LeftoversMini ────────────────────────────────────────────────────────

function LeftoversMini({ onNav }: { onNav: (id: string) => void }) {
  const list = mock.leftovers;
  return (
    <Card pad={22} hover onClick={() => onNav('pantry')} style={{ cursor: 'pointer' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
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
          Leftovers to use
        </div>
        <Pill tone="orange" size="sm" dot>
          {list.filter((l) => l.days <= 1).length} soon
        </Pill>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {list.slice(0, 3).map((l: Leftover) => {
          const eatToday = l.days === 0;
          return (
            <div
              key={l.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 10,
                background: eatToday
                  ? 'var(--tomato-soft)'
                  : l.days === 1
                    ? 'var(--amber-soft)'
                    : 'var(--paper-warm)',
                border: `1px solid ${eatToday ? 'var(--tomato-line)' : l.days === 1 ? 'var(--amber-line)' : 'var(--line-soft)'}`,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: 'var(--on-tint-pad)',
                  borderRadius: 8,
                  display: 'grid',
                  placeItems: 'center',
                  flex: '0 0 auto',
                }}
              >
                <Illo name={l.illo} size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    lineHeight: 1.25,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {l.meal}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', marginTop: 1 }}>
                  {l.servings} serving{l.servings > 1 ? 's' : ''} · use by {l.useBy}
                </div>
              </div>
              {eatToday && (
                <Pill tone="tomato" size="sm">
                  Today
                </Pill>
              )}
            </div>
          );
        })}
      </div>
      <Button
        full
        variant="soft"
        iconRight="arrowRight"
        onClick={(e) => {
          e.stopPropagation();
          onNav('pantry');
        }}
        style={{ marginTop: 12 }}
      >
        Open leftovers
      </Button>
    </Card>
  );
}

// ─── ActivityCard ────────────────────────────────────────────────────────

function ActivityCard() {
  return (
    <Card pad={22}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: 0.6,
          color: 'var(--ink-muted)',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        Kitchen activity
      </div>
      <div>
        {mock.activity.slice(0, 5).map((a, i) => (
          <ActivityRow key={i} act={a} />
        ))}
      </div>
    </Card>
  );
}

// ─── Dashboard (root) — hooks live here only ──────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const pushToast = useToastStore((s) => s.push);
  const openAskPilot = useNavStore((s) => s.openAskPilot);

  const onNav = (id: string) => navigate('/' + id);
  const onOpenItem = (_id: string) => navigate('/pantry');
  const onOpenRecipe = (_id: string) => navigate('/cook');
  const onCookNow = (_id: string) => navigate('/cook');

  return (
    <div
      style={{
        padding: '28px 28px 56px',
        display: 'grid',
        gap: 20,
        gridTemplateColumns: 'minmax(0, 1fr) 360px',
      }}
    >
      {/* MAIN COLUMN */}
      <div style={{ display: 'grid', gap: 20, minWidth: 0 }}>
        <TodayPlan onOpenRecipe={onOpenRecipe} onCookNow={onCookNow} onToast={pushToast} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
          <CoverageScore onNav={onNav} />
          <WasteRescue onCookNow={onCookNow} onOpenRecipe={onOpenRecipe} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
          <ExpiringCard onOpenItem={onOpenItem} onNav={onNav} />
          <PilotCard onAskPilot={openAskPilot} />
        </div>

        <KitchenWins />

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
          <WeekPreview onNav={onNav} onOpenRecipe={onOpenRecipe} />
          <BudgetMini onNav={onNav} />
        </div>
      </div>

      {/* SIDE COLUMN */}
      <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
        <GroceryMini onNav={onNav} />
        <LeftoversMini onNav={onNav} />
        <NutritionMini onNav={onNav} />
        <ActivityCard />
      </div>
    </div>
  );
}
