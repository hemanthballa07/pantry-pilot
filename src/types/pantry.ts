// Pantry domain: inventory items, grocery list, restock rules, staples,
// low-stock list, and the kitchen-memory pattern feed.

export type ItemCategory =
  | 'Vegetables'
  | 'Dairy'
  | 'Leftovers'
  | 'Grains'
  | 'Meat'
  | 'Frozen'
  | 'Canned'
  | 'Oils'
  | 'Sauces'
  | 'Fruits'
  | 'Beverages'
  | 'Spices';

export type ItemLocation = 'Fridge' | 'Pantry' | 'Freezer' | 'Counter';

// Comment header in src/data.js lists six statuses; 'expired' is reserved
// for the simulator but never appears in the current dataset.
export type ItemStatus = 'today' | 'tomorrow' | 'week' | 'fresh' | 'frozen' | 'expired';

export type ItemOwner = 'Hemanth' | 'Shared';

export type StoreName = 'Aldi' | 'Walmart' | 'Publix' | 'Costco' | "Trader Joe's" | '—';

export interface Item {
  id: string;
  name: string;
  cat: ItemCategory;
  qty: string;
  loc: ItemLocation;
  expires: string;
  expDays: number;
  status: ItemStatus;
  price: number;
  owner: ItemOwner;
  store: StoreName;
  illo: string;
}

export type GrocerySection = 'Produce' | 'Dairy' | 'Bakery' | 'Household';

export type GroceryPriority = 'high' | 'medium' | 'low';

// 'Pilot' is the AI agent; the rest are household first names.
export type Actor = 'Pilot' | 'Hemanth' | 'Alex' | 'Maya';

export interface GroceryItem {
  id: string;
  name: string;
  qty: string;
  section: GrocerySection;
  price: number;
  needed: string[];
  addedBy: Actor;
  priority: GroceryPriority;
  bought: boolean;
}

export interface AutoRestockRule {
  id: string;
  item: string;
  illo: string;
  rule: string;
  threshold: string;
  freq: string;
  on: boolean;
  next: string;
}

export type LowStockStatus = 'low' | 'running';

export interface LowStockItem {
  name: string;
  illo: string;
  level: number;
  status: LowStockStatus;
  qty: string;
}

export interface StapleMissing {
  name: string;
  illo: string;
  unlocks: number;
  price: number;
}

export interface Staples {
  score: number;
  have: string[];
  missing: StapleMissing[];
}

export type KitchenMemoryIcon = 'chef' | 'alert' | 'timer' | 'wallet' | 'heart';

export interface KitchenMemoryEntry {
  id: string;
  icon: KitchenMemoryIcon;
  title: string;
  body: string;
}
