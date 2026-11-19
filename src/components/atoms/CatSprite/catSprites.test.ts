import { describe, expect, it } from 'vitest';
import { FULL_BODIES } from './catSprites';

describe('FULL_BODIES', () => {
  it('fits every body and frame on the same 16x18 canvas', () => {
    for (const frames of Object.values(FULL_BODIES)) {
      for (const rows of [frames.open, frames.closed, frames.happy]) {
        expect(rows).toHaveLength(frames.height);
        for (const row of rows) expect(row).toHaveLength(frames.width);
      }
    }
  });

  it('sinks the chubby head one row lower than the regular one', () => {
    const firstRow = (rows: string[]) =>
      rows.findIndex((row) => row.includes('o'));
    expect(firstRow(FULL_BODIES.chubby.open)).toBe(
      firstRow(FULL_BODIES.regular.open) + 1,
    );
  });
});
