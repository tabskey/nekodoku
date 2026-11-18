import { describe, expect, it } from 'vitest';
import { decodeBackup, encodeBackup } from './backup';
import { defaultSave, type SaveData } from './save';

const profile: SaveData = {
  ...defaultSave(),
  levelsCleared: 12,
  coins: 340,
  fish: 17,
  ownedCats: ['white', 'orange', 'calico'],
  selectedCat: 'calico',
  bestTimes: { 5: 21, 9: 140 },
  bestScores: { 1: 560, 5: 610 },
  options: { autoMark: true, theme: 'light', language: 'en', sound: false },
};

describe('backup code', () => {
  it('restores exactly the same profile (round trip)', () => {
    expect(decodeBackup(encodeBackup(profile))).toEqual({
      ok: true,
      save: profile,
    });
  });

  it('uses only characters that survive copy and paste', () => {
    expect(encodeBackup(profile)).toMatch(/^[A-Za-z0-9_-]+\.[0-9a-f]{8}$/);
  });

  it('ignores spaces and line breaks added while copying', () => {
    const code = encodeBackup(profile);
    const spaced = `  ${code.slice(0, 20)}\n${code.slice(20, 40)} ${code.slice(40)}\n`;
    expect(decodeBackup(spaced)).toEqual({ ok: true, save: profile });
  });

  it('catches a mistyped or truncated code with the checksum', () => {
    const code = encodeBackup(profile);
    // One character changed, as a typo would.
    const typo =
      code.slice(0, 3) + (code[3] === 'A' ? 'B' : 'A') + code.slice(4);
    expect(decodeBackup(typo)).toEqual({ ok: false, error: 'checksum' });
    expect(decodeBackup(code.slice(0, -5))).toEqual({
      ok: false,
      error: 'checksum',
    });
    expect(decodeBackup('')).toEqual({ ok: false, error: 'checksum' });
    expect(decodeBackup('hello world')).toEqual({
      ok: false,
      error: 'checksum',
    });
  });

  it('rejects a well-formed code that does not hold a valid profile', () => {
    const fake = encodeBackup({ ...profile, coins: -1 } as SaveData);
    expect(decodeBackup(fake)).toEqual({ ok: false, error: 'invalid' });
    const future = encodeBackup({ ...profile, schemaVersion: 99 });
    expect(decodeBackup(future)).toEqual({ ok: false, error: 'invalid' });
  });

  it('keeps non-ASCII text intact', () => {
    const named = { ...profile, ownedCats: ['white', 'fumaça'] };
    expect(decodeBackup(encodeBackup(named))).toEqual({
      ok: true,
      save: named,
    });
  });
});
