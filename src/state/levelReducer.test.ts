import { describe, expect, it } from 'vitest';
import { generate } from '../game/generator';
import {
  BASE_SCORE,
  LIVES_PER_LEVEL,
  MISTAKE_PENALTY,
  timeBonus,
} from '../game/scoring';
import { ruledOutCells } from '../game/solver';
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

describe('levelReducer timer', () => {
  const tick: LevelAction = { type: 'tick' };
  const ticks = (n: number) => Array.from({ length: n }, () => tick);

  it('counts seconds while the level is in play', () => {
    expect(createLevel(puzzle).elapsedSeconds).toBe(0);
    expect(play(...ticks(3)).elapsedSeconds).toBe(3);
  });

  it('stops counting once the level is won or lost', () => {
    const won = play(tick, ...puzzle.solution.map(place));
    expect(levelReducer(won, tick)).toBe(won);
    const lost = play(tick, ...wrongCells.slice(0, 3).map(place));
    expect(levelReducer(lost, tick)).toBe(lost);
  });

  it('adds the time bonus to the score on a win', () => {
    const won = play(
      ...ticks(10),
      place(wrongCell),
      ...puzzle.solution.map(place),
    );
    expect(won.score).toBe(
      BASE_SCORE - MISTAKE_PENALTY + timeBonus(puzzle.size, 10),
    );
  });

  it('gives no bonus past par time', () => {
    const won = play(...ticks(1000), ...puzzle.solution.map(place));
    expect(won.score).toBe(BASE_SCORE);
  });

  it('resets the clock on restart', () => {
    expect(play(...ticks(5), { type: 'restart' }).elapsedSeconds).toBe(0);
  });
});

describe('levelReducer helps', () => {
  const reveal: LevelAction = { type: 'useReveal' };
  const eraser: LevelAction = { type: 'useEraser' };

  it('Reveal places the next correct cat, over an x if needed', () => {
    const state = play(tap(rightCell), reveal);
    expect(state.marks[rightCell]).toBe('cat');
    expect(state.lastCorrectCat).toBe(rightCell);
  });

  it('Reveal can finish the level', () => {
    const state = play(...puzzle.solution.map(() => reveal));
    expect(state.status).toBe('won');
  });

  it('Eraser clears x on solution cells and leaves the rest', () => {
    const state = play(tap(rightCell), tap(wrongCell), eraser);
    expect(state.marks[rightCell]).toBe('empty');
    expect(state.marks[wrongCell]).toBe('marked');
  });

  it('helps do nothing once the level is over', () => {
    const lost = play(...wrongCells.slice(0, 3).map(place));
    expect(levelReducer(lost, reveal)).toBe(lost);
  });
});

describe('levelReducer auto-mark', () => {
  const withAutoMark = (...actions: LevelAction[]) =>
    actions.reduce(levelReducer, createLevel(puzzle, true));

  it('is off by default: a cat marks nothing else', () => {
    const state = play(place(rightCell));
    expect(state.marks.filter((mark) => mark === 'marked')).toEqual([]);
  });

  it('marks every empty cell the cat rules out, and only those', () => {
    const state = withAutoMark(place(rightCell));
    const ruledOut = ruledOutCells(puzzle, rightCell);
    state.marks.forEach((mark, cell) => {
      if (cell === rightCell) expect(mark).toBe('cat');
      else expect(mark).toBe(ruledOut.includes(cell) ? 'marked' : 'empty');
    });
  });

  it('leaves cats in place and does not toggle existing x', () => {
    const [first, second] = puzzle.solution;
    const xCell = ruledOutCells(puzzle, second)[0];
    const state = withAutoMark(place(first), tap(xCell), place(second));
    expect(state.marks[first]).toBe('cat');
    expect(state.marks[xCell]).toBe('marked');
  });

  it('also marks after Reveal', () => {
    const state = withAutoMark({ type: 'useReveal' });
    expect(
      state.marks.filter((mark) => mark === 'marked').length,
    ).toBeGreaterThan(0);
  });

  it('marks nothing on a mistake beyond the rejected cell', () => {
    const state = withAutoMark(place(wrongCell));
    expect(state.marks.filter((mark) => mark === 'marked')).toEqual(['marked']);
  });

  it('keeps the setting on restart', () => {
    expect(withAutoMark({ type: 'restart' }).autoMark).toBe(true);
  });
});
