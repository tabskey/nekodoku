import { describe, expect, it } from 'vitest';
import { formatTime } from './formatTime';

describe('formatTime', () => {
  it('pads minutes and seconds to two digits', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(48)).toBe('00:48');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(600)).toBe('10:00');
  });

  it('keeps counting minutes past an hour', () => {
    expect(formatTime(3600 + 59)).toBe('60:59');
    expect(formatTime(6000)).toBe('100:00');
  });
});
