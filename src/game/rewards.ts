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

// Win streak (proposed): winning levels in a row, new or replayed, with no loss
// in between, raises what the rewards pay. At most 20%, so it never shouts.
// Each step is the streak that reaches it and the bonus it gives, in percent;
// see Win streak in docs/GAME_RULES.md.
export const STREAK_STEPS = [
  { wins: 2, percent: 5 },
  { wins: 4, percent: 10 },
  { wins: 8, percent: 15 },
  { wins: 10, percent: 20 },
];

/** The largest reward multiplier, in percent (120 means 20% more). */
export const MAX_STREAK_PERCENT =
  100 + STREAK_STEPS[STREAK_STEPS.length - 1].percent;

/** The reward multiplier in percent after `streak` wins in a row (100 = none). */
export function streakPercent(streak: number): number {
  let percent = 100;
  for (const step of STREAK_STEPS) {
    if (streak >= step.wins) percent = 100 + step.percent;
  }
  return percent;
}

/** A reward with the streak bonus, each amount rounded to the nearest. */
export function applyStreak(reward: Reward, percent: number): Reward {
  return {
    coins: Math.round((reward.coins * percent) / 100),
    fish: Math.round((reward.fish * percent) / 100),
  };
}

export interface ClearResult {
  /** What the clear pays in all, bonus included. */
  reward: Reward;
  /** The part of `reward` that came from the win streak. */
  bonus: Reward;
  /** The win streak after this clear. */
  streak: number;
  /** The reward multiplier it applied, in percent. */
  percent: number;
}

/**
 * What clearing `level` pays and where it leaves the win streak. Every win, a
 * first clear or a replay, adds one to the streak; then the reward gets the
 * bonus of the new streak (a replay still pays coins only when it beats the
 * best score).
 */
export function clearResult(
  level: number,
  score: number,
  levelsCleared: number,
  bestScore: number | undefined,
  streak: number,
): ClearResult {
  const next = streak + 1;
  const percent = streakPercent(next);
  const base = clearReward(level, score, levelsCleared, bestScore);
  const reward = applyStreak(base, percent);
  const bonus = {
    coins: reward.coins - base.coins,
    fish: reward.fish - base.fish,
  };
  return { reward, bonus, streak: next, percent };
}
