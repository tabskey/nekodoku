// What clearing a level pays. See "Currencies" and "Replaying" in
// docs/GAME_RULES.md.
import { levelConfig } from './progression';

export interface Reward {
  coins: number;
  fish: number;
}

// Proposed amounts; keep them here so they are cheap to change.
export const LEVEL_REWARD: Reward = { coins: 40, fish: 2 };
export const BOSS_REWARD: Reward = { coins: 100, fish: 5 };
const NO_REWARD: Reward = { coins: 0, fish: 0 };

/**
 * The reward for clearing a level. The first clear pays coins and fish.
 * A replay pays coins only, and only when it beats the best score.
 */
export function levelReward(
  isBoss: boolean,
  firstClear: boolean,
  score: number,
  bestScore: number | undefined,
): Reward {
  const full = isBoss ? BOSS_REWARD : LEVEL_REWARD;
  if (firstClear) return full;
  if (bestScore === undefined || score > bestScore)
    return { coins: full.coins, fish: 0 };
  return NO_REWARD;
}

/**
 * The reward for clearing `level` with `score`, given the player's progress
 * so far: levels cleared and the best score on that level, if any.
 */
export function clearReward(
  level: number,
  score: number,
  levelsCleared: number,
  bestScore: number | undefined,
): Reward {
  return levelReward(
    levelConfig(level).isBoss,
    level > levelsCleared,
    score,
    bestScore,
  );
}
