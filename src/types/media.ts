// Pilot suggestions, "cook before you shop" prompts, and cook-reel cards.

import type { RecipeId } from './recipe';

export type PilotSuggestionIcon = 'spark' | 'leaf' | 'wallet' | 'alert';
export type PilotSuggestionTone = 'tomato' | 'green' | 'amber' | 'orange';

export interface PilotSuggestion {
  id: string;
  icon: PilotSuggestionIcon;
  tone: PilotSuggestionTone;
  title: string;
  body: string;
}

export interface CookBeforeShopMeal {
  recipe: RecipeId;
  reason: string;
}

export interface CookBeforeShop {
  can: number;
  meals: CookBeforeShopMeal[];
  // Estimated savings in dollars.
  save: number;
}

export interface Reel {
  id: string;
  recipeId: RecipeId;
  creator: string;
  handle: string;
  title: string;
  caption: string;
  // Pre-formatted counts (e.g. '24.1k', '1.1k'). Not numbers.
  likes: string;
  saves: string;
  comments: string;
  // mm:ss format.
  duration: string;
  tone: string;
  illo: string;
  tag: string;
}
