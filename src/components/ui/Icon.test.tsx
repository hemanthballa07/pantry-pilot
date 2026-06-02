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
});
