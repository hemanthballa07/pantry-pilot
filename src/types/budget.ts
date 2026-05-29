// Budget, nutrition, scores, achievements, waste analytics, and
// takeout-swap suggestions.

import type { RecipeId } from './recipe';

export interface BudgetCategorySpend {
  cat: string;
  amount: number;
  color: string;
}

export interface StoreSpend {
  name: string;
  amount: number;
  trips: number;
}

export interface Budget {
  monthly: number;
  spent: number;
  waste: number;
  savedFromPantry: number;
  byCategory: BudgetCategorySpend[];
  // One entry per week of the current month.
  weekly: number[];
  stores: StoreSpend[];
}

// `cals` is the only stat without a unit (it's calories). Every other
// stat carries an explicit `unit` field.
export interface NutritionStatNoUnit {
  value: number;
  target: number;
}
export interface NutritionStatWithUnit {
  value: number;
  target: number;
  unit: string;
}

export interface Nutrition {
  cals: NutritionStatNoUnit;
  protein: NutritionStatWithUnit;
  carbs: NutritionStatWithUnit;
  fat: NutritionStatWithUnit;
  fiber: NutritionStatWithUnit;
  veg: NutritionStatWithUnit;
}

export interface Scores {
  pantryHealth: number;
  wasteRisk: number;
  staplesScore: number;
  nutritionBalance: number;
  budgetHealth: number;
}

export type KitchenWinIcon = 'leaf' | 'chef' | 'wallet' | 'sparkles';
export type KitchenWinTone = 'green' | 'orange' | 'amber';

export interface KitchenWin {
  id: string;
  title: string;
  value: string;
  sub: string;
  icon: KitchenWinIcon;
  tone: KitchenWinTone;
}

export type WasteCategory = 'Produce' | 'Dairy' | 'Bakery';

export type WasteReason =
  | 'Expired'
  | 'Forgot about it'
  | 'Did not like'
  | 'Spoiled early'
  | 'Bought too much';

export interface WasteLogEntry {
  item: string;
  cat: WasteCategory;
  qty: string;
  cost: number;
  reason: WasteReason;
  // Human short date (e.g. 'Nov 14'), not ISO.
  date: string;
}

export interface TakeoutSwap {
  id: string;
  takeout: string;
  takeoutCost: number;
  home: string;
  homeCost: number;
  time: number;
  save: number;
  recipe: RecipeId;
}
