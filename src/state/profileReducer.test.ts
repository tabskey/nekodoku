import { describe, expect, it } from 'vitest';
import { levelConfig, worldCat } from '../game/progression';
import { BOSS_REWARD, LEVEL_REWARD } from '../game/rewards';
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
