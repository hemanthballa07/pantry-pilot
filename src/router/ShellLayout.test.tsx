import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ShellLayout } from '@/router/ShellLayout';
import { useSearchStore } from '@/stores/search';

// Use the component router (not createMemoryRouter): the v7 data router pulls in
// fetch/AbortSignal machinery that undici rejects under jsdom on navigation.
function renderShellAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<ShellLayout />}>
          <Route path="/cook" element={<div>cook screen</div>} />
          <Route path="/pantry" element={<div>pantry screen</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ShellLayout chrome (WS3)', () => {
  beforeEach(() => useSearchStore.getState().clear());

  it('renders the sidebar nav and marks the active route with aria-current', () => {
    renderShellAt('/cook');
    expect(screen.getByRole('button', { name: /cook/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /pantry/i })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('typing in the TopBar search input updates the search store', async () => {
    const user = userEvent.setup();
    renderShellAt('/cook');
    await user.type(screen.getByPlaceholderText(/search/i), 'rice');
    expect(useSearchStore.getState().query).toBe('rice');
  });

  it('clears the search query when navigating to another screen', async () => {
    const user = userEvent.setup();
    renderShellAt('/cook');
    await user.type(screen.getByPlaceholderText(/search/i), 'rice');
    expect(useSearchStore.getState().query).toBe('rice');
    await user.click(screen.getByRole('button', { name: /pantry/i }));
    expect(useSearchStore.getState().query).toBe('');
  });
});
