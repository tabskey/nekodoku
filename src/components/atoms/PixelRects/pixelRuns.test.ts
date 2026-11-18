import { describe, expect, it } from 'vitest';
import { toRuns } from './pixelRuns';

describe('toRuns', () => {
  it('joins equal neighbors into one run', () => {
    expect(toRuns('bbbb')).toEqual([{ x: 0, width: 4, char: 'b' }]);
  });

  it('splits where the character changes, keeping each x', () => {
    expect(toRuns('.obb.')).toEqual([
      { x: 0, width: 1, char: '.' },
      { x: 1, width: 1, char: 'o' },
      { x: 2, width: 2, char: 'b' },
      { x: 4, width: 1, char: '.' },
    ]);
  });

  it('makes a separate run after a gap of the same character', () => {
    expect(toRuns('b.b').map((run) => run.x)).toEqual([0, 1, 2]);
  });

  it('has no runs for an empty row', () => {
    expect(toRuns('')).toEqual([]);
  });
});
