import { describe, expect, it } from 'vitest';
import { createRng } from './rng';

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
