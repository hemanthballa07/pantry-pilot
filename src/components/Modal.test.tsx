import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders its children when open', () => {
    render(
      <Modal open onClose={() => {}}>
        modal body
      </Modal>,
    );
    expect(screen.getByText('modal body')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        modal body
      </Modal>,
    );
    expect(screen.queryByText('modal body')).not.toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        body
      </Modal>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open onClose={onClose}>
        body
      </Modal>,
    );
    const backdrop = container.querySelector('.pp-overlay');
    expect(backdrop).not.toBeNull();
    await userEvent.click(backdrop as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when the panel itself is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        modal body
      </Modal>,
    );
    await userEvent.click(screen.getByText('modal body'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('exposes the label as the dialog accessible name', () => {
    render(
      <Modal open onClose={() => {}} label="Checkout">
        body
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Checkout' })).toBeInTheDocument();
  });

  it('moves focus into the panel when opened', () => {
    render(
      <Modal open onClose={() => {}}>
        body
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBe(document.activeElement);
  });

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(
      <Modal open onClose={() => {}}>
        body
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <Modal open={false} onClose={() => {}}>
        body
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('restores focus to the previously focused element on close', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const { rerender } = render(
      <Modal open onClose={() => {}}>
        body
      </Modal>,
    );
    rerender(
      <Modal open={false} onClose={() => {}}>
        body
      </Modal>,
    );
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});
