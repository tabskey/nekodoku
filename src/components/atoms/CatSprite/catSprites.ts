import {
  catLook,
  type CatBody,
  type CatCoat,
  type CatEyes,
} from '../../../game/progression';

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

// Slim body: narrow, long legs, thin tail up. Placeholder art.
const SLIM_BODY = [
  '.....obbbbo..o..',
  '.....obwwbo.obo.',
  '....obbwwbboobo.',
  '....obbbbbbbbo..',
  '....obbbbbbo....',
  '....obo..obo....',
  '....obo..obo....',
  '....owo..owo....',
];

// Chubby body: wide and round, short legs, tail curled in front of the paws.
// One row shorter, so the head sits one row lower into it. Placeholder art.
const CHUBBY_BODY = [
  '..obbbbbbbbbbo..',
  '.obbbwwwwwwbbbo.',
  'obbbbwwwwwwbbbbo',
  'obbbbbbbbbbbbbbo',
  'obowwobbbbowwobo',
  '.obbbbbbbbbbbbo.',
  '..oooooooooooo..',
];

export type { CatBody };

const BODIES: Record<CatBody, string[]> = {
  slim: SLIM_BODY,
  regular: BODY,
  chubby: CHUBBY_BODY,
};

const FULL_HEIGHT = 18;

