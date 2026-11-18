import { describe, expect, it } from 'vitest';
import { BOSS_REWARD, LEVEL_REWARD, levelReward } from './rewards';

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
