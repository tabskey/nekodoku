import { describe, expect, it } from 'vitest';
import { CAT_POSES } from './catSprites';

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
