import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Pantry from '@/screens/Pantry';
import { mock } from '@/data/mock';
import { useSearchStore } from '@/stores/search';

function renderPantry() {
  return render(
    <MemoryRouter>
      <Pantry />
    </MemoryRouter>,
  );
}

describe('Pantry — search wiring (WS3)', () => {
  beforeEach(() => useSearchStore.getState().clear());

  it('shows an inventory item by default', () => {
    renderPantry();
    expect(screen.getAllByText(mock.items[0].name).length).toBeGreaterThan(0);
  });

  it('reads the search store: a query keeps matching items and hides non-matching ones', () => {
    const target = mock.items[0];
    // An item whose name does NOT contain the target's name → must be filtered out.
    const other = mock.items.find((i) => i.name !== target.name && !i.name.includes(target.name));
    useSearchStore.getState().setQuery(target.name);
    renderPantry();
    expect(screen.getAllByText(target.name).length).toBeGreaterThan(0);
    if (other) expect(screen.queryByText(other.name)).toBeNull();
  });

  it('exposes the tab group as a labelled toggle group with aria-pressed (OQ-018)', () => {
    renderPantry();
    const group = screen.getByRole('group', { name: 'Pantry sections' });
    const tabs = within(group).getAllByRole('button');
    expect(tabs.length).toBeGreaterThan(1);
    // every tab carries an explicit pressed state, exactly one is active
    tabs.forEach((b) => expect(['true', 'false']).toContain(b.getAttribute('aria-pressed')));
    expect(tabs.filter((b) => b.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
  });
});
