// Pure capture/scan logic + fixtures — shared by the three capture flows
// (receipt / barcode / fridge) in src/overlays/Capture.tsx. Extracted from the
// legacy scan-*.jsx screens so the helpers + mock catalogs are unit-testable
// independent of React (the src/lib/cook.ts / OQ-003 precedent). The flows are
// presentational React shells over these.

export type Confidence = 'auto' | 'guess';
export type ExpiryTone = 'ghost' | 'tomato' | 'amber' | 'green';

// ── Shared expiry helpers (identical across all three legacy scan screens) ──
export function expiryLabel(d: number): string {
  if (d === 0) return 'Non-perishable';
  if (d === 1) return 'Tomorrow';
  if (d < 7) return `${d} days`;
  if (d < 30) return `${Math.round(d / 7)} weeks`;
  if (d < 365) return `${Math.round(d / 30)} months`;
  return `${Math.round(d / 365)} year${d >= 730 ? 's' : ''}`;
}

export function expiryTone(d: number): ExpiryTone {
  if (d === 0) return 'ghost';
  if (d <= 3) return 'tomato';
  if (d <= 7) return 'amber';
  return 'green';
}

// Fridge bounding-box accent: green for confident detections, amber for guesses.
export function boxColor(conf: Confidence): string {
  return conf === 'auto' ? 'var(--green)' : 'var(--amber)';
}

// Deterministic pseudo-random barcode bar widths from a seed (the UPC), so the
// drawn barcode is stable per product. 34 bars, each width 1–4.
export function barcodeBars(seed: string): number[] {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const bars: number[] = [];
  for (let i = 0; i < 34; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    bars.push(1 + (h % 4));
  }
  return bars;
}

// ── Receipt fixture ─────────────────────────────────────────────────────────
export interface ReceiptMatch {
  name: string;
  illo: string;
  cat: string;
  expDays: number;
  confidence: Confidence;
  alternates?: string[];
  note?: string;
}
export interface ReceiptLine {
  raw: string;
  qty: string;
  price: number;
  match: ReceiptMatch | null;
}
export interface Receipt {
  store: string;
  address: string;
  when: string;
  total: number;
  items: ReceiptLine[];
}

export const RECEIPT: Receipt = {
  store: 'Publix',
  address: '1100 NW 8th Ave · Gainesville',
  when: 'Today · 2:14 PM',
  total: 43.55,
  items: [
    {
      raw: 'WHL MILK GAL',
      qty: '1 gal',
      price: 3.79,
      match: { name: 'Whole Milk', illo: 'milk', cat: 'Dairy', expDays: 7, confidence: 'auto' },
    },
    {
      raw: 'ORG SPINACH 5oz',
      qty: '1 bag',
      price: 3.49,
      match: {
        name: 'Spinach',
        illo: 'spinach',
        cat: 'Vegetables',
        expDays: 5,
        confidence: 'auto',
      },
    },
    {
      raw: 'LG EGGS 12CT',
      qty: '1 dozen',
      price: 4.2,
      match: { name: 'Eggs', illo: 'egg', cat: 'Dairy', expDays: 28, confidence: 'auto' },
    },
    {
      raw: 'BANANA',
      qty: '6 ct',
      price: 1.79,
      match: { name: 'Bananas', illo: 'banana', cat: 'Vegetables', expDays: 7, confidence: 'auto' },
    },
    {
      raw: 'RM TOMATO',
      qty: '4 ct',
      price: 2.49,
      match: {
        name: 'Roma Tomatoes',
        illo: 'tomato',
        cat: 'Vegetables',
        expDays: 7,
        confidence: 'auto',
      },
    },
    {
      raw: 'GRK YGURT 32oz',
      qty: '32 oz',
      price: 5.49,
      match: {
        name: 'Greek Yogurt',
        illo: 'yogurt',
        cat: 'Dairy',
        expDays: 30,
        confidence: 'auto',
        note: 'Bulk size · Pilot suggested last week',
      },
    },
    {
      raw: 'FLR TORTILLA 8CT',
      qty: '8 ct',
      price: 2.99,
      match: {
        name: 'Flour Tortillas',
        illo: 'bread',
        cat: 'Grains',
        expDays: 14,
        confidence: 'auto',
      },
    },
    {
      raw: 'PARM CHS WEDG 4oz',
      qty: '4 oz',
      price: 5.49,
      match: { name: 'Parmesan', illo: 'cheese', cat: 'Dairy', expDays: 60, confidence: 'auto' },
    },
    {
      raw: 'CHKN BRST 1.2LB',
      qty: '1.2 lb',
      price: 7.99,
      match: {
        name: 'Chicken Breast',
        illo: 'chicken',
        cat: 'Meat',
        expDays: 3,
        confidence: 'auto',
      },
    },
    {
      raw: 'DSH SOAP 25oz',
      qty: '1 bottle',
      price: 3.49,
      match: {
        name: 'Dish Soap',
        illo: 'bottle',
        cat: 'Household',
        expDays: 0,
        confidence: 'auto',
      },
    },
    {
      raw: 'TWL 6PK SLCT',
      qty: '6 pk',
      price: 7.99,
      match: {
        name: 'Paper Towels',
        illo: 'paper',
        cat: 'Household',
        expDays: 0,
        confidence: 'auto',
      },
    },
    {
      raw: 'NTL FRZ BERR 12oz',
      qty: '12 oz',
      price: 4.99,
      match: {
        name: 'Frozen Berries',
        illo: 'berries',
        cat: 'Frozen',
        expDays: 180,
        confidence: 'guess',
        alternates: ['Frozen Mixed Berries', 'Frozen Strawberries'],
      },
    },
    {
      raw: 'PROD #4225',
      qty: '1.4 lb',
      price: 2.45,
      match: {
        name: 'Avocados',
        illo: 'egg',
        cat: 'Vegetables',
        expDays: 5,
        confidence: 'guess',
        alternates: ['Limes', 'Green peppers'],
        note: 'PLU 4225 = Hass avocado',
      },
    },
    { raw: 'LM PEP DR PEPP 6PK', qty: '6 pk', price: 5.79, match: null },
  ],
};

