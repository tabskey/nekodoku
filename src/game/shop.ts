// What the shop sells. See "Shop" in docs/GAME_RULES.md. World cats are
// never listed here: they are earned by exploring.
import { createRng, shuffle } from './rng';

export interface ShopCat {
  /** Cat id, the key of its palette. */
  id: string;
  /** Price in fish (proposed). */
  price: number;
}

/** The shop pool: shop-exclusive cats only. */
export const SHOP_CATS: ShopCat[] = [
  // Test entry to try the shop; the owner replaces it with hand-drawn cats.
  { id: 'calico', price: 6 },
];

// Proposed, see "Shop" in docs/GAME_RULES.md.
export const ROTATION_SIZE = 4;

// FNV-1a: turns the day string into a 32-bit seed.
function hashDay(day: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < day.length; i++) {
    hash ^= day.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * The shop cats on sale on `day` (a date such as "2026-11-18"): up to 4
 * unowned shop cats, picked from the date alone so the same day always
 * gives the same draw. When fewer than 4 are unowned, all of them.
 */
export function dailyRotation(
  day: string,
  owned: readonly string[],
): ShopCat[] {
  const unowned = SHOP_CATS.filter((cat) => !owned.includes(cat.id));
  return shuffle(unowned, createRng(hashDay(day))).slice(0, ROTATION_SIZE);
}

/** The shop entry for a cat id, if it is a shop cat. */
export function shopCat(id: string): ShopCat | undefined {
  return SHOP_CATS.find((cat) => cat.id === id);
}
