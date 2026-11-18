import { describe, expect, it } from 'vitest';
import { play, unlockAudio } from './audio';
import { EFFECTS } from './sounds';

describe('audio', () => {
  it('stays silent and never throws without Web Audio', () => {
    expect(() => unlockAudio()).not.toThrow();
    expect(() => play('won')).not.toThrow();
  });

  it('defines every effect with playable notes', () => {
    for (const notes of Object.values(EFFECTS)) {
      expect(notes.length).toBeGreaterThan(0);
      for (const n of notes) {
        expect(n.freq).toBeGreaterThan(0);
        expect(n.duration).toBeGreaterThan(0);
        expect(n.volume).toBeGreaterThan(0);
        expect(n.volume).toBeLessThanOrEqual(1);
      }
    }
  });
});
