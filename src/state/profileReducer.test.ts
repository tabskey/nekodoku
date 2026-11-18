import { describe, expect, it } from 'vitest';
import { levelConfig } from '../game/progression';
import { BOSS_REWARD, LEVEL_REWARD } from '../game/rewards';
import { defaultSave } from '../storage/save';
import { profileReducer, type ProfileAction } from './profileReducer';

const cleared = (level: number, score = 400, seconds = 60): ProfileAction => ({
  type: 'levelCleared',
  level,
  score,
  seconds,
});

function play(...actions: ProfileAction[]) {
  return actions.reduce(profileReducer, defaultSave());
}

describe('profileReducer levelCleared', () => {
  it('counts the first clear and pays the full reward', () => {
    const profile = play(cleared(1));
    expect(profile.levelsCleared).toBe(1);
    expect(profile.coins).toBe(LEVEL_REWARD.coins);
    expect(profile.fish).toBe(LEVEL_REWARD.fish);
  });

  it('pays the Boss reward on a Boss', () => {
    const bossLevel = 5;
    expect(levelConfig(bossLevel).isBoss).toBe(true);
    const profile = play(
      cleared(1),
      cleared(2),
      cleared(3),
      cleared(4),
      cleared(bossLevel),
    );
    expect(profile.fish).toBe(4 * LEVEL_REWARD.fish + BOSS_REWARD.fish);
  });

  it('pays coins only on a replay that beats the best score, and keeps progress', () => {
    const better = play(cleared(1), cleared(2), cleared(1, 450));
    expect(better.levelsCleared).toBe(2);
    expect(better.coins).toBe(3 * LEVEL_REWARD.coins);
    expect(better.fish).toBe(2 * LEVEL_REWARD.fish);
    expect(better.bestScores[1]).toBe(450);

    const worse = play(cleared(1), cleared(1, 300));
    expect(worse.coins).toBe(LEVEL_REWARD.coins);
    expect(worse.bestScores[1]).toBe(400);
  });

  it('keeps the best time per board size', () => {
    const size = levelConfig(1).size;
    expect(levelConfig(2).size).toBe(size);
    expect(play(cleared(1, 400, 40), cleared(2, 400, 25)).bestTimes[size]).toBe(
      25,
    );
    expect(play(cleared(1, 400, 40), cleared(2, 400, 90)).bestTimes[size]).toBe(
      40,
    );
  });
});

describe('profileReducer coins and options', () => {
  it('spends coins it has, and refuses to go below zero', () => {
    const rich = play(cleared(1));
    expect(profileReducer(rich, { type: 'spendCoins', amount: 30 }).coins).toBe(
      LEVEL_REWARD.coins - 30,
    );
    expect(profileReducer(rich, { type: 'spendCoins', amount: 999 })).toBe(
      rich,
    );
  });

  it('changes one option and leaves the others', () => {
    const profile = play({ type: 'setOption', key: 'language', value: 'en' });
    expect(profile.options).toEqual({
      ...defaultSave().options,
      language: 'en',
    });
  });
});
