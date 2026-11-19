# Design reference

The visual direction is retro pixel art on a dark plum background, with flat color blocks and no black outlines.

## Mockup

The screens were mocked up on a design canvas:
https://claude.ai/artifact/NfScKNVVf8ygQPLdGeih6o

The canvas is private to the owner. The first two rows are the night mode; the third row repeats the menu, world map, 5x5 level, Boss and shop in day mode. The world map exists in one version only: the walking map. Its scene follows the world's time of day, not the mode (see Biomes in `docs/GAME_RULES.md`): at night a dark blue ground, lilac path and blinking yellow fireflies; by day a light green ground with a sandy dirt path. The artboards:

| Artboard | What it shows |
| --- | --- |
| Menu inicial | Logo, the selected cat (to be shown in full body, facing the player, saying something in a pixel speech bubble in the top right corner of its card, made after the mockup: "Oi!", "Miau!", "Bem-vindo de volta!"... one at random on opening, and another every 7 seconds), play button, path to the next Boss, links to shop, cats and options |
| Boss 12x12 | The largest board, playable: 12 zones (three of them striped), the world's scenery strip above the board with the ghost cat waiting at the top right, and the restoration sequence when the Boss is beaten. A Tweak switches the scenery between three world palettes |
| Tipos de corpo | The three body types (slim, regular, chubby) under the same head, each in a different color and as a black silhouette, on the 16x20 canvas |
| Mapa da praia (diurno) | The beach biome in day mode, to compare biomes: sand ground, sea with foam and waves along the right edge, palm trees, starfish and shells, a wooden-brown path and a different path layout. Same walking cat and tiles as the main map |
| Trocar de mundo (arrastar) | The world map with world switching: swipe the map sideways (or use the arrows beside the title) to move between World 1 (cleared: every tile done with its best score, the restored cat beside the Boss), World 2 (in progress: ghost waiting at the Boss) and World 3 (locked overlay). Dots under the title show the current world |
| Opções | Options screen, interactive: language (Portuguese or English, switches the screen's text live), mode (device, night, day, switches the screen's colors live), sound effects and auto-mark switches, backup code (create shows a sample code; use shows the paste field) and the button to About |
| Sobre | About the game: who made it, why it exists and contact links (GitHub, LinkedIn, e-mail). All personal text is a placeholder for the owner to fill in |
| Mapa do mundo | Interactive world map in the style of classic platform-game maps: winding path of dots, level tiles (cleared, open, locked), the Boss tile with the ghost beside it, and the selected cat walking tile to tile in a two-frame side-view cycle. Tapping the cat makes it say something in a pixel speech bubble (the same bubble as the menu's) for about 2.5 s, made after the mockup. Tapping an open tile makes the cat walk there; a demo button simulates clearing the current level |
| Jogo (fase 5x5) | A playable 5x5 level: lives, score, timer, coins, silhouette strip, rules popover, Reveal and Eraser |
| Lojinha | Shop cats priced in fish, a progress-locked cat, helps priced in coins |
| Assets base | Sprites, zone colors, interface colors and typefaces |

The mockup is a reference for layout and behavior, not source code to copy. Its art is placeholder only: no sprite from the mockup ships in the game. The real components are built in React following `docs/ARCHITECTURE.md`.

## Themes

The game has two modes, chosen in Options:

- **Night mode (noturno):** the dark plum interface described under Colors. It is the one shown in the mockup.
- **Day mode (diurno):** a light version of the same interface.

The default follows the device setting; the player's choice overrides it and is saved.

Only the neutral colors change between modes. The accents (coral, gold, teal), the zone colors and the cat palettes are the same in both, and the Boss scenery switches between its night and day palettes (see `docs/SPRITES.md`).

Build every color as a CSS variable from the first component, with the two sets of values switched by a `data-theme` attribute on the root element. No component may use a hard-coded neutral color.

## Sprites

Drawing, export and recoloring rules live in `docs/SPRITES.md`. This section lists what exists and where it is used.

All sprites are SVGs made of 1x1 rectangles on a pixel grid, with `shape-rendering="crispEdges"`. They scale to any size; keep the displayed size a multiple of the grid so pixels stay square.

| File | Grid | Use |
| --- | --- | --- |
| `cat-white.svg`, `cat-white-blink.svg` | 12x12 | Default cat (Mingau, "Snowball" in English), eyes open and closed |
| `cat-orange.svg`, `cat-orange-blink.svg` | 12x12 | Caramelo ("Caramel") |
| `cat-gray.svg`, `cat-gray-blink.svg` | 12x12 | Fumaça ("Smoky") |
| `cat-black.svg`, `cat-black-blink.svg` | 12x12 | Meia-noite ("Midnight") |
| `cat-ghost.svg` | 12x12 | Silhouette for the progress strip and locked cats |
| `cat-<color>-full.svg`, `cat-<color>-full-blink.svg` | 16x18 | Whole sitting cat, eyes open and closed, in the four colors |
| `ghost-cat.svg` | 12x14 | The ghost that waits during a Boss |
| `scene-<color>.svg`, `scene-<color>-day.svg` | 85x18 | Boss scenery in three world palettes (teal, rose, gold), night and day |
| `fish.svg` | 12x7 | Fish currency |
| `coin.svg` | 10x10 | Coin currency |
| `heart.svg`, `heart-empty.svg` | 9x8 | Life and lost life |

Blink: stack the closed-eyes sprite over the open one and show it for a short step every few seconds (the mockup uses a 3.4 s cycle with the eyes closed for the last 8%). Give cats on the board different delays so they do not blink in unison. Respect `prefers-reduced-motion`.

Each cat's outline is a darker shade of its own fur, never black.

Cats come in two poses. The head is the icon: it is what appears on the board, in the HUD, on the map and in the shop cards. The full body (the same head on a sitting body) is the cat itself: it appears in the restoration reveal and wherever a cat is presented on its own, such as the collection.

### Ghost and scenery

- The ghost cat is the cat head on a wavy hem, 12x14, in pale blue. It floats with a two-step up-and-down animation.
- The scenery is an 85x18 pixel strip (sky, stars, moon, two layers of hills, ground) built from a pixel map with six roles. Each world supplies a six-color palette, the same way cats do. The mockup shows three: teal, rose and gold.
- Draw both from data in the app (pixel map plus palette), like `CatSprite`, so a new world needs only a new palette.

### Lost level

When the last life is lost, a dark plum veil (`--veil`, 60%) comes over the page and stays until the player tries again, in two steps. After 0.4 s the ghost appears in the middle of the screen over a flat pixel shadow, floats up 143 px in 13 hard steps (whole pixels) with a slow 8 px sway, and fades out in five opacity steps, while the message (a cat-flavored title and a friendly line, one of four pairs picked from the time on the clock, so repeated losses do not read the same) and the Try again button show in the middle of the screen, just below where the ghost stood. The veil makes the pale ghost stand out on any zone color and draws the eye to the button. Only the button takes taps: the header stays reachable under the veil. With reduced motion there is no ghost and nothing animates. The fade is stepped, not smooth, to stay pixel art. Decided by the owner.

### Restoration sequence

Played when a Boss is beaten, over a full-screen neutral background (the cream card color). About 3.6 seconds, all in hard steps with no easing or fades, to stay pixel-art:

1. The ghost travels from its corner to the center, growing to twice its size (0.9 s, 8 steps).
2. The ghost turns into a black silhouette.
3. The silhouette flickers three times between the ghost's shape and the cat's shape.
4. The silhouette of the whole cat, full body, holds for a moment, then the cat appears in full color, blinking.
5. The cat's name, a line of text and the button to return to the map appear.
6. With the cat, the party starts and loops while the screen stays open: golden sunburst rays centered on the cat turn slowly behind it (15 degrees in five steps, which repeats seamlessly), 36 squares of confetti in the zone colors fall in six hard steps per leg, swaying, six little plus-shaped sparkles twinkle around the cat, and a big cheer ("OBA!" or "YAY!", coral with a darker coral shadow) bounces 8 px above it. The background stays plain before step 4 so the black silhouette shows. With reduced motion the rays and the cheer stand still, and there is no confetti or sparkle. Decided by the owner.

A silhouette is the same sprite with every pixel in one color (in CSS, `filter: brightness(0)` on the image). With reduced motion enabled, skip straight to step 5.

### Recolorable cats

An SVG loaded through `<img>` cannot be recolored with CSS, so cats are drawn by the `CatSprite` atom from data in `src/components/atoms/CatSprite/catSprites.ts`:

- One shared pixel map per pose (head 12x12, full body 16x18; one character per pixel, each character a role such as fur, patch or eye), in two frames: eyes open and eyes closed. The full body reuses the head rows, so a change to the head shows up in both.
- One palette per cat, mapping each role to a color.

A new world cat is a new palette entry and needs no new file. A hand-drawn shop cat can either bring its own pixel map (stays recolorable) or ship as a finished SVG file (fixed colors). The SVG files in `src/assets/` remain as reference and for places where a plain image is enough.

## Colors

Interface, night mode:

| Role | Hex |
| --- | --- |
| Background | `#2a1f3d` |
| Raised panel | `#3a2d54` |
| Card / light button | `#f6ecd4` |
| Primary action | `#ff7a59` |
| Coin / highlight | `#ffc94a` |
| Done / positive | `#58c7b5` |
| Muted text on dark | `#cbbfe0` |
| Text on light | `#17102a` |

Day mode neutrals, as used in the light row of the mockup **(proposed)**:

| Role | Hex |
| --- | --- |
| Background | `#f6ecd4` |
| Raised panel | `#e0cfa8` |
| Card / light button | `#ffffff` |
| Shadow under a card button | `#d9c9a3` |
| Muted text | `#5a4b70` |
| Board background, behind the cells | `#5a4b70` |
| Warning and error text | `#a8381f` (coral `#ff7a59` in night mode) |
| Text | `#2a1f3d` |
| Score and other gold text | `#7a4e00` |

The board background is not the raised panel in day mode: the light panel is almost the same color as the zones (zone 7, `#e2cfa6`, matches it exactly), so cells would merge into the board. Every zone needs at least 3:1 contrast against the board; `#5a4b70` gives 3:1 or more (zone 6, the darkest, is right at 3:1, so do not darken the day board further). In night mode the board stays on the raised panel color.

Gold text is the one accent that changes: the coin yellow is unreadable on a light background, so text that is gold in night mode uses a dark amber in day mode. Gold as a fill (buttons, the Boss step) stays the same.

The black silhouette of the restoration sequence needs a light backdrop in both modes, so that screen stays on the cream background even in night mode.

Button depth is a 4 px bottom shadow in a darker shade of the button's own color: `#cdbf9f` under cream, `#c9553a` under coral, `#d99a1c` under gold, `#3a9c8b` under teal.

Secondary buttons (cards, helps, shop actions, the level's round buttons) use their own tokens, `--button`, `--button-shadow` and `--button-text`. By day they are white on the cream page. At night they are a raised lilac, `#4a3b63` with a `#352b4d` shadow and cream text, so they sit quietly on the plum the way the white ones do on cream, and the coral Play stays the one that stands out. The chosen option in a choice group is teal at night (white by day), like a switch that is on. The cards behind each cat in the shop and the collection (`--cat-tile`) are a mid lilac at night, `#7d6d9f` with dark text, so dark cats stay visible without the card glowing; by day they keep the panel color. Decided by the owner.

Zones, in the order they are assigned:

`#f7a8b8` `#ffd66b` `#8ecdf7` `#a9dd8a` `#c9b3f5` `#ffb37a` `#3fb39c` `#e2cfa6` `#d5d3df`

Nine colors cover boards up to 9x9. Zones 9 to 11, for the 10x10 to 12x12 boards, reuse a color under a pattern of dark squares at 16% (`--zone-stripe`), in 3 px steps so they stay crisp:

| Zone | Base color | Pattern |
| --- | --- | --- |
| 9 | `#f7a8b8` (as zone 0) | checkerboard |
| 10 | `#8ecdf7` (as zone 2) | horizontal stripes |
| 11 | `#a9dd8a` (as zone 3) | vertical stripes |

This follows the "Boss 12x12" artboard, except that zone 9 is a checkerboard instead of diagonal stripes, which CSS blurs.

## Type

- Display (titles, numbers, button labels): Press Start 2P
- Body (rules, descriptions): Pixelify Sans

Both are on Google Fonts. For offline play, bundle the font files with the app instead of loading them from the network.

## Layout notes

- Designed for a 390 px wide phone screen, 24 px side padding.
- Board cells are separate tiles with a 6 px gap on a raised panel.
- Touch targets are at least 44 px.
- Corners are square: no `border-radius`, since curves are drawn with blurred edges and the mockup is square throughout.
- Depth is always a darker shade of the element's own color (or of the panel, `--panel-shadow`), never translucent black.
- Keyboard focus is the same everywhere: a 3 px gold outline, 2 px away from the element.
- The rules popover opens over the screen from the "!" button and closes on the next tap.
