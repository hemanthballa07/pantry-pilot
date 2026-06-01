import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Overlays } from './Overlays';
import { useNavStore } from '@/stores/nav';
import { mock } from '@/data/mock';

const recipe = mock.recipes[0];

beforeEach(() => useNavStore.setState({ recipeId: null }));

describe('Overlays', () => {
  it('renders no drawer when no overlay is open in the store', () => {
    const { container } = render(<Overlays />);
    expect(container.querySelector('.pp-drawer')).toBeNull();
  });

  it('renders the recipe-detail overlay when a recipe is open in the store', async () => {
    useNavStore.setState({ recipeId: recipe.id });
    render(<Overlays />);
    // The overlay is React.lazy code-split — await the chunk resolving.
    expect(await screen.findByRole('heading', { name: recipe.name })).toBeInTheDocument();
  });

  it('closing the recipe overlay clears the store', async () => {
    useNavStore.setState({ recipeId: recipe.id });
    render(<Overlays />);
    await userEvent.click(await screen.findByLabelText('Close recipe'));
    expect(useNavStore.getState().recipeId).toBeNull();
  });
});
