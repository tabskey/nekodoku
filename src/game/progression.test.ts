import { describe, expect, it } from 'vitest';
import { generate } from './generator';
import {
  levelConfig,
  startingCatCells,
  worldLength,
  worldStart,
} from './progression';

describe('worldLength', () => {
  it('never decreases and never passes the cap', () => {
    for (let world = 2; world <= 100; world++) {
      expect(worldLength(world)).toBeGreaterThanOrEqual(worldLength(world - 1));
      expect(worldLength(world)).toBeLessThanOrEqual(20);
    }
    expect(worldLength(100)).toBe(20);
  });

  it('follows the table for later worlds', () => {
    expect([7, 8, 9, 10, 11].map(worldLength)).toEqual([12, 12, 13, 13, 14]);
  });
});

describe('levelConfig', () => {
  it('opens world 1 on a 5x5 with a starting cat', () => {
    expect(levelConfig(1)).toEqual({
      world: 1,
      levelInWorld: 1,
      size: 5,
      startingCats: 1,
      isBoss: false,
    });
    expect(levelConfig(2).startingCats).toBe(0);
  });

  it('ends each world on its Boss and starts the next world after it', () => {
    expect(levelConfig(5)).toMatchObject({ world: 1, size: 9, isBoss: true });
    expect(levelConfig(5).startingCats).toBe(1);
    expect(levelConfig(6)).toMatchObject({ world: 2, levelInWorld: 1 });
    expect(levelConfig(44)).toMatchObject({ world: 6, size: 12, isBoss: true });
    expect(levelConfig(45)).toMatchObject({ world: 7, levelInWorld: 1 });
  });

  it('keeps every level between 5x5 and 12x12, with 12x12 only on Bosses past world 5', () => {
    for (let level = 1; level <= 1000; level++) {
      const { size, isBoss, world } = levelConfig(level);
      expect(size).toBeGreaterThanOrEqual(5);
      expect(size).toBeLessThanOrEqual(isBoss && world >= 6 ? 12 : 11);
      if (isBoss && world >= 6) expect(size).toBe(12);
    }
  });

  it('rejects levels below 1', () => {
    expect(() => levelConfig(0)).toThrow();
  });
});

describe('startingCatCells', () => {
  const puzzle = generate(5, 1);

  it('picks the requested number of solution cells', () => {
    const cells = startingCatCells(puzzle, 2, 1);
    expect(cells).toHaveLength(2);
    for (const cell of cells) expect(puzzle.solution).toContain(cell);
    expect(new Set(cells).size).toBe(2);
  });

  it('picks the same cells for the same level, and none for zero', () => {
    expect(startingCatCells(puzzle, 1, 5)).toEqual(
      startingCatCells(puzzle, 1, 5),
    );
    expect(startingCatCells(puzzle, 0, 1)).toEqual([]);
  });
});

describe('worldStart', () => {
  it('gives the first level of each world, matching levelConfig', () => {
    expect([1, 2, 7].map(worldStart)).toEqual([1, 6, 45]);
    for (let world = 1; world <= 30; world++) {
      expect(levelConfig(worldStart(world))).toMatchObject({
        world,
        levelInWorld: 1,
      });
    }
  });
});
