import { describe, expect, it } from 'vitest';
import {
  generate,
  generatePuzzle,
  growZones,
  placeCats,
  sideNeighbors,
} from './generator';
import { createRng } from './rng';
import { countSolutions, isValidPlacement } from './solver';
import type { Puzzle } from './types';

// One zone per cell, so only the row, column and touching rules apply.
function noZones(size: number): Puzzle {
  return { size, zones: Array.from({ length: size * size }, (_, i) => i) };
}

// True when every zone id 0..size-1 forms one connected group of cells.
function zonesAreContiguous(puzzle: Puzzle): boolean {
  const { size, zones } = puzzle;
  for (let zone = 0; zone < size; zone++) {
    const cells = zones.flatMap((z, cell) => (z === zone ? [cell] : []));
    if (cells.length === 0) return false;
    const seen = new Set([cells[0]]);
    const stack = [cells[0]];
    while (stack.length > 0) {
      for (const n of sideNeighbors(stack.pop()!, size)) {
        if (zones[n] === zone && !seen.has(n)) {
          seen.add(n);
          stack.push(n);
        }
      }
    }
    if (seen.size !== cells.length) return false;
  }
  return true;
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
  it('returns contiguous zones with exactly one solution, the attached one', () => {
    // 12x12 is left out: a few seconds per board is too slow for this loop.
    for (let size = 4; size <= 11; size++) {
      for (let seed = 1; seed <= 10; seed++) {
        const puzzle = generate(size, seed);
        expect(countSolutions(puzzle, 2)).toBe(1);
        expect(isValidPlacement(puzzle, puzzle.solution)).toBe(true);
        expect(zonesAreContiguous(puzzle)).toBe(true);
      }
    }
  });

  it('gives the same puzzle for the same seed', () => {
    expect(generate(9, 7)).toEqual(generate(9, 7));
  });
});

describe('generatePuzzle', () => {
  it('gives levels 1 to 200 one solution, the attached one, and contiguous zones', () => {
    for (let level = 1; level <= 200; level++) {
      const puzzle = generatePuzzle(level);
      expect(countSolutions(puzzle, 2)).toBe(1);
      expect(isValidPlacement(puzzle, puzzle.solution)).toBe(true);
      expect(zonesAreContiguous(puzzle)).toBe(true);
    }
  }, 120_000);

  it('gives the same puzzle for the same level', () => {
    expect(generatePuzzle(12)).toEqual(generatePuzzle(12));
  });
});
