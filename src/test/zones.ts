// Test helpers shared by several test files. Not part of the app.
import { sideNeighbors } from '../game/generator';
import type { Puzzle } from '../game/types';

// True when every zone id 0..size-1 forms one connected group of cells.
export function zonesAreContiguous(puzzle: Puzzle): boolean {
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
