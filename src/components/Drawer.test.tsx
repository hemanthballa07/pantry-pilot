import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('renders its children when open', () => {
    render(
      <Drawer open onClose={() => {}} label="Test drawer">
        drawer body
      </Drawer>,
    );
    expect(screen.getByText('drawer body')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(
      <Drawer open={false} onClose={() => {}} label="Test drawer">
        drawer body
      </Drawer>,
    );
    expect(screen.queryByText('drawer body')).not.toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} label="Test drawer">
        body
      </Drawer>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Drawer open onClose={onClose} label="Test drawer">
        body
      </Drawer>,
    );
    const backdrop = container.querySelector('.pp-overlay');
    expect(backdrop).not.toBeNull();
    await userEvent.click(backdrop as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('exposes the label as the dialog accessible name', () => {
    render(
      <Drawer open onClose={() => {}} label="Schezwan Egg Fried Rice">
        body
      </Drawer>,
    );
    expect(screen.getByRole('dialog', { name: 'Schezwan Egg Fried Rice' })).toBeInTheDocument();
  });

  it('moves focus into the drawer when opened', () => {
    const { container } = render(
      <Drawer open onClose={() => {}} label="Test drawer">
        body
      </Drawer>,
    );
    expect(container.querySelector('.pp-drawer')).toBe(document.activeElement);
  });

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(
      <Drawer open onClose={() => {}} label="Test drawer">
        body
      </Drawer>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <Drawer open={false} onClose={() => {}} label="Test drawer">
        body
      </Drawer>,
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('restores focus to the previously focused element on close', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const { rerender } = render(
      <Drawer open onClose={() => {}} label="Test drawer">
        body
      </Drawer>,
    );
    rerender(
      <Drawer open={false} onClose={() => {}} label="Test drawer">
        body
      </Drawer>,
    );
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('traps Tab focus inside the drawer, wrapping at the end (OQ-012)', () => {
    render(
      <Drawer open onClose={() => {}} label="Test drawer">
        <button>alpha</button>
        <button>omega</button>
      </Drawer>,
    );
    const [alpha, omega] = screen.getAllByRole('button');
    omega.focus();
    fireEvent.keyDown(omega, { key: 'Tab' });
    expect(document.activeElement).toBe(alpha);
  });
});
