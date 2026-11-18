import { describe, expect, it } from 'vitest';
import {
  BASE_SCORE,
  MISTAKE_PENALTY,
  parTime,
  scoreAfterMistake,
  timeBonus,
} from './scoring';

describe('scoreAfterMistake', () => {
  it('subtracts the penalty', () => {
    expect(scoreAfterMistake(BASE_SCORE)).toBe(BASE_SCORE - MISTAKE_PENALTY);
  });

  it('never goes below zero', () => {
    expect(scoreAfterMistake(MISTAKE_PENALTY - 1)).toBe(0);
    expect(scoreAfterMistake(0)).toBe(0);
  });
});

describe('time bonus', () => {
  it('sets par at 2 seconds per cell', () => {
    expect(parTime(5)).toBe(50);
    expect(parTime(12)).toBe(288);
  });

  it('gives 2 points per second under par and nothing past it', () => {
    expect(timeBonus(5, 0)).toBe(100);
    expect(timeBonus(5, 30)).toBe(40);
    expect(timeBonus(5, 50)).toBe(0);
    expect(timeBonus(5, 999)).toBe(0);
  });
});
