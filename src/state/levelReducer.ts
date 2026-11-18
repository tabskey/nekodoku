// The level being played. Lives only in memory: a level in progress is
// never saved (see Saving in docs/GAME_RULES.md).
import {
  BASE_SCORE,
  LIVES_PER_LEVEL,
  scoreAfterMistake,
} from '../game/scoring';
import { isSolutionCell, isSolved } from '../game/solver';
import type { CellMark, SolvedPuzzle, StrokeMode } from '../game/types';

export interface LevelState {
  puzzle: SolvedPuzzle;
  marks: CellMark[];
  lives: number;
  score: number;
  status: 'playing' | 'won' | 'lost';
  /** The cat just placed on its solution cell, for the happy frame. */
  lastCorrectCat?: number;
}

export type LevelAction =
  | { type: 'tapCell'; index: number }
  | { type: 'placeCat'; index: number }
  | { type: 'strokeCells'; mode: StrokeMode; indices: number[] }
  | { type: 'restart' };

export function createLevel(puzzle: SolvedPuzzle): LevelState {
  return {
    puzzle,
    marks: new Array(puzzle.size * puzzle.size).fill('empty'),
    lives: LIVES_PER_LEVEL,
    score: BASE_SCORE,
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
  // Retry is always allowed and has no limit.
  if (action.type === 'restart') return createLevel(state.puzzle);
  if (state.status !== 'playing') return state;
  const marks = [...state.marks];

  switch (action.type) {
    case 'tapCell':
      marks[action.index] = AFTER_TAP[marks[action.index]];
      return withWin({ ...state, marks });

    case 'placeCat': {
      if (isSolutionCell(state.puzzle, action.index)) {
        marks[action.index] = 'cat';
        return withWin({ ...state, marks, lastCorrectCat: action.index });
      }
      // A mistake: the cat is rejected, the cell keeps an x, a life is lost.
      marks[action.index] = 'marked';
      const lives = state.lives - 1;
      return {
        ...state,
        marks,
        lives,
        score: scoreAfterMistake(state.score),
        status: lives === 0 ? 'lost' : 'playing',
        lastCorrectCat: undefined,
      };
    }

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
