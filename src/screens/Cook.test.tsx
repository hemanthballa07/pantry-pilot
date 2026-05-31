import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cook from '@/screens/Cook';
import { useSearchStore } from '@/stores/search';

function renderCook() {
  return render(
    <MemoryRouter>
      <Cook />
    </MemoryRouter>,
  );
}

describe('Cook — search wiring (WS3)', () => {
  beforeEach(() => useSearchStore.getState().clear());

  it('reads the search store: a non-matching query empties the Explore list', () => {
    useSearchStore.getState().setQuery('zzzznomatchqimpossible');
    renderCook();
    expect(screen.getByText(/no dishes match that search/i)).toBeInTheDocument();
  });

  it('shows dishes when the query is empty', () => {
    renderCook();
    expect(screen.queryByText(/no dishes match that search/i)).toBeNull();
  });
});
