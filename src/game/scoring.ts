// Lives and score inside a level. See "Lives, score and time" in
// docs/GAME_RULES.md.

export const LIVES_PER_LEVEL = 3;
export const BASE_SCORE = 500;
export const MISTAKE_PENALTY = 50;

/** Score after one more mistake. Never below zero. */
export function scoreAfterMistake(score: number): number {
  return Math.max(0, score - MISTAKE_PENALTY);
}
