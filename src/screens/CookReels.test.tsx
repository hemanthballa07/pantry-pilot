import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookReels } from './CookReels';
import { mock } from '@/data/mock';

const first = mock.reels[0];

describe('CookReels', () => {
  it('renders the reel feed with the first clip', () => {
    render(<CookReels onCookNow={() => {}} onOpenRecipe={() => {}} />);
    expect(screen.getByText(/cook reels/i)).toBeInTheDocument();
    expect(screen.getByText(first.title)).toBeInTheDocument();
  });

  it('"Cook this now" opens cook mode for the reel recipe', async () => {
    const onCookNow = vi.fn();
    render(<CookReels onCookNow={onCookNow} onOpenRecipe={() => {}} />);
    await userEvent.click(screen.getAllByRole('button', { name: /cook this now/i })[0]);
    expect(onCookNow).toHaveBeenCalledWith(first.recipeId);
  });

  it('"Recipe" opens the recipe detail for the reel', async () => {
    const onOpenRecipe = vi.fn();
    render(<CookReels onCookNow={() => {}} onOpenRecipe={onOpenRecipe} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Recipe' })[0]);
    expect(onOpenRecipe).toHaveBeenCalledWith(first.recipeId);
  });

  it('saving a reel bumps the saved count', async () => {
    render(<CookReels onCookNow={() => {}} onOpenRecipe={() => {}} />);
    expect(screen.getByText('0 saved')).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: 'Save' })[0]);
    expect(screen.getByText('1 saved')).toBeInTheDocument();
  });

  it('liking a reel toggles its pressed state', async () => {
    render(<CookReels onCookNow={() => {}} onOpenRecipe={() => {}} />);
    const like = screen.getAllByRole('button', { name: 'Like' })[0];
    expect(like).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(like);
    expect(like).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(like);
    expect(like).toHaveAttribute('aria-pressed', 'false');
  });
});
