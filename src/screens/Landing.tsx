// src/screens/Landing.tsx — TypeScript port of src/screens/landing.jsx
// Phase 3: self-contained. Uses react-router-dom for navigation and
// useToastStore instead of window.PPToast. UI component stubs replace
// window.PPIcon / window.PPUI / window.PPIllo globals.
// Phase 5 will swap the stubs for the properly-converted component library.
// OQ-009 tracks illustration fidelity (Illo is a colored placeholder here).

import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '@/stores';
import { mock } from '@/data/mock';
import { Icon } from '@/components/ui';

// ─── Illo ─────────────────────────────────────────────────────────────────
// Phase 3 placeholder — a colored rounded square. OQ-009 will wire real SVGs.

const ILLO_COLORS: Record<string, string> = {
  spinach: '#3B6E3D',
  egg: '#C99325',
  rice: '#C8B89A',
  tomato: '#C73E2E',
  carrot: '#D9722B',
  onion: '#6E3A4F',
  milk: '#A8C4D4',
  pepper: '#C73E2E',
  yogurt: '#E8DCC8',
  garlic: '#C8B078',
  berries: '#6E3A4F',
  banana: '#C99325',
  apple: '#C73E2E',
  chicken: '#C8A068',
  tofu: '#E8DCC8',
  beans: '#B85C1F',
  oats: '#C8A880',
  bread: '#C8A068',
  pasta: '#E8D890',
  oil: '#C8B050',
  soy: '#3B2E18',
  cheese: '#C99325',
  coffee: '#4A2C1A',
  chili: '#C73E2E',
  salt: '#D8D4CC',
  ricebag: '#C8B89A',
  frozenveg: '#3B6E3D',
  peanutbutter: '#B85C1F',
  tortilla: '#E8D0A0',
  lime: '#3B6E3D',
  lentils: '#C89050',
  noodles: '#E8D890',
  cilantro: '#3B6E3D',
  peanuts: '#B85C1F',
  ginger: '#C8A068',
  paneer: '#E8DCC8',
  scallion: '#3B6E3D',
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

// ─── Logo ─────────────────────────────────────────────────────────────────

function Logo({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: 'var(--ink, #1a1814)',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--amber, #C99325)',
        fontSize: Math.round(size * 0.5),
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      ✦
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'orange' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconRight?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
  children?: ReactNode;
}

const BTN_BG: Record<ButtonVariant, string> = {
  primary: 'var(--ink, #1a1814)',
  secondary: 'var(--paper-warm, #fdfaf3)',
  orange: 'var(--orange-deep, #B85C1F)',
  ghost: 'transparent',
};
const BTN_FG: Record<ButtonVariant, string> = {
  primary: 'var(--paper-warm, #fdfaf3)',
  secondary: 'var(--ink, #1a1814)',
  orange: 'var(--paper-warm, #fdfaf3)',
  ghost: 'var(--ink, #1a1814)',
};
const BTN_BD: Record<ButtonVariant, string> = {
  primary: 'none',
  secondary: '1px solid var(--line, rgba(0,0,0,.12))',
  orange: 'none',
  ghost: 'none',
};

function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  onClick,
  style,
  children,
}: ButtonProps) {
  const pad = ({ sm: '7px 14px', md: '10px 18px', lg: '13px 24px' } as const)[size];
  const fs = ({ sm: 13, md: 14, lg: 16 } as const)[size];
  const isz = ({ sm: 13, md: 14, lg: 15 } as const)[size];
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: pad,
        fontSize: fs,
        fontWeight: 600,
        background: BTN_BG[variant],
        color: BTN_FG[variant],
        border: BTN_BD[variant],
        borderRadius: 10,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'opacity 120ms',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={isz} stroke="currentColor" />}
      {children}
      {iconRight && <Icon name={iconRight} size={isz} stroke="currentColor" />}
    </button>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────

type PillTone = 'green' | 'amber' | 'tomato' | 'orange' | 'ghost' | 'ink';
type PillSize = 'sm' | 'md' | 'lg';

interface PillProps {
  tone?: PillTone;
  size?: PillSize;
  icon?: string;
  children?: ReactNode;
}

const PILL_STYLE: Record<PillTone, { bg: string; fg: string; bd: string }> = {
  green: { bg: 'var(--green-soft, #C8D8B8)', fg: 'var(--green-deep, #1E5C22)', bd: 'transparent' },
  amber: { bg: 'var(--amber-soft, #EDD99A)', fg: 'var(--amber-ink, #6B4C0A)', bd: 'transparent' },
  tomato: { bg: 'var(--tomato-soft, #F5C4BE)', fg: 'var(--tomato, #C73E2E)', bd: 'transparent' },
  orange: {
    bg: 'var(--orange-tint, #F8E8D8)',
    fg: 'var(--orange-deep, #7A3B10)',
    bd: 'transparent',
  },
  ghost: {
    bg: 'rgba(255,255,255,.06)',
    fg: 'var(--ink-muted, #8a8374)',
    bd: 'rgba(255,255,255,.12)',
  },
  ink: { bg: 'var(--ink, #1a1814)', fg: 'var(--paper-warm, #fdfaf3)', bd: 'transparent' },
};

