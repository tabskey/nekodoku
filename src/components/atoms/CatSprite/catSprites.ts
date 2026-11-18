// Cat sprite data: one pixel map shared by every cat, plus one palette per cat.
// Each character in the map is a role; the palette says which color that role gets.

export type PixelRole =
  | 'outline'
  | 'fur'
  | 'patch'
  | 'ear'
  | 'eye'
  | 'shine'
  | 'nose'
  | 'muzzle'
  | 'lid';

export type CatPalette = Record<PixelRole, string>;

export const ROLE_BY_CHAR: Record<string, PixelRole> = {
  o: 'outline',
  b: 'fur',
  p: 'patch',
  i: 'ear',
  e: 'eye',
  h: 'shine',
  n: 'nose',
  w: 'muzzle',
  c: 'lid',
};

// 12x12 grid. A dot is a transparent pixel.
const OPEN_EYES = [
  '.o........o.',
  'obo......obo',
  'obio....oibo',
  'obbboooobbbo',
  'obpbbppbbpbo',
  'obbbbbbbbbbo',
  'obehbbbbehbo',
  'obeebbbbeebo',
  'obbbwnnwbbbo',
  '.obwwwwwwbo.',
  '..obbbbbbo..',
  '...oooooo...',
];

// Same cat with rows 6 and 7 swapped for closed eyes.
const CLOSED_EYES = [
  ...OPEN_EYES.slice(0, 6),
  'obbbbbbbbbbo',
  'obccbbbbccbo',
  ...OPEN_EYES.slice(8),
];

// TODO(happy frame): placeholder reusing the closed eyes. Once the happy
// frame is drawn, replace this with its map: OPEN_EYES with rows 6 and 7 as
// "^ ^" arcs in the 'eye' role. Both poses pick it up from here.
const HAPPY_EYES = CLOSED_EYES;

// Sitting body, 16 pixels wide. The head sits on top of it, centered.
const BODY = [
  '....obbbbbbo....',
  '...obbwwwwbbo...',
  '...obbwwwwbbo...',
  '..obbbbwwbbbbo..',
  '..obbbbbbbbbbooo',
  '..obbobbbbobbbbo',
  '..owwowwwwowwooo',
  '...oo.oooo.oo...',
];

// Full body = first 10 rows of the head, padded to 16 wide, then the body.
function withBody(head: string[]): string[] {
  return [...head.slice(0, 10).map((row) => `..${row}..`), ...BODY];
}

// Side view walking right, on the full-body canvas so the cat keeps its size
// when it stops. Two frames: legs together, legs apart. Placeholder art.
const WALK_TOP = [
  '................',
  '................',
  '................',
  '................',
  '........o...o...',
  '.......obo.obo..',
  '.......obbobbbo.',
  '.o.....obbbbbbbo',
  'obo....obbbbehbo',
  'obo....obbbbbwwn',
  '.obooooobbbwwwo.',
  '..obbbbbbbbbbo..',
  '..obbbbbbbbbbo..',
  '..obbbbbbbbbbo..',
  '..obbbbbbbbbbo..',
];
const WALK_TOGETHER = [
  ...WALK_TOP,
  '...ob.ob..ob.ob.',
  '...ob.ob..ob.ob.',
  '...oo.oo..oo.oo.',
];
const WALK_APART = [
  ...WALK_TOP,
  '...ob..obob..ob.',
  '..ob..ob..ob..ob',
  '..oo..oo..oo..oo',
];
// The side view has one eye, in row 8.
function closeSideEye(rows: string[]): string[] {
  return rows.map((row, y) => (y === 8 ? row.replace('eh', 'cc') : row));
}

export type CatPose = 'head' | 'full' | 'walk';

interface PoseFrames {
  open: string[];
  closed: string[];
  /** Eyes as "^ ^", shown for a moment after a correct move. */
  happy: string[];
  /** Second frame of the walk cycle, swapped with `open` while walking. */
  step?: string[];
  width: number;
  height: number;
}

// 'head' is the icon used on the board, HUD and map.
// 'full' is the whole cat, used in the restoration reveal and the collection.
export const CAT_POSES: Record<CatPose, PoseFrames> = {
  head: {
    open: OPEN_EYES,
    closed: CLOSED_EYES,
    happy: HAPPY_EYES,
    width: 12,
    height: 12,
  },
  full: {
    open: withBody(OPEN_EYES),
    closed: withBody(CLOSED_EYES),
    happy: withBody(HAPPY_EYES),
    width: 16,
    height: 18,
  },
  // 'walk' is the cat moving along the world map.
  walk: {
    open: WALK_TOGETHER,
    closed: closeSideEye(WALK_TOGETHER),
    happy: WALK_TOGETHER,
    step: WALK_APART,
    width: 16,
    height: 18,
  },
};

const DARK_EYE = '#2a1f3d';
const PINK_EAR = '#f7a8b8';
const PINK_NOSE = '#ff8fa3';

export const CAT_PALETTES = {
  white: {
    outline: '#a79cc0',
    fur: '#ffffff',
    patch: '#e6dff0',
    ear: PINK_EAR,
    eye: DARK_EYE,
    shine: '#ffffff',
    nose: PINK_NOSE,
    muzzle: '#ffffff',
    lid: DARK_EYE,
  },
  orange: {
    outline: '#b5611f',
    fur: '#f6a04d',
    patch: '#d9772b',
    ear: PINK_EAR,
    eye: DARK_EYE,
    shine: '#ffffff',
    nose: PINK_NOSE,
    muzzle: '#fff1dc',
    lid: DARK_EYE,
  },
  gray: {
    outline: '#6b6683',
    fur: '#a7a3b8',
    patch: '#7f7a94',
    ear: PINK_EAR,
    eye: '#2f6b4f',
    shine: '#ffffff',
    nose: PINK_NOSE,
    muzzle: '#d9d6e3',
    lid: DARK_EYE,
  },
  black: {
    outline: '#352b4d',
    fur: '#4a3f66',
    patch: '#3a3052',
    ear: '#8f6f9c',
    eye: '#ffd66b',
    shine: '#fff6d6',
    nose: PINK_NOSE,
    muzzle: '#5a4e78',
    lid: '#ffd66b',
  },
  // Test shop cat, placeholder colors: white fur, orange patches and dark
  // ears for the third calico color. The owner replaces it with her own.
  calico: {
    outline: '#a07a5c',
    fur: '#fffaf2',
    patch: '#f39a45',
    ear: '#3a3052',
    eye: DARK_EYE,
    shine: '#ffffff',
    nose: PINK_NOSE,
    muzzle: '#fffaf2',
    lid: DARK_EYE,
  },
} satisfies Record<string, CatPalette>;

export type CatId = keyof typeof CAT_PALETTES;

// A silhouette is the same map with every role in one color.
export function silhouettePalette(color: string): CatPalette {
  return {
    outline: color,
    fur: color,
    patch: color,
    ear: color,
    eye: color,
    shine: color,
    nose: color,
    muzzle: color,
    lid: color,
  };
}

/** The palette for a saved cat id, falling back to the default cat. */
export function catPalette(id: string): CatPalette {
  return CAT_PALETTES[id as CatId] ?? CAT_PALETTES.white;
}
