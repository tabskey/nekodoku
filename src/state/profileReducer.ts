// Everything that outlives a level. Saved after every action by
// ProfileProvider. See "State" in docs/ARCHITECTURE.md.
import { levelConfig, worldCat } from '../game/progression';
import { clearResult } from '../game/rewards';
import { shopCat } from '../game/shop';
import { defaultSave, type Options, type SaveData } from '../storage/save';

export type ProfileAction =
  | { type: 'levelCleared'; level: number; score: number; seconds: number }
  /** Erases the progress and starts over; the options stay as they are. */
  | { type: 'resetProgress' }
  /** A level was lost: the win streak starts over. */
  | { type: 'levelLost' }
  | { type: 'spendCoins'; amount: number }
  | { type: 'buyCat'; id: string }
  | { type: 'selectCat'; id: string }
  /** Replaces the whole profile with one read from a backup code. */
  | { type: 'importSave'; save: SaveData }
  | {
      [K in keyof Options]: { type: 'setOption'; key: K; value: Options[K] };
    }[keyof Options];

export function profileReducer(
  profile: SaveData,
  action: ProfileAction,
): SaveData {
  switch (action.type) {
    case 'levelCleared': {
      const { level, score, seconds } = action;
      const { size, world, isBoss } = levelConfig(level);
      const best = profile.bestScores[level];
      const { reward, streak } = clearResult(
        level,
        score,
        profile.levelsCleared,
        best,
        profile.winStreak,
      );
      const bestTime = profile.bestTimes[size];
      // Beating a Boss restores the world's cat into the collection.
      const restored = isBoss ? worldCat(world) : undefined;
      const ownedCats =
        restored && !profile.ownedCats.includes(restored)
          ? [...profile.ownedCats, restored]
          : profile.ownedCats;
      return {
        ...profile,
        ownedCats,
        levelsCleared: Math.max(profile.levelsCleared, level),
        winStreak: streak,
        coins: profile.coins + reward.coins,
        fish: profile.fish + reward.fish,
        bestScores: {
          ...profile.bestScores,
          [level]: Math.max(best ?? 0, score),
        },
        bestTimes: {
          ...profile.bestTimes,
          [size]:
            bestTime === undefined ? seconds : Math.min(bestTime, seconds),
        },
      };
    }

    case 'resetProgress':
      return { ...defaultSave(), options: profile.options };

    case 'levelLost':
      return profile.winStreak === 0 ? profile : { ...profile, winStreak: 0 };

    case 'spendCoins':
      if (action.amount > profile.coins) return profile;
      return { ...profile, coins: profile.coins - action.amount };

    case 'buyCat': {
      // Whether the cat is on today's rotation is checked by the shop screen,
      // which knows the date; this guards the rest.
      const cat = shopCat(action.id);
      if (
        !cat ||
        profile.ownedCats.includes(cat.id) ||
        profile.fish < cat.price
      ) {
        return profile;
      }
      return {
        ...profile,
        fish: profile.fish - cat.price,
        ownedCats: [...profile.ownedCats, cat.id],
      };
    }

    case 'selectCat':
      if (!profile.ownedCats.includes(action.id)) return profile;
      return { ...profile, selectedCat: action.id };

    case 'importSave':
      return action.save;

    case 'setOption':
      return {
        ...profile,
        options: { ...profile.options, [action.key]: action.value },
      };
  }
}
