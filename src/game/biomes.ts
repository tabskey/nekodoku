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
