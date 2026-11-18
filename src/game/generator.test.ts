import { describe, expect, it } from 'vitest';
import { placeCats } from './generator';
import { createRng } from './rng';
import { isValidPlacement } from './solver';
import type { Puzzle } from './types';

// One zone per cell, so only the row, column and touching rules apply.
function noZones(size: number): Puzzle {
  return { size, zones: Array.from({ length: size * size }, (_, i) => i) };
}

describe('placeCats', () => {
  it('places one valid cat per row on every board size', () => {
    for (let size = 4; size <= 12; size++) {
      for (let seed = 1; seed <= 50; seed++) {
        const cats = placeCats(size, createRng(seed));
        expect(cats).toHaveLength(size);
        cats.forEach((cell, row) => {
          expect(Math.floor(cell / size)).toBe(row);
        });
        expect(isValidPlacement(noZones(size), cats)).toBe(true);
      }
    }
  });

  it('gives the same placement for the same seed', () => {
    expect(placeCats(9, createRng(7))).toEqual(placeCats(9, createRng(7)));
  });

  it('varies with the seed', () => {
    const placements = new Set(
      Array.from({ length: 20 }, (_, seed) =>
        placeCats(9, createRng(seed)).join(),
      ),
    );
    expect(placements.size).toBeGreaterThan(1);
  });

  it('throws on a board too small to hold a placement', () => {
    expect(() => placeCats(3, createRng(1))).toThrow();
  });
});
