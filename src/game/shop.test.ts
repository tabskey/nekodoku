import { describe, expect, it } from 'vitest';
import { dailyRotation, ROTATION_SIZE, SHOP_CATS, shopCat } from './shop';

describe('dailyRotation', () => {
  it('offers at most 4 shop cats, all from the shop pool', () => {
    const rotation = dailyRotation('2026-11-18', []);
    expect(rotation.length).toBe(Math.min(ROTATION_SIZE, SHOP_CATS.length));
    for (const cat of rotation) expect(SHOP_CATS).toContainEqual(cat);
  });

  it('gives the same draw for the same day', () => {
    expect(dailyRotation('2026-11-18', [])).toEqual(
      dailyRotation('2026-11-18', []),
    );
  });

  it('never offers a cat the player owns', () => {
    const owned = SHOP_CATS.map((cat) => cat.id);
    expect(dailyRotation('2026-11-18', owned)).toEqual([]);
  });

  it('never offers world cats', () => {
    const ids = dailyRotation('2026-11-18', []).map((cat) => cat.id);
    for (const worldCat of ['white', 'orange', 'gray', 'black']) {
      expect(ids).not.toContain(worldCat);
    }
  });
});

describe('shopCat', () => {
  it('finds shop cats only', () => {
    expect(shopCat('calico')?.price).toBeGreaterThan(0);
    expect(shopCat('black')).toBeUndefined();
  });
});
