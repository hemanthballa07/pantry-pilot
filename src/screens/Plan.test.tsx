import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Plan from '@/screens/Plan';
import { mock } from '@/data/mock';
import { useToastStore } from '@/stores/toast';

function renderPlan() {
  return render(
    <MemoryRouter>
      <Plan />
    </MemoryRouter>,
  );
}

// Mirrors Plan's totalRecipes computation over the initial mock plan.
const initialPlanned = () =>
  mock.days.flatMap((d) => Object.values(mock.mealPlan[d])).filter(Boolean).length;

function headingCount(): number {
  const h = screen.getByRole('heading', { name: /meals planned/i });
  return Number(h.textContent!.match(/^\s*(\d+)/)![1]);
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('Plan — meal plan mutable state (ADR-010)', () => {
  beforeEach(() => useToastStore.getState().dismiss());

  it('renders the initial planned-meal count from the mock', () => {
    renderPlan();
    expect(headingCount()).toBe(initialPlanned());
  });

  it('clearing a planned meal decrements the count (setPlan → null)', async () => {
    const user = userEvent.setup();
    const { container } = renderPlan();
    const before = headingCount();

    // PlannedMeal carries className="lift" and an inner clear (×) button.
    const clearBtn = container.querySelector('.lift button') as HTMLButtonElement | null;
    expect(clearBtn).toBeTruthy();
    await user.click(clearBtn!);

    expect(headingCount()).toBe(before - 1);
  });

  it('dropping a recipe onto an empty slot adds it and toasts', () => {
    const { container } = renderPlan();
    const before = headingCount();
    const recipe = mock.recipes[0];

    // First draggable recipe card in the drawer = mock.recipes[0]. Assert that
    // explicitly so any future desync (a draggable added above the drawer) fails
    // loudly here rather than in the toast regex below.
    const card = container.querySelector('[draggable="true"]') as HTMLElement;
    expect(card).toBeTruthy();
    expect(card.textContent).toContain(recipe.name);
    // An EmptySlot renders "Drop here"; its cell ancestor holds the onDrop handler.
    const emptyCell = screen.getAllByText('Drop here')[0].parentElement!.parentElement!;

    // Handlers read React state (draggedRecipe), not dataTransfer, so synthetic
    // dragStart → drop drives the real onDrop path.
    fireEvent.dragStart(card);
    fireEvent.drop(emptyCell);

    expect(headingCount()).toBe(before + 1);
    expect(useToastStore.getState().current?.text).toMatch(
      new RegExp(`^Added ${escapeRe(recipe.name)} to `),
    );
  });
});
