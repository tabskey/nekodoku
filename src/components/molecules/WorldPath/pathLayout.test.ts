import { describe, expect, it } from 'vitest';
import { DOT_PX, pathLayout } from './pathLayout';

describe('pathLayout', () => {
  it.each([1, 5, 7, 12, 20])('lays out %i tiles on whole pixels', (count) => {
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
});
