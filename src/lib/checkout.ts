// Pure checkout logic — retailer pricing, fees, and savings math. Extracted
// from the legacy src/screens/checkout.jsx so it's unit-testable independent of
// React (the OQ-003 / src/lib/cook.ts precedent). The Checkout overlay composes
// these; it owns the phase/retailer/excluded state.

export type Fulfillment = 'delivery' | 'pickup';

export interface Retailer {
  id: string;
  name: string;
  /** Price multiplier applied to the baseline basket. */
  mult: number;
  /** Flat delivery fee (waived on pickup). */
  fee: number;
  eta: string;
  badge: string;
}

// Verbatim from the legacy checkout.jsx RETAILERS table.
export const RETAILERS: Retailer[] = [
  { id: 'aldi', name: 'Aldi', mult: 0.86, fee: 3.99, eta: 'Today, 2–3 PM', badge: 'Cheapest' },
  {
    id: 'walmart',
    name: 'Walmart',
    mult: 0.95,
    fee: 0.0,
    eta: 'Today, 4–6 PM',
    badge: 'Free delivery',
  },
  { id: 'publix', name: 'Publix', mult: 1.1, fee: 4.99, eta: 'Today, 1–2 PM', badge: 'Fastest' },
  { id: 'wholef', name: 'Whole Foods', mult: 1.24, fee: 0.0, eta: 'Tomorrow AM', badge: 'Organic' },
];

/** The selected retailer, falling back to the first (Aldi) for an unknown id. */
export function getRetailer(id: string): Retailer {
  return RETAILERS.find((x) => x.id === id) ?? RETAILERS[0];
}

export interface CheckoutTotals {
  baseSubtotal: number;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  savings: number;
}

// Mirrors the legacy math: subtotal = Σprice × retailer.mult; delivery is free
// on pickup; service fee is 5% of the subtotal; savings is what the same basket
// would cost at the priciest retailer minus the chosen one, floored at 0.
export function computeTotals(
  items: readonly { price: number }[],
  retailer: Retailer,
  fulfillment: Fulfillment,
): CheckoutTotals {
  const baseSubtotal = items.reduce((s, c) => s + c.price, 0);
  const subtotal = baseSubtotal * retailer.mult;
  const deliveryFee = fulfillment === 'pickup' ? 0 : retailer.fee;
  const serviceFee = +(subtotal * 0.05).toFixed(2);
  const total = subtotal + deliveryFee + serviceFee;
  const priciest = Math.max(...RETAILERS.map((x) => x.mult)) * baseSubtotal;
  const savings = Math.max(0, priciest - subtotal);
  return { baseSubtotal, subtotal, deliveryFee, serviceFee, total, savings };
}
