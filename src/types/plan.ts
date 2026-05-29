// Planning domain: weekly plan, today plan, leftovers, occasions,
// coverage and waste rescue.

import type { RecipeId } from './recipe';

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type Day = (typeof DAYS)[number];

export type MealSlotKey = 'B' | 'L' | 'D';

// One day's three slots. `null` means leftover or skip — captured in
// the prototype by the comment-out beside the field.
export type DayPlan = Record<MealSlotKey, RecipeId | null>;

export type MealPlan = Record<Day, DayPlan>;

export type SlotKey = MealSlotKey | 'S';

export type SlotStatus = 'ready' | 'leftover' | 'tonight';

export interface TodaySlot {
  slot: SlotKey;
  time: string;
  name: string;
  recipe: RecipeId | null;
  kind: string;
  uses: string[];
  cal: number;
  p: number;
  status: SlotStatus;
  tone: string;
}

export interface TodayPlan {
  summary: string;
  slots: TodaySlot[];
}

export interface CoverageBlocker {
  ingr: string;
  unlocks: number;
  items: string[];
}

export interface MealCoverage {
  days: number;
  breakfasts: number;
  lunches: number;
  dinners: number;
  snacks: number;
  available: number;
  oneSwap: number;
  blockers: CoverageBlocker[];
}

export type LeftoverTone = 'amber' | 'green' | 'tomato';

export interface Leftover {
  id: string;
  meal: string;
  servings: number;
  cooked: string;
  useBy: string;
  days: number;
  tone: LeftoverTone;
  storage: string;
  reheat: string;
  illo: string;
  remix: string[];
}

export interface WasteRescueStep {
  day: string;
  action: string;
  recipe: RecipeId;
  value: number;
  illos: string[];
  why: string;
}

export interface WasteRescue {
  // Estimated waste risk in cents.
  risk: number;
  plan: WasteRescueStep[];
}

export type OccasionIcon =
  | 'save'
  | 'timer'
  | 'users'
  | 'leaf'
  | 'snowflake'
  | 'flame';

export interface Occasion {
  id: string;
  name: string;
  icon: OccasionIcon;
  desc: string;
  meals: number;
  hours: number;
  cost: number;
}
