// src/screens/extras/shared.tsx — shared UI primitives for the Extras quartet.
//
// Extracted verbatim from the former monolithic src/screens/Extras.tsx as part of the
// OQ-004 / ADR-004 split (Insights / Household / Imports / Settings each became their own
// module). These mirror the per-file inline-primitive convention used elsewhere (Cook,
// Landing); an app-wide consolidation is tracked as OQ-011.
import type { CSSProperties, ReactNode } from 'react';
import type { ActivityEntry } from '@/types';
import { Icon, Pill, Button } from '@/components/ui';
import { Illo } from '@/components/Illo';

// ─── Icon (OQ-011b: now the shared components/ui primitive; re-exported so the
//     Extras quartet keeps importing it from here) ───────────────────────────
export { Icon };

// ─── Illo (OQ-011c: shared components/Illo, re-exported for the Extras quartet) ──
export { Illo };

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

// ─── Pill (OQ-011c: shared components/ui Pill, re-exported) ─────────────────
export { Pill };

// ─── Button (OQ-011c: shared components/ui Button, re-exported) ─────────────
export { Button };

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
