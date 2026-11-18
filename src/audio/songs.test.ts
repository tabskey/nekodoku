import { describe, expect, it } from 'vitest';
import { noteFrequency, SONGS } from './songs';

describe('songs', () => {
  it('turns note names into frequencies', () => {
    expect(noteFrequency('A4')).toBe(440);
    expect(noteFrequency('A3')).toBe(220);
    expect(noteFrequency('C4')).toBeCloseTo(261.63, 2);
    expect(noteFrequency('G#3')).toBeCloseTo(207.65, 2);
  });

  it('writes every note readably, and every voice of a song to the same length', () => {
    for (const song of Object.values(SONGS)) {
      const lengths = song.voices.map((voice) =>
        voice.notes.reduce((sum, [name, beats, glide]) => {
          if (name !== '-') expect(noteFrequency(name)).toBeGreaterThan(0);
          if (glide) expect(noteFrequency(glide)).toBeGreaterThan(0);
          expect(beats).toBeGreaterThan(0);
          return sum + beats;
        }, 0),
      );
      expect(new Set(lengths).size).toBe(1);
    }
  });
});
