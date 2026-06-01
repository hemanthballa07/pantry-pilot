import { describe, it, expect } from 'vitest';
import {
  expiryLabel,
  expiryTone,
  boxColor,
  barcodeBars,
  RECEIPT,
  CATALOG,
  DETECTED,
  HIDDEN,
} from './capture';

describe('expiryLabel', () => {
  it('maps day counts to human labels', () => {
    expect(expiryLabel(0)).toBe('Non-perishable');
    expect(expiryLabel(1)).toBe('Tomorrow');
    expect(expiryLabel(5)).toBe('5 days');
    expect(expiryLabel(14)).toBe('2 weeks');
    expect(expiryLabel(60)).toBe('2 months');
    expect(expiryLabel(400)).toBe('1 year');
    expect(expiryLabel(800)).toBe('2 years');
  });
});

describe('expiryTone', () => {
  it('escalates tone as the shelf life shortens', () => {
    expect(expiryTone(0)).toBe('ghost');
    expect(expiryTone(2)).toBe('tomato');
    expect(expiryTone(6)).toBe('amber');
    expect(expiryTone(30)).toBe('green');
  });
});

describe('boxColor', () => {
  it('greens auto detections and ambers guesses', () => {
    expect(boxColor('auto')).toBe('var(--green)');
    expect(boxColor('guess')).toBe('var(--amber)');
  });
});

describe('barcodeBars', () => {
  it('is deterministic for a seed and yields 34 bars of width 1–4', () => {
    const a = barcodeBars('894700010045');
    const b = barcodeBars('894700010045');
    expect(a).toEqual(b);
    expect(a).toHaveLength(34);
    expect(a.every((w) => w >= 1 && w <= 4)).toBe(true);
  });

  it('differs by seed', () => {
    expect(barcodeBars('111')).not.toEqual(barcodeBars('222'));
  });
});

describe('capture fixtures', () => {
  it('receipt has matched, guessed, and unmatched lines', () => {
    expect(RECEIPT.items.some((l) => l.match?.confidence === 'auto')).toBe(true);
    expect(RECEIPT.items.some((l) => l.match?.confidence === 'guess')).toBe(true);
    expect(RECEIPT.items.some((l) => l.match === null)).toBe(true);
  });

  it('barcode catalog and fridge fixtures are populated', () => {
    expect(CATALOG).toHaveLength(6);
    expect(DETECTED.some((d) => d.conf === 'guess')).toBe(true);
    expect(HIDDEN).toHaveLength(3);
  });
});
