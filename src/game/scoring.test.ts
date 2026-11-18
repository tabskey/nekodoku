import { describe, expect, it } from 'vitest';
import { BASE_SCORE, MISTAKE_PENALTY, scoreAfterMistake } from './scoring';

describe('scoreAfterMistake', () => {
  it('subtracts the penalty', () => {
    expect(scoreAfterMistake(BASE_SCORE)).toBe(BASE_SCORE - MISTAKE_PENALTY);
  });

  it('never goes below zero', () => {
    expect(scoreAfterMistake(MISTAKE_PENALTY - 1)).toBe(0);
    expect(scoreAfterMistake(0)).toBe(0);
  });
});
