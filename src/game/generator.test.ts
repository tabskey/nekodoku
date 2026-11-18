import { describe, expect, it } from 'vitest';
import {
  generate,
  generatePuzzle,
  growZones,
  placeCats,
  sideNeighbors,
} from './generator';
import { createRng } from './rng';
import { isValidPlacement } from './solver';
import { zonesAreContiguous } from '../test/zones';
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

describe('sideNeighbors', () => {
  it('lists only the cells that share a side', () => {
    expect(sideNeighbors(0, 4).sort((a, b) => a - b)).toEqual([1, 4]);
    expect(sideNeighbors(5, 4).sort((a, b) => a - b)).toEqual([1, 4, 6, 9]);
    expect(sideNeighbors(15, 4).sort((a, b) => a - b)).toEqual([11, 14]);
  });
});

describe('growZones', () => {
  function grow(size: number, seed: number) {
    const rng = createRng(seed);
    const cats = placeCats(size, rng);
    return { cats, zones: growZones(size, cats, rng) };
  }

  it('fills the board with contiguous zones, one per cat', () => {
    for (let size = 4; size <= 12; size++) {
      for (let seed = 1; seed <= 50; seed++) {
        const { cats, zones } = grow(size, seed);
        expect(zones).toHaveLength(size * size);
        cats.forEach((cell, zone) => expect(zones[cell]).toBe(zone));
        expect(zonesAreContiguous({ size, zones })).toBe(true);
      }
    }
  });

  it('gives the same zones for the same seed', () => {
    expect(grow(9, 7)).toEqual(grow(9, 7));
  });

  it('makes zones of uneven sizes', () => {
    const { zones } = grow(9, 7);
    const sizes = Array.from(
      { length: 9 },
      (_, zone) => zones.filter((z) => z === zone).length,
    );
    expect(Math.max(...sizes)).toBeGreaterThan(Math.min(...sizes));
  });
});

describe('generate', () => {
  it('gives the same puzzle for the same seed', () => {
    expect(generate(9, 7)).toEqual(generate(9, 7));
  });
});

describe('generatePuzzle', () => {
  it('gives the same puzzle for the same level', () => {
    expect(generatePuzzle(12)).toEqual(generatePuzzle(12));
  });
});
