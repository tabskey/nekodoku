// Worlds and levels. Pure data plus the rule for worlds past the table. See
// "Progression" in docs/GAME_RULES.md.
import { createRng, shuffle } from './rng';
import type { SolvedPuzzle } from './types';

interface WorldRow {
  /** Board size of each level, the Boss last. */
  sizes: number[];
  /** Starting cats per level, same order as `sizes`; missing means none. */
  startingCats?: number[];
}

/** Hand-made worlds 1 to 6 (proposed, from the worlds table). */
const WORLDS: WorldRow[] = [
  { sizes: [5, 5, 6, 7, 9], startingCats: [1, 0, 0, 0, 1] },
  { sizes: [5, 6, 7, 8, 9] },
  { sizes: [6, 6, 7, 7, 8, 8, 9, 10] },
  { sizes: [6, 7, 7, 8, 8, 9, 9, 10] },
  { sizes: [7, 7, 8, 8, 9, 9, 10, 11] },
  { sizes: [7, 7, 8, 8, 9, 9, 10, 10, 11, 12] },
];

// Later worlds (proposed): 12 levels at world 7, one more every two worlds,
// capped at 20. Kept here so they are cheap to change.
const LATER_FIRST_LENGTH = 12;
const LATER_MAX_LENGTH = 20;
const BOSS_SIZE = 12;
const LARGEST_NON_BOSS = 11;

/** Number of levels in `world`, the Boss included. */
export function worldLength(world: number): number {
  if (world <= WORLDS.length) return WORLDS[world - 1].sizes.length;
  const extra = Math.floor((world - WORLDS.length - 1) / 2);
  return Math.min(LATER_FIRST_LENGTH + extra, LATER_MAX_LENGTH);
}

// Sizes for a world past the table: two levels per size from 7 (odd
// worlds) or 8 (even worlds) up to 11, extra levels added at 11 and 10,
// then the 12x12 Boss.
function laterWorldSizes(world: number): number[] {
  const count = worldLength(world) - 1;
  const sizes: number[] = [];
  for (let size = world % 2 ? 7 : 8; size <= LARGEST_NON_BOSS; size++) {
    sizes.push(size, size);
  }
  for (let i = 0; sizes.length < count; i++) {
    sizes.push(i % 2 ? LARGEST_NON_BOSS - 1 : LARGEST_NON_BOSS);
  }
  sizes.sort((a, b) => a - b);
  return [...sizes, BOSS_SIZE];
}

export interface LevelConfig {
  world: number;
  /** 1-based position inside the world. */
  levelInWorld: number;
  size: number;
  startingCats: number;
  isBoss: boolean;
}

/** The global number of the first level of `world`. */
export function worldStart(world: number): number {
  let first = 1;
  for (let w = 1; w < world; w++) first += worldLength(w);
  return first;
}

/** World, board size and starting cats for a level (1-based, global). */
export function levelConfig(level: number): LevelConfig {
  if (!Number.isInteger(level) || level < 1) {
    throw new Error(`Invalid level ${level}`);
  }
  let world = 1;
  let first = 1;
  while (level >= first + worldLength(world)) {
    first += worldLength(world);
    world++;
  }
  const index = level - first;
  const row = WORLDS[world - 1] ?? { sizes: laterWorldSizes(world) };
  return {
    world,
    levelInWorld: index + 1,
    size: row.sizes[index],
    startingCats: row.startingCats?.[index] ?? 0,
    isBoss: index === row.sizes.length - 1,
  };
}

/**
 * The cells that start with a cat: `count` cells of the solution, picked at
 * random but always the same for the same level.
 */
export function startingCatCells(
  puzzle: SolvedPuzzle,
  count: number,
  level: number,
): number[] {
  return shuffle(puzzle.solution, createRng(level)).slice(0, count);
}
