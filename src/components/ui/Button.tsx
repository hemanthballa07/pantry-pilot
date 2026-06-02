import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { Icon } from './Icon';

export interface ButtonProps {
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
