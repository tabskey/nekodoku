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

/** Cells sharing a side with `cell`. */
export function sideNeighbors(cell: number, size: number): number[] {
  const row = Math.floor(cell / size);
  const col = cell % size;
  const result: number[] = [];
  if (row > 0) result.push(cell - size);
  if (row < size - 1) result.push(cell + size);
  if (col > 0) result.push(cell - 1);
  if (col < size - 1) result.push(cell + 1);
  return result;
}

/**
 * Grows one zone from each cat until the board is full; zone i starts at
 * cats[i]. Each step claims a random free cell that touches a zone, for a
 * random one of the zones it touches. Zones with longer borders get picked
 * more often, so sizes come out uneven. Every cell joins a zone it touches,
 * so each zone stays contiguous.
 */
export function growZones(
  size: number,
  cats: number[],
  rng: () => number,
): number[] {
  const zones: number[] = new Array(size * size).fill(-1);
  cats.forEach((cell, zone) => (zones[cell] = zone));
  let free = size * size - cats.length;

  while (free > 0) {
    const cell = Math.floor(rng() * size * size);
    if (zones[cell] !== -1) continue;
    const touching = sideNeighbors(cell, size)
      .map((n) => zones[n])
      .filter((zone) => zone !== -1);
    if (touching.length === 0) continue;
    zones[cell] = touching[Math.floor(rng() * touching.length)];
    free--;
  }
  return zones;
}
