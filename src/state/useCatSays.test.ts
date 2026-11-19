import { describe, expect, it } from 'vitest';
import { pickOther } from './useCatSays';

describe('pickOther', () => {
  const phrases = ['a', 'b', 'c'];

  it('never picks the last phrase again, whatever the random number', () => {
    for (const random of [0, 0.34, 0.67, 0.999]) {
      expect(pickOther(phrases, 'b', () => random)).not.toBe('b');
    }
  });

  it('picks any phrase when there is no last one', () => {
    expect(pickOther(phrases, undefined, () => 0)).toBe('a');
    expect(pickOther(phrases, undefined, () => 0.999)).toBe('c');
  });

  it('repeats the only phrase there is, and says nothing without any', () => {
    expect(pickOther(['a'], 'a')).toBe('a');
    expect(pickOther([], undefined)).toBeUndefined();
  });
});
