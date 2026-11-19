import { describe, expect, it } from 'vitest';
import {
  applyStreak,
  BOSS_REWARD,
  clearResult,
  clearReward,
  LEVEL_REWARD,
  levelReward,
  MAX_STREAK_PERCENT,
  streakPercent,
} from './rewards';

describe('levelReward', () => {
  it('pays coins and fish on a first clear, more on a Boss', () => {
    expect(levelReward(false, true, 300, undefined)).toEqual(LEVEL_REWARD);
    expect(levelReward(true, true, 300, undefined)).toEqual(BOSS_REWARD);
  });

  it('pays coins only on a replay that beats the best score', () => {
    expect(levelReward(false, false, 450, 400)).toEqual({
      coins: LEVEL_REWARD.coins,
      fish: 0,
    });
  });

  it('pays nothing on a replay that does not beat the best score', () => {
    expect(levelReward(false, false, 400, 400)).toEqual({ coins: 0, fish: 0 });
    expect(levelReward(true, false, 100, 400)).toEqual({ coins: 0, fish: 0 });
  });
});

describe('clearReward', () => {
  it('treats a level past the progress as a first clear, and knows Bosses', () => {
    expect(clearReward(1, 300, 0, undefined)).toEqual(LEVEL_REWARD);
    expect(clearReward(5, 300, 4, undefined)).toEqual(BOSS_REWARD);
  });

  it('treats a cleared level as a replay', () => {
    expect(clearReward(1, 300, 3, 400)).toEqual({ coins: 0, fish: 0 });
    expect(clearReward(1, 450, 3, 400)).toEqual({
      coins: LEVEL_REWARD.coins,
      fish: 0,
    });
  });
});

describe('streakPercent', () => {
  it('steps up at 2, 4, 8 and 10 wins, to 20% at most', () => {
    const at = [0, 1, 2, 3, 4, 7, 8, 9, 10, 50].map(streakPercent);
    expect(at).toEqual([100, 100, 105, 105, 110, 110, 115, 115, 120, 120]);
    expect(MAX_STREAK_PERCENT).toBe(120);
  });
});

describe('applyStreak', () => {
  it('rounds each amount to the nearest', () => {
    expect(applyStreak(LEVEL_REWARD, 105)).toEqual({ coins: 42, fish: 2 });
    expect(applyStreak(BOSS_REWARD, 110)).toEqual({ coins: 110, fish: 6 });
    expect(applyStreak({ coins: 0, fish: 0 }, 120)).toEqual({
      coins: 0,
      fish: 0,
    });
  });

  it('never pays more than 20% over the base, whatever the streak', () => {
    for (const base of [LEVEL_REWARD, BOSS_REWARD]) {
      for (let streak = 0; streak <= 30; streak++) {
        const paid = applyStreak(base, streakPercent(streak));
        expect(paid.coins).toBeLessThanOrEqual(base.coins * 1.2);
        expect(paid.fish).toBeLessThanOrEqual(base.fish * 1.2);
        expect(paid.coins).toBeGreaterThanOrEqual(base.coins);
        expect(paid.fish).toBeGreaterThanOrEqual(base.fish);
      }
    }
  });
});

describe('clearResult', () => {
  it('adds a first clear to the streak and pays the new bonus', () => {
    // Level 3 is the third in a row (streak 2 before it): 3 wins, +5%.
    expect(clearResult(3, 300, 2, undefined, 2)).toEqual({
      reward: { coins: 42, fish: 2 },
      bonus: { coins: 2, fish: 0 },
      streak: 3,
      percent: 105,
    });
  });

  it('adds a replay to the streak too, and its coins get the new bonus', () => {
    // The 5th win in a row (a replay that beats the best score): +10%.
    expect(clearResult(1, 450, 3, 400, 4)).toEqual({
      reward: { coins: 44, fish: 0 },
      bonus: { coins: 4, fish: 0 },
      streak: 5,
      percent: 110,
    });
  });

  it('adds a replay that pays nothing, which still counts as a win', () => {
    expect(clearResult(1, 100, 3, 400, 1)).toMatchObject({
      reward: { coins: 0, fish: 0 },
      streak: 2,
    });
  });
});
