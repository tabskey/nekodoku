// Where the map's decorations sit: placed at random, seeded by the world, on
// a 6px grid, and never on the path, a tile, the cat standing on a tile or
// the ghost beside the Boss (see Biomes in docs/GAME_RULES.md).
import { createRng } from '../../../game/rng';
import type { PathLayout } from './pathLayout';

export type DecorationKind = 'speck0' | 'speck1' | 'bush' | 'firefly';

export interface Decoration {
  kind: DecorationKind;
  x: number;
  y: number;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const GRID = 6;
const SIZES: Record<DecorationKind, { w: number; h: number }> = {
  speck0: { w: 6, h: 6 },
  speck1: { w: 6, h: 6 },
  bush: { w: 24, h: 18 },
  firefly: { w: 6, h: 6 },
};
// How many of each per 10,000 px² of map, about the mockup's density.
const DENSITY: Record<DecorationKind, number> = {
  speck0: 3.4,
  speck1: 1.2,
  bush: 0.4,
  firefly: 0.5,
};
// Gives up on a decoration after this many spots that touch something.
const TRIES = 30;

function overlaps(a: Box, b: Box): boolean {
  return (
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  );
}

/** Areas kept clear: each dot, each tile with its cat and note, the Boss and its ghost. */
export function clearZones({ points, tilePoints }: PathLayout): Box[] {
  const dots = points.map((p) => ({ x: p.x - 6, y: p.y - 6, w: 12, h: 12 }));
  const tiles = tilePoints.map((index, i) => {
    const { x, y } = points[index];
    // The Boss also has its ghost on one side: keep both sides clear.
    const half = i === tilePoints.length - 1 ? 70 : 30;
    return { x: x - half, y: y - 56, w: half * 2, h: 104 };
  });
  return [...dots, ...tiles];
}

export function decorations(layout: PathLayout, seed: number): Decoration[] {
  const rng = createRng(seed);
  const zones = clearZones(layout);
  const placed: Box[] = [];
  const result: Decoration[] = [];
  const area = (layout.width * layout.height) / 10_000;

  for (const kind of Object.keys(DENSITY) as DecorationKind[]) {
    const { w, h } = SIZES[kind];
    const count = Math.round(DENSITY[kind] * area);
    for (let n = 0; n < count; n++) {
      for (let t = 0; t < TRIES; t++) {
        const box = {
          x: Math.floor((rng() * (layout.width - w)) / GRID) * GRID,
          y: Math.floor((rng() * (layout.height - h)) / GRID) * GRID,
          w,
          h,
        };
        if ([...zones, ...placed].some((zone) => overlaps(box, zone))) continue;
        placed.push(box);
        result.push({ kind, x: box.x, y: box.y });
        break;
      }
    }
  }
  return result;
}
