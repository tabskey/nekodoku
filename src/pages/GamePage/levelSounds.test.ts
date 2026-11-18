import { describe, expect, it } from 'vitest';
import { generate } from '../../game/generator';
import {
  createLevel,
  levelReducer,
  type LevelAction,
} from '../../state/levelReducer';
import { levelSound } from './levelSounds';

const puzzle = generate(4, 1);
const [rightCell] = puzzle.solution;
const wrongCell = [...puzzle.zones.keys()].find(
  (cell) => !puzzle.solution.includes(cell),
)!;

// The sound made by the last action, after playing the ones before it.
function soundOf(...actions: LevelAction[]) {
  const before = actions.slice(0, -1).reduce(levelReducer, createLevel(puzzle));
  return levelSound(before, levelReducer(before, actions.at(-1)!));
}

const tap = (index: number): LevelAction => ({ type: 'tapCell', index });
const place = (index: number): LevelAction => ({ type: 'placeCat', index });

describe('levelSound', () => {
  it('clicks on an x and blips down when it goes', () => {
    expect(soundOf(tap(wrongCell))).toBe('tap');
    expect(soundOf(tap(wrongCell), tap(wrongCell))).toBe('remove');
  });

  it('blips up on a cat and buzzes on a mistake', () => {
    expect(soundOf(place(rightCell))).toBe('placeCat');
    expect(soundOf(place(wrongCell))).toBe('mistake');
  });

  it('plays the jingles when the level is won or lost', () => {
    expect(soundOf(...puzzle.solution.map(place))).toBe('won');
    const wrong = [...puzzle.zones.keys()]
      .filter((cell) => !puzzle.solution.includes(cell))
      .slice(0, 3);
    expect(soundOf(...wrong.map(place))).toBe('lost');
  });

  it('stays quiet on a tick', () => {
    expect(soundOf({ type: 'tick' })).toBeUndefined();
  });
});
