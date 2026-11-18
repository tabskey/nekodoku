// What a touch on the board means, decided from plain data so it can be
// tested without a browser. The Board feeds it fingers and cells; see
// "Board input" in docs/ARCHITECTURE.md.
import type { CellMark, StrokeMode } from '../../../game/types';

// Proposed timings, see "Board input" in docs/ARCHITECTURE.md.
export const DOUBLE_TAP_MS = 300;
export const HOLD_MS = 450;

/** The last single tap, so a second one on the same cell can place a cat. */
export interface LastTap {
  index: number;
  time: number;
}

export const NO_TAP: LastTap = { index: -1, time: 0 };

/** A finger's touch so far: where it started and the cells it crossed. */
export interface TouchSoFar {
  start: number;
  mode: StrokeMode;
  cells: number[];
  /** The hold already placed a cat. */
  held: boolean;
}

export type Release =
  /** The hold already acted; the release does nothing more. */
  | { kind: 'none' }
  | { kind: 'stroke'; mode: StrokeMode; cells: number[] }
  /** A tap, which also places a cat when it is the second in a row. */
  | { kind: 'tap'; index: number; double: boolean };

/** A stroke from an x erases x; from anything else, it marks. */
export function strokeMode(startMark: CellMark): StrokeMode {
  return startMark === 'marked' ? 'erase' : 'mark';
}

/** What lifting the finger means, and the last tap to remember after it. */
export function release(
  touch: TouchSoFar,
  last: LastTap,
  now: number,
): { release: Release; last: LastTap } {
  if (touch.held) return { release: { kind: 'none' }, last };
  if (touch.cells.length > 1) {
    return {
      release: { kind: 'stroke', mode: touch.mode, cells: touch.cells },
      last,
    };
  }
  const double = last.index === touch.start && now - last.time < DOUBLE_TAP_MS;
  return {
    release: { kind: 'tap', index: touch.start, double },
    // A double tap is used up; a third tap starts a new pair.
    last: double ? NO_TAP : { index: touch.start, time: now },
  };
}
