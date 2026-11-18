import { describe, expect, it } from 'vitest';
import { generate } from './generator';
import {
  countSolutions,
  isSolutionCell,
  isSolved,
  isValidPlacement,
  solve,
} from './solver';
import type { Puzzle } from './types';

// zones where every cell has its own zone id: the zone rule can never fire,
// which isolates the row/column/touching checks in the tests below.
function uniqueZonesPuzzle(size: number): Puzzle {
  return { size, zones: Array.from({ length: size * size }, (_, i) => i) };
}

describe('isValidPlacement', () => {
  it('accepts a correct placement', () => {
    expect(isValidPlacement(UNIQUE_PUZZLE, [1, 7, 8, 14])).toBe(true);
  });

  it('rejects two cats in the same row', () => {
    // cell 0 = row 0, col 0; cell 2 = row 0, col 2 (far enough apart to not touch).
    expect(isValidPlacement(uniqueZonesPuzzle(4), [0, 2])).toBe(false);
  });

  it('rejects two cats in the same column', () => {
    // cell 0 = row 0, col 0; cell 8 = row 2, col 0.
    expect(isValidPlacement(uniqueZonesPuzzle(4), [0, 8])).toBe(false);
  });

  it('rejects two cats in the same zone', () => {
    const zones = uniqueZonesPuzzle(4).zones.slice();
    zones[9] = zones[0]; // cell 9 = row 2, col 1: different row/col, not touching.
    const puzzle: Puzzle = { size: 4, zones };
    expect(isValidPlacement(puzzle, [0, 9])).toBe(false);
  });

  it('rejects two cats touching along a side', () => {
    // cell 0 = row 0, col 0; cell 1 = row 0, col 1: side by side.
    expect(isValidPlacement(uniqueZonesPuzzle(4), [0, 1])).toBe(false);
  });

  it('rejects two cats touching diagonally', () => {
    // cell 0 = row 0, col 0; cell 5 = row 1, col 1: different row and
    // column, so only the touching rule can reject this one.
    expect(isValidPlacement(uniqueZonesPuzzle(4), [0, 5])).toBe(false);
  });
});

// Fixtures below are hand-built 4x4 boards, each confirmed by brute-force
// search over all 24 column permutations before being written down here.

// Solution: row0->col1, row1->col3, row2->col0, row3->col2 (cells 1,7,8,14).
// prettier-ignore
const UNIQUE_PUZZLE: Puzzle = {
  size: 4,
  zones: [
    0, 0, 0, 1,
    0, 2, 2, 1,
    2, 2, 3, 1,
    2, 3, 3, 3,
  ],
};

// Four 2x2 quadrants: symmetric under a half-turn, so it has exactly two
// solutions, (1,7,8,14) and (2,4,11,13), that mirror each other.
// prettier-ignore
const MULTIPLE_PUZZLE: Puzzle = {
  size: 4,
  zones: [
    0, 0, 1, 1,
    0, 0, 1, 1,
    2, 2, 3, 3,
    2, 2, 3, 3,
  ],
};

// A zone layout that breaks both of the only two placements a 4x4 board
// could otherwise allow (see MULTIPLE_PUZZLE), leaving none.
// prettier-ignore
const NONE_PUZZLE: Puzzle = {
  size: 4,
  zones: [
    1, 1, 3, 2,
    0, 0, 3, 2,
    0, 0, 0, 2,
    0, 0, 0, 2,
  ],
};

describe('countSolutions', () => {
  it('counts exactly one solution', () => {
    expect(countSolutions(UNIQUE_PUZZLE, 5)).toBe(1);
  });

  it('counts several solutions', () => {
    expect(countSolutions(MULTIPLE_PUZZLE, 5)).toBe(2);
  });

  it('counts zero solutions', () => {
    expect(countSolutions(NONE_PUZZLE, 5)).toBe(0);
  });

  it('stops counting once the limit is reached', () => {
    expect(countSolutions(MULTIPLE_PUZZLE, 1)).toBe(1);
  });
});

describe('solve', () => {
  it('returns the solution when there is exactly one', () => {
    const solution = solve(UNIQUE_PUZZLE);
    expect(solution).toEqual([1, 7, 8, 14]);
    expect(isValidPlacement(UNIQUE_PUZZLE, solution!)).toBe(true);
  });

  it('returns nothing when there are several solutions', () => {
    expect(solve(MULTIPLE_PUZZLE)).toBeUndefined();
  });

  it('returns nothing when there is no solution', () => {
    expect(solve(NONE_PUZZLE)).toBeUndefined();
  });
});

describe('performance', () => {
  // A randomly grown, contiguous 9x9 zone layout (not a uniqueness fixture,
  // just a realistic board shape to time the search on).
  // prettier-ignore
  const BIG_PUZZLE: Puzzle = {
    size: 9,
    zones: [
      0, 0, 0, 1, 1, 1, 1, 1, 1,
      0, 7, 1, 1, 1, 1, 1, 1, 1,
      6, 7, 6, 1, 1, 5, 5, 1, 8,
      6, 6, 6, 6, 5, 5, 5, 8, 8,
      6, 6, 6, 3, 5, 4, 4, 4, 8,
      6, 6, 6, 3, 3, 4, 4, 4, 4,
      6, 6, 3, 3, 3, 4, 4, 4, 4,
      6, 6, 3, 3, 3, 2, 2, 2, 4,
      6, 6, 6, 3, 3, 2, 2, 2, 2,
    ],
  };

  it('runs on a 9x9 board in a few milliseconds', () => {
    const start = performance.now();
    const count = countSolutions(BIG_PUZZLE, 1000);
    const elapsed = performance.now() - start;

    expect(count).toBe(152);
    // ~5 ms cold on a desktop; the margin absorbs slow CI runners.
    expect(elapsed).toBeLessThan(50);
  });
});

describe('isSolved', () => {
  const puzzle = generate(5, 3);

  it('accepts the full solution', () => {
    expect(isSolved(puzzle, puzzle.solution)).toBe(true);
  });

  it('rejects a partial placement, even if valid', () => {
    expect(isSolved(puzzle, puzzle.solution.slice(1))).toBe(false);
  });
});

describe('isSolutionCell', () => {
  const puzzle = generate(5, 3);

  it('is true only on the solution cells', () => {
    const cells = [...puzzle.zones.keys()].filter((cell) =>
      isSolutionCell(puzzle, cell),
    );
    expect(cells).toEqual(puzzle.solution);
  });
});
