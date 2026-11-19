import { describe, expect, it } from 'vitest';
import { clearZones, decorations } from './decorations';
import { ROUTE_SHAPES, type WorldRoute } from '../../../game/biomes';
import { pathLayout } from './pathLayout';

const ROUTES: WorldRoute[] = ROUTE_SHAPES.flatMap((shape) => [
  { shape, mirrored: false },
  { shape, mirrored: true },
]);

describe('decorations', () => {
  it.each([5, 12, 20])(
    'never touches the path or a tile on a %i-tile map, in every route',
    (count) => {
      for (const route of ROUTES) {
        const layout = pathLayout(count, route);
        const zones = clearZones(layout);
        for (let world = 1; world <= 30; world++) {
          const placed = decorations(layout, world);
          expect(placed.length).toBeGreaterThan(0);
          const bad = placed.filter(({ kind, x, y }) => {
            const w = kind === 'bush' ? 24 : 6;
            const h = kind === 'bush' ? 18 : 6;
            const outside =
              x < 0 || y < 0 || x + w > layout.width || y + h > layout.height;
            const touches = zones.some(
              (z) =>
                x < z.x + z.w && z.x < x + w && y < z.y + z.h && z.y < y + h,
            );
            return outside || touches;
          });
          expect(bad).toEqual([]);
        }
      }
    },
  );

  it('places the same decorations for the same world', () => {
    const layout = pathLayout(12);
    expect(decorations(layout, 7)).toEqual(decorations(layout, 7));
  });
});
