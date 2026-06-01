import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Imports } from '@/screens/Extras';
import { Overlays } from '@/overlays/Overlays';
import { useNavStore } from '@/stores/nav';

describe('Imports → capture overlay (integration)', () => {
  beforeEach(() => {
    useNavStore.setState({ captureKind: null });
  });

  it('opens the receipt scanner when the receipt method card is clicked', async () => {
    render(
      <MemoryRouter>
        <Imports />
        <Overlays />
      </MemoryRouter>,
    );
    expect(screen.queryByLabelText('Close capture')).toBeNull();

    await userEvent.click(screen.getByText('Scan a receipt'));

    expect(useNavStore.getState().captureKind).toBe('receipt');
    expect(await screen.findByRole('dialog', { name: /scan receipt/i })).toBeInTheDocument();
  });
});
