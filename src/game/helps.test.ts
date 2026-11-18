import { describe, expect, it } from 'vitest';
import { generate } from './generator';
import {
  ERASER_COST,
  eraserCells,
  helpCost,
  REVEAL_COST,
  revealCell,
} from './helps';
import type { CellMark } from './types';

const puzzle = generate(5, 2);
const empty = (): CellMark[] => new Array(25).fill('empty');
const wrongCell = [...puzzle.zones.keys()].find(
  (cell) => !puzzle.solution.includes(cell),
)!;

describe('revealCell', () => {
  it('picks the first solution cell still without its cat', () => {
    const marks = empty();
    expect(revealCell(puzzle, marks)).toBe(puzzle.solution[0]);
    marks[puzzle.solution[0]] = 'cat';
    expect(revealCell(puzzle, marks)).toBe(puzzle.solution[1]);
  });

  it('picks a solution cell even when it holds an x', () => {
    const marks = empty();
    marks[puzzle.solution[0]] = 'marked';
    expect(revealCell(puzzle, marks)).toBe(puzzle.solution[0]);
  });

  it('finds nothing once every cat is placed', () => {
    const marks = empty();
    for (const cell of puzzle.solution) marks[cell] = 'cat';
    expect(revealCell(puzzle, marks)).toBeUndefined();
  });
});

describe('eraserCells', () => {
  it('lists only the x on solution cells', () => {
    const marks = empty();
    marks[puzzle.solution[1]] = 'marked';
    marks[puzzle.solution[3]] = 'marked';
    marks[wrongCell] = 'marked';
    expect(eraserCells(puzzle, marks)).toEqual([
      puzzle.solution[1],
      puzzle.solution[3],
    ]);
  });
});

describe('helpCost', () => {
  it('charges Reveal its price', () => {
    expect(helpCost('reveal', puzzle, empty())).toBe(REVEAL_COST);
  });

  it('charges the Eraser only when it has something to erase', () => {
    const marks = empty();
    marks[wrongCell] = 'marked';
    expect(helpCost('eraser', puzzle, marks)).toBe(0);
    marks[puzzle.solution[0]] = 'marked';
    expect(helpCost('eraser', puzzle, marks)).toBe(ERASER_COST);
  });
});
