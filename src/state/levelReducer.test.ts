import { describe, expect, it } from 'vitest';
import { generate } from '../game/generator';
import { createLevel, levelReducer, type LevelState } from './levelReducer';

// A generated 4x4: exactly one solution, so the win check is exact.
const puzzle = generate(4, 1);
// A cell outside the solution, for the extra-cat case.
const wrongCell = [...puzzle.zones.keys()].find(
  (cell) => !puzzle.solution.includes(cell),
)!;

function play(...actions: Parameters<typeof levelReducer>[1][]): LevelState {
  return actions.reduce(levelReducer, createLevel(puzzle));
}

describe('levelReducer', () => {
  it('starts with every cell empty and the level in play', () => {
    const state = createLevel(puzzle);
    expect(state.marks).toEqual(new Array(16).fill('empty'));
    expect(state.status).toBe('playing');
  });

  it('cycles a single tap: empty -> x -> empty', () => {
    expect(play({ type: 'tapCell', index: 5 }).marks[5]).toBe('marked');
    expect(
      play({ type: 'tapCell', index: 5 }, { type: 'tapCell', index: 5 })
        .marks[5],
    ).toBe('empty');
  });

  it('places a cat, and a tap on the cat removes it', () => {
    const placed = play({ type: 'placeCat', index: 5 });
    expect(placed.marks[5]).toBe('cat');
    expect(levelReducer(placed, { type: 'tapCell', index: 5 }).marks[5]).toBe(
      'empty',
    );
  });

  it('turns the x from the first tap of a double tap into a cat', () => {
    const state = play(
      { type: 'tapCell', index: 5 },
      { type: 'placeCat', index: 5 },
    );
    expect(state.marks[5]).toBe('cat');
  });

  it('marks only empty cells on a mark stroke, skipping cats and x', () => {
    const state = play(
      { type: 'placeCat', index: 1 },
      { type: 'tapCell', index: 2 },
      { type: 'strokeCells', mode: 'mark', indices: [0, 1, 2, 3] },
    );
    expect(state.marks.slice(0, 4)).toEqual([
      'marked',
      'cat',
      'marked',
      'marked',
    ]);
  });

  it('erases only x on an erase stroke, skipping cats and empty cells', () => {
    const state = play(
      { type: 'tapCell', index: 0 },
      { type: 'placeCat', index: 1 },
      { type: 'tapCell', index: 3 },
      { type: 'strokeCells', mode: 'erase', indices: [0, 1, 2, 3] },
    );
    expect(state.marks.slice(0, 4)).toEqual(['empty', 'cat', 'empty', 'empty']);
  });

  it('changes each cell once even if the stroke crosses it twice', () => {
    const state = play({
      type: 'strokeCells',
      mode: 'mark',
      indices: [0, 1, 0, 1],
    });
    expect(state.marks.slice(0, 2)).toEqual(['marked', 'marked']);
  });

  it('is won when the cats match the solution, and then ignores input', () => {
    const won = play(
      ...puzzle.solution.map((index) => ({ type: 'placeCat' as const, index })),
    );
    expect(won.status).toBe('won');
    expect(levelReducer(won, { type: 'tapCell', index: 1 })).toBe(won);
  });

  it('is not won while a cat is missing or extra cats break the rules', () => {
    const three = play(
      ...puzzle.solution
        .slice(0, 3)
        .map((index) => ({ type: 'placeCat' as const, index })),
    );
    expect(three.status).toBe('playing');
    expect(
      levelReducer(three, { type: 'placeCat', index: wrongCell }).status,
    ).toBe('playing');
  });

  it('remembers a cat placed on its solution cell, and forgets a wrong one', () => {
    const right = play({ type: 'placeCat', index: puzzle.solution[0] });
    expect(right.lastCorrectCat).toBe(puzzle.solution[0]);
    expect(
      levelReducer(right, { type: 'placeCat', index: wrongCell })
        .lastCorrectCat,
    ).toBeUndefined();
  });
});
