import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Illo } from './Illo';

describe('Illo', () => {
  it('labels itself with the illustration name', () => {
    render(<Illo name="rice" />);
    expect(screen.getByLabelText('rice')).toBeInTheDocument();
  });

  it('renders an unknown name without crashing (color falls back)', () => {
    render(<Illo name="not-a-real-illo" />);
    expect(screen.getByLabelText('not-a-real-illo')).toBeInTheDocument();
  });
});
