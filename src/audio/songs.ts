// Background loops as data: each voice is a list of [note, beats], played on
// repeat. A note is a name like 'C4' or 'G#3', or '-' for a rest; an optional
// third name makes it glide there, which is how the meows are drawn. Changing
// a song means editing this file (see Sound in docs/ARCHITECTURE.md).

export interface Voice {
  wave: 'square' | 'triangle';
  /** Peak volume of each note, kept low so effects stay clear on top. */
  volume: number;
  notes: SongNote[];
}

/** [note, beats] or [note, beats, glides to]. */
export type SongNote = [string, number] | [string, number, string];

export interface Song {
  bpm: number;
  voices: Voice[];
  /**
   * The beat the loop starts from. The notes before it play once, as an
   * introduction; without it the whole song repeats. Every voice must have a
   * note starting exactly there.
   */
  loopFromBeat?: number;
}

export type SongId = 'menu' | 'level' | 'boss' | 'celebration';

// Eight eighth notes, half a beat each, for one bar of arpeggio.
const bar = (...names: string[]): SongNote[] =>
  names.map((name) => [name, 0.5]);

export const SONGS: Record<SongId, Song> = {
  // The Boss restoration (see Restoration sequence in docs/DESIGN.md), timed
  // to its 3.6 s: at 116 bpm beat 6 falls at 3.1 s, when the cat appears.
  // Beats 0-6 build up (the ghost flies in, turns black, flickers three
  // times), then a fanfare and a happy loop in C: C, G, Am, F.
  celebration: {
    bpm: 116,
    loopFromBeat: 6,
    voices: [
      {
        wave: 'triangle',
        volume: 0.08,
        notes: [
          // A steady pulse on C, then G leading into the reveal.
          ['C2', 1],
          ['C2', 1],
          ['C2', 1],
          ['C2', 1],
          ['G2', 1],
          ['G2', 1],
          ['C3', 1],
          ['G2', 1],
          ['C3', 1],
          ['G2', 1],
          ['G2', 1],
          ['D3', 1],
          ['G2', 1],
          ['D3', 1],
          ['A2', 1],
          ['E3', 1],
          ['A2', 1],
          ['E3', 1],
          ['F2', 1],
          ['C3', 1],
          ['F2', 1],
          ['C3', 1],
        ],
      },
      {
        wave: 'triangle',
        volume: 0.045,
        notes: [
          // The ghost flies in: a quick climb.
          ...bar('C4', 'E4', 'G4', 'C5'),
          // It turns black: two slow notes.
          ['G4', 0.75],
          ['B4', 0.75],
          // The flicker: three short blips.
          ['A5', 0.25],
          ['-', 0.25],
          ['A5', 0.25],
          ['-', 0.25],
          ['A5', 0.25],
          ['-', 0.25],
          // The last climb, into the reveal.
          ['C5', 0.25],
          ['E5', 0.25],
          ['G5', 0.25],
          ['B5', 0.25],
          // The loop: sparkling arpeggios under the tune.
          ...bar('E4', 'G4', 'C5', 'G4', 'E4', 'G4', 'C5', 'G4'),
          ...bar('D4', 'G4', 'B4', 'G4', 'D4', 'G4', 'B4', 'G4'),
          ...bar('E4', 'A4', 'C5', 'A4', 'E4', 'A4', 'C5', 'A4'),
          ...bar('F4', 'A4', 'C5', 'A4', 'F4', 'A4', 'C5', 'A4'),
        ],
      },
      {
        wave: 'square',
        volume: 0.035,
        notes: [
          // The tune waits for the reveal.
          ['-', 6],
          ['G4', 0.5],
          ['C5', 0.5],
          ['E5', 1],
          ['G5', 1],
          ['E5', 0.5],
          ['G5', 0.5],
          ['D5', 1],
          ['B4', 0.5],
          ['D5', 0.5],
          ['G5', 1],
          ['D5', 1],
          ['C5', 0.5],
          ['E5', 0.5],
          ['A5', 1],
          ['G5', 0.5],
          ['E5', 0.5],
          ['C5', 1],
          ['A4', 0.5],
          ['C5', 0.5],
          ['F5', 1],
          ['E5', 0.5],
          ['D5', 0.5],
          ['C5', 1],
        ],
      },
    ],
  },
  // Funky chill loop for the menu and the map: Dm7 and G7 back and forth,
  // a syncopated bass with octave pops, offbeat stabs, and a soft meow to
  // close every loop.
  menu: {
    bpm: 98,
    voices: [
      {
        wave: 'triangle',
        volume: 0.08,
        notes: [
          ...bar('D2', '-', 'D3', '-', '-', 'D2', 'C3', 'A2'),
          ...bar('G2', '-', 'G3', '-', '-', 'G2', 'F3', 'D3'),
          ...bar('D2', '-', 'D3', '-', '-', 'D2', 'C3', 'A2'),
          ...bar('G2', '-', 'G3', '-', 'F3', '-', 'D3', '-'),
        ],
      },
      {
        wave: 'square',
        volume: 0.025,
        notes: [
          ...bar('-', 'F4', '-', 'A4', '-', 'C5', 'A4', '-'),
          ...bar('-', 'F4', '-', 'B4', '-', 'D5', 'B4', '-'),
          ...bar('-', 'A4', '-', 'C5', '-', 'E5', 'D5', 'C5'),
          // The last beats are left free for the meow.
          ...bar('-', 'B4', '-', 'D5', '-', '-', '-', '-'),
        ],
      },
      {
        wave: 'square',
        volume: 0.035,
        notes: [
          ['-', 14.5],
          ['A4', 0.25, 'E5'], // a little rising "mr"
          ['-', 0.25],
          ['E5', 0.75, 'A4'], // and the falling "rrow"
          ['-', 0.25],
        ],
      },
    ],
  },
  // Chill loop for regular levels: Cmaj7, Am7, Fmaj7, G, soft and slow.
  level: {
    bpm: 76,
    voices: [
      {
        wave: 'triangle',
        volume: 0.07,
        notes: [
          ['C3', 4],
          ['A2', 4],
          ['F2', 4],
          ['G2', 4],
        ],
      },
      {
        wave: 'triangle',
        volume: 0.04,
        notes: [
          ...bar('E4', 'G4', 'B4', 'G4', 'E4', 'G4', 'B4', 'D5'),
          ...bar('C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'A4'),
          ...bar('A3', 'C4', 'E4', 'C4', 'A3', 'C4', 'E4', 'F4'),
          ...bar('B3', 'D4', 'G4', 'D4', 'B3', 'D4', 'F4', 'D4'),
        ],
      },
    ],
  },
  // A little tenser for Bosses: Am, F, Dm, E, faster, with a square edge.
  boss: {
    bpm: 92,
    voices: [
      {
        wave: 'triangle',
        volume: 0.08,
        notes: [
          ['A2', 2],
          ['A2', 2],
          ['F2', 2],
          ['F2', 2],
          ['D2', 2],
          ['D2', 2],
          ['E2', 2],
          ['E2', 2],
        ],
      },
      {
        wave: 'square',
        volume: 0.025,
        notes: [
          ...bar('A3', 'C4', 'E4', 'C4', 'A3', 'C4', 'E4', 'C4'),
          ...bar('F3', 'A3', 'C4', 'A3', 'F3', 'A3', 'C4', 'A3'),
          ...bar('D3', 'F3', 'A3', 'F3', 'D3', 'F3', 'A3', 'F3'),
          ...bar('E3', 'G#3', 'B3', 'G#3', 'E3', 'G#3', 'B3', 'D4'),
        ],
      },
    ],
  },
};

const SEMITONES: Record<string, number> = {
  C: -9,
  'C#': -8,
  D: -7,
  'D#': -6,
  E: -5,
  F: -4,
  'F#': -3,
  G: -2,
  'G#': -1,
  A: 0,
  'A#': 1,
  B: 2,
};

/** Frequency in Hz of a note name such as 'A4' (440) or 'G#3'. */
export function noteFrequency(name: string): number {
  const match = /^([A-G]#?)(\d)$/.exec(name);
  if (!match) throw new Error(`Not a note: ${name}`);
  const semitones = SEMITONES[match[1]] + (Number(match[2]) - 4) * 12;
  return 440 * 2 ** (semitones / 12);
}

/** The index of the note of `voice` that starts exactly at `beat`. */
export function loopIndex(voice: Voice, beat: number): number {
  let at = 0;
  for (let i = 0; i < voice.notes.length; i++) {
    if (at === beat) return i;
    at += voice.notes[i][1];
  }
  throw new Error(`No note starts at beat ${beat}`);
}