// ── Barcode catalog (each "scan" reveals the next product) ──────────────────
export interface CatalogProduct {
  upc: string;
  name: string;
  brand: string;
  size: string;
  illo: string;
  cat: string;
  expDays: number;
  kcal: number;
  price: number;
}

export const CATALOG: CatalogProduct[] = [
  {
    upc: '894700010045',
    name: 'Greek Yogurt',
    brand: 'Chobani',
    size: '32 oz',
    illo: 'yogurt',
    cat: 'Dairy',
    expDays: 24,
    kcal: 90,
    price: 5.49,
  },
  {
    upc: '076808500011',
    name: 'Spaghetti',
    brand: 'Barilla',
    size: '16 oz',
    illo: 'pasta',
    cat: 'Grains',
    expDays: 540,
    kcal: 200,
    price: 1.99,
  },
  {
    upc: '037600105019',
    name: 'Peanut Butter',
    brand: 'Skippy',
    size: '16 oz',
    illo: 'peanutbutter',
    cat: 'Sauces',
    expDays: 240,
    kcal: 190,
    price: 3.99,
  },
  {
    upc: '024000162834',
    name: 'Lactaid Milk',
    brand: 'Lactaid',
    size: '½ gal',
    illo: 'milk',
    cat: 'Dairy',
    expDays: 9,
    kcal: 130,
    price: 4.29,
  },
  {
    upc: '030000010600',
    name: 'Rolled Oats',
    brand: 'Quaker',
    size: '18 oz',
    illo: 'oats',
    cat: 'Grains',
    expDays: 300,
    kcal: 150,
    price: 3.29,
  },
  {
    upc: '024463061071',
    name: 'Sriracha',
    brand: 'Huy Fong',
    size: '17 oz',
    illo: 'chili',
    cat: 'Sauces',
    expDays: 365,
    kcal: 5,
    price: 3.99,
  },
];

// ── Fridge detection fixtures ───────────────────────────────────────────────
export interface DetectedItem {
  name: string;
  illo: string;
  box: { x: number; y: number; w: number; h: number };
  conf: Confidence;
  cat: string;
  expDays: number;
  qty: string;
  alternates?: string[];
  note?: string;
}
export interface HiddenItem {
  name: string;
  illo: string;
  cat: string;
  expDays: number;
}

export const DETECTED: DetectedItem[] = [
  {
    name: 'Spinach',
    illo: 'spinach',
    box: { x: 6, y: 12, w: 22, h: 24 },
    conf: 'auto',
    cat: 'Vegetables',
    expDays: 4,
    qty: '1 bag',
  },
  {
    name: 'Whole Milk',
    illo: 'milk',
    box: { x: 35, y: 7, w: 17, h: 32 },
    conf: 'auto',
    cat: 'Dairy',
    expDays: 7,
    qty: '½ gal',
  },
  {
    name: 'Eggs',
    illo: 'egg',
    box: { x: 62, y: 9, w: 28, h: 21 },
    conf: 'auto',
    cat: 'Dairy',
    expDays: 26,
    qty: '10 ct',
  },
  {
    name: 'Roma Tomatoes',
    illo: 'tomato',
    box: { x: 8, y: 58, w: 22, h: 26 },
    conf: 'auto',
    cat: 'Vegetables',
    expDays: 6,
    qty: '4 ct',
  },
  {
    name: 'Carrots',
    illo: 'carrot',
    box: { x: 37, y: 60, w: 22, h: 24 },
    conf: 'guess',
    cat: 'Vegetables',
    expDays: 12,
    qty: '1 bag',
    alternates: ['Bell peppers', 'Sweet potato'],
  },
  {
    name: 'Greek Yogurt',
    illo: 'yogurt',
    box: { x: 65, y: 55, w: 25, h: 28 },
    conf: 'auto',
    cat: 'Dairy',
    expDays: 18,
    qty: '32 oz',
  },
  {
    name: 'Leftovers',
    illo: 'rice',
    box: { x: 44, y: 40, w: 18, h: 16 },
    conf: 'guess',
    cat: 'Leftovers',
    expDays: 2,
    qty: '1 box',
    note: 'Unlabeled container',
    alternates: ['Cooked rice', 'Pasta', 'Curry'],
  },
];

export const HIDDEN: HiddenItem[] = [
  { name: 'Butter', illo: 'cheese', cat: 'Dairy', expDays: 60 },
  { name: 'Cheddar Cheese', illo: 'cheese', cat: 'Dairy', expDays: 21 },
  { name: 'Sriracha', illo: 'chili', cat: 'Sauces', expDays: 365 },
];
