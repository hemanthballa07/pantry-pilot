// PPData — the root mock shape returned by src/data.js (today) and
// satisfied by src/data/mock.ts (Phase 2 onward).

import type {
  AutoRestockRule,
  GroceryItem,
  Item,
  KitchenMemoryEntry,
  LowStockItem,
  Staples,
} from './pantry';
import type {
  Craving,
  NotebookEntry,
  Recipe,
  Unlock,
} from './recipe';
import type {
  ActivityEntry,
  HouseholdMember,
  InboxEntry,
  User,
} from './household';
import type {
  Day,
  Leftover,
  MealCoverage,
  MealPlan,
  Occasion,
  TodayPlan,
  WasteRescue,
} from './plan';
import type {
  Budget,
  KitchenWin,
  Nutrition,
  Scores,
  TakeoutSwap,
  WasteLogEntry,
} from './budget';
import type {
  CookBeforeShop,
  PilotSuggestion,
  Reel,
} from './media';

export interface PPData {
  user: User;
  items: Item[];
  recipes: Recipe[];
  days: readonly Day[];
  mealPlan: MealPlan;
  grocery: GroceryItem[];
  pilotSuggestions: PilotSuggestion[];
  household: HouseholdMember[];
  activity: ActivityEntry[];
  leftovers: Leftover[];
  budget: Budget;
  nutrition: Nutrition;
  todayPlan: TodayPlan;
  mealCoverage: MealCoverage;
  kitchenWins: KitchenWin[];
  autoRestockRules: AutoRestockRule[];
  lowStock: LowStockItem[];
  staples: Staples;
  kitchenMemory: KitchenMemoryEntry[];
  cravings: Craving[];
  unlocks: Unlock[];
  wasteRescue: WasteRescue;
  takeoutSwaps: TakeoutSwap[];
  occasions: Occasion[];
  wasteLog: WasteLogEntry[];
  inbox: InboxEntry[];
  notebook: NotebookEntry[];
  cookBeforeShop: CookBeforeShop;
  reels: Reel[];
  scores: Scores;
}
