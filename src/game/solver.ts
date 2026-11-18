// Rules and solver for Nekodoku puzzles. Pure TypeScript: no React, no DOM,
// no Math.random. See "Puzzle generation" in docs/ARCHITECTURE.md.

import type { Puzzle } from './types';

function rowOf(cell: number, size: number): number {
  return Math.floor(cell / size);
}

function colOf(cell: number, size: number): number {
  return cell % size;
}

/**
 * Checks a set of cat placements (cell indices) against the puzzle rules:
 * at most one cat per row, per column and per zone, and no two cats
 * touching, including diagonally. Works on a partial placement too, so it
 * can validate a single rule in isolation.
 */
export function isValidPlacement(puzzle: Puzzle, cats: number[]): boolean {
  const { size, zones } = puzzle;
  const seenRows = new Set<number>();
  const seenCols = new Set<number>();
  const seenZones = new Set<number>();
  const placed: Array<{ row: number; col: number }> = [];

  for (const cell of cats) {
    const row = rowOf(cell, size);
    const col = colOf(cell, size);
    const zone = zones[cell];

    if (seenRows.has(row) || seenCols.has(col) || seenZones.has(zone)) {
      return false;
    }
    seenRows.add(row);
    seenCols.add(col);
    seenZones.add(zone);
    placed.push({ row, col });
  }

  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const rowDiff = Math.abs(placed[i].row - placed[j].row);
      const colDiff = Math.abs(placed[i].col - placed[j].col);
      if (rowDiff <= 1 && colDiff <= 1) return false;
    }
  }

  return true;
}

// Row-by-row backtracking search with column and zone bitmasks (size is at
// most 12, so both fit comfortably in a plain number). Adjacency only needs
// checking against the previous row: rows two or more apart can never touch.
function search(puzzle: Puzzle, limit: number): number[][] {
  const { size, zones } = puzzle;
  const placement: number[] = new Array(size).fill(-1);
  const solutions: number[][] = [];
  // zonesFrom[row]: bit per zone with a cell in `row` or below. A zone with
  // no cat yet and no cells left below is a dead end.
  const zonesFrom: number[] = new Array(size + 1).fill(0);
  for (let row = size - 1; row >= 0; row--) {
    zonesFrom[row] = zonesFrom[row + 1];
    for (let col = 0; col < size; col++) {
      zonesFrom[row] |= 1 << zones[row * size + col];
    }
  }
  const allZones = (1 << size) - 1;

  function backtrack(
    row: number,
    colMask: number,
    zoneMask: number,
    prevCol: number,
  ): void {
    if (solutions.length >= limit) return;
    if (row === size) {
      solutions.push([...placement]);
      return;
    }
    if (allZones & ~zoneMask & ~zonesFrom[row]) return;

    for (let col = 0; col < size; col++) {
      const colBit = 1 << col;
      if (colMask & colBit) continue;
      if (prevCol !== -1 && Math.abs(col - prevCol) <= 1) continue;

      const cell = row * size + col;
      const zoneBit = 1 << zones[cell];
      if (zoneMask & zoneBit) continue;

      placement[row] = cell;
      backtrack(row + 1, colMask | colBit, zoneMask | zoneBit, col);
      placement[row] = -1;

      if (solutions.length >= limit) return;
    }
  }

  backtrack(0, 0, 0, -1);
  return solutions;
}

/** Counts solutions, stopping as soon as `limit` is reached. */
export function countSolutions(puzzle: Puzzle, limit: number): number {
  return search(puzzle, limit).length;
}

/** Returns up to `limit` solutions, each a cell index per row. */
export function findSolutions(puzzle: Puzzle, limit: number): number[][] {
  return search(puzzle, limit);
}

/** Returns the solution (cell index per row), or nothing if there is not exactly one. */
export function solve(puzzle: Puzzle): number[] | undefined {
  const solutions = search(puzzle, 2);
  return solutions.length === 1 ? solutions[0] : undefined;
}
