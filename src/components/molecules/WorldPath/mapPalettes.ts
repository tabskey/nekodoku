import type { Biome, TimeOfDay } from '../../../game/biomes';

export interface MapPalette {
  ground: string;
  path: string;
  /** Two shades of the small squares that texture the ground. */
  specks: [string, string];
  /** Meadow bushes: base and top. */
  bush?: [string, string];
  /** Blinking fireflies, at night. */
  firefly?: string;
  /** Beach sea along the right edge: water and foam. */
  sea?: [string, string];
}

// Placeholder colors and shapes. Meadow night and day and beach day come
// from the mockup; the others are guesses until the owner draws them.
export const MAP_PALETTES: Record<Biome, Record<TimeOfDay, MapPalette>> = {
  meadow: {
    night: {
      ground: '#1c2c44',
      path: '#cbbfe0',
      specks: ['#243a57', '#16233a'],
      bush: ['#2f5d73', '#3f8a86'],
      firefly: '#ffd66b',
    },
    day: {
      ground: '#9ad3b0',
      path: '#d9b77a',
      specks: ['#86c4a0', '#b3e2c4'],
      bush: ['#3a9c8b', '#58c7b5'],
    },
    afternoon: {
      ground: '#b78aa8',
      path: '#f6d7c3',
      specks: ['#a87a98', '#c69ab7'],
      bush: ['#7a5a8a', '#9a72a0'],
    },
  },
  beach: {
    night: {
      ground: '#3b3a5c',
      path: '#a98a6a',
      specks: ['#34334f', '#4a4870'],
      firefly: '#ffd66b',
      sea: ['#24456e', '#8fb3d9'],
    },
    day: {
      ground: '#f3dca0',
      path: '#c98a4b',
      specks: ['#e8cc8a', '#f8eac2'],
      sea: ['#5ec2e0', '#ffffff'],
    },
    afternoon: {
      ground: '#f0b8a8',
      path: '#a8604a',
      specks: ['#e3a898', '#f8cbbd'],
      sea: ['#c07ab0', '#fbe3ef'],
    },
  },
};
