import { describe, it, expect } from 'vitest';
import { RETAILERS, getRetailer, computeTotals } from './checkout';

const aldi = getRetailer('aldi'); // mult 0.86, fee 3.99 — cheapest
const wholef = getRetailer('wholef'); // mult 1.24, fee 0 — priciest
// A clean $100 base so multipliers read directly off the totals.
const cart = [{ price: 60 }, { price: 40 }];

describe('RETAILERS', () => {
  it('lists the four retailers with Aldi as the cheapest multiplier', () => {
    expect(RETAILERS).toHaveLength(4);
    const cheapest = RETAILERS.reduce((a, b) => (a.mult <= b.mult ? a : b));
    expect(cheapest.id).toBe('aldi');
  });
});

describe('getRetailer', () => {
  it('returns the retailer matching the id', () => {
    expect(getRetailer('publix').name).toBe('Publix');
  });

  it('falls back to the first retailer for an unknown id', () => {
    expect(getRetailer('nope')).toBe(RETAILERS[0]);
  });
});

describe('computeTotals', () => {
  it('scales the subtotal by the retailer multiplier', () => {
    const t = computeTotals(cart, aldi, 'delivery');
    expect(t.baseSubtotal).toBeCloseTo(100, 2);
    expect(t.subtotal).toBeCloseTo(86, 2);
  });

  it('charges the retailer delivery fee on delivery and nothing on pickup', () => {
    expect(computeTotals(cart, aldi, 'delivery').deliveryFee).toBe(3.99);
    expect(computeTotals(cart, aldi, 'pickup').deliveryFee).toBe(0);
  });

  it('adds a 5% service fee on the subtotal', () => {
    const t = computeTotals(cart, aldi, 'pickup');
    expect(t.serviceFee).toBeCloseTo(4.3, 2); // 5% of 86
  });

  it('totals subtotal + delivery + service', () => {
    const t = computeTotals(cart, aldi, 'delivery');
    expect(t.total).toBeCloseTo(86 + 3.99 + 4.3, 2);
  });

  it('reports savings versus the priciest retailer on the same basket', () => {
    const t = computeTotals(cart, aldi, 'delivery');
    expect(t.savings).toBeCloseTo(1.24 * 100 - 86, 2); // 38
  });

  it('reports zero savings when the chosen retailer is the priciest', () => {
    const t = computeTotals(cart, wholef, 'delivery');
    expect(t.savings).toBe(0);
  });

  it('is all zeros for an empty basket', () => {
    const t = computeTotals([], aldi, 'delivery');
    expect(t.baseSubtotal).toBe(0);
    expect(t.subtotal).toBe(0);
    expect(t.serviceFee).toBe(0);
    expect(t.savings).toBe(0);
    expect(t.total).toBe(t.deliveryFee); // only the flat delivery fee remains
  });
});
