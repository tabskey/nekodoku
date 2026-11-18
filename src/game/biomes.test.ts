import { describe, expect, it } from 'vitest';
import { BIOMES, TIMES, worldScene } from './biomes';

describe('worldScene', () => {
  it('starts with the meadow at night', () => {
    expect(worldScene(1)).toEqual({ biome: 'meadow', time: 'night' });
  });

  it('always gives a world the same scene', () => {
    expect(worldScene(37)).toEqual(worldScene(37));
  });

  it('never repeats the scene of the world before', () => {
    for (let w = 2; w <= 200; w++) {
      expect(worldScene(w)).not.toEqual(worldScene(w - 1));
    }
  });

  it('uses every biome at every time of day', () => {
    const seen = new Set(
      Array.from({ length: 200 }, (_, i) => {
        const { biome, time } = worldScene(i + 1);
        return `${biome}-${time}`;
      }),
    );
    expect(seen.size).toBe(BIOMES.length * TIMES.length);
  });
});
