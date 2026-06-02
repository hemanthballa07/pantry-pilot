import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddItem } from './AddItem';
import { useToastStore } from '@/stores/toast';
import { useNavStore } from '@/stores/nav';

beforeEach(() => {
  useToastStore.setState({ current: null });
  useNavStore.setState({ captureKind: null, addItemOpen: false });
});

describe('AddItem overlay', () => {
  it('opens as a dialog named Add item with the new-item form', () => {
    render(<AddItem onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: /add item/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /new item/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. spinach/i)).toBeInTheDocument();
  });

  it('the close button calls onClose', async () => {
    const onClose = vi.fn();
    render(<AddItem onClose={onClose} />);
    await userEvent.click(screen.getByLabelText('Close add item'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Cancel calls onClose', async () => {
    const onClose = vi.fn();
    render(<AddItem onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Add item toasts the new item, the location, and closes', async () => {
    const onClose = vi.fn();
    render(<AddItem onClose={onClose} />);
    await userEvent.type(screen.getByPlaceholderText(/e\.g\. spinach/i), 'Spinach');
    await userEvent.click(screen.getByRole('button', { name: 'Add item' }));
    expect(useToastStore.getState().current?.text).toMatch(/added spinach to fridge/i);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('a quick-capture action closes and opens the matching scanner', async () => {
    const onClose = vi.fn();
    render(<AddItem onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /scan receipt/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(useNavStore.getState().captureKind).toBe('receipt');
  });
});