function Pill({ tone = 'green', size = 'md', icon, children }: PillProps) {
  const s = PILL_STYLE[tone];
  const pad = ({ sm: '3px 8px', md: '5px 11px', lg: '7px 14px' } as const)[size];
  const fs = ({ sm: 11, md: 12, lg: 13 } as const)[size];
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
        color: s.fg,
        border: `1px solid ${s.bd}`,
        borderRadius: 999,
      }}
    >
      {icon && <Icon name={icon} size={fs - 1} stroke={s.fg} />}
      {children}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────

interface CardProps {
  pad?: number;
  hover?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
}

function Card({ pad = 20, hover = false, style, children }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--paper, #fff)',
        border: '1px solid var(--line, rgba(0,0,0,.1))',
        borderRadius: 16,
        padding: pad,
        boxShadow: 'var(--sh-1, 0 1px 4px rgba(0,0,0,.06))',
        transition: hover ? 'box-shadow 120ms, transform 120ms' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Ring ─────────────────────────────────────────────────────────────────

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
  const off = circ * (1 - value / 100);
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

// ─── Avatar / AvatarStack ─────────────────────────────────────────────────

interface AvatarProps {
  initials: string;
  color?: string;
  size?: number;
}

function Avatar({ initials, color = 'var(--ink)', size = 32 }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.floor(size * 0.38),
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

interface AvatarStackProps {
  people: Array<{ initials: string; color?: string }>;
  size?: number;
}

function AvatarStack({ people, size = 32 }: AvatarStackProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {people.map((p, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -(size * 0.3), zIndex: people.length - i }}>
          <div
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: p.color ?? 'var(--ink, #1a1814)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: Math.floor(size * 0.38),
              fontWeight: 700,
              border: '2px solid var(--paper-warm, #fdfaf3)',
            }}
          >
            {p.initials}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ExpiryBadge ──────────────────────────────────────────────────────────

interface ExpiryBadgeProps {
  status: string;
  expires: string;
  size?: 'sm' | 'md';
}

const EXPIRY_TONE: Record<string, { bg: string; fg: string }> = {
  today: { bg: 'var(--tomato-soft, #F5C4BE)', fg: 'var(--tomato, #C73E2E)' },
  tomorrow: { bg: 'var(--orange-tint, #F8E8D8)', fg: 'var(--orange-deep, #7A3B10)' },
  week: { bg: 'var(--amber-soft, #EDD99A)', fg: 'var(--amber-ink, #6B4C0A)' },
  fresh: { bg: 'var(--green-soft, #C8D8B8)', fg: 'var(--green-deep, #1E5C22)' },
  frozen: { bg: '#D8E8F0', fg: '#3A5F7A' },
  expired: { bg: '#E0D0D0', fg: '#8A2020' },
};

function ExpiryBadge({ status, expires, size = 'md' }: ExpiryBadgeProps) {
  const t = EXPIRY_TONE[status] ?? EXPIRY_TONE.fresh;
  const sm = size === 'sm';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: sm ? '2px 7px' : '3px 9px',
        background: t.bg,
        color: t.fg,
        borderRadius: 999,
        fontSize: sm ? 10.5 : 12,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {expires}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

interface SectionHeadProps {
  eyebrow?: string;
  title: ReactNode;
  sub?: string;
}

function SectionHead({ eyebrow, title, sub }: SectionHeadProps) {
  return (
    <div style={{ maxWidth: 760 }}>
      {eyebrow && (
        <div
          style={{
            fontSize: 12,
            letterSpacing: 1,
            color: 'var(--green-deep, #1E5C22)',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          {eyebrow}
        </div>
      )}
      <h2
        className="serif"
        style={{
          fontSize: 42,
          lineHeight: 1.05,
          letterSpacing: -0.8,
          margin: '0 0 12px',
        }}
      >
        {title}
      </h2>
      {sub && (
        <p style={{ fontSize: 16, color: 'var(--ink-muted, #8a8374)', margin: 0, lineHeight: 1.5 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

interface FeatureCardProps {
  tone: 'green' | 'orange' | 'amber';
  icon: string;
  title: string;
  body: string;
  visual: ReactNode;
}

function FeatureCard({ tone, icon, title, body, visual }: FeatureCardProps) {
  const toneMap = {
    green: {
      bg: 'var(--green-tint)',
      bd: 'var(--green-soft)',
      pillBg: 'var(--green-soft)',
      pillFg: 'var(--green-deep, #1E5C22)',
    },
    orange: {
      bg: 'var(--orange-tint)',
      bd: 'var(--orange-soft)',
      pillBg: 'var(--orange-soft)',
      pillFg: 'var(--orange-deep, #7A3B10)',
    },
    amber: {
      bg: 'var(--amber-soft)',
      bd: 'var(--line)',
      pillBg: '#F1E2BA',
      pillFg: 'var(--amber-ink, #6B4C0A)',
    },
  } as const;
  const t = toneMap[tone];
  return (
    <Card
      pad={0}
      hover
      style={{
        overflow: 'hidden',
        background: t.bg,
        borderColor: t.bd,
        height: 460,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: 28 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: t.pillBg,
            color: t.pillFg,
            display: 'grid',
            placeItems: 'center',
            marginBottom: 16,
            border: '1px solid var(--on-tint-border, rgba(0,0,0,.08))',
          }}
        >
          <Icon name={icon} size={18} />
        </div>
        <h3 className="serif" style={{ fontSize: 26, margin: '0 0 10px', letterSpacing: -0.4 }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--ink-2, #4a4535)', margin: 0, lineHeight: 1.55 }}>
          {body}
        </p>
      </div>
      <div style={{ flex: 1, padding: '0 28px 28px', display: 'flex', alignItems: 'flex-end' }}>
        {visual}
      </div>
    </Card>
  );
}

// ─── Landing section helpers ───────────────────────────────────────────────

function HeroVisual() {
  const push = useToastStore((s) => s.push);
  return (
    <div style={{ position: 'relative', height: 540 }}>
      <Card
        pad={20}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 460,
          transform: 'rotate(2.5deg)',
          boxShadow: 'var(--sh-3, 0 8px 32px rgba(0,0,0,.12))',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 11.5,
              letterSpacing: 0.8,
              color: 'var(--ink-muted, #8a8374)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Your fridge · today
          </div>
          <Pill tone="tomato" size="sm" icon="alert">
            4 use soon
          </Pill>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {(['spinach', 'egg', 'rice', 'tomato', 'yogurt', 'carrot'] as const).map((n, i) => (
            <div
              key={n}
              style={{
                background:
                  i < 2
                    ? 'linear-gradient(160deg, #F5D9D2 0%, #F2C6BC 100%)'
                    : i < 4
                      ? 'linear-gradient(160deg, #F4E6C8 0%, #EFD7A4 100%)'
                      : 'linear-gradient(160deg, #E5EBD5 0%, #D2DFB6 100%)',
                borderRadius: 12,
                padding: 12,
                display: 'grid',
                placeItems: 'center',
                border: '1px solid var(--on-tint-border, rgba(0,0,0,.08))',
              }}
            >
              <Illo name={n} size={42} />
            </div>
          ))}
        </div>
      </Card>

      <Card
        pad={22}
        style={{
          position: 'absolute',
          top: 200,
          left: 0,
          width: 380,
          boxShadow: 'var(--sh-lift, 0 4px 24px rgba(0,0,0,.15))',
          borderColor: 'var(--line-strong, rgba(0,0,0,.16))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background: 'var(--ink, #1a1814)',
              color: 'var(--amber, #C99325)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="sparkles" size={15} stroke="currentColor" />
          </div>
          <div
            style={{
              fontSize: 11.5,
              letterSpacing: 0.8,
              color: 'var(--ink-muted, #8a8374)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Pilot suggests · 7:14 pm
          </div>
        </div>
        <div
          className="serif"
          style={{
            fontSize: 22,
            lineHeight: 1.2,
            color: 'var(--ink, #1a1814)',
            letterSpacing: -0.3,
            marginBottom: 12,
          }}
        >
          Make Schezwan fried rice tonight.
        </div>
        <div
          style={{
            fontSize: 13.5,
            color: 'var(--ink-muted, #8a8374)',
            lineHeight: 1.5,
            marginBottom: 14,
          }}
        >
          Uses your <strong style={{ color: 'var(--tomato, #C73E2E)' }}>spinach</strong>, leftover
          rice, and eggs. 18 minutes, $2.40 a serving.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              push('Open the kitchen to start cooking');
            }}
          >
            Cook now
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              push('Saved');
            }}
          >
            Save
          </Button>
        </div>
      </Card>

      <Card
        pad={18}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 40,
          width: 200,
          transform: 'rotate(-3deg)',
          boxShadow: 'var(--sh-3, 0 8px 32px rgba(0,0,0,.12))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Ring value={84} size={62} stroke={7} color="var(--green, #3B6E3D)">
            <div
              className="serif tnum"
              style={{ fontSize: 18, color: 'var(--ink, #1a1814)', lineHeight: 1 }}
            >
              84
            </div>
          </Ring>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-muted, #8a8374)', fontWeight: 600 }}>
              Pantry health
            </div>
            <div style={{ fontSize: 12, color: 'var(--green-deep, #1E5C22)', fontWeight: 600 }}>
              Good
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function FloatProduce() {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: -30,
          top: 320,
          opacity: 0.5,
          transform: 'rotate(-12deg)',
        }}
      >
        <Illo name="carrot" size={120} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 80,
          bottom: -20,
          opacity: 0.4,
          transform: 'rotate(6deg)',
        }}
      >
        <Illo name="onion" size={90} />
      </div>
    </>
  );
}

function InventoryGlance() {
  const items = ['egg', 'milk', 'pepper', 'rice', 'tomato', 'spinach', 'garlic', 'yogurt'] as const;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, width: '100%' }}>
      {items.map((n) => (
        <div
          key={n}
          style={{
            aspectRatio: '1 / 1',
            background: 'var(--paper-warm, #fdfaf3)',
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            border: '1px solid var(--line-soft, rgba(0,0,0,.07))',
          }}
        >
          <Illo name={n} size={32} />
        </div>
      ))}
    </div>
  );
}

function ExpiryGlance() {
  const rows = [
    { n: 'spinach', name: 'Spinach', status: 'tomorrow', time: 'Tomorrow' },
    { n: 'rice', name: 'Cooked rice', status: 'today', time: 'Use today' },
    { n: 'milk', name: 'Whole milk', status: 'week', time: '2 days' },
    { n: 'egg', name: 'Eggs', status: 'fresh', time: '9 days' },
  ] as const;
  return (
    <div style={{ width: '100%', display: 'grid', gap: 8 }}>
      {rows.map((r) => (
        <div
          key={r.n}
          style={{
            background: 'var(--paper-warm, #fdfaf3)',
            borderRadius: 10,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid var(--line-soft, rgba(0,0,0,.07))',
          }}
        >
          <Illo name={r.n} size={28} />
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{r.name}</div>
          <ExpiryBadge status={r.status} expires={r.time} size="sm" />
        </div>
      ))}
    </div>
  );
}

function RecipeGlance() {
  return (
    <div
      style={{
        width: '100%',
        background: 'var(--paper, #fff)',
        border: '1px solid var(--line, rgba(0,0,0,.1))',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 90,
          background: 'linear-gradient(135deg, #C73E2E 0%, #D9722B 100%)',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
        }}
      >
        <Illo name="rice" size={56} />
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <Pill tone="ink" size="sm">
            92% match
          </Pill>
        </div>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>
          Schezwan Egg Fried Rice
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-muted, #8a8374)' }}>
          18 min · Easy · $2.40/serving
        </div>
      </div>
    </div>
  );
}

function PlannerGlance() {
  const meals: Array<[string, string, string]> = [
    ['B', 'Banana oat pancakes', 'var(--amber, #C99325)'],
    ['L', 'Chickpea rice bowl', 'var(--green, #3B6E3D)'],
    ['D', 'Schezwan fried rice', 'var(--tomato, #C73E2E)'],
  ];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <Card pad={20} style={{ boxShadow: 'var(--sh-3, 0 8px 32px rgba(0,0,0,.12))' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <div className="serif" style={{ fontSize: 17 }}>
          This week
        </div>
        <Pill tone="green" size="sm" icon="check">
          Balanced
        </Pill>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(7, 1fr)',
          gap: 6,
          fontSize: 11,
          color: 'var(--ink-muted, #8a8374)',
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        <div />
        {days.map((d) => (
          <div key={d} style={{ textAlign: 'center' }}>
            {d}
          </div>
        ))}
      </div>
      {meals.map(([k, label, tone]) => (
        <div
          key={k}
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto repeat(7, 1fr)',
            gap: 6,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-soft, #9a9080)',
              fontWeight: 700,
              padding: '8px 8px 0 0',
            }}
          >
            {k}
          </div>
          {days.map((d, i) => (
            <div
              key={d}
              style={{
                height: 46,
                borderRadius: 8,
                background:
                  i === 1 && k === 'L'
                    ? 'var(--bg-tint, rgba(0,0,0,.03))'
                    : 'var(--paper-warm, #fdfaf3)',
                border: '1px solid var(--line, rgba(0,0,0,.1))',
                padding: '4px 6px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {i === 1 && k === 'L' ? (
                <div
                  style={{
                    fontSize: 9.5,
                    color: 'var(--ink-soft, #9a9080)',
                    textAlign: 'center',
                    marginTop: 14,
                  }}
                >
                  leftover
                </div>
              ) : (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 3,
                      height: '100%',
                      background: tone,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 9.5,
                      fontWeight: 600,
                      color: 'var(--ink-2, #4a4535)',
                      lineHeight: 1.2,
                      paddingLeft: 4,
                    }}
                  >
                    {label.split(' ').slice(0, 2).join(' ')}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
      <div
        style={{
          marginTop: 18,
          padding: '12px 14px',
          background: 'var(--green-tint)',
          border: '1px solid var(--green-soft)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Icon name="sparkles" size={16} stroke="var(--green-deep, #1E5C22)" />
        <div
          style={{ fontSize: 12.5, color: 'var(--green-deep, #1E5C22)', fontWeight: 600, flex: 1 }}
        >
          Pilot built a grocery list: 11 items · est. $42
        </div>
        <Icon name="chevronRight" size={14} stroke="var(--green-deep, #1E5C22)" />
      </div>
    </Card>
  );
}

function BudgetGlance() {
  const rows = [
    { c: 'Produce', v: 42, color: 'var(--green, #3B6E3D)' },
    { c: 'Dairy', v: 22, color: 'var(--amber, #C99325)' },
    { c: 'Meat', v: 17, color: 'var(--tomato, #C73E2E)' },
    { c: 'Grains', v: 12, color: 'var(--orange, #D9722B)' },
  ] as const;
  return (
    <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 18 }}>
      <Ring
        value={74}
        size={84}
        stroke={9}
        color="var(--green, #3B6E3D)"
        trackColor="rgba(60,50,30,.08)"
      >
        <div style={{ textAlign: 'center' }}>
          <div
            className="serif tnum"
            style={{ fontSize: 20, color: 'var(--ink, #1a1814)', lineHeight: 1 }}
          >
            $184
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--ink-muted, #8a8374)',
              marginTop: 2,
              fontWeight: 600,
            }}
          >
            of $250
          </div>
        </div>
      </Ring>
      <div style={{ flex: 1 }}>
        {rows.map((r) => (
          <div key={r.c} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: r.color }} />
            <div
              style={{ fontSize: 11.5, color: 'var(--ink-2, #4a4535)', flex: 1, fontWeight: 600 }}
            >
              {r.c}
            </div>
            <div className="tnum" style={{ fontSize: 11.5, color: 'var(--ink-muted, #8a8374)' }}>
              {r.v}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Landing (default export) ──────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();
  // Phase 3 smoke test: assert @/data/mock is reachable from a converted screen.
  // Rendered as a data-attribute; not visible to users; verifiable in DevTools.
  const smokeText = mock.todayPlan.summary;

  const goto = (id: string) => () =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const navLinks = [
    { label: 'Product', onClick: goto('section-features') },
    { label: 'Recipes', onClick: () => navigate('/cook') },
    { label: 'Households', onClick: () => navigate('/household') },
    { label: 'Pricing', onClick: goto('section-cta') },
    { label: 'About', onClick: goto('section-quote') },
  ];
  const footerLinks = [
    { label: 'Help', onClick: () => navigate('/settings') },
    { label: 'Privacy', onClick: goto('section-features') },
    { label: 'Terms', onClick: goto('section-features') },
    { label: 'Status', onClick: goto('section-features') },
    { label: 'Press', onClick: goto('section-quote') },
  ];

  // In the prototype, "Open kitchen" triggers the onboarding modal.
  // Phase 3: navigate to /dashboard (onboarding screen converts in Phase 4).
  const enterKitchen = () => navigate('/dashboard');

  return (
    <div
      data-summary={smokeText}
      style={{ minHeight: '100vh', background: 'var(--bg, #fafaf7)', color: 'var(--ink, #1a1814)' }}
    >
      {/* Top nav */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(250,246,238,.82)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--line-soft, rgba(0,0,0,.07))',
          padding: '16px 48px',
          display: 'flex',
          alignItems: 'center',
          gap: 28,
        }}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <Logo size={30} />
          <div
            className="serif"
            style={{ fontSize: 19, letterSpacing: -0.3, color: 'var(--ink, #1a1814)' }}
          >
            PantryPilot
          </div>
        </button>
        <nav style={{ display: 'flex', gap: 22, marginLeft: 24 }}>
          {navLinks.map((l) => (
            <button
              key={l.label}
              onClick={l.onClick}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: 'var(--ink-muted, #8a8374)',
                fontSize: 13.5,
                fontWeight: 500,
                fontFamily: 'inherit',
                transition: 'color 120ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink, #1a1814)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-muted, #8a8374)')}
            >
              {l.label}
            </button>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: 'var(--ink-muted, #8a8374)',
            fontSize: 13.5,
            fontWeight: 500,
            fontFamily: 'inherit',
          }}
        >
          Sign in
        </button>
        <Button variant="primary" size="sm" onClick={enterKitchen} iconRight="arrowRight">
          Open kitchen
        </Button>
      </header>
      <div id="page-top" />

      {/* Hero */}
      <section style={{ padding: '72px 48px 48px', position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.05fr .95fr',
            gap: 56,
            alignItems: 'center',
          }}
        >
          <div>
            <Pill tone="green" size="lg" icon="sparkles">
              Backed by Pilot, your kitchen AI
            </Pill>
            <h1
              className="serif"
              style={{
                fontSize: 76,
                lineHeight: 1.02,
                letterSpacing: -1.5,
                margin: '20px 0 22px',
                color: 'var(--ink, #1a1814)',
              }}
            >
              Waste less food. <br />
              <em style={{ fontStyle: 'italic', color: 'var(--green-deep, #1E5C22)' }}>
                Cook smarter
              </em>{' '}
              every week.
            </h1>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.55,
                color: 'var(--ink-2, #4a4535)',
                maxWidth: 540,
                margin: '0 0 32px',
              }}
            >
              PantryPilot knows what's in your kitchen, nudges you before food expires, and turns
              what you already have into dinner — without another grocery run.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" onClick={enterKitchen} iconRight="arrowRight">
                Start your kitchen
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon="circle"
                onClick={() => navigate('/dashboard')}
              >
                Watch the demo · 90s
              </Button>
            </div>
            <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 14 }}>
              <AvatarStack
                people={[
                  { initials: 'HB', color: '#3B6E3D' },
                  { initials: 'AC', color: '#D9722B' },
                  { initials: 'MP', color: '#6E3A4F' },
                  { initials: 'JD', color: '#3A5F7A' },
                  { initials: 'KR', color: '#C73E2E' },
                ]}
                size={30}
              />
              <div style={{ fontSize: 13, color: 'var(--ink-muted, #8a8374)' }}>
                <strong style={{ color: 'var(--ink-2, #4a4535)' }}>14,200+</strong> households
                cooking from their pantry
              </div>
            </div>
          </div>
          <HeroVisual />
        </div>
        <FloatProduce />
      </section>

      {/* Pain band */}
      <section
        style={{
          padding: '32px 48px',
          borderTop: '1px solid var(--line-soft, rgba(0,0,0,.07))',
          borderBottom: '1px solid var(--line-soft, rgba(0,0,0,.07))',
          background: 'var(--paper-warm, #fdfaf3)',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: 12,
              letterSpacing: 1,
              color: 'var(--ink-muted, #8a8374)',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            The kitchen most of us actually run
          </div>
          {[
            { num: '$1,500', label: 'wasted on spoiled food / household / year' },
            { num: '32%', label: "of groceries thrown out before they're used" },
            { num: '4.5×', label: 'more takeout when nothing in the fridge inspires' },
            { num: '21 min', label: 'the average decide-what-to-cook spiral' },
          ].map((s) => (
            <div key={s.num} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="serif" style={{ fontSize: 24, color: 'var(--ink, #1a1814)' }}>
                {s.num}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-muted, #8a8374)', maxWidth: 200 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features 1 */}
      <section id="section-features" style={{ padding: '96px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHead
            eyebrow="What PantryPilot does"
            title={
              <>
                One question, every day:{' '}
                <em style={{ color: 'var(--green-deep, #1E5C22)', fontStyle: 'italic' }}>
                  what should I cook?
                </em>
              </>
            }
            sub="Inventory, expiry, recipes, planning, grocery, budget — all in one calm place."
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
              marginTop: 40,
            }}
          >
            <FeatureCard
              tone="green"
              icon="pantry"
              title="Know what you have"
              body="A clean inventory across pantry, fridge, freezer, and leftovers. Scan a receipt or barcode; everything organizes itself."
              visual={<InventoryGlance />}
            />
            <FeatureCard
              tone="orange"
              icon="clock"
              title="Stop tossing food"
              body="Color-coded expiry, friendly nudges, and recipes that use what's about to spoil — before it does."
              visual={<ExpiryGlance />}
            />
            <FeatureCard
              tone="amber"
              icon="chef"
              title="Cook from what you have"
              body="Pilot suggests meals you can make right now, ranks them by ingredient match and freshness, and walks you through cooking."
              visual={<RecipeGlance />}
            />
          </div>
        </div>
      </section>

      {/* Meal planner split */}
      <section style={{ padding: '0 48px 96px' }}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            background: 'linear-gradient(165deg, #F4EEDF 0%, #ECE3CB 100%)',
            borderRadius: 28,
            padding: '64px 56px',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid var(--line, rgba(0,0,0,.1))',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.15fr',
              gap: 56,
              alignItems: 'center',
            }}
          >
            <div>
              <Pill tone="green" size="md">
                Weekly meal plan
              </Pill>
              <h2
                className="serif"
                style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: -1, margin: '16px 0 18px' }}
              >
                Plan a whole week in one calm screen.
              </h2>
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.55,
                  color: 'var(--ink-2, #4a4535)',
                  maxWidth: 480,
                }}
              >
                Drag recipes onto a calendar. Pilot balances protein, fits your budget, and prefers
                ingredients you already have. Your grocery list writes itself.
              </p>
              <ul
                style={{ marginTop: 24, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}
              >
                {[
                  "Auto-fills around what's expiring",
                  'Generates a sectioned grocery list',
                  'Adjusts for high-protein, vegetarian, or under-$60 weeks',
                ].map((x) => (
                  <li
                    key={x}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 14.5,
                      color: 'var(--ink-2, #4a4535)',
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 999,
                        background: 'var(--green-soft, #C8D8B8)',
                        color: 'var(--green-deep, #1E5C22)',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Icon name="check" size={13} />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 30 }}>
                <Button variant="primary" iconRight="arrowRight" onClick={() => navigate('/plan')}>
                  Open meal planner
                </Button>
              </div>
            </div>
            <PlannerGlance />
          </div>
        </div>
      </section>

      {/* Quote */}
      <section id="section-quote" style={{ padding: '32px 48px 96px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{ fontSize: 36, color: 'var(--green-deep, #1E5C22)', marginBottom: 12 }}
            className="serif"
          >
            "
          </div>
          <p
            className="serif"
            style={{
              fontSize: 32,
              lineHeight: 1.25,
              letterSpacing: -0.5,
              color: 'var(--ink, #1a1814)',
              margin: 0,
            }}
          >
            I haven't ordered Uber Eats out of decision fatigue in three weeks. The fridge actually
            tells me what to cook now — and I throw out almost nothing.
          </p>
          <div style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Avatar initials="MR" color="var(--plum, #6E3A4F)" size={32} />
            <div style={{ textAlign: 'left', fontSize: 13 }}>
              <div style={{ fontWeight: 600, color: 'var(--ink, #1a1814)' }}>Mira R.</div>
              <div style={{ color: 'var(--ink-muted, #8a8374)' }}>Graduate student · Brooklyn</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features 2 — AI + Budget + Household */}
      <section style={{ padding: '0 48px 96px' }}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: 20,
          }}
        >
          <Card
            pad={36}
            style={{
              background: 'var(--ink, #1a1814)',
              color: 'var(--paper-warm, #fdfaf3)',
              borderColor: 'var(--ink, #1a1814)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Pill tone="ghost" size="md">
              <span style={{ color: 'var(--amber, #C99325)', display: 'flex' }}>
                <Icon name="sparkles" size={12} stroke="currentColor" />
              </span>
              <span style={{ color: 'var(--paper-warm, #fdfaf3)', opacity: 0.85 }}>Ask Pilot</span>
            </Pill>
            <h2
              className="serif"
              style={{ fontSize: 38, margin: '18px 0 14px', lineHeight: 1.1, letterSpacing: -0.6 }}
            >
              Your kitchen's quiet co-pilot.
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.55,
                color: 'rgba(253,250,243,.78)',
                maxWidth: 460,
                margin: 0,
              }}
            >
              Pilot watches your pantry, suggests recipes from what's about to expire, rewrites your
              shopping list when you change your mind, and texts you a heads-up before you
              double-buy.
            </p>
            <div style={{ marginTop: 28, display: 'grid', gap: 10 }}>
              {[
                '"What can I make with rice, eggs, and onions in 20 minutes?"',
                '"Plan a $60 high-protein week."',
                '"What\'s expiring this week?"',
              ].map((q) => (
                <div
                  key={q}
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 12,
                    fontSize: 13.5,
                    color: 'var(--paper-warm, #fdfaf3)',
                  }}
                >
                  {q}
                </div>
              ))}
            </div>
            <div
              style={{
                position: 'absolute',
                right: -40,
                bottom: -40,
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(217,114,43,0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
          </Card>
          <div style={{ display: 'grid', gap: 20 }}>
            <Card
              pad={28}
              style={{ background: 'var(--green-tint)', borderColor: 'var(--green-soft)' }}
            >
              <Pill tone="green" size="md" icon="wallet">
                Budget aware
              </Pill>
              <h3
                className="serif"
                style={{ fontSize: 26, margin: '12px 0 10px', letterSpacing: -0.3 }}
              >
                See where your $250 goes.
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--ink-2, #4a4535)',
                  margin: 0,
                  lineHeight: 1.55,
                  maxWidth: 420,
                }}
              >
                Monthly budget rings, store comparisons, and a waste cost line so you can spot the
                spinach that keeps coming home and leaving in the bin.
              </p>
              <BudgetGlance />
            </Card>
            <Card
              pad={28}
              style={{ background: 'var(--orange-tint)', borderColor: 'var(--orange-soft)' }}
            >
              <Pill tone="orange" size="md" icon="users">
                Shared kitchens
              </Pill>
              <h3
                className="serif"
                style={{ fontSize: 26, margin: '12px 0 10px', letterSpacing: -0.3 }}
              >
                Built for roommates and families.
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--ink-2, #4a4535)',
                  margin: 0,
                  lineHeight: 1.55,
                  maxWidth: 420,
                }}
              >
                Shared pantry, personal items, ownership labels, and a grocery list that warns the
                second person before they buy that third box of pasta.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '0 48px 120px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHead eyebrow="How it works" title="Three steps to a calmer kitchen." />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
              marginTop: 32,
            }}
          >
            {[
              {
                n: '01',
                t: 'Stock the pantry',
                icon: 'scan',
                tone: 'var(--green, #3B6E3D)',
                d: 'Snap a grocery receipt, scan barcodes, or add items by hand. Expiry dates fill in automatically.',
              },
              {
                n: '02',
                t: 'Pilot watches everything',
                icon: 'sparkles',
                tone: 'var(--orange, #D9722B)',
                d: 'Quietly tracks freshness, low staples, your habits — and surfaces the ones that matter today.',
              },
              {
                n: '03',
                t: 'Cook, plan, repeat',
                icon: 'chef',
                tone: 'var(--tomato, #C73E2E)',
                d: 'Recipes from what you have. A meal plan that fits your week. A grocery list that fits your budget.',
              },
            ].map((s) => (
              <Card key={s.n} pad={28} style={{ minHeight: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'var(--bg-tint, rgba(0,0,0,.04))',
                      color: s.tone,
                      display: 'grid',
                      placeItems: 'center',
                      border: '1px solid var(--line, rgba(0,0,0,.1))',
                    }}
                  >
                    <Icon name={s.icon} size={18} stroke={s.tone} />
                  </div>
                  <span
                    className="serif tnum"
                    style={{ color: 'var(--ink-soft, #9a9080)', fontSize: 18 }}
                  >
                    {s.n}
                  </span>
                </div>
                <h3
                  className="serif"
                  style={{ fontSize: 22, margin: '0 0 8px', letterSpacing: -0.3 }}
                >
                  {s.t}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13.5,
                    color: 'var(--ink-muted, #8a8374)',
                    lineHeight: 1.55,
                  }}
                >
                  {s.d}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="section-cta" style={{ padding: '0 48px 80px' }}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            background: 'var(--ink, #1a1814)',
            borderRadius: 28,
            padding: '64px 56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32,
            flexWrap: 'wrap',
            color: 'var(--paper-warm, #fdfaf3)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: 620, position: 'relative', zIndex: 2 }}>
            <h2
              className="serif"
              style={{ fontSize: 52, lineHeight: 1.05, letterSpacing: -1, margin: '0 0 16px' }}
            >
              Open your kitchen.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(253,250,243,.7)', margin: 0, maxWidth: 480 }}>
              Free to start. No card. Connects with grocery receipts, barcodes, and your household.
              Two minutes to set up, calmer kitchen by Friday.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 2 }}>
            <Button variant="orange" size="lg" iconRight="arrowRight" onClick={enterKitchen}>
              Open kitchen
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'transparent',
                color: 'var(--paper-warm, #fdfaf3)',
                border: '1px solid rgba(253,250,243,.25)',
              }}
            >
              View demo
            </Button>
          </div>
          <div style={{ position: 'absolute', right: -30, bottom: -30, opacity: 0.4 }}>
            <Illo name="tomato" size={180} />
          </div>
          <div style={{ position: 'absolute', right: 160, top: -20, opacity: 0.35 }}>
            <Illo name="spinach" size={120} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '32px 48px 48px',
          borderTop: '1px solid var(--line-soft, rgba(0,0,0,.07))',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={24} />
            <span className="serif" style={{ fontSize: 15 }}>
              PantryPilot
            </span>
            <span style={{ fontSize: 12, color: 'var(--ink-soft, #9a9080)' }}>
              · Made for kitchens that get used
            </span>
          </div>
          <div style={{ display: 'flex', gap: 22 }}>
            {footerLinks.map((l) => (
              <button
                key={l.label}
                onClick={l.onClick}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'var(--ink-muted, #8a8374)',
                  fontSize: 12.5,
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink-2, #4a4535)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-muted, #8a8374)')}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft, #9a9080)' }}>
            © 2026 PantryPilot Co-op
          </div>
        </div>
      </footer>
    </div>
  );
}
