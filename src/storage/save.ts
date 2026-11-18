// The saved profile: one key in localStorage, holding SaveData as JSON.
// This folder is the only place that touches localStorage. See
// "Persistence" in docs/ARCHITECTURE.md.
import { migrate, SCHEMA_VERSION } from './migrations';

export interface Options {
  autoMark: boolean;
  theme: 'system' | 'light' | 'dark';
  language: 'system' | 'pt' | 'en';
  sound: boolean;
}

export interface SaveData {
  schemaVersion: number;
  levelsCleared: number;
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

export const DEFAULT_OPTIONS: Options = {
  autoMark: false,
  theme: 'system',
  language: 'system',
  sound: true,
};

export function defaultSave(): SaveData {
  return {
    schemaVersion: SCHEMA_VERSION,
    levelsCleared: 0,
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
    ['system', 'light', 'dark'].includes(options.theme as string) &&
    ['system', 'pt', 'en'].includes(options.language as string)
  );
}

/**
 * Reads the profile. Migrates an older save, and falls back to a fresh
 * profile when there is none, it is unreadable, or storage is unavailable.
 */
export function loadSave(store = browserStore()): SaveData {
  try {
    const raw = store?.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const save = migrate(JSON.parse(raw));
    return isSaveData(save) ? save : defaultSave();
  } catch {
    return defaultSave();
  }
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
