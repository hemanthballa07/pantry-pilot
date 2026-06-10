import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon (ui)', () => {
  it('renders an svg with the union path for a known name', () => {
    const { container } = render(<Icon name="plus" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.querySelector('path')?.getAttribute('d')).toBe('M12 5v14M5 12h14');
  });

  it('renders an empty path d for an unknown name', () => {
    const { container } = render(<Icon name="not-a-real-icon" />);
    expect(container.querySelector('path')?.getAttribute('d')).toBe('');
  });

  it('applies size to width and height', () => {
    const { container } = render(<Icon name="check" size={24} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('24');
    expect(svg?.getAttribute('height')).toBe('24');
  });

  it('applies the stroke prop', () => {
    const { container } = render(<Icon name="check" stroke="var(--ink-soft)" />);
    expect(container.querySelector('svg')?.getAttribute('stroke')).toBe('var(--ink-soft)');
  });

  it('is aria-hidden by default, but is not when decorative={false}', () => {
    const plain = render(<Icon name="check" />);
    expect(plain.container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    const meaningful = render(<Icon name="check" decorative={false} />);
    expect(meaningful.container.querySelector('svg')?.getAttribute('aria-hidden')).toBeNull();
  });

  it('resolves the canonical NEW glyph names added for OQ-011b', () => {
    // The 8 names the divergent files needed that weren't in the Phase-A union.
    for (const name of [
      'scan',
      'camera',
      'barcode',
      'checkCircle',
      'arrowUp',
      'arrowDown',
      'chevronUp',
      'chevronDown',
    ]) {
      const { container } = render(<Icon name={name} />);
      expect(container.querySelector('path')?.getAttribute('d')).not.toBe('');
    }
  });
});
