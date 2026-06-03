import { describe, it, expect } from 'vitest';
import { mock } from '@/data/mock';
import type { Recipe, Step } from '@/types';
import {
  fmtQty,
  scaleIngredients,
  buildSteps,
  applyAdaptations,
  adaptDelta,
  recipeUsesHeat,
  donenessFor,
  suggestedAdapts,
  beginnerCue,
} from './cook';

const recipes = mock.recipes as readonly Recipe[];
const r1 = recipes.find((r) => r.id === 'r1')!; // Schezwan Egg Fried Rice — has a RECIPE_DEF
const noDef = recipes.find((r) => r.id === 'r2')!; // no def → fallback path

describe('fmtQty', () => {
  it('formats wholes, quarters, and units', () => {
    expect(fmtQty(2, 'cups')).toBe('2 cups');
    expect(fmtQty(0.5, 'tsp')).toBe('½ tsp');
    expect(fmtQty(1.25, '')).toBe('1 ¼');
    expect(fmtQty(0, '')).toBe('0');
  });
  it('returns empty string for a null quantity', () => {
    expect(fmtQty(null, 'cups')).toBe('');
  });
});

describe('scaleIngredients', () => {
  it('scales quantities linearly with servings', () => {
    const base = scaleIngredients(r1, 2, 'medium'); // BASE_SERVINGS = 2
    const dbl = scaleIngredients(r1, 4, 'medium');
    expect(base[0].qty).toBe(2); // Eggs, base
    expect(dbl[0].qty).toBe(4); // doubled at 4 servings
  });

  it('applies the spice multiplier only to the spiced ingredient', () => {
    const med = scaleIngredients(r1, 2, 'medium');
    const extra = scaleIngredients(r1, 2, 'extra'); // spice ×2.4
    const i = med.findIndex((x) => x.name === 'Schezwan sauce');
    expect(med[i].qty).toBe(2);
    expect(extra[i].qty).toBeCloseTo(4.8);
    expect(extra[0].qty).toBe(med[0].qty); // non-spiced ingredient unaffected
  });

  it('falls back to uses with null qty when the recipe has no def', () => {
    const scaled = scaleIngredients(noDef, 2, 'medium');
    expect(scaled).toHaveLength(noDef.uses.length);
    expect(scaled[0].qty).toBeNull();
    expect(scaled[0].name).toBe(noDef.uses[0]);
  });
});

describe('buildSteps', () => {
  it('returns the recipe def step script when present', () => {
    const steps = buildSteps(r1, 2, 'medium', scaleIngredients(r1, 2, 'medium'));
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].title).toMatch(/prep/i);
  });
  it('returns a generic 5-step fallback for recipes without a def', () => {
    const steps = buildSteps(noDef, 2, 'medium', scaleIngredients(noDef, 2, 'medium'));
    expect(steps).toHaveLength(5);
  });
});

describe('applyAdaptations + adaptDelta', () => {
  it('attaches one pilot note per active adaptation', () => {
    const steps = buildSteps(r1, 2, 'medium', scaleIngredients(r1, 2, 'medium'));
    const adapted = applyAdaptations(steps, new Set(['healthier']));
    const notes = adapted.reduce((n, s) => n + (s.pilotNotes?.length ?? 0), 0);
    expect(notes).toBe(1);
  });
  it('sums the calorie/protein deltas of active adaptations', () => {
    expect(adaptDelta(new Set(['healthier', 'protein']))).toEqual({ cals: -20, protein: 18 });
  });
});

describe('recipeUsesHeat', () => {
  it('is true for a spicy dish, false for a non-heat one', () => {
    expect(recipeUsesHeat(r1, scaleIngredients(r1, 2, 'medium'))).toBe(true);
    const cool = recipes.find((r) => /parfait|pancake/i.test(r.name))!;
    expect(recipeUsesHeat(cool, scaleIngredients(cool, 2, 'medium'))).toBe(false);
  });
});

describe('donenessFor', () => {
  const timedBrown: Step = {
    title: 'Sear the egg',
    body: 'fry hard until the edges crisp',
    timer: 2,
  };
  it('offers a 3-option doneness choice for a timed browning step', () => {
    const d = donenessFor(timedBrown);
    expect(d).not.toBeNull();
    expect(d!.options).toHaveLength(3);
    expect(d!.options.map((o) => o.dt)).toEqual([-1, 0, 1]);
  });
  it('returns null for a timed step with no browning keyword', () => {
    expect(donenessFor({ title: 'Boil water', body: 'add a pinch of salt', timer: 5 })).toBeNull();
  });
  it('returns null for a browning step with no timer (nothing to nudge)', () => {
    expect(donenessFor({ title: 'Sear the egg', body: 'fry it' })).toBeNull();
  });
});

describe('suggestedAdapts', () => {
  it("always seeds 'healthier'", () => {
    expect(suggestedAdapts('mild', false).has('healthier')).toBe(true);
  });
  it("adds 'spicier' only when the dish uses heat AND the spice is spicy/extra", () => {
    expect(suggestedAdapts('spicy', true).has('spicier')).toBe(true);
    expect(suggestedAdapts('extra', true).has('spicier')).toBe(true);
    expect(suggestedAdapts('mild', true).has('spicier')).toBe(false); // not spicy enough
    expect(suggestedAdapts('spicy', false).has('spicier')).toBe(false); // no heat element
  });
});

describe('beginnerCue', () => {
  it('returns a non-empty cue and clamps an out-of-range index to the last one', () => {
    expect(beginnerCue(0).length).toBeGreaterThan(0);
    expect(beginnerCue(999)).toBe(beginnerCue(998));
  });
});
