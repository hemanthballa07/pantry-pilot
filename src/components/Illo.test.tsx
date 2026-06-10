import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Illo } from './Illo';

describe('Illo', () => {
  it('renders decorative (aria-hidden, no accessible name — the food name is in adjacent text)', () => {
    const { container } = render(<Illo name="rice" />);
    const tile = container.firstElementChild;
    expect(tile?.getAttribute('aria-hidden')).toBe('true');
    expect(tile?.getAttribute('aria-label')).toBeNull();
  });

  it('renders an unknown name without crashing (color falls back)', () => {
    const { container } = render(<Illo name="not-a-real-illo" />);
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });
});
