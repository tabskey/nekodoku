// What the shop sells. See "Shop" in docs/GAME_RULES.md. World cats are
// never listed here: they are earned by exploring.

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
