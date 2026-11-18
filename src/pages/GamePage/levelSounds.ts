// Which sound a change in the level makes. Reducers stay silent; the page
// compares the state before and after each action (see Sound in
// docs/ARCHITECTURE.md).
import type { Effect } from '../../audio/sounds';
import type { LevelState } from '../../state/levelReducer';

const count = (state: LevelState, mark: string) =>
  state.marks.filter((m) => m === mark).length;

/** The effect for going from `before` to `after`, or none (a tick, a retry). */
export function levelSound(
  before: LevelState,
  after: LevelState,
): Effect | undefined {
  if (before.status !== after.status) {
    if (after.status === 'won') return 'won';
    if (after.status === 'lost') return 'lost';
    return undefined;
  }
  if (after.lives < before.lives) return 'mistake';
  const cats = count(after, 'cat') - count(before, 'cat');
  const xs = count(after, 'marked') - count(before, 'marked');
  if (cats > 0) return 'placeCat';
  if (cats < 0 || xs < 0) return 'remove';
  if (xs > 0) return 'tap';
  return undefined;
}