// Full body = first 10 rows of the head, padded to 16 wide, then the body.
// A shorter body leaves empty rows on top, so every cat stands on the bottom.
function withBody(head: string[], body: string[]): string[] {
  const empty = FULL_HEIGHT - 10 - body.length;
  return [
    ...Array<string>(empty).fill('.'.repeat(16)),
    ...head.slice(0, 10).map((row) => `..${row}..`),
    ...body,
  ];
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

// Slim side view: taller thin tail, narrow body, five rows of legs.
const SLIM_WALK_TOP = [
  '................',
  '................',
  '................',
  '................',
  '..o.....o...o...',
  '.obo...obo.obo..',
  '.obo...obbobbbo.',
  '.obo...obbbbbbbo',
  '.obo...obbbbehbo',
  '.obo...obbbbbwwn',
  '..oboooobbbwwwo.',
  '..obbbbbbbbbbo..',
  '..obbbbbbbbbbo..',
];
const SLIM_WALK_TOGETHER = [
  ...SLIM_WALK_TOP,
  '..ob.ob..ob.ob..',
  '..ob.ob..ob.ob..',
  '..ob.ob..ob.ob..',
  '..ob.ob..ob.ob..',
  '..oo.oo..oo.oo..',
];
const SLIM_WALK_APART = [
  ...SLIM_WALK_TOP,
  '..ob.ob..ob.ob..',
  '..ob.ob..ob.ob..',
  '..ob..obob..ob..',
  '.ob..ob..ob..ob.',
  '.oo..oo..oo..oo.',
];

// Chubby side view: head one row lower, wide round body, two rows of legs.
const CHUBBY_WALK_TOP = [
  '................',
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
  '.obbbbbbbbbbbbo.',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  '.obbbbbbbbbbbbo.',
];
const CHUBBY_WALK_TOGETHER = [
  ...CHUBBY_WALK_TOP,
  '..ob.ob..ob.ob..',
  '..oo.oo..oo.oo..',
];
const CHUBBY_WALK_APART = [
  ...CHUBBY_WALK_TOP,
  '.ob..ob..ob..ob.',
  '.oo..oo..oo..oo.',
];

// The side view has one eye, the only "eh" in the map.
function closeSideEye(rows: string[]): string[] {
  return rows.map((row) => row.replace('eh', 'cc'));
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

function fullBody(body: CatBody): PoseFrames {
  return {
    open: withBody(OPEN_EYES, BODIES[body]),
    closed: withBody(CLOSED_EYES, BODIES[body]),
    happy: withBody(HAPPY_EYES, BODIES[body]),
    width: 16,
    height: FULL_HEIGHT,
  };
}

function walk(together: string[], apart: string[]): PoseFrames {
  return {
    open: together,
    closed: closeSideEye(together),
    happy: together,
    step: apart,
    width: 16,
    height: FULL_HEIGHT,
  };
}

const HEAD: PoseFrames = {
  open: OPEN_EYES,
  closed: CLOSED_EYES,
  happy: HAPPY_EYES,
  width: 12,
  height: 12,
};

// 'head' is the icon used on the board, HUD and map, the same for every body.
// 'full' is the whole cat, used in the restoration reveal and the collection.
// 'walk' is the cat moving along the world map.
export const CAT_POSES: Record<CatPose, Record<CatBody, PoseFrames>> = {
  head: { slim: HEAD, regular: HEAD, chubby: HEAD },
  full: {
    slim: fullBody('slim'),
    regular: fullBody('regular'),
    chubby: fullBody('chubby'),
  },
  walk: {
    slim: walk(SLIM_WALK_TOGETHER, SLIM_WALK_APART),
    regular: walk(WALK_TOGETHER, WALK_APART),
    chubby: walk(CHUBBY_WALK_TOGETHER, CHUBBY_WALK_APART),
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

type Eyes = Pick<CatPalette, 'eye' | 'shine'>;

/** Colors of each generated cat's coat: every role but the eyes. Placeholders. */
export const COAT_COLORS: Record<CatCoat, Omit<CatPalette, keyof Eyes>> = {
  white: {
    outline: '#a79cc0',
    fur: '#ffffff',
    patch: '#e6dff0',
    ear: PINK_EAR,
    nose: PINK_NOSE,
    muzzle: '#ffffff',
    lid: DARK_EYE,
  },
  cream: {
    outline: '#c49a6c',
    fur: '#f6dfb8',
    patch: '#e8c38f',
    ear: PINK_EAR,
    nose: PINK_NOSE,
    muzzle: '#fff8ec',
    lid: DARK_EYE,
  },
  orange: {
    outline: '#b5611f',
    fur: '#f6a04d',
    patch: '#d9772b',
    ear: PINK_EAR,
    nose: PINK_NOSE,
    muzzle: '#fff1dc',
    lid: DARK_EYE,
  },
  gray: {
    outline: '#6b6683',
    fur: '#a7a3b8',
    patch: '#7f7a94',
    ear: PINK_EAR,
    nose: PINK_NOSE,
    muzzle: '#d9d6e3',
    lid: DARK_EYE,
  },
  black: {
    outline: '#352b4d',
    fur: '#4a3f66',
    patch: '#3a3052',
    ear: '#8f6f9c',
    nose: PINK_NOSE,
    muzzle: '#5a4e78',
    lid: '#a79cc0',
  },
  brown: {
    outline: '#6b4226',
    fur: '#9c6b45',
    patch: '#7d5234',
    ear: PINK_EAR,
    nose: PINK_NOSE,
    muzzle: '#e8cfb0',
    lid: DARK_EYE,
  },
  // Tuxedos: the muzzle role also paints the chest and paws, so a white
  // muzzle on dark fur is the tuxedo with no extra pixel map.
  tuxedo: {
    outline: '#352b4d',
    fur: '#4a3f66',
    patch: '#3a3052',
    ear: '#8f6f9c',
    nose: PINK_NOSE,
    muzzle: '#ffffff',
    lid: '#a79cc0',
  },
  grayTuxedo: {
    outline: '#4f4a66',
    fur: '#7f7a94',
    patch: '#66617c',
    ear: PINK_EAR,
    nose: PINK_NOSE,
    muzzle: '#ffffff',
    lid: DARK_EYE,
  },
  orangeWhite: {
    outline: '#b5611f',
    fur: '#f6a04d',
    patch: '#d9772b',
    ear: PINK_EAR,
    nose: PINK_NOSE,
    muzzle: '#ffffff',
    lid: DARK_EYE,
  },
  // Tortoiseshell: black with orange in the patch and muzzle roles, so the
  // forehead spots, muzzle, chest and paws come out orange.
  tortie: {
    outline: '#352b4d',
    fur: '#4a3f66',
    patch: '#f39a45',
    ear: '#8f6f9c',
    nose: PINK_NOSE,
    muzzle: '#e0803a',
    lid: '#a79cc0',
  },
  // Tortoiseshell with white: orange spots, white muzzle, chest and paws.
  tortieWhite: {
    outline: '#352b4d',
    fur: '#4a3f66',
    patch: '#f39a45',
    ear: '#8f6f9c',
    nose: PINK_NOSE,
    muzzle: '#ffffff',
    lid: '#a79cc0',
  },
  chocolate: {
    outline: '#3f2117',
    fur: '#6e3f2c',
    patch: '#58301f',
    ear: '#c48a8a',
    nose: PINK_NOSE,
    muzzle: '#8a5640',
    lid: '#e8cfb0',
  },
  // Siamese: cream fur with dark points. The ear, patch and muzzle roles make
  // the dark ears, mask and paws.
  siamese: {
    outline: '#8a6a52',
    fur: '#f6ead6',
    patch: '#6b4a3a',
    ear: '#5a3d30',
    nose: '#5a3d30',
    muzzle: '#6b4a3a',
    lid: DARK_EYE,
  },
};

/** Colors of each generated cat's eyes. Placeholders. */
export const EYE_COLORS: Record<CatEyes, Eyes> = {
  blue: { eye: '#3b7dd8', shine: '#ffffff' },
  green: { eye: '#2f8f5b', shine: '#ffffff' },
  yellow: { eye: '#e8b923', shine: '#fff6d6' },
  orange: { eye: '#e8742a', shine: '#fff1dc' },
};

/** The palette for a saved cat id, falling back to the default cat. */
export function catPalette(id: string): CatPalette {
  const { palette, eyes } = catLook(id);
  if (eyes) {
    return { ...COAT_COLORS[palette as CatCoat], ...EYE_COLORS[eyes] };
  }
  return CAT_PALETTES[palette as CatId] ?? CAT_PALETTES.white;
}
