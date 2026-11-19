import { describe, expect, it } from 'vitest';
import { levelConfig, worldCat } from '../game/progression';
import { LEVEL_REWARD } from '../game/rewards';
import { shopCat } from '../game/shop';
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
    // Four levels at 2 fish (the streak never lifts 2 above 2), then the Boss
    // at its 4-win bonus: 5 fish become 6.
    expect(profile.fish).toBe(4 * LEVEL_REWARD.fish + 6);
  });

  it('pays coins only on a replay that beats the best score, and keeps progress', () => {
    const better = play(cleared(1), cleared(2), cleared(1, 450));
    expect(better.levelsCleared).toBe(2);
    // 40, then 42 with a 2-win streak, and the replay's 42 (it keeps the streak).
    expect(better.coins).toBe(40 + 42 + 42);
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

describe('profileReducer win streak', () => {
  const lost: ProfileAction = { type: 'levelLost' };

  it('grows with each first clear and pays the bonus from the 2nd win', () => {
    expect(play(cleared(1)).winStreak).toBe(1);
    const second = play(cleared(1), cleared(2));
    expect(second.winStreak).toBe(2);
    expect(second.coins).toBe(40 + 42);
  });

  it('starts over after a loss, and pays the plain reward again', () => {
    const profile = play(cleared(1), cleared(2), lost, cleared(3));
    expect(profile.winStreak).toBe(1);
    expect(profile.coins).toBe(40 + 42 + 40);
  });

  it('counts replays as wins, and leaving a level changes nothing', () => {
    // Level 1 won three times in a row, as replays of a cleared level.
    const profile = play(cleared(1), cleared(1, 450), cleared(1, 500));
    expect(profile.winStreak).toBe(3);
    // Only a loss starts it over: nothing else is dispatched when leaving.
    expect(play(cleared(1), cleared(1)).winStreak).toBe(2);
  });

  it('reaches the 20% ceiling at 10 wins and stays there', () => {
    const wins = Array.from({ length: 12 }, (_, i) => cleared(i + 1));
    const profile = play(...wins);
    expect(profile.winStreak).toBe(12);
    // The 10th, 11th and 12th levels pay 48 coins (40 + 20%) each.
    const before = play(...wins.slice(0, 11));
    expect(profile.coins - before.coins).toBe(48);
  });

  it('is already at none after a loss with no streak, with nothing to save', () => {
    const profile = play(lost);
    expect(profileReducer(profile, lost)).toBe(profile);
  });
});

describe('profileReducer resetProgress', () => {
  it('erases the progress and keeps the options', () => {
    const played = play(cleared(1), cleared(2), {
      type: 'setOption',
      key: 'language',
      value: 'en',
    });
    expect(played.coins).toBeGreaterThan(0);
    expect(profileReducer(played, { type: 'resetProgress' })).toEqual({
      ...defaultSave(),
      options: { ...defaultSave().options, language: 'en' },
    });
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

describe('profileReducer cats', () => {
  const price = shopCat('calico')!.price;
  const withFish = (fish: number) => ({ ...defaultSave(), fish });

  it('buys a shop cat with fish', () => {
    const profile = profileReducer(withFish(price + 1), {
      type: 'buyCat',
      id: 'calico',
    });
    expect(profile.ownedCats).toContain('calico');
    expect(profile.fish).toBe(1);
  });

  it('refuses without enough fish, twice, or for a world cat', () => {
    const poor = withFish(price - 1);
    expect(profileReducer(poor, { type: 'buyCat', id: 'calico' })).toBe(poor);
    const owned = profileReducer(withFish(price * 2), {
      type: 'buyCat',
      id: 'calico',
    });
    expect(profileReducer(owned, { type: 'buyCat', id: 'calico' })).toBe(owned);
    const rich = withFish(999);
    expect(profileReducer(rich, { type: 'buyCat', id: 'black' })).toBe(rich);
  });

  it('selects owned cats only', () => {
    const start = defaultSave();
    expect(profileReducer(start, { type: 'selectCat', id: 'calico' })).toBe(
      start,
    );
    const owned = profileReducer(withFish(price), {
      type: 'buyCat',
      id: 'calico',
    });
    expect(
      profileReducer(owned, { type: 'selectCat', id: 'calico' }).selectedCat,
    ).toBe('calico');
  });
});

describe('profileReducer restored cats', () => {
  it('adds the world cat to the collection when its Boss is beaten, once', () => {
    const beforeBoss = play(cleared(1), cleared(2), cleared(3), cleared(4));
    expect(beforeBoss.ownedCats).not.toContain(worldCat(1));
    const afterBoss = profileReducer(beforeBoss, cleared(5));
    expect(afterBoss.ownedCats).toContain(worldCat(1));
    const replayed = profileReducer(afterBoss, cleared(5, 999));
    expect(replayed.ownedCats.filter((id) => id === worldCat(1))).toHaveLength(
      1,
    );
  });
});

describe('profileReducer importSave', () => {
  it('replaces the whole profile', () => {
    const imported = { ...defaultSave(), levelsCleared: 9, coins: 77 };
    expect(
      profileReducer(play(cleared(1)), { type: 'importSave', save: imported }),
    ).toBe(imported);
  });
});
