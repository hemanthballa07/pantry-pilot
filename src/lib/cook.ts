// Pure cook-mode logic — ingredient scaling, step scripts, and adaptations.
// Extracted from the legacy src/screens/cook-mode.jsx so it's unit-testable
// independent of React (resolves OQ-003). The CookMode overlay composes these.
import { recipeDefs, ingrIllo } from '@/data/recipes';
import type { Recipe, RecipeDef, Spice, Step } from '@/types';

export const BASE_SERVINGS = 2;
export const SPICE_MULT: Record<Spice, number> = { mild: 0.5, medium: 1, spicy: 1.6, extra: 2.4 };
export const SPICE_LABEL: Record<Spice, string> = {
  mild: 'Mild',
  medium: 'Medium',
  spicy: 'Spicy',
  extra: 'Extra spicy',
};

// recipeDefs is a literal object (`satisfies Record<string, RecipeDef>`), so a
// dynamic recipe.id lookup needs the optional-Record view to be `| undefined`.
const defs = recipeDefs as Record<string, RecipeDef | undefined>;

export interface ScaledIngredient {
  name: string;
  qty: number | null;
  unit: string;
  illo: string;
  spice?: boolean;
}

export interface PilotNote {
  label: string;
  tone: string;
  bg: string;
  text: string;
}

export type CookStep = Step & { pilotNotes: PilotNote[] };

export interface DonenessOption {
  label: string;
  dt: number;
  cue: string | null;
}
export interface Doneness {
  q: string;
  options: DonenessOption[];
}

export type AdaptId = 'healthier' | 'protein' | 'spicier' | 'crispier' | 'lowercarb' | 'quicker';

export interface Adaptation {
  id: AdaptId;
  label: string;
  icon: string;
  tone: string;
  bg: string;
  delta: { cals?: number; protein?: number };
  match: RegExp;
  note: string;
}

export function fmtQty(qty: number | null, unit: string): string {
  if (qty == null) return '';
  const rounded = Math.round(qty * 4) / 4;
  const whole = Math.floor(rounded);
  const f = rounded - whole;
  const frac = f === 0 ? '' : f === 0.25 ? '¼' : f === 0.5 ? '½' : '¾';
  const num = whole === 0 ? frac || '0' : frac ? `${whole} ${frac}` : `${whole}`;
  return unit ? `${num} ${unit}` : num;
}

export function scaleIngredients(
  recipe: Recipe,
  servings: number,
  spice: Spice,
): ScaledIngredient[] {
  const def = defs[recipe.id];
  if (!def) {
    return recipe.uses.map((u) => ({ name: u, qty: null, unit: '', illo: ingrIllo(u) }));
  }
  const scale = servings / BASE_SERVINGS;
  const spiceMult = SPICE_MULT[spice] ?? 1;
  return def.ingredients.map((it) => ({ ...it, qty: it.qty * scale * (it.spice ? spiceMult : 1) }));
}

export function buildSteps(
  recipe: Recipe,
  _servings: number,
  spice: Spice,
  ingredients: ScaledIngredient[],
): Step[] {
  const get = (name: string) => ingredients.find((i) => i.name === name) ?? { qty: 0, unit: '' };
  const q = (name: string) => fmtQty(get(name).qty, get(name).unit);

  const def = defs[recipe.id];
  if (def?.steps) return def.steps(q, spice);

  // Generic recipe fallback (recipes without a full step script).
  const spiceLine =
    spice === 'mild'
      ? 'Go easy on salt and chili — let the produce speak.'
      : spice === 'extra'
        ? 'Lean into the heat. Add chili flakes or extra hot sauce.'
        : 'Season to taste. Salt, acid, fat, heat — adjust one at a time.';
  return [
    {
      title: 'Gather and prep everything first.',
      body: `Pull out and prep: ${recipe.uses.join(', ')}. Wash, chop, and measure before the heat goes on.`,
    },
    {
      title: 'Build a flavor base.',
      body: 'Warm oil over medium-high. Add aromatics — onion, garlic, anything bright — and cook until soft and fragrant.',
      timer: 3,
    },
    {
      title: 'Add the main ingredients.',
      body: "Layer in proteins and bigger vegetables. Don't crowd the pan. Let things get color before stirring.",
      timer: 4,
    },
    { title: 'Season, taste, and adjust.', body: spiceLine },
    {
      title: 'Plate and finish.',
      body: 'Top with anything fresh you have — herbs, citrus zest, a drizzle of good oil.',
      tip: 'Pilot will save extras as a leftover and remind you to use them within 3 days.',
    },
  ];
}

const BEGINNER_CUES = [
  'All your ingredients are measured and chopped, with nothing left in the bag or wrapper.',
  'Onions look slightly translucent (clear, not brown), and you can smell the garlic — about 60 seconds.',
  'Eggs are no longer wet but still soft and slightly glossy. Pull them off heat before they brown.',
  'Rice edges crisp slightly and grains are separate, not clumped. About 2 minutes of high heat.',
  "Sauce coats every grain evenly. Taste — add a pinch of salt if it's flat. Serve hot.",
];
export function beginnerCue(idx: number): string {
  return BEGINNER_CUES[Math.min(idx, BEGINNER_CUES.length - 1)];
}

