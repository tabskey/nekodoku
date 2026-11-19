// The saved profile: one key in localStorage, holding SaveData as JSON.
// This folder is the only place that touches localStorage. See
// "Persistence" in docs/ARCHITECTURE.md.
import { migrate, SCHEMA_VERSION } from './migrations';

export interface Options {
  autoMark: boolean;
  theme: 'system' | 'light' | 'dark';
  language: 'system' | 'pt' | 'en';
  sound: boolean;
  /** Background music in levels, separate from the sound effects. */
  music: boolean;
}

export interface SaveData {
  schemaVersion: number;
  levelsCleared: number;
  /** Levels cleared for the first time in a row, with no loss in between. */
  winStreak: number;
  coins: number;
  fish: number;
  ownedCats: string[];
  selectedCat: string;
  /** Board size -> best time in seconds. */
  bestTimes: Record<number, number>;
  /** Level -> best score, for replay rewards. */
  bestScores: Record<number, number>;
  options: Options;
}

export const SAVE_KEY = 'nekodoku.save';

// Far beyond anything a player reaches. Finding a level's world walks the
// worlds one by one, so a hand-edited code with a huge count would freeze the
// game on every launch.
export const MAX_LEVELS_CLEARED = 10_000;

export const DEFAULT_OPTIONS: Options = {
  autoMark: false,
  theme: 'system',
  language: 'system',
  sound: true,
  music: true,
};

export function defaultSave(): SaveData {
  return {
    schemaVersion: SCHEMA_VERSION,
    levelsCleared: 0,
    winStreak: 0,
    coins: 0,
    fish: 0,
    ownedCats: ['white'],
    selectedCat: 'white',
    bestTimes: {},
    bestScores: {},
    options: { ...DEFAULT_OPTIONS },
  };
}

/** The part of Storage this module uses, so tests can pass a fake. */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>;

// localStorage can be missing or throw (private mode, blocked site data).
function browserStore(): KeyValueStore | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

const isCount = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

const isNumberMap = (value: unknown) =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.entries(value).every(([key, n]) => isCount(Number(key)) && isCount(n));

/** True when `value` has the exact shape of a current SaveData. */
export function isSaveData(value: unknown): value is SaveData {
  if (typeof value !== 'object' || value === null) return false;
  const save = value as Record<string, unknown>;
  const options = save.options as Record<string, unknown> | null | undefined;
  return (
    save.schemaVersion === SCHEMA_VERSION &&
    isCount(save.levelsCleared) &&
    (save.levelsCleared as number) <= MAX_LEVELS_CLEARED &&
    isCount(save.winStreak) &&
    (save.winStreak as number) <= MAX_LEVELS_CLEARED &&
    isCount(save.coins) &&
    isCount(save.fish) &&
    Array.isArray(save.ownedCats) &&
    save.ownedCats.every((cat) => typeof cat === 'string') &&
    typeof save.selectedCat === 'string' &&
    isNumberMap(save.bestTimes) &&
    isNumberMap(save.bestScores) &&
    typeof options === 'object' &&
    options !== null &&
    typeof options.autoMark === 'boolean' &&
    typeof options.sound === 'boolean' &&
    typeof options.music === 'boolean' &&
    ['system', 'light', 'dark'].includes(options.theme as string) &&
    ['system', 'pt', 'en'].includes(options.language as string)
  );
}

/** Where a save that could not be read is kept, before a new profile replaces it. */
export const UNREADABLE_KEY = `${SAVE_KEY}.unreadable`;

/**
 * A SaveData from stored text: migrated and checked. Nothing when it cannot be
 * read: damaged, not a save, or from a newer version of the game.
 */
export function parseSave(raw: string): SaveData | undefined {
  try {
    const save = migrate(JSON.parse(raw));
    return isSaveData(save) ? save : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Reads the profile. Migrates an older save, and falls back to a fresh
 * profile when there is none, it cannot be read, or storage is unavailable. A
 * save that cannot be read is copied aside first, because the fresh profile
 * is about to be saved over it (an older copy of the game opening a save
 * from a newer one would otherwise wipe it).
 */
export function loadSave(store = browserStore()): SaveData {
  try {
    const raw = store?.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const save = parseSave(raw);
    if (save) return save;
    store?.setItem(UNREADABLE_KEY, raw);
  } catch {
    // Storage blocked or full: the game runs on with a fresh profile.
  }
  return defaultSave();
}

/** Writes the profile. Returns false when storage is unavailable or full. */
export function writeSave(save: SaveData, store = browserStore()): boolean {
  try {
    if (!store) return false;
    store.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}
