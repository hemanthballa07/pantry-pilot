import type { ReactNode } from 'react';
import { Icon } from './Icon';

export type PillTone =
  | 'green'
  | 'orange'
  | 'tomato'
  | 'amber'
  | 'sky'
  | 'ink'
  | 'neutral'
  | 'ghost';

export interface PillProps {
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
