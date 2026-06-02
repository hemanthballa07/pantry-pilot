import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Inbox } from './Inbox';
import { mock } from '@/data/mock';

describe('Inbox overlay', () => {
  it('opens as a dialog named Kitchen Inbox with the seeded captures', () => {
    render(<Inbox onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: /kitchen inbox/i })).toBeInTheDocument();
    expect(screen.getByText(/crispy gnocchi/i)).toBeInTheDocument();
  });

  it('the close button calls onClose', async () => {
    const onClose = vi.fn();
    render(<Inbox onClose={onClose} />);
    await userEvent.click(screen.getByLabelText('Close inbox'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('capturing a note prepends it ahead of the seeded items', async () => {
    const seededLen = mock.inbox.length;
    render(<Inbox onClose={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText(/buy oat milk/i), 'Buy oat milk');
    await userEvent.click(screen.getByLabelText('Capture'));
    const fresh = screen.getByText('Buy oat milk');
    const seededFirst = screen.getByText(/crispy gnocchi/i);
    // The new capture renders before the previously-first seeded item.
    expect(
      fresh.compareDocumentPosition(seededFirst) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // ADR-010: local state is a copy — the shared mock fixture is never mutated.
    expect(mock.inbox).toHaveLength(seededLen);
  });

  it('removing a capture drops the count', async () => {
    render(<Inbox onClose={() => {}} />);
    const removes = screen.getAllByRole('button', { name: /^Remove / });
    const n = removes.length;
    expect(n).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(`^${n} captured`))).toBeInTheDocument();
    await userEvent.click(removes[0]);
    expect(screen.getByText(new RegExp(`^${n - 1} captured`))).toBeInTheDocument();
  });

  it('shows the empty state once everything is dismissed', async () => {
    render(<Inbox onClose={() => {}} />);
    for (const btn of screen.getAllByRole('button', { name: /^Remove / })) {
      await userEvent.click(btn);
    }
    expect(screen.getByText(/inbox zero/i)).toBeInTheDocument();
  });
});
