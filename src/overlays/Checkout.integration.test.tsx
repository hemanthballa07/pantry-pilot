import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Shop from '@/screens/Shop';
import { Overlays } from '@/overlays/Overlays';
import { useNavStore } from '@/stores/nav';
import { useSearchStore } from '@/stores/search';

describe('Shop → checkout overlay (integration)', () => {
  beforeEach(() => {
    useNavStore.setState({ checkoutOpen: false });
    useSearchStore.getState().clear();
  });

  it('opens the checkout modal when the Check out button is clicked', async () => {
    render(
      <MemoryRouter>
        <Shop />
        <Overlays />
      </MemoryRouter>,
    );
    // Nothing open until the button is clicked.
    expect(screen.queryByLabelText('Close checkout')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /check out/i }));

    // Clicking sets the store synchronously; the lazy overlay chunk resolves async.
    expect(useNavStore.getState().checkoutOpen).toBe(true);
    expect(await screen.findByRole('dialog', { name: /checkout/i })).toBeInTheDocument();
  });
});
