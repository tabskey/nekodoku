import type { Biome, TimeOfDay } from '../../../game/biomes';

export interface MapPalette {
  ground: string;
  path: string;
}

// Placeholder colors. Meadow night and day and beach day come from the
// mockup; the others are guesses until the owner draws them.
export const MAP_PALETTES: Record<Biome, Record<TimeOfDay, MapPalette>> = {
  meadow: {
    night: { ground: '#1c2c44', path: '#cbbfe0' },
    day: { ground: '#9ad3b0', path: '#d9b77a' },
    afternoon: { ground: '#b78aa8', path: '#f6d7c3' },
  },
  beach: {
    night: { ground: '#3b3a5c', path: '#a98a6a' },
    day: { ground: '#f3dca0', path: '#c98a4b' },
    afternoon: { ground: '#f0b8a8', path: '#a8604a' },
  },
};
