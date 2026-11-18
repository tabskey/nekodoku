// Lives and score inside a level. See "Lives, score and time" in
// docs/GAME_RULES.md.

export const LIVES_PER_LEVEL = 3;
export const BASE_SCORE = 500;
export const MISTAKE_PENALTY = 50;

/** Score after one more mistake. Never below zero. */
export function scoreAfterMistake(score: number): number {
  return Math.max(0, score - MISTAKE_PENALTY);
}

// Time bonus, accepted by the owner as a starting point; tune after playtesting.
export const PAR_SECONDS_PER_CELL = 2;
export const BONUS_PER_SECOND = 2;

/** Seconds under which a board earns a time bonus: 50 s on 5x5, 288 s on 12x12. */
export function parTime(size: number): number {
  return PAR_SECONDS_PER_CELL * size * size;
}

/** Points for finishing under par time; nothing past it. */
export function timeBonus(size: number, seconds: number): number {
  return BONUS_PER_SECOND * Math.max(0, parTime(size) - seconds);
}
