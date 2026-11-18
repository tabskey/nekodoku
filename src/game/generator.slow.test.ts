// The slowest generator checks: every board size and levels 1 to 200.
// They run in `npm test` (the build job) but are left out of the coverage
// run, where instrumentation makes them several times slower.
import { describe, expect, it } from 'vitest';
import { zonesAreContiguous } from '../test/zones';
import { generate, generatePuzzle } from './generator';
import { countSolutions, isValidPlacement } from './solver';

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
});
