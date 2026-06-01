import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Cook from '@/screens/Cook';
import { Overlays } from '@/overlays/Overlays';
import { useNavStore } from '@/stores/nav';
import { useSearchStore } from '@/stores/search';
import { mock } from '@/data/mock';

const recipe = mock.recipes[0];

describe('Cook → recipe-detail overlay (integration)', () => {
  beforeEach(() => {
    useNavStore.setState({ recipeId: null });
    useSearchStore.getState().clear();
  });

  it('opens the recipe-detail drawer when a recipe card is clicked', async () => {
    render(
      <MemoryRouter>
        <Cook />
        <Overlays />
      </MemoryRouter>,
    );
    // Nothing open until a card is clicked.
    expect(screen.queryByLabelText('Close recipe')).toBeNull();

    await userEvent.click(screen.getByText(recipe.name));

    // Clicking sets the store synchronously; the lazy overlay chunk resolves async.
    expect(useNavStore.getState().recipeId).toBe(recipe.id);
    expect(await screen.findByLabelText('Close recipe')).toBeInTheDocument();
  });
});
