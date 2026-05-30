// Recipe domain: recipe summaries (from PP_DATA.recipes), full cook scripts
// (from RECIPE_DEF), and the craving / unlock prompt shapes.

// Template literal type — matches 'r1', 'r2', ..., 'r999' etc. but
// rejects typos like 'rl1' or 'r88x' at compile time. Narrow enough
// to catch mistakes; wide enough to avoid enumerating all 22 ids.
// Code-reviewer audit (MEDIUM) — tightened before Phase 3 consumers.
export type RecipeId = `r${number}`;

export type Cuisine =
  | 'Indo-Chinese'
  | 'Italian'
  | 'Mediterranean'
  | 'American'
  | 'Breakfast'
  | 'Asian'
  | 'Mexican'
  | 'Indian'
  | 'Chinese';

export type Diet =
  | 'Vegetarian'
  | 'Vegan'
  | 'High-protein'
  | 'High-protein-add';

export type RecipeTag =
  | 'under-20'
  | 'uses-leftovers'
  | 'budget'
  | 'uses-expiring'
  | 'comfort'
  | 'meal-prep'
  | 'high-protein'
  | 'breakfast';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Recipe {
  id: RecipeId;
  name: string;
  time: number;
  difficulty: Difficulty;
  match: number;
  missing: string[];
  uses: string[];
  expiringUsed: string[];
  cost: number;
  // Present only on r1. Flagged as a discovery — see PROJECT_LOG OQ-007.
  costSingle?: boolean;
  cals: number;
  protein: number;
  carbs: number;
  fat: number;
  cuisine: Cuisine;
  diet: Diet[];
  tags: RecipeTag[];
  tone: string;
  desc: string;
}

// Full cook script in src/screens/recipe-defs.js. Not every Recipe has one
// — RECIPE_DEF only covers ~half. Consumers fall back to recipe.uses.

export interface Ingredient {
  name: string;
  // Base quantity for 2 servings; scaled at render time.
  qty: number;
  unit: string;
  illo: string;
  // Marks the ingredient that the 'spice' control modulates.
  spice?: boolean;
}

export interface Step {
  title: string;
  body: string;
  // Minutes; for the in-screen countdown.
  timer?: number;
  tip?: string;
  cue?: string;
}

export type Spice = 'mild' | 'medium' | 'spicy' | 'extra';

// `q(name)` returns a formatted, scaled quantity string for the named
// ingredient. The spice arg drives the heat-line copy.
export type ScaleFn = (ingredientName: string) => string;
export type StepsFn = (q: ScaleFn, spice: Spice) => Step[];

export interface RecipeDef {
  ingredients: Ingredient[];
  steps: StepsFn;
}

export type CravingIcon =
  | 'flame'
  | 'heart'
  | 'leaf'
  | 'fire'
  | 'wallet'
  | 'snowflake'
  | 'bag'
  | 'save';

export interface Craving {
  id: string;
  label: string;
  icon: CravingIcon;
  recipes: RecipeId[];
}

export interface Unlock {
  id: string;
  buy: string;
  illo: string;
  unlocks: number;
  price: number;
  // Free-text meal labels, not RecipeIds — unlocks describe recipes the
  // catalog doesn't yet contain.
  meals: string[];
  tone: string;
}

export interface NotebookEntry {
  id: string;
  name: string;
  tone: string;
  ill: string;
  last: string;
  rating: number | null;
  notes: string;
}
