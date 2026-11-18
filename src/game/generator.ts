// Puzzle generator. Pure TypeScript, deterministic from its RNG. See
// "Puzzle generation" in docs/ARCHITECTURE.md.

import { createRng, shuffle } from './rng';
import { levelConfig } from './progression';
import { findSolutions } from './solver';
import type { SolvedPuzzle } from './types';

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

// True when `zone` stays one connected group once `removed` leaves it.
function staysContiguous(
  zones: number[],
  size: number,
  zone: number,
  removed: number,
): boolean {
  const cells = zones.flatMap((z, cell) =>
    z === zone && cell !== removed ? [cell] : [],
  );
  if (cells.length === 0) return false;
  const seen = new Set([cells[0]]);
  const stack = [cells[0]];
  while (stack.length > 0) {
    for (const n of sideNeighbors(stack.pop()!, size)) {
      if (n !== removed && zones[n] === zone && !seen.has(n)) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  return seen.size === cells.length;
}

/**
 * Kills one unwanted solution: moves a cell where `other` has a cat (and
 * `cats` does not) into a neighboring zone, so `other` ends up with two cats
 * in that zone. The intended cats never move, so they stay a solution.
 * Returns false when no cell can move without splitting its zone.
 */
function repair(
  zones: number[],
  size: number,
  cats: number[],
  other: number[],
  rng: () => number,
): boolean {
  const moves: Array<[cell: number, zone: number]> = [];
  other.forEach((cell, row) => {
    if (cell === cats[row]) return;
    if (!staysContiguous(zones, size, zones[cell], cell)) return;
    for (const n of sideNeighbors(cell, size)) {
      if (zones[n] !== zones[cell]) moves.push([cell, zones[n]]);
    }
  });
  if (moves.length === 0) return false;
  const [cell, zone] = moves[Math.floor(rng() * moves.length)];
  zones[cell] = zone;
  return true;
}

/**
 * Builds a size x size puzzle with exactly one solution, always the same
 * one for the same seed. Places cats and grows zones, then, while the
 * solver finds a second solution, repairs the zones to rule it out. Starts
 * over when a board cannot be repaired or needs too many repairs.
 */
export function generate(size: number, seed: number): SolvedPuzzle {
  const rng = createRng(seed);
  for (;;) {
    const cats = placeCats(size, rng);
    const zones = growZones(size, cats, rng);
    // A repair can open a new solution; give up on boards that keep doing it.
    for (let repairs = 0; repairs <= size * size; repairs++) {
      const solutions = findSolutions({ size, zones }, 2);
      if (solutions.length === 1) {
        return { size, zones, solution: solutions[0] };
      }
      const other = solutions.find((s) => s.join() !== cats.join())!;
      if (repair(zones, size, cats, other, rng)) continue;
      // Stuck on that one; any other unwanted solution may still be fixable.
      const fixed = findSolutions({ size, zones }, 8).some(
        (s) => s.join() !== cats.join() && repair(zones, size, cats, s, rng),
      );
      if (!fixed) break;
    }
  }
}

/** The puzzle for a level: same level, same board, every time. */
export function generatePuzzle(level: number): SolvedPuzzle {
  return generate(levelConfig(level).size, level);
}
