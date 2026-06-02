import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AskPilot } from './AskPilot';

afterEach(() => vi.useRealTimers());

describe('AskPilot overlay', () => {
  it('opens as a dialog named Pilot with the opening message', () => {
    render(<AskPilot onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: /pilot/i })).toBeInTheDocument();
    expect(screen.getByText(/spinach expiring tomorrow/i)).toBeInTheDocument();
  });

  it('the close button calls onClose', async () => {
    const onClose = vi.fn();
    render(<AskPilot onClose={onClose} />);
    await userEvent.click(screen.getByLabelText('Close Pilot'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('sending a typed message appends it to the conversation', async () => {
    render(<AskPilot onClose={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText(/ask pilot/i), 'What can I cook?');
    await userEvent.click(screen.getByLabelText('Send message'));
    expect(screen.getByText('What can I cook?')).toBeInTheDocument();
  });

  it('a quick prompt sends itself as a user message', async () => {
    render(<AskPilot onClose={() => {}} />);
    const prompt = 'What can I cook in 20 minutes?';
    // Before clicking: only the suggestion chip carries the text.
    expect(screen.getAllByText(prompt)).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: prompt }));
    // After clicking: the chip remains and the message bubble is added.
    expect(screen.getAllByText(prompt)).toHaveLength(2);
  });

  it('Pilot replies after a short delay', () => {
    vi.useFakeTimers();
    render(<AskPilot onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/ask pilot/i), { target: { value: 'Hi' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    expect(screen.getByText('Hi')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByText(/here's my take/i)).toBeInTheDocument();
  });

  it('ignores further sends while a reply is pending (single-flight)', () => {
    vi.useFakeTimers();
    render(<AskPilot onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/ask pilot/i), { target: { value: 'Hi' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    // A quick prompt fired while Pilot is thinking is dropped (not added as a bubble) —
    // the chip text stays a single occurrence.
    fireEvent.click(screen.getByRole('button', { name: 'Use my expiring vegetables' }));
    expect(screen.getAllByText('Use my expiring vegetables')).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(800);
    });
    // Exactly one reply lands, not two.
    expect(screen.getAllByText(/here's my take/i)).toHaveLength(1);
  });

  it('clears a pending reply timer on unmount', () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = render(<AskPilot onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/ask pilot/i), { target: { value: 'Hi' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    unmount();
    // The unmount effect clears the pending reply timer so it never setStates after close.
    expect(clearSpy).toHaveBeenCalled();
    // Advancing past the delay must not throw or schedule a late reply.
    expect(() => act(() => vi.advanceTimersByTime(800))).not.toThrow();
    clearSpy.mockRestore();
  });
});
