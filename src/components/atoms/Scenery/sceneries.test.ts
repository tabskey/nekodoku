import { describe, expect, it } from 'vitest';
import { ROLE_BY_CHAR, SCENERIES, bossScenery } from './sceneries';

describe('sceneries', () => {
  it('draws every scenery 85x18 with known roles only', () => {
    for (const rows of SCENERIES) {
      expect(rows).toHaveLength(18);
      for (const row of rows) {
        expect(row).toHaveLength(85);
        for (const char of row) expect(ROLE_BY_CHAR[char]).toBeDefined();
      }
    }
  });

  it('gives consecutive worlds different colors', () => {
    for (let world = 1; world < 30; world++) {
      expect(bossScenery(world, 'night').palette).not.toEqual(
        bossScenery(world + 1, 'night').palette,
      );
    }
  });
});
