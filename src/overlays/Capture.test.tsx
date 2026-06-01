import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Capture } from './Capture';

afterEach(() => vi.useRealTimers());

describe('Capture overlay — receipt', () => {
  it('opens the receipt capture phase as a dialog', () => {
    render(<Capture kind="receipt" onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: /scan receipt/i })).toBeInTheDocument();
    expect(screen.getByText(/snap your receipt/i)).toBeInTheDocument();
  });

  it('the close button calls onClose', async () => {
    const onClose = vi.fn();
    render(<Capture kind="receipt" onClose={onClose} />);
    await userEvent.click(screen.getByLabelText('Close capture'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('capturing advances to the detecting (OCR) phase', async () => {
    render(<Capture kind="receipt" onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /use camera/i }));
    expect(screen.getByText(/line items read|matching against the catalog/i)).toBeInTheDocument();
  });
});

describe('Capture overlay — barcode', () => {
  it('opens the barcode scan phase as a dialog', () => {
    render(<Capture kind="barcode" onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: /scan barcode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scan an item/i })).toBeInTheDocument();
  });

  it('scanning an item decodes the first catalog product into the tray', () => {
    vi.useFakeTimers();
    render(<Capture kind="barcode" onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /scan an item/i }));
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getAllByText(/greek yogurt/i).length).toBeGreaterThan(0);
  });

  it('does not fire decode timers after the overlay closes mid-scan', () => {
    vi.useFakeTimers();
    const { unmount } = render(<Capture kind="barcode" onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /scan an item/i }));
    unmount(); // close while "Decoding…" (before the 700ms decode resolves)
    expect(() =>
      act(() => {
        vi.advanceTimersByTime(2000);
      }),
    ).not.toThrow();
  });
});

describe('Capture overlay — fridge', () => {
  it('opens the fridge capture phase as a dialog', () => {
    render(<Capture kind="fridge" onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: /photo of fridge/i })).toBeInTheDocument();
    expect(screen.getByText(/open your fridge/i)).toBeInTheDocument();
  });

  it('capturing advances to the detecting phase', async () => {
    render(<Capture kind="fridge" onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /take photo/i }));
    expect(screen.getByText('Detecting items')).toBeInTheDocument();
  });

  // Real timers: the detecting machine auto-advances to review on its own; findBy
  // polls until it lands there (fake timers don't cascade React effect-scheduled
  // chains reliably under jsdom).
  it('toggles a hidden item in and out of the batch on the review phase', async () => {
    render(<Capture kind="fridge" onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /take photo/i }));
    const addBtn = await screen.findByRole('button', { name: 'Add Butter' }, { timeout: 8000 });
    await userEvent.click(addBtn);
    expect(screen.getByRole('button', { name: 'Remove Butter' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove Butter' }));
    expect(screen.getByRole('button', { name: 'Add Butter' })).toBeInTheDocument();
  });

  it('swapping a guessed item renames it and clears the original guess', async () => {
    render(<Capture kind="fridge" onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /take photo/i }));
    // The "Bell peppers" alternate only exists in the review phase (Carrots is a
    // guess) — wait on it rather than "Carrots", which also appears as a detecting
    // bounding-box label.
    const swapBtn = await screen.findByRole('button', { name: 'Bell peppers' }, { timeout: 8000 });
    await userEvent.click(swapBtn);
    expect(screen.queryByText('Carrots')).toBeNull();
  });
});
