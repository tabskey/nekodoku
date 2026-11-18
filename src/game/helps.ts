// Helps bought with coins at the moment of use. See "Helps" in
// docs/GAME_RULES.md.
import type { CellMark, SolvedPuzzle } from './types';

export type Help = 'reveal' | 'eraser';

// Proposed prices; keep them here so they are cheap to change.
export const REVEAL_COST = 50;
export const ERASER_COST = 20;

/** The cell Reveal fills: the first solution cell, row by row, still without its cat. */
export function revealCell(
  puzzle: SolvedPuzzle,
  marks: CellMark[],
): number | undefined {
  return puzzle.solution.find((cell) => marks[cell] !== 'cat');
}

/** The cells the Eraser clears: every x sitting on a solution cell. */
export function eraserCells(puzzle: SolvedPuzzle, marks: CellMark[]): number[] {
  return puzzle.solution.filter((cell) => marks[cell] === 'marked');
}

/** What a help costs right now. The Eraser is free when there is nothing to erase. */
export function helpCost(
  help: Help,
  puzzle: SolvedPuzzle,
  marks: CellMark[],
): number {
  if (help === 'reveal') return REVEAL_COST;
  return eraserCells(puzzle, marks).length > 0 ? ERASER_COST : 0;
}
