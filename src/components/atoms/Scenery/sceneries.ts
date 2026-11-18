// Boss scenery: one pixel map with six color roles, recolored per world and
// time of day (see Boss sceneries in docs/SPRITES.md). Placeholder art, made
// from the SVGs in src/assets/; the afternoon palettes are guesses.
import type { TimeOfDay } from '../../../game/biomes';

export type SceneryRole = 'sky' | 'speck' | 'disc' | 'far' | 'near' | 'ground';
export type SceneryPalette = Record<SceneryRole, string>;

export const ROLE_BY_CHAR: Record<string, SceneryRole> = {
  s: 'sky',
  k: 'speck',
  d: 'disc',
  f: 'far',
  n: 'near',
  g: 'ground',
};

// 85x18. Stars by night, small clouds by day; the disc is the moon or the sun.
// Add more drawings here; Bosses rotate through them.
export const SCENERIES: string[][] = [
  [
    'sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
    'sssssssssssssssssssssssssssksssssssssssssssssssssssssssksssssssssssssssssssssssssssss',
    'sssssksssssdddsssssssssssssssssssssssssssksssssssssssssssssssssssssssssssssssskssssss',
    'ssssssssssdddddssssssssssssssssssssssssssssssssssssssssssssssssksssssssssssssssssssss',
    'ssssssssssdddddssskssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
    'ssssssssssdddddssssssssssssssssssksssssssssssssssssssssssssssssssssssskssssssssssssss',
    'sssssssssssdddsssssssssssssssssssssssssssssssssssksssssssssssssssssssssssssssssssskss',
    'ssssssssssssssssssssssskssssssssssssssssssssssssssssssssssssksssssssssssfffffffffssss',
    'sffffffffffsssssssssfffffffffssssssssssssssssssssssssssssssssssssssssfffffffffffffsss',
    'fffffffffffffffffffffffffffffffssssssssssssssssssssssffffffffssssfffffffffffffffffffs',
    'fffffffffffffffffffffffffffffffffsssssssssssssssssfffffffffffffffffffffffffffffffffff',
    'fnnnnfffffffffffffffffffffffffffffsssssnnnnsssssfffffffffffffffffffffffffffffnnnnffff',
    'nnnnnnnnffffffffffffffffnnnnnnffffnnnnnnnnnnnnffffffffffffffffnnnnnnffffnnnnnnnnnnnff',
    'nnnnnnnnnnfffffffffffnnnnnnnnnnnnnnnnnnnnnnnnnnffffffffffffnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnfffffffnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnffffffffnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
    'ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
  ],
];

// The world's color; each has a palette for every time of day.
export const SCENERY_PALETTES: Record<TimeOfDay, SceneryPalette>[] = [
  {
    night: {
      sky: '#24405a',
      speck: '#cfeef0',
      disc: '#f6ecd4',
      far: '#2f5d73',
      near: '#3f8a86',
      ground: '#58c7b5',
    },
    day: {
      sky: '#8fd0e6',
      speck: '#ffffff',
      disc: '#ffc94a',
      far: '#8fcdb8',
      near: '#58c7b5',
      ground: '#3a9c8b',
    },
    afternoon: {
      sky: '#e89ab0',
      speck: '#ffd6e0',
      disc: '#ff7a59',
      far: '#7a6a9a',
      near: '#4f8a8a',
      ground: '#3a9c8b',
    },
  },
  {
    night: {
      sky: '#4a2a4f',
      speck: '#ffe3ee',
      disc: '#f6ecd4',
      far: '#7a3f6b',
      near: '#c05f86',
      ground: '#f7a8b8',
    },
    day: {
      sky: '#f7b6cc',
      speck: '#ffffff',
      disc: '#ffc94a',
      far: '#f29fba',
      near: '#dd7799',
      ground: '#c05f86',
    },
    afternoon: {
      sky: '#f2a07a',
      speck: '#ffe3d0',
      disc: '#ffc94a',
      far: '#b8607a',
      near: '#a04870',
      ground: '#7a3f6b',
    },
  },
  {
    night: {
      sky: '#3d3350',
      speck: '#fff1b8',
      disc: '#f6ecd4',
      far: '#6b5a4a',
      near: '#b58a3c',
      ground: '#ffc94a',
    },
    day: {
      sky: '#ffd98a',
      speck: '#ffffff',
      disc: '#ff7a59',
      far: '#f0c25e',
      near: '#dba23a',
      ground: '#b58a3c',
    },
    afternoon: {
      sky: '#f4a3a8',
      speck: '#ffe6c8',
      disc: '#ff7a59',
      far: '#c98a5a',
      near: '#b56a3c',
      ground: '#8a5a2c',
    },
  },
];

/** The drawing and colors of `world`'s Boss: both rotate, so a world always looks the same. */
export function bossScenery(world: number, time: TimeOfDay) {
  return {
    rows: SCENERIES[(world - 1) % SCENERIES.length],
    palette: SCENERY_PALETTES[(world - 1) % SCENERY_PALETTES.length][time],
  };
}
