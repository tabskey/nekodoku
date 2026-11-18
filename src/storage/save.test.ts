import { describe, expect, it } from 'vitest';
import { migrate } from './migrations';
import {
  defaultSave,
  isSaveData,
  MAX_LEVELS_CLEARED,
  loadSave,
  SAVE_KEY,
  writeSave,
  type KeyValueStore,
} from './save';

function memoryStore(
  initial?: string,
): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(SAVE_KEY, initial);
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

const failingStore: KeyValueStore = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('quota');
  },
};

describe('save and load', () => {
  it('starts a fresh profile when nothing is saved', () => {
    expect(loadSave(memoryStore())).toEqual(defaultSave());
  });

  it('round-trips a profile through storage', () => {
    const store = memoryStore();
    const save = {
      ...defaultSave(),
      levelsCleared: 7,
      coins: 120,
      fish: 9,
      bestTimes: { 5: 31 },
      bestScores: { 3: 480 },
      options: {
        autoMark: true,
        theme: 'light' as const,
        language: 'en' as const,
        sound: false,
        music: false,
      },
    };
    expect(writeSave(save, store)).toBe(true);
    expect(store.data.has(SAVE_KEY)).toBe(true);
    expect(loadSave(store)).toEqual(save);
  });

  it('falls back to a fresh profile on unreadable or invalid data', () => {
    expect(loadSave(memoryStore('not json'))).toEqual(defaultSave());
    expect(loadSave(memoryStore('{"coins": -5}'))).toEqual(defaultSave());
    expect(
      loadSave(
        memoryStore(JSON.stringify({ ...defaultSave(), coins: 'lots' })),
      ),
    ).toEqual(defaultSave());
  });

  it('keeps running without storage', () => {
    expect(loadSave(failingStore)).toEqual(defaultSave());
    expect(writeSave(defaultSave(), failingStore)).toBe(false);
    expect(loadSave(undefined)).toEqual(defaultSave());
    expect(writeSave(defaultSave(), undefined)).toBe(false);
  });
});

describe('isSaveData', () => {
  it('accepts a default profile and rejects broken ones', () => {
    expect(isSaveData(defaultSave())).toBe(true);
    expect(isSaveData(null)).toBe(false);
    expect(isSaveData({ ...defaultSave(), schemaVersion: 99 })).toBe(false);
    expect(isSaveData({ ...defaultSave(), levelsCleared: 1.5 })).toBe(false);
    expect(
      isSaveData({ ...defaultSave(), levelsCleared: MAX_LEVELS_CLEARED }),
    ).toBe(true);
    expect(
      isSaveData({ ...defaultSave(), levelsCleared: MAX_LEVELS_CLEARED + 1 }),
    ).toBe(false);
    expect(isSaveData({ ...defaultSave(), bestScores: { 3: -1 } })).toBe(false);
    expect(
      isSaveData({
        ...defaultSave(),
        options: { ...defaultSave().options, theme: 'pink' },
      }),
    ).toBe(false);
  });
});

describe('migrate', () => {
  const steps = {
    1: (save: Record<string, unknown>) => ({
      ...save,
      fish: 0,
      schemaVersion: 2,
    }),
    2: (save: Record<string, unknown>) => ({
      ...save,
      renamed: save.coins,
      schemaVersion: 3,
    }),
  };

  it('runs every step from the save version to the target, in order', () => {
    expect(migrate({ schemaVersion: 1, coins: 5 }, steps, 3)).toEqual({
      schemaVersion: 3,
      coins: 5,
      fish: 0,
      renamed: 5,
    });
  });

  it('adds the music switch, on, to a version 1 save', () => {
    const { autoMark, theme, language, sound } = defaultSave().options;
    const old = {
      ...defaultSave(),
      schemaVersion: 1,
      options: { autoMark, theme, language, sound },
    };
    expect(migrate(old)).toEqual(defaultSave());
  });

  it('leaves a current save untouched', () => {
    const save = defaultSave();
    expect(migrate(save)).toEqual(save);
  });

  it('rejects saves it cannot bring up to date', () => {
    expect(migrate('text', steps, 3)).toBeUndefined();
    expect(migrate({ coins: 5 }, steps, 3)).toBeUndefined();
    expect(migrate({ schemaVersion: 4 }, steps, 3)).toBeUndefined();
    expect(migrate({ schemaVersion: 0 }, steps, 3)).toBeUndefined();
  });
});
