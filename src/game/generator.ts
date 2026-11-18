// Puzzle generator. Pure TypeScript, deterministic from its RNG. See
// "Puzzle generation" in docs/ARCHITECTURE.md.

import { shuffle } from './rng';

/**
 * Picks a random valid cat placement: one cat per row and column, and no
 * cat within one column of the cat in the row above (so none touch).
 * Returns the cell index of the cat in each row, the same shape as a
 * solution. Backtracks row by row over a shuffled column order.
 */
export function placeCats(size: number, rng: () => number): number[] {
  const cols: number[] = [];
  const allCols = Array.from({ length: size }, (_, col) => col);

  function place(row: number, usedCols: number): boolean {
    if (row === size) return true;
    for (const col of shuffle(allCols, rng)) {
      if (usedCols & (1 << col)) continue;
      if (row > 0 && Math.abs(col - cols[row - 1]) <= 1) continue;
      cols[row] = col;
      if (place(row + 1, usedCols | (1 << col))) return true;
    }
    return false;
  }

  // Boards below 4x4 have no valid placement at all.
  if (!place(0, 0)) {
    throw new Error(`No valid cat placement on a ${size}x${size} board`);
  }
  return cols.map((col, row) => row * size + col);
}