export const ADAPTATIONS: Adaptation[] = [
  {
    id: 'healthier',
    label: 'Healthier',
    icon: 'leaf',
    tone: 'var(--green-deep)',
    bg: 'var(--green-tint)',
    delta: { cals: -90, protein: 2 },
    match: /oil|fry|saut|butter|heat the/i,
    note: 'Use half the fat and finish with a squeeze of lemon or a splash of water. Add a handful of greens for fiber and volume.',
  },
  {
    id: 'protein',
    label: '+ Protein',
    icon: 'fire',
    tone: 'var(--tomato)',
    bg: 'var(--tomato-soft)',
    delta: { cals: 70, protein: 16 },
    match: /egg|tofu|chicken|bean|chickpea|paneer|finish|serve|plate/i,
    note: 'Stir in an extra egg, ½ block of tofu, or a scoop of beans for roughly +16g protein.',
  },
  {
    id: 'spicier',
    label: 'Spicier',
    icon: 'flame',
    tone: 'var(--orange-deep)',
    bg: 'var(--orange-tint)',
    delta: { cals: 5 },
    match: /sauce|chili|spice|season|schezwan|masala|sriracha|soy/i,
    note: 'Add a chopped green chili or an extra teaspoon of chili flakes when the sauce goes in.',
  },
  {
    id: 'crispier',
    label: 'Crispier',
    icon: 'flame',
    tone: 'var(--amber-ink)',
    bg: 'var(--amber-soft)',
    delta: {},
    match: /sear|fry|roast|crisp|brown|char|toast|golden/i,
    note: 'Spread it thin, crank the heat, and leave it undisturbed a minute longer — let the edges char before you toss.',
  },
  {
    id: 'lowercarb',
    label: 'Lower carb',
    icon: 'leaf',
    tone: 'var(--green-deep)',
    bg: 'var(--green-tint)',
    delta: { cals: -80 },
    match: /rice|noodle|pasta|tortilla|bread|oat/i,
    note: 'Swap half the rice or noodles for riced cauliflower or extra veg to cut the carbs.',
  },
  {
    id: 'quicker',
    label: 'In a hurry',
    icon: 'timer',
    tone: 'var(--sky-ink)',
    bg: 'var(--sky-soft)',
    delta: {},
    match: /prep|gather|chop|dice|heat/i,
    note: 'Prep while the pan heats and combine steps where you can — saves about 5 minutes.',
  },
];

export function applyAdaptations(steps: Step[], activeIds: Set<string>): CookStep[] {
  const out: CookStep[] = steps.map((s) => ({ ...s, pilotNotes: [] }));
  ADAPTATIONS.filter((a) => activeIds.has(a.id)).forEach((a) => {
    let idx = out.findIndex((s) => a.match.test(`${s.title} ${s.body}`));
    if (idx < 0) idx = 0;
    out[idx].pilotNotes.push({ label: a.label, tone: a.tone, bg: a.bg, text: a.note });
  });
  return out;
}

export function adaptDelta(activeIds: Set<string>): { cals: number; protein: number } {
  let cals = 0;
  let protein = 0;
  ADAPTATIONS.filter((a) => activeIds.has(a.id)).forEach((a) => {
    cals += a.delta.cals ?? 0;
    protein += a.delta.protein ?? 0;
  });
  return { cals, protein };
}

// Suggested adaptations seeded from the user's taste inputs.
export function suggestedAdapts(spice: Spice, usesHeat: boolean): Set<AdaptId> {
  const s = new Set<AdaptId>(['healthier']);
  if (usesHeat && (spice === 'spicy' || spice === 'extra')) s.add('spicier');
  return s;
}

// Does this dish have a heat element worth asking about? Parfaits, pancakes,
// pasta etc. don't — so the setup screen skips the spice question for them.
export function recipeUsesHeat(recipe: Recipe, ingredients: ScaledIngredient[]): boolean {
  if (ingredients.some((i) => i.spice)) return true;
  const uses = recipe.uses.join(' ');
  if (/sriracha|schezwan|chili|salsa|hot sauce|jalape/i.test(uses)) return true;
  if (
    /curry|masala|spicy|taco|kung pao|chili|stir fry|schezwan|enchilada|burrito|fajita/i.test(
      recipe.name,
    )
  )
    return true;
  return ['Indian', 'Mexican', 'Chinese', 'Indo-Chinese', 'Thai', 'Asian'].includes(recipe.cuisine);
}

// A step that browns/roasts/fries earns a live "cook to your taste" control.
const DONE_RE = /sear|fry|roast|crisp|brown|char|toast|saut|golden|simmer/i;
export function donenessFor(step: Step): Doneness | null {
  if (step.timer && DONE_RE.test(`${step.title} ${step.body}`)) {
    return {
      q: 'Cook it to your taste',
      options: [
        { label: 'Lighter', dt: -1, cue: 'Pull it early — softer and milder, less colour.' },
        { label: 'Just right', dt: 0, cue: null },
        {
          label: 'Deeper',
          dt: 1,
          cue: 'Take it a shade further — more browning, deeper, nuttier flavour.',
        },
      ],
    };
  }
  return null;
}
