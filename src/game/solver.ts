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

interface SearchResult {
  count: number;
  firstSolution?: number[];
}

// Row-by-row backtracking search with column and zone bitmasks (size is at
// most 12, so both fit comfortably in a plain number). Adjacency only needs
// checking against the previous row: rows two or more apart can never touch.
function search(puzzle: Puzzle, limit: number): SearchResult {
  const { size, zones } = puzzle;
  const placement: number[] = new Array(size).fill(-1);
  let count = 0;
  let firstSolution: number[] | undefined;

  function backtrack(
    row: number,
    colMask: number,
    zoneMask: number,
    prevCol: number,
  ): void {
    if (count >= limit) return;
    if (row === size) {
      count++;
      firstSolution ??= [...placement];
      return;
    }

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

      if (count >= limit) return;
    }
  }

  backtrack(0, 0, 0, -1);
  return { count, firstSolution };
}

/** Counts solutions, stopping as soon as `limit` is reached. */
export function countSolutions(puzzle: Puzzle, limit: number): number {
  return search(puzzle, limit).count;
}

/** Returns the solution (cell index per row), or nothing if there is not exactly one. */
export function solve(puzzle: Puzzle): number[] | undefined {
  const { count, firstSolution } = search(puzzle, 2);
  return count === 1 ? firstSolution : undefined;
}
