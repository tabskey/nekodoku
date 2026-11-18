import { describe, expect, it } from 'vitest';
import {
  DOUBLE_TAP_MS,
  NO_TAP,
  release,
  strokeMode,
  type TouchSoFar,
} from './touch';

const tapOn = (cell: number): TouchSoFar => ({
  start: cell,
  mode: 'mark',
  cells: [cell],
  held: false,
});

describe('release', () => {
  it('is a tap when the finger never left its cell', () => {
    expect(release(tapOn(4), NO_TAP, 1000).release).toEqual({
      kind: 'tap',
      index: 4,
      double: false,
    });
  });

  it('places a cat on a second tap on the same cell in time', () => {
    const first = release(tapOn(4), NO_TAP, 1000);
    const second = release(tapOn(4), first.last, 1000 + DOUBLE_TAP_MS - 1);
    expect(second.release).toEqual({ kind: 'tap', index: 4, double: true });
    // A third tap starts over instead of placing again.
    expect(release(tapOn(4), second.last, 1100).release).toMatchObject({
      double: false,
    });
  });

  it('is a plain tap when the second one is too slow or on another cell', () => {
    const first = release(tapOn(4), NO_TAP, 1000);
    expect(
      release(tapOn(4), first.last, 1000 + DOUBLE_TAP_MS).release,
    ).toMatchObject({ double: false });
    expect(release(tapOn(5), first.last, 1100).release).toMatchObject({
      index: 5,
      double: false,
    });
  });

  it('is one stroke over every cell crossed, and keeps the last tap', () => {
    const last = { index: 2, time: 900 };
    const stroke = release(
      { start: 1, mode: 'erase', cells: [1, 2, 3], held: false },
      last,
      1000,
    );
    expect(stroke).toEqual({
      release: { kind: 'stroke', mode: 'erase', cells: [1, 2, 3] },
      last,
    });
  });

  it('does nothing after a hold, which already placed the cat', () => {
    expect(release({ ...tapOn(4), held: true }, NO_TAP, 1000).release).toEqual({
      kind: 'none',
    });
  });
});

describe('strokeMode', () => {
  it('erases from an x and marks from anything else', () => {
    expect(strokeMode('marked')).toBe('erase');
    expect(strokeMode('empty')).toBe('mark');
    expect(strokeMode('cat')).toBe('mark');
  });
});
