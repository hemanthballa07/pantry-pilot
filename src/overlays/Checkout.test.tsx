import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkout } from './Checkout';

afterEach(() => vi.useRealTimers());

describe('Checkout overlay', () => {
  it('opens on the cart phase with the basket and a Place order action', () => {
    render(<Checkout onClose={() => {}} />);
    expect(screen.getByText(/your basket/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
  });

  it('exposes the surface as a dialog named Checkout', () => {
    render(<Checkout onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: /checkout/i })).toBeInTheDocument();
  });

  it('the close button calls onClose', async () => {
    const onClose = vi.fn();
    render(<Checkout onClose={onClose} />);
    await userEvent.click(screen.getByLabelText('Close checkout'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Place order advances to the placing state', async () => {
    render(<Checkout onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /place order/i }));
    expect(screen.getByText(/placing your order/i)).toBeInTheDocument();
  });

  it('settles into the order-placed summary after the placing delay', () => {
    vi.useFakeTimers();
    render(<Checkout onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    expect(screen.getByText(/placing your order/i)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1700);
    });
    expect(screen.getByText(/order placed/i)).toBeInTheDocument();
  });

  it('switching to Pickup waives the delivery fee', async () => {
    render(<Checkout onClose={() => {}} />);
    // Aldi (default) charges a delivery fee, so "Free" is absent on the cart phase.
    expect(screen.queryByText('Free')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /pickup/i }));
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('removing an item drops the basket count', async () => {
    render(<Checkout onClose={() => {}} />);
    const removeButtons = screen.getAllByRole('button', { name: /^Remove / });
    const n = removeButtons.length;
    expect(n).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(`^${n} items · delivered`))).toBeInTheDocument();
    await userEvent.click(removeButtons[0]);
    expect(screen.getByText(new RegExp(`^${n - 1} items · delivered`))).toBeInTheDocument();
  });

  it('deselecting every basket item disables Place order', async () => {
    render(<Checkout onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /place order/i })).toBeEnabled();
    // Each cart row exposes a distinct "Remove <name>" button; click each once.
    for (const btn of screen.getAllByRole('button', { name: /^Remove / })) {
      await userEvent.click(btn);
    }
    expect(screen.getByRole('button', { name: /place order/i })).toBeDisabled();
  });
});
