import { describe, expect, it } from 'vitest';
import { ROUTE_SHAPES, type WorldRoute } from '../../../game/biomes';
import { DOT_PX, pathLayout } from './pathLayout';

describe('pathLayout', () => {
  it.each([2, 5, 7, 12, 20])('lays out %i tiles on whole pixels', (count) => {
    const { width, height, points, tilePoints } = pathLayout(count);
    expect(tilePoints).toHaveLength(count);
    expect(tilePoints[0]).toBe(0);
    expect(tilePoints.at(-1)).toBe(points.length - 1);
    for (const { x, y } of points) {
      expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true);
      expect(x > 0 && x < width && y > 0 && y < height).toBe(true);
    }
  });

  it('keeps every dot one step from the next, going straight', () => {
    const { points } = pathLayout(20);
    for (let i = 1; i < points.length; i++) {
      const dx = Math.abs(points[i].x - points[i - 1].x);
      const dy = Math.abs(points[i].y - points[i - 1].y);
      expect(dx + dy).toBe(DOT_PX);
      expect(dx === 0 || dy === 0).toBe(true);
    }
  });

  it('starts at the bottom and snakes back on the second row', () => {
    const { points, tilePoints } = pathLayout(8);
    const tile = (i: number) => points[tilePoints[i]];
    expect(tile(4).y).toBeLessThan(tile(0).y);
    expect(tile(4).x).toBe(tile(3).x);
    expect(tile(5).x).toBeLessThan(tile(4).x);
  });

  it('puts the Boss alone on the top row, centered', () => {
    for (const count of [5, 7, 12, 20]) {
      const { width, points, tilePoints } = pathLayout(count);
      const boss = points[tilePoints[count - 1]];
      expect(boss.x).toBe(width / 2);
      for (const i of tilePoints.slice(0, -1)) {
        expect(points[i].y).toBeGreaterThan(boss.y);
      }
    }
  });
});

const ROUTES: WorldRoute[] = ROUTE_SHAPES.flatMap((shape) => [
  { shape, mirrored: false },
  { shape, mirrored: true },
]);

describe.each(ROUTES)(
  'pathLayout of the $shape route (mirrored: $mirrored)',
  (route) => {
    const counts = [2, 5, 7, 12, 20];

    it.each(counts)(
      'keeps %i tiles on whole pixels, inside the map',
      (count) => {
        const { width, height, points, tilePoints } = pathLayout(count, route);
        expect(tilePoints).toHaveLength(count);
        expect(tilePoints.at(-1)).toBe(points.length - 1);
        for (const { x, y } of points) {
          expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true);
          expect(x > 0 && x < width && y > 0 && y < height).toBe(true);
        }
      },
    );

    it.each(counts)(
      'steps straight, one dot at a time, with %i tiles',
      (count) => {
        const { points } = pathLayout(count, route);
        for (let i = 1; i < points.length; i++) {
          const dx = Math.abs(points[i].x - points[i - 1].x);
          const dy = Math.abs(points[i].y - points[i - 1].y);
          expect(dx + dy).toBe(DOT_PX);
          expect(dx === 0 || dy === 0).toBe(true);
        }
      },
    );

    it.each(counts)(
      'puts the Boss alone on the top row, centered, with %i tiles',
      (count) => {
        const { width, points, tilePoints } = pathLayout(count, route);
        const boss = points[tilePoints[count - 1]];
        expect(boss.x).toBe(width / 2);
        for (const i of tilePoints.slice(0, -1)) {
          expect(points[i].y).toBeGreaterThan(boss.y);
        }
      },
    );

    it.each(counts)('never lets two of %i tiles touch', (count) => {
      const { points, tilePoints } = pathLayout(count, route);
      const centers = tilePoints.map((i) => points[i]);
      for (let a = 0; a < centers.length; a++) {
        for (let b = a + 1; b < centers.length; b++) {
          const dx = Math.abs(centers[a].x - centers[b].x);
          const dy = Math.abs(centers[a].y - centers[b].y);
          expect(dx >= 60 || dy >= 60).toBe(true);
        }
      }
    });

    it.each(counts)(
      'never runs through a tile that is not its own, with %i tiles',
      (count) => {
        const { points, tilePoints } = pathLayout(count, route);
        tilePoints.forEach((center, k) => {
          // The dots between the neighbors of tile k belong to tile k's own path.
          const from = tilePoints[k - 1] ?? center;
          const to = tilePoints[k + 1] ?? center;
          points.forEach((dot, d) => {
            if (d >= from && d <= to) return;
            const near =
              Math.abs(dot.x - points[center].x) < 28 &&
              Math.abs(dot.y - points[center].y) < 28;
            expect(near).toBe(false);
          });
        });
      },
    );
  },
);
