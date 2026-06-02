import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Cook now</Button>);
    expect(screen.getByRole('button', { name: 'Cook now' })).toBeInTheDocument();
  });

  it('applies the variant background', () => {
    render(<Button variant="secondary">Save</Button>);
    expect(screen.getByRole('button').style.background).toBe('var(--paper-warm, #fdfaf3)');
  });

  it('supports the orange variant (superset from Shop/Plan/Cook)', () => {
    render(<Button variant="orange">Promo</Button>);
    expect(screen.getByRole('button').style.background).toBe('var(--orange, #D9722B)');
  });

  it('renders a leading icon svg', () => {
    render(<Button icon="plus">Add</Button>);
    expect(screen.getByRole('button').querySelector('svg')).not.toBeNull();
  });

  it('renders a trailing icon svg', () => {
    render(<Button iconRight="cart">List</Button>);
    expect(screen.getByRole('button').querySelector('svg')).not.toBeNull();
  });

  it('fires onClick when pressed', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('stretches to full width when full is set', () => {
    render(<Button full>Wide</Button>);
    expect(screen.getByRole('button').style.width).toBe('100%');
  });
});
