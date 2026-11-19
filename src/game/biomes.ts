// Each world's map has a biome and a time of day, picked from the world
// number so a world always looks the same (see Biomes in docs/GAME_RULES.md).
import { createRng } from './rng';

// Add a biome or a time here once it is drawn; the map palettes in
// src/components/molecules/WorldPath/mapPalettes.ts must then fill it in.
export const BIOMES = ['meadow', 'beach'] as const;
export const TIMES = ['night', 'day', 'afternoon'] as const;

export type Biome = (typeof BIOMES)[number];
export type TimeOfDay = (typeof TIMES)[number];

export interface WorldScene {
  biome: Biome;
  time: TimeOfDay;
}

const SCENES: WorldScene[] = BIOMES.flatMap((biome) =>
  TIMES.map((time) => ({ biome, time })),
);

/**
 * The biome and time of day of `world`. World 1 is the meadow at night; each
 * later world picks at random among the others, never the same as the world
 * before it.
 */
export function worldScene(world: number): WorldScene {
  let pick = 0;
  for (let w = 2; w <= world; w++) {
    // One fewer choice, then skip over the previous pick.
    const next = Math.floor(createRng(w)() * (SCENES.length - 1));
    pick = next >= pick ? next + 1 : next;
  }
  return SCENES[pick];
}

// How the path of a world's map is laid out. pathLayout.ts draws each shape;
// add one here and there to give the maps one more look.
export const ROUTE_SHAPES = ['snake', 'wide', 'stairs'] as const;

export type RouteShape = (typeof ROUTE_SHAPES)[number];

export interface WorldRoute {
  shape: RouteShape;
  /** Flipped left to right, so the same shape starts on the other side. */
  mirrored: boolean;
}

// Keeps the route's random picks apart from the scene's, which use the world
// number alone.
const ROUTE_SEED = 7919;

/**
 * The path of `world`'s map. World 1 is the plain snake; each later world
 * picks a shape different from the world before it, and flips it or not, at
 * random but always the same for the same world.
 */
export function worldRoute(world: number): WorldRoute {
  let shape = 0;
  let mirrored = false;
  for (let w = 2; w <= world; w++) {
    const rng = createRng(w + ROUTE_SEED);
    // One fewer choice, then skip over the previous shape.
    const next = Math.floor(rng() * (ROUTE_SHAPES.length - 1));
    shape = next >= shape ? next + 1 : next;
    mirrored = rng() < 0.5;
  }
  return { shape: ROUTE_SHAPES[shape], mirrored };
}
