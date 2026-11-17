// Shared types for the pure game logic. See the data model in
// docs/ARCHITECTURE.md.
//
// `solution` is deliberately not part of this type: the solver's job is to
// *find* it, and a puzzle with zero or several solutions has none to give.
// The generator (Phase 3) attaches a confirmed solution once solve() finds
// exactly one.

/** A puzzle board: an NxN grid split into N contiguous color zones. */
export interface Puzzle {
  /** Board size N; the board is N x N. */
  size: number;
  /** Zone id (0..size-1) per cell, row-major, length size*size. */
  zones: number[];
}
