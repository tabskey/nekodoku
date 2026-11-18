// Shared types for the pure game logic. See the data model in
// docs/ARCHITECTURE.md.

/**
 * A puzzle board: an NxN grid split into N contiguous color zones.
 *
 * No `solution` here on purpose: the solver's job is to *find* it, and a
 * puzzle with zero or several solutions has none to give.
 */
export interface Puzzle {
  /** Board size N; the board is N x N. */
  size: number;
  /** Zone id (0..size-1) per cell, row-major, length size*size. */
  zones: number[];
}

/**
 * What the game plays. Only the generator creates it, after solve()
 * confirms exactly one solution, so no level reaches the player without one.
 */
export interface SolvedPuzzle extends Puzzle {
  /** Cell index of the cat in each row, length size. */
  solution: number[];
}

/** What the player has put on a cell. */
export type CellMark = 'empty' | 'marked' | 'cat';

/** A drag marks empty cells or erases x, decided by the cell it starts on. */
export type StrokeMode = 'mark' | 'erase';
