import { describe, expect, it } from 'vitest';
import { generate } from '../game/generator';
import { BASE_SCORE, LIVES_PER_LEVEL, MISTAKE_PENALTY } from '../game/scoring';
import {
  createLevel,
  levelReducer,
  type LevelAction,
  type LevelState,
} from './levelReducer';

// A generated 4x4: exactly one solution, so the win check is exact.
const puzzle = generate(4, 1);
const [rightCell] = puzzle.solution;
// Cells outside the solution, for mistakes.
const wrongCells = [...puzzle.zones.keys()].filter(
  (cell) => !puzzle.solution.includes(cell),
);
const [wrongCell] = wrongCells;
// A row of four cells holding exactly one solution cell, for the stroke tests.
const row = [0, 1, 2, 3];
const catInRow = puzzle.solution[0];

function play(...actions: LevelAction[]): LevelState {
  return actions.reduce(levelReducer, createLevel(puzzle));
}

const place = (index: number): LevelAction => ({ type: 'placeCat', index });
const tap = (index: number): LevelAction => ({ type: 'tapCell', index });

describe('levelReducer', () => {
  it('starts with every cell empty, full lives and the base score', () => {
    const state = createLevel(puzzle);
    expect(state.marks).toEqual(new Array(16).fill('empty'));
    expect(state).toMatchObject({
      lives: LIVES_PER_LEVEL,
      score: BASE_SCORE,
      status: 'playing',
    });
  });

  it('cycles a single tap: empty -> x -> empty', () => {
    expect(play(tap(5)).marks[5]).toBe('marked');
    expect(play(tap(5), tap(5)).marks[5]).toBe('empty');
  });

  it('places a correct cat, and a tap on the cat removes it', () => {
    const placed = play(place(rightCell));
    expect(placed.marks[rightCell]).toBe('cat');
    expect(levelReducer(placed, tap(rightCell)).marks[rightCell]).toBe('empty');
  });

  it('turns the x from the first tap of a double tap into a cat', () => {
    expect(play(tap(rightCell), place(rightCell)).marks[rightCell]).toBe('cat');
  });

  it('marks only empty cells on a mark stroke, skipping cats and x', () => {
    const other = row.filter((cell) => cell !== catInRow);
    const state = play(place(catInRow), tap(other[0]), {
      type: 'strokeCells',
      mode: 'mark',
      indices: row,
    });
    expect(row.map((cell) => state.marks[cell])).toEqual(
      row.map((cell) => (cell === catInRow ? 'cat' : 'marked')),
    );
  });

  it('erases only x on an erase stroke, skipping cats and empty cells', () => {
    const other = row.filter((cell) => cell !== catInRow);
    const state = play(place(catInRow), tap(other[0]), tap(other[2]), {
      type: 'strokeCells',
      mode: 'erase',
      indices: row,
    });
    expect(row.map((cell) => state.marks[cell])).toEqual(
      row.map((cell) => (cell === catInRow ? 'cat' : 'empty')),
    );
  });

  it('changes each cell once even if the stroke crosses it twice', () => {
    const state = play({
      type: 'strokeCells',
      mode: 'mark',
      indices: [0, 1, 0, 1],
    });
    expect(state.marks.slice(0, 2)).toEqual(['marked', 'marked']);
  });

  it('is won when every cat is placed, and then ignores input', () => {
    const won = play(...puzzle.solution.map(place));
    expect(won.status).toBe('won');
    expect(levelReducer(won, tap(rightCell))).toBe(won);
  });

  it('remembers a correct cat for the happy frame, and forgets it on a mistake', () => {
    const right = play(place(rightCell));
    expect(right.lastCorrectCat).toBe(rightCell);
    expect(
      levelReducer(right, place(wrongCell)).lastCorrectCat,
    ).toBeUndefined();
  });
});

describe('levelReducer mistakes', () => {
  it('rejects a wrong cat, keeps an x and costs a life and points', () => {
    const state = play(place(wrongCell));
    expect(state.marks[wrongCell]).toBe('marked');
    expect(state.lives).toBe(LIVES_PER_LEVEL - 1);
    expect(state.score).toBe(BASE_SCORE - MISTAKE_PENALTY);
    expect(state.status).toBe('playing');
  });

  it('keeps the x when a double tap lands on a wrong cell', () => {
    expect(play(tap(wrongCell), place(wrongCell)).marks[wrongCell]).toBe(
      'marked',
    );
  });

  it('loses the level on the third mistake, and then ignores input', () => {
    const lost = play(...wrongCells.slice(0, 3).map(place));
    expect(lost.lives).toBe(0);
    expect(lost.status).toBe('lost');
    expect(levelReducer(lost, place(rightCell))).toBe(lost);
  });

  it('restarts from scratch after a loss, as often as wanted', () => {
    const lost = play(...wrongCells.slice(0, 3).map(place));
    const retried = levelReducer(lost, { type: 'restart' });
    expect(retried).toEqual(createLevel(puzzle));
    expect(levelReducer(retried, { type: 'restart' })).toEqual(
      createLevel(puzzle),
    );
  });
});
