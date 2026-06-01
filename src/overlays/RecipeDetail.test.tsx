import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeDetail } from './RecipeDetail';
import { mock } from '@/data/mock';

const recipe = mock.recipes[0];

describe('RecipeDetail', () => {
  it('renders nothing when no recipe is selected', () => {
    const { container } = render(<RecipeDetail recipeId={null} onClose={() => {}} />);
    expect(container.querySelector('.pp-drawer')).toBeNull();
  });

  it('renders the selected recipe name, a key stat, and an ingredient', () => {
    render(<RecipeDetail recipeId={recipe.id} onClose={() => {}} />);
    expect(screen.getByRole('heading', { name: recipe.name })).toBeInTheDocument();
    expect(screen.getByText(`${recipe.protein}g`)).toBeInTheDocument();
    expect(screen.getByText(recipe.uses[0])).toBeInTheDocument();
  });

  it('renders nothing for an unknown recipe id', () => {
    const { container } = render(<RecipeDetail recipeId={'r9999'} onClose={() => {}} />);
    expect(container.querySelector('.pp-drawer')).toBeNull();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<RecipeDetail recipeId={recipe.id} onClose={onClose} />);
    await userEvent.click(screen.getByLabelText('Close recipe'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
