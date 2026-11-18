// The level being played. Lives only in memory: a level in progress is
// never saved (see Saving in docs/GAME_RULES.md).
import {
  BASE_SCORE,
  LIVES_PER_LEVEL,
  scoreAfterMistake,
  timeBonus,
} from '../game/scoring';
import { eraserCells, revealCell } from '../game/helps';
import { isSolutionCell, isSolved, ruledOutCells } from '../game/solver';
import type { CellMark, SolvedPuzzle, StrokeMode } from '../game/types';

export interface LevelState {
  puzzle: SolvedPuzzle;
  marks: CellMark[];
  lives: number;
  score: number;
  elapsedSeconds: number;
  status: 'playing' | 'won' | 'lost';
  /** Option read when the level starts: x the cells a correct cat rules out. */
  autoMark: boolean;
  /** Starting cats: placed when the level opens, and fixed. */
  givens: number[];
  /** The cat just placed on its solution cell, for the happy frame. */
  lastCorrectCat?: number;
  /** The cell of the last mistake, so it can shake. */
  lastMistake?: number;
}

export type LevelAction =
  | { type: 'tapCell'; index: number }
  | { type: 'placeCat'; index: number }
  | { type: 'strokeCells'; mode: StrokeMode; indices: number[] }
  | { type: 'useReveal' }
  | { type: 'useEraser' }
  | { type: 'tick' }
  | { type: 'restart' };

export function createLevel(
  puzzle: SolvedPuzzle,
  autoMark = false,
  givens: number[] = [],
): LevelState {
  const marks: CellMark[] = new Array(puzzle.size * puzzle.size).fill('empty');
  for (const cell of givens) {
    marks[cell] = 'cat';
    if (autoMark) autoMarkAround(puzzle, marks, cell);
  }
  return {
    puzzle,
    autoMark,
    givens,
    marks,
    lives: LIVES_PER_LEVEL,
    score: BASE_SCORE,
    elapsedSeconds: 0,
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
  if (!isSolved(state.puzzle, cats)) return state;
  const bonus = timeBonus(state.puzzle.size, state.elapsedSeconds);
  return { ...state, status: 'won', score: state.score + bonus };
}

// Marks the empty cells a cat on `cell` rules out; cats and x stay as they are.
function autoMarkAround(puzzle: SolvedPuzzle, marks: CellMark[], cell: number) {
  for (const other of ruledOutCells(puzzle, cell)) {
    if (marks[other] === 'empty') marks[other] = 'marked';
  }
}

// Puts a correct cat on `cell`, auto-marking the empty cells it rules out.
function withCat(
  state: LevelState,
  marks: CellMark[],
  cell: number,
): LevelState {
  marks[cell] = 'cat';
  if (state.autoMark) autoMarkAround(state.puzzle, marks, cell);
  return withWin({ ...state, marks, lastCorrectCat: cell });
}

export function levelReducer(
  state: LevelState,
  action: LevelAction,
): LevelState {
  // Retry is always allowed and has no limit.
  if (action.type === 'restart')
    return createLevel(state.puzzle, state.autoMark, state.givens);
  if (state.status !== 'playing') return state;
  const marks = [...state.marks];

  switch (action.type) {
    // Helps are paid for by the caller; the reducer only applies them.
    case 'useReveal': {
      const cell = revealCell(state.puzzle, marks);
      if (cell === undefined) return state;
      return withCat(state, marks, cell);
    }

    case 'useEraser':
      for (const cell of eraserCells(state.puzzle, marks))
        marks[cell] = 'empty';
      return { ...state, marks };

    case 'tick':
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };

    case 'tapCell':
      // A starting cat is fixed: tapping it does nothing.
      if (state.givens.includes(action.index)) return state;
      marks[action.index] = AFTER_TAP[marks[action.index]];
      return withWin({ ...state, marks });

    case 'placeCat': {
      if (isSolutionCell(state.puzzle, action.index)) {
        return withCat(state, marks, action.index);
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
        lastMistake: action.index,
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
