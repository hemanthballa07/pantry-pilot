import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Cook from './Cook';
import { useSearchStore } from '@/stores/search';

describe('Cook → Reels tab (integration)', () => {
  beforeEach(() => useSearchStore.getState().clear());

  it('renders the reels feed on the Reels tab (no longer a placeholder)', async () => {
    render(
      <MemoryRouter>
        <Cook />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Reels' }));
    expect(screen.getByText('Cook Reels')).toBeInTheDocument();
    expect(screen.queryByText(/convert in a later phase/i)).toBeNull();
  });
});
