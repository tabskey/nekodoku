// Every sound effect as data: notes played one after another. Changing a
// sound means editing numbers (see Sound in docs/ARCHITECTURE.md and the
// list of moments in docs/GAME_RULES.md).

export interface Note {
  /** Frequency in Hz. */
  freq: number;
  /** Glides to this frequency by the end of the note. */
  to?: number;
  /** Length in seconds. */
  duration: number;
  wave: 'square' | 'triangle';
  /** Peak volume, 0 to 1; each note fades out quickly from it. */
  volume: number;
}

export type Effect =
  | 'tap'
  | 'placeCat'
  | 'remove'
  | 'mistake'
  | 'won'
  | 'lost'
  | 'help'
  | 'coin'
  | 'sweep'
  | 'chime';

const note = (
  freq: number,
  duration: number,
  wave: Note['wave'],
  volume: number,
  to?: number,
): Note => ({ freq, duration, wave, volume, to });

export const EFFECTS: Record<Effect, Note[]> = {
  // Very short, soft click.
  tap: [note(880, 0.03, 'triangle', 0.12)],
  // Short rising blip.
  placeCat: [note(523, 0.08, 'square', 0.1, 784)],
  // Short falling blip.
  remove: [note(660, 0.07, 'square', 0.08, 440)],
  // Low buzz.
  mistake: [note(110, 0.25, 'square', 0.15)],
  // Short rising jingle: C, E, G, high C.
  won: [
    note(523, 0.09, 'triangle', 0.18),
    note(659, 0.09, 'triangle', 0.18),
    note(784, 0.09, 'triangle', 0.18),
    note(1047, 0.2, 'triangle', 0.18),
  ],
  // Short falling jingle: G, E, C.
  lost: [
    note(392, 0.12, 'triangle', 0.16),
    note(330, 0.12, 'triangle', 0.16),
    note(262, 0.24, 'triangle', 0.16),
  ],
  // Sparkle, for Reveal and Eraser.
  help: [
    note(1568, 0.05, 'triangle', 0.1),
    note(2093, 0.05, 'triangle', 0.1),
    note(2637, 0.08, 'triangle', 0.1),
  ],
  // Coin, for a purchase in the shop.
  coin: [note(988, 0.06, 'square', 0.1), note(1319, 0.18, 'square', 0.1)],
  // Rising sweep, during the restoration's silhouette.
  sweep: [note(220, 1, 'triangle', 0.12, 880)],
  // Chime, when the restored cat appears.
  chime: [
    note(1047, 0.15, 'triangle', 0.16),
    note(1568, 0.35, 'triangle', 0.16),
  ],
};
