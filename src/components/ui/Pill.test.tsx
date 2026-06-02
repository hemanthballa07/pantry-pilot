import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pill } from './Pill';

describe('Pill', () => {
  it('renders its children', () => {
    render(<Pill>2 days left</Pill>);
    expect(screen.getByText('2 days left')).toBeInTheDocument();
  });

  it('applies the tone color', () => {
    render(<Pill tone="tomato">urgent</Pill>);
    const el = screen.getByText('urgent');
    expect(el.style.color).toBe('var(--tomato-ink, #b02020)');
  });

  it('renders an inner svg when an icon is given', () => {
    render(<Pill icon="alert">today</Pill>);
    expect(screen.getByText('today').querySelector('svg')).not.toBeNull();
  });

  it('renders a dot when dot is set', () => {
    render(<Pill dot>fresh</Pill>);
    const el = screen.getByText('fresh');
    const dot = el.querySelector('span');
    expect(dot).not.toBeNull();
    expect(dot?.style.background.toLowerCase()).toBe('currentcolor');
  });
});
