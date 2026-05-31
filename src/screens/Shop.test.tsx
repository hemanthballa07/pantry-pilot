import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Shop from '@/screens/Shop';
import { mock } from '@/data/mock';
import { useToastStore } from '@/stores/toast';

function renderShop() {
  return render(
    <MemoryRouter>
      <Shop />
    </MemoryRouter>,
  );
}

const openCount = () => mock.grocery.filter((i) => !i.bought).length;

function headingLeftCount(): number {
  const h = screen.getByRole('heading', { name: /items left to buy/i });
  return Number(h.textContent!.match(/(\d+)\s+items left to buy/)![1]);
}

describe('Shop — cart mutable state (ADR-010)', () => {
  beforeEach(() => useToastStore.getState().dismiss());

  it('renders the initial open-item count from the mock', () => {
    renderShop();
    expect(headingLeftCount()).toBe(openCount());
  });

  it('toggling an open item decrements the count and pushes an inventory toast', async () => {
    const user = userEvent.setup();
    renderShop();

    const before = headingLeftCount();
    const firstOpen = mock.grocery.find((i) => !i.bought)!;

    // Exact-match the grocery row's name node, walk up to the row, click its
    // toggle (the first/only button in a GroceryRow).
    const nameNode = screen.getAllByText(firstOpen.name)[0];
    const row = nameNode.parentElement!.parentElement!;
    const toggle = within(row).getAllByRole('button')[0];
    await user.click(toggle);

    expect(headingLeftCount()).toBe(before - 1);
    expect(useToastStore.getState().current?.text).toBe(`Added ${firstOpen.name} to inventory`);
  });
});
