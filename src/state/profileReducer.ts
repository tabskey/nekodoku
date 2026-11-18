// Everything that outlives a level. Saved after every action by
// ProfileProvider. See "State" in docs/ARCHITECTURE.md.
import { levelConfig } from '../game/progression';
import { levelReward } from '../game/rewards';
import type { Options, SaveData } from '../storage/save';

export type ProfileAction =
  | { type: 'levelCleared'; level: number; score: number; seconds: number }
  | { type: 'spendCoins'; amount: number }
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
      const { isBoss, size } = levelConfig(level);
      const best = profile.bestScores[level];
      const reward = levelReward(
        isBoss,
        level > profile.levelsCleared,
        score,
        best,
      );
      const bestTime = profile.bestTimes[size];
      return {
        ...profile,
        levelsCleared: Math.max(profile.levelsCleared, level),
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

    case 'spendCoins':
      if (action.amount > profile.coins) return profile;
      return { ...profile, coins: profile.coins - action.amount };

    case 'setOption':
      return {
        ...profile,
        options: { ...profile.options, [action.key]: action.value },
      };
  }
}
