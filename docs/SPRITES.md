# Sprite production guide

How to draw, export and plug in pixel art for Nekodoku.

**All final art is drawn by the owner in Aseprite.** The sprites in `src/assets/` and in the design canvas are placeholders made only to test layout and sizes. None of them ships in the game. Reference images collected for inspiration are never traced or copied.

## Size rules: read before drawing

1. **Cat head: 12x12, always.** Every cat, generated or hand-made, has its head drawn on a 12x12 grid. This is what fits the board cells.
2. **The head uses columns 0 to 10; column 11 is always empty.** The drawing is 11 columns wide, an odd width, so it has a true center column (column 5) where a one-pixel nose sits. See Centering the head.
3. **Full-body cat: one canvas for every cat.** All full-body cats share the same canvas size, so they line up in the menu, the collection and the restoration. Proposed canvas: 16x20, which leaves two empty rows above the head for hats and other accessories; the mockup's body types use it **(waiting for the owner's confirmation; it can change once, for all cats)**.
4. **The head inside the full body is the same 12x12 head**, placed at the same spot on the canvas for every cat (columns 2 to 13 of the 16-wide canvas, so the head's center column lands on body column 7), so the icon and the full cat always match.
5. **Body types fit the same canvas.** Slim, regular and chubby bodies all fit inside the full-body canvas; a chubby cat is wider inside it, not on a bigger canvas.
6. **Display only at whole multiples** (2x, 3x, 4x) of the canvas size.

For where each sprite appears and the interface colors, see `docs/DESIGN.md`.

## Canvas sizes

Sizes are in sprite pixels. "Fixed" sizes are tied to the layout; "free" ones can change.

| Sprite | Current size | Fixed or free | Why |
| --- | --- | --- | --- |
| Cat head (icon) | 12x12, drawn in columns 0 to 10 | Fixed | Must fit board cells at whole multiples: 24 px on a 12x12 board, 36 on 9x9, 48 or 60 on 5x5. A 13-wide canvas was considered for centering and rejected: it does not fit the 24 px and 36 px cells |
| Cat, full body | 16x20 (proposed) | Fixed, one size for all cats | Cats must line up in the menu, collection and restoration. Can be changed once, for every cat at once |
| Cat, walking on the map | Same canvas as the full body | Fixed | Side view, one walk cycle of 2 to 4 frames per body type. It shares the full-body canvas so the cat does not jump in size when it stops |
| Ghost cat | 12x14 | Free | Shown at the Boss and in the restoration. Keep it close to the full-body size so the transformation reads well |
| Fish | 12x7 | Free | |
| Coin | 10x10 | Free | |
| Heart | 9x8 | Free | |
| Boss scenery | 85x18 | Height fixed, width free | Drawn at 4 px per sprite pixel: 18 rows give the 72 px strip; 85 columns give 340 px |

The style is closer to 8-bit than 16-bit: very small canvases and few colors per sprite.

## Centering the head

A one-pixel nose can only be centered on an odd width, so the head is drawn 11 columns wide (columns 0 to 10) and column 11 stays empty on every cat. That leaves the drawing half a sprite pixel left of the canvas center.

`CatSprite` corrects it when displaying: it shifts the sprite right by half a sprite pixel, rounded to whole CSS pixels so it stays crisp.

```tsx
// Heads are drawn in columns 0-10; column 11 is always empty.
// Shift right by half a sprite pixel, rounded to whole CSS px so it stays crisp.
const offsetX = Math.round(scale / 2);
```

| Scale | Shift | Result |
| --- | --- | --- |
| 2x | 1 px | Exactly centered |
| 3x | 2 px | Half a screen pixel off, invisible |
| 4x | 2 px | Exactly centered |

The same shift applies to the full body and the ghost, since the head sits at the same relative position in them. Never shift by a fraction of a CSS pixel.

Face layout that works at this size: head about 9 columns wide (columns 1 to 9), whiskers in columns 0 and 10, eyes mirrored around column 5, a one-pixel nose in column 5 and a "^" mouth (one pixel diagonally below the nose on each side).

## Head frames

Every cat head has three frames in the same Aseprite file. Only the eye rows change between them.

| Frame | Eyes | When it shows | Eye pixels use the role |
| --- | --- | --- | --- |
| 1 | Open (shine on top, eye color below) | All the time | shine, eye |
| 2 | Closed, flat line "- -" | Normal blink, every few seconds | lid |
| 3 | Happy, arcs "^ ^" | When the player makes a correct move | eye |

Tag the frames in Aseprite so the code knows which range to play: **idle** for frames 1 and 2, **happy** for frame 3. In idle, frame 1 stays on screen much longer than frame 2.

## Body types

Every cat has one of three body types under the same 12x12 head:

| Body | Idea |
| --- | --- |
| Slim | Narrow body, long legs, thin tail |
| Regular | The default sitting body |
| Chubby | Wide, round body, short legs, the head sits a little lower into the body |

Each body is one pixel map using the same color roles as the head, so any palette works on any body. The head frames (see Head frames) change only the head rows; the body does not blink.

The chubby body sits one row lower so its head sinks a little into the body. All three keep the head at the same column, so they line up when shown side by side.

Each body type also needs a side-view walk cycle for the world map (see the table above). The head in the walk cycle is a side-view head, not the 12x12 front icon.

World cats are generated: a body type plus a palette, chosen from the world number, so each world always restores the same cat. Shop cats are hand-drawn and may break the palette rules (see below), but never the size rules.

## Rules that keep sprites sharp

- Always display a sprite at a whole multiple of its size (2x, 3x, 4x). A 12-pixel sprite at 30 px blurs; at 24 or 36 px it stays crisp.
- Any position offset is a whole number of CSS pixels (see Centering the head).
- No anti-aliasing, gradients or soft brushes. Every pixel is one flat color.
- No black outlines. The outline is a darker shade of the sprite's main color.
- Keep the background transparent.

## Rules that keep sprites recolorable

Cats, the ghost and the scenery are recolored by palette, so one drawing serves many worlds. For that to work:

- Use exactly one color per role, and never reuse a color for two roles. The color is how the code knows which pixel is fur and which is patch.
- Cat roles (9): outline, fur, patch, ear, eye, shine, nose, muzzle, lid. The lid is the closed-eye line and only appears in the blink frame. The "^" mouth uses the muzzle role.
- Scenery roles (6): sky, speck (stars at night, small clouds by day), disc (moon or sun), far hills, near hills, ground. A scenery may use fewer roles, not more, unless the palette type is extended.
- Draw the blink and the happy eyes as extra frames of the same file, changing only the eye rows (see Head frames).
- A hand-drawn shop cat that will never be recolored can ignore these rules and use any colors.

## Exporting from Aseprite

Aseprite exports PNG, not SVG. Export at 1x (no scaling), with transparency. Prefer a sprite sheet (File → Export Sprite Sheet, layout Horizontal Strip, with the JSON data so the frame tags come along); one PNG per frame also works.

There are two ways to use the PNG in the app:

1. **PNG as an image.** Simplest. Scale it in CSS with `image-rendering: pixelated`. Colors are fixed, which is fine for shop-exclusive cats, items and anything that never changes color.
2. **PNG converted to a pixel map.** Needed for anything recolored by palette. A small script reads the PNG, assigns a letter to each distinct color and outputs the rows of letters plus the palette, in the format of `src/components/atoms/CatSprite/catSprites.ts`. The script is not written yet; it belongs in a `scripts/` folder and runs at development time, not in the app.

## Boss sceneries

- There are several scenery drawings, and Boss levels rotate through them, so consecutive worlds do not show the same landscape.
- Which drawing a Boss gets is a pure function of the world number (for example, world number modulo the number of drawings), so a world always shows the same scenery.
- The drawing and the color are independent: the drawing comes from the rotation, the palette comes from the world.
- Every scenery palette exists in two versions, one per theme (see Themes in `docs/DESIGN.md`):
  - **Night**, for the night mode: dark sky, stars, moon.
  - **Day**, for the day mode: light sky, small clouds, sun.
- The same pixel map serves both: only the six colors change. A star pixel becomes a cloud pixel and the moon becomes the sun.

Example for the teal world:

| Role | Night | Day |
| --- | --- | --- |
| Sky | `#24405a` | `#8fd0e6` |
| Speck | `#cfeef0` | `#ffffff` |
| Disc | `#f6ecd4` | `#ffc94a` |
| Far hills | `#2f5d73` | `#8fcdb8` |
| Near hills | `#3f8a86` | `#58c7b5` |
| Ground | `#58c7b5` | `#3a9c8b` |

The day sky is kept a medium blue, not a pale one, so the pale ghost still stands out against it. The day palettes for the rose and gold worlds are in `src/assets/scene-rose-day.svg` and `scene-gold-day.svg`.

## Map biomes

Each biome is a small kit, reused by every world that rotates onto it:

- **Palette:** ground, ground speckles, path, decoration colors, in a night and a day version.
- **Decorations:** 3 to 5 small sprites (for example tree, bush, rock for the forest; palm, wave, shell for the beach; tombstone, fence, pumpkin for the graveyard), each on a 12x12 or 16x16 canvas. Drawn with color roles so the night version is a palette swap.
- **Path layout:** a few hand-made path shapes (positions of the level tiles and the bends between them) rotate across worlds. A river biome may add a bridge where the path crosses the water.

**One pixel scale on the map.** Everything on the map, from ground speckles to decorations to the walking cat, uses the same size of pixel on screen (3 CSS px per sprite pixel in the mockup). The current mockup breaks this: its ground speckles and path dots are 6 px squares while the cat's pixels are 3 px. Fix it when the real map is built.

## Checklist for a new sprite

1. Canvas at the size in the table, transparent background.
2. If it is a cat head: drawn in columns 0 to 10, column 11 empty, nose on column 5.
3. Flat colors, one per role, no black outline.
4. Head frames, if it is a cat: open, blink "- -" and happy "^ ^", tagged idle and happy.
5. Export PNG at 1x.
6. Decide: fixed colors (use the PNG) or recolorable (convert to a pixel map).
7. Check it on screen at the multiples it will be shown at.
