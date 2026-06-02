import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookMode } from './CookMode';

// r1 = Schezwan Egg Fried Rice — has a full RECIPE_DEF (5 scripted steps).
function renderCook(onExit: () => void = () => {}) {
  return render(<CookMode recipeId="r1" onExit={onExit} />);
}

describe('CookMode phase machine', () => {
  it('opens on the setup phase with the recipe name and a Start cooking action', () => {
    renderCook();
    expect(screen.getByRole('button', { name: /start cooking/i })).toBeInTheDocument();
    expect(screen.getAllByText(/schezwan egg fried rice/i).length).toBeGreaterThan(0);
  });

  it('Cancel exits the overlay', async () => {
    const onExit = vi.fn();
    renderCook(onExit);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('Start cooking advances to the step deck', async () => {
    renderCook();
    await userEvent.click(screen.getByRole('button', { name: /start cooking/i }));
    expect(screen.getByText(/now cooking/i)).toBeInTheDocument();
    expect(screen.getByText(/^Step 1$/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument();
  });

  it('exposes the cook surface as a modal dialog named after the recipe', () => {
    renderCook();
    expect(screen.getByRole('dialog', { name: /schezwan egg fried rice/i })).toBeInTheDocument();
  });

  it('moves focus into the cook dialog on open (OQ-012)', () => {
    renderCook();
    expect(screen.getByRole('dialog', { name: /schezwan egg fried rice/i })).toBe(
      document.activeElement,
    );
  });

  it('restores focus to the opener after walking every phase and closing (OQ-012)', async () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const { unmount } = render(<CookMode recipeId="r1" onExit={() => {}} />);
    // setup → cook → … → summary, exercising a focus trap on each phase root.
    await userEvent.click(screen.getByRole('button', { name: /start cooking/i }));
    while (screen.queryByRole('button', { name: /next step/i })) {
      await userEvent.click(screen.getByRole('button', { name: /next step/i }));
    }
    await userEvent.click(screen.getByRole('button', { name: /finish cooking/i }));
    expect(screen.getByText(/cook complete/i)).toBeInTheDocument();
    // Closing the overlay returns focus all the way back to the element that opened it.
    unmount();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('locks body scroll while open and restores it on unmount', () => {
    const { unmount } = renderCook();
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('walks through the steps and finishes into the summary', async () => {
    renderCook();
    await userEvent.click(screen.getByRole('button', { name: /start cooking/i }));
    // Advance until the last step (then "Next step" becomes "Finish cooking").
    while (screen.queryByRole('button', { name: /next step/i })) {
      await userEvent.click(screen.getByRole('button', { name: /next step/i }));
    }
    await userEvent.click(screen.getByRole('button', { name: /finish cooking/i }));
    expect(screen.getByText(/cook complete/i)).toBeInTheDocument();
    expect(screen.getByText(/nicely done/i)).toBeInTheDocument();
  });
});
