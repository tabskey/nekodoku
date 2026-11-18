import { describe, expect, it } from 'vitest';
import { clearZones, decorations } from './decorations';
import { pathLayout } from './pathLayout';

describe('decorations', () => {
  it.each([5, 12, 20])(
    'never touches the path or a tile on a %i-tile map',
    (count) => {
      const layout = pathLayout(count);
      const zones = clearZones(layout);
      for (let world = 1; world <= 30; world++) {
        const placed = decorations(layout, world);
        expect(placed.length).toBeGreaterThan(0);
        for (const { kind, x, y } of placed) {
          const w = kind === 'bush' ? 24 : 6;
          const h = kind === 'bush' ? 18 : 6;
          expect(x >= 0 && y >= 0).toBe(true);
          expect(x + w <= layout.width && y + h <= layout.height).toBe(true);
          for (const z of zones) {
            const touches =
              x < z.x + z.w && z.x < x + w && y < z.y + z.h && z.y < y + h;
            expect(touches).toBe(false);
          }
        }
      }
    },
  );

  it('places the same decorations for the same world', () => {
    const layout = pathLayout(12);
    expect(decorations(layout, 7)).toEqual(decorations(layout, 7));
  });
});
