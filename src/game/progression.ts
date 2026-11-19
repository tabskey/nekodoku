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

// Worlds 1 to 3 restore the named cats; every later world restores a generated
// cat with the id `w<world>`. Ids stay plain strings, so the save keeps its
// shape. World cats are never sold.
const NAMED_WORLD_CATS = ['orange', 'gray', 'black'];

/** The cat restored by beating `world`'s Boss. */
export function worldCat(world: number): string {
  return NAMED_WORLD_CATS[world - 1] ?? `w${world}`;
}

export type CatBody = 'slim' | 'regular' | 'chubby';

const BODIES: CatBody[] = ['slim', 'regular', 'chubby'];

// TODO(design): when the final cat art lands (new coats, eye colors, body
// types or named cats), update BODIES, CAT_COATS, CAT_EYES and NAMED_BODIES to
// match, and their colors in catSprites.ts. Changing them changes how already
// restored cats look, never which cats a player owns.
/** Fur patterns the generated cats wear (proposed). Colors live in catSprites.ts. */
export const CAT_COATS = [
  'white',
  'cream',
  'orange',
  'gray',
  'black',
  'brown',
  'tuxedo',
  'grayTuxedo',
  'orangeWhite',
  'tortie',
  'tortieWhite',
  'chocolate',
  'siamese',
  'siameseBlue',
  'siameseChocolate',
  'siameseRed',
] as const;

/** Eye colors of the generated cats (proposed). */
export const CAT_EYES = ['blue', 'green', 'yellow', 'orange'] as const;

export type CatCoat = (typeof CAT_COATS)[number];
export type CatEyes = (typeof CAT_EYES)[number];

// Coats that only come with some eye colors: Siamese eyes are always blue.
const COAT_EYES: Partial<Record<CatCoat, readonly CatEyes[]>> = {
  siamese: ['blue'],
  siameseBlue: ['blue'],
  siameseChocolate: ['blue'],
  siameseRed: ['blue'],
};

// Every coat, eye and body combination, shuffled once with a fixed seed, so
// generated cats never repeat a look until all of them are used.
const GENERATED_LOOKS = shuffle(
  CAT_COATS.flatMap((coat) =>
    (COAT_EYES[coat] ?? CAT_EYES).flatMap((eyes) =>
      BODIES.map((body) => ({ coat, eyes, body })),
    ),
  ),
  createRng(0x6e656b6f),
);

// Bodies of the named cats, as in the "Tipos de corpo" artboard.
const NAMED_BODIES: Record<string, CatBody> = { gray: 'slim', white: 'chubby' };

export interface CatLook {
  /** Key of the palette to draw a named cat with, or the coat of a generated one. */
  palette: string;
  /** Eye color of a generated cat; named cats keep their palette's eyes. */
  eyes?: CatEyes;
  body: CatBody;
  /** Place among the generated cats (0 for world 4's), to pick its name. */
  generated?: number;
}

/** How the cat with a saved id looks. */
export function catLook(id: string): CatLook {
  const world = Number(/^w(\d+)$/.exec(id)?.[1]);
  if (!(world > NAMED_WORLD_CATS.length)) {
    return { palette: id, body: NAMED_BODIES[id] ?? 'regular' };
  }
  const generated = world - NAMED_WORLD_CATS.length - 1;
  const { coat, eyes, body } =
    GENERATED_LOOKS[generated % GENERATED_LOOKS.length];
  return { palette: coat, eyes, body, generated };
}
