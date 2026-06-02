import { describe, it, expect } from 'vitest';
import { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useFocusTrap } from './useFocusTrap';

function Trap({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <div ref={ref} tabIndex={-1} role="dialog" aria-label="trap">
      <button>first</button>
      <button>middle</button>
      <button>last</button>
    </div>
  );
}

function EmptyTrap() {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true);
  return <div ref={ref} tabIndex={-1} role="dialog" aria-label="empty" />;
}

describe('useFocusTrap', () => {
  it('moves focus into the panel when activated', () => {
    render(<Trap />);
    expect(screen.getByRole('dialog')).toBe(document.activeElement);
  });

  it('wraps Tab from the last focusable back to the first', () => {
    render(<Trap />);
    const [first, , last] = screen.getAllByRole('button');
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
  });

  it('wraps Shift+Tab from the first focusable to the last', () => {
    render(<Trap />);
    const [first, , last] = screen.getAllByRole('button');
    first.focus();
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('leaves a mid-order Tab to native handling (does not preventDefault)', () => {
    render(<Trap />);
    const [, middle] = screen.getAllByRole('button');
    middle.focus();
    // fireEvent returns false only if the handler called preventDefault. A Tab in the
    // middle of the order must NOT be intercepted — the boundary-only branch is exercised.
    const notPrevented = fireEvent.keyDown(middle, { key: 'Tab' });
    expect(notPrevented).toBe(true);
    expect(document.activeElement).toBe(middle);
  });

  it('keeps focus on the panel when there are no focusable children', () => {
    render(<EmptyTrap />);
    const panel = screen.getByRole('dialog');
    expect(panel).toBe(document.activeElement);
    fireEvent.keyDown(panel, { key: 'Tab' });
    expect(panel).toBe(document.activeElement);
  });

  it('restores focus to the previously focused element when deactivated', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const { rerender } = render(<Trap active />);
    rerender(<Trap active={false} />);
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});
