// The level being played. Lives only in memory: a level in progress is
// never saved (see Saving in docs/GAME_RULES.md). Lives, score and time
// arrive in Phase 5.
import { isSolved } from '../game/solver';
import type { CellMark, SolvedPuzzle, StrokeMode } from '../game/types';

export interface LevelState {
  puzzle: SolvedPuzzle;
  marks: CellMark[];
  status: 'playing' | 'won';
}

export type LevelAction =
  | { type: 'tapCell'; index: number }
  | { type: 'placeCat'; index: number }
  | { type: 'strokeCells'; mode: StrokeMode; indices: number[] };

export function createLevel(puzzle: SolvedPuzzle): LevelState {
  return {
    puzzle,
    marks: new Array(puzzle.size * puzzle.size).fill('empty'),
    status: 'playing',
  };
}

// Tap: empty -> x, x -> empty, cat -> empty.
const AFTER_TAP: Record<CellMark, CellMark> = {
  empty: 'marked',
  marked: 'empty',
  cat: 'empty',
};

function withWin(state: LevelState): LevelState {
  const cats = state.marks.flatMap((mark, cell) =>
    mark === 'cat' ? [cell] : [],
  );
  return isSolved(state.puzzle, cats) ? { ...state, status: 'won' } : state;
}

export function levelReducer(
  state: LevelState,
  action: LevelAction,
): LevelState {
  if (state.status !== 'playing') return state;
  const marks = [...state.marks];

  switch (action.type) {
    case 'tapCell':
      marks[action.index] = AFTER_TAP[marks[action.index]];
      return withWin({ ...state, marks });

    case 'placeCat':
      marks[action.index] = 'cat';
      return withWin({ ...state, marks });

    case 'strokeCells': {
      // Cats are skipped; marking leaves x alone, erasing leaves empty alone.
      const from: CellMark = action.mode === 'mark' ? 'empty' : 'marked';
      const to: CellMark = action.mode === 'mark' ? 'marked' : 'empty';
      for (const index of action.indices) {
        if (marks[index] === from) marks[index] = to;
      }
      return { ...state, marks };
    }
  }
}
