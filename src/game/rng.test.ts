import { describe, expect, it } from 'vitest';
import { createRng, shuffle } from './rng';

function draw(seed: number, count: number): number[] {
  const rng = createRng(seed);
  return Array.from({ length: count }, rng);
}

describe('createRng', () => {
  it('repeats the same sequence for the same seed', () => {
    expect(draw(12, 100)).toEqual(draw(12, 100));
  });

  it('gives different sequences for different seeds', () => {
    expect(draw(12, 10)).not.toEqual(draw(13, 10));
  });

  it('stays within [0, 1)', () => {
    for (const value of draw(1, 10_000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('shuffle', () => {
  const items = Array.from({ length: 12 }, (_, i) => i);

  it('keeps every item exactly once', () => {
    expect(shuffle(items, createRng(5)).sort((a, b) => a - b)).toEqual(items);
  });

  it('gives the same order for the same seed', () => {
    expect(shuffle(items, createRng(5))).toEqual(shuffle(items, createRng(5)));
  });

  it('leaves the input untouched', () => {
    const copy = [...items];
    shuffle(items, createRng(5));
    expect(items).toEqual(copy);
  });
});
