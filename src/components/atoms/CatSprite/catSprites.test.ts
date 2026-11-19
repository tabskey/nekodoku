import { describe, expect, it } from 'vitest';
import { catLook } from '../../../game/progression';
import {
  CAT_PALETTES,
  CAT_POSES,
  catPalette,
  COAT_COLORS,
  EYE_COLORS,
} from './catSprites';

describe('CAT_POSES', () => {
  it('fits every body and frame of a pose on the same canvas', () => {
    for (const bodies of Object.values(CAT_POSES)) {
      for (const frames of Object.values(bodies)) {
        const all = [frames.open, frames.closed, frames.happy];
        if (frames.step) all.push(frames.step);
        for (const rows of all) {
          expect(rows).toHaveLength(frames.height);
          for (const row of rows) expect(row).toHaveLength(frames.width);
        }
      }
    }
  });

  it('sinks the chubby head one row lower than the regular one', () => {
    const firstRow = (rows: string[]) =>
      rows.findIndex((row) => row.includes('o'));
    for (const pose of ['full', 'walk'] as const) {
      expect(firstRow(CAT_POSES[pose].chubby.open)).toBe(
        firstRow(CAT_POSES[pose].regular.open) + 1,
      );
    }
  });

  it('closes the side-view eye on every walking body', () => {
    for (const frames of Object.values(CAT_POSES.walk)) {
      expect(frames.closed.join()).not.toContain('eh');
      expect(frames.closed.join()).toContain('cc');
    }
  });
});

describe('catPalette', () => {
  it('gives a generated cat its coat and eye colors', () => {
    const { palette, eyes } = catLook('w4');
    expect(catPalette('w4')).toEqual({
      ...COAT_COLORS[palette as keyof typeof COAT_COLORS],
      ...EYE_COLORS[eyes!],
    });
  });

  it('keeps a named cat on its own palette', () => {
    expect(catPalette('black')).toBe(CAT_PALETTES.black);
  });
});
