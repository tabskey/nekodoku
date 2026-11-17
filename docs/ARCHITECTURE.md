# Architecture

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite |
| UI | React + TypeScript |
| Tests | Vitest |
| State | `useReducer` + Context, no state library |
| Persistence | `localStorage`, one versioned key |
| Offline / install | PWA (service worker + manifest) |
| CI / deploy | GitHub Actions: lint, test, build, publish to GitHub Pages |
| Local container | Docker / Podman, development only (not used by GitHub Pages) |
| Hosting | GitHub Pages, static files only |

There is no backend. GitHub Pages serves the app from `/<repo-name>/`, so Vite's `base` must be set to that path and every asset URL must be relative to it.

## Build and deploy

### Pipeline

One workflow in `.github/workflows/deploy.yml`, triggered on every push to `main` and on pull requests:

1. `actions/checkout`, then `actions/setup-node` with npm cache.
2. `npm ci`, `npm run lint`, `npm test`, `npm run build`.
3. On `main` only: `actions/upload-pages-artifact` with `dist/`, then `actions/deploy-pages`.

Pull requests run steps 1 and 2 only, so a broken change is caught before it reaches `main`.

In the repository settings, **Settings → Pages → Source** must be **GitHub Actions**, not "Deploy from a branch". Using both makes them compete for the same site.

The Node version is the same in the workflow and in the container image (see below). Change both together.

### Routing on GitHub Pages

GitHub Pages cannot rewrite URLs: a request for a path that is not a real file returns 404. The app therefore has no URL routes. `MenuPage`, `GamePage` and `ShopPage` are switched by state, and the URL stays at `/<repo-name>/`.

If URL routes are ever added, use `HashRouter` (`/#/world/2`) or copy `index.html` to `404.html` in the build. Do not rely on server rewrites; see Serving with nginx in `docs/FUTURE_BACKEND.md`.

### Local container

A `Dockerfile` at the root gives a reproducible dev environment, so the project runs the same on any machine without installing Node on the host. It works unchanged with Podman.

- It is for development only: dev server, tests, lint and build. GitHub Pages ignores it, and the workflow does not use it.
- Base image `node:22-alpine`, `WORKDIR /app`, `npm ci` at build time.
- The source is mounted as a volume so edits on the host reach the dev server. `node_modules` stays inside the container (anonymous volume) so host and container never share native binaries.
- The dev server must listen on all interfaces inside the container: `npm run dev -- --host`.
- On SELinux hosts (Fedora, Bazzite) the bind mount needs the `:Z` suffix.
- If file changes are not picked up, enable polling in Vite (`server.watch.usePolling`) for container runs only.

There is no `docker-compose.yml`: with one service, a short `run` command is enough. Add one only if a second service appears.

Serving the production build from a container (nginx) is not part of the project today; see `docs/FUTURE_BACKEND.md`.

## Folder layout

```
.github/
  workflows/     deploy.yml
src/
  game/          pure TypeScript: rules, solver, generator, progression
  state/         reducers and context providers
  storage/       localStorage access, save schema, migrations, backup code
  components/
    atoms/       Cell, CatSprite, Heart, Button, CoinBadge
    molecules/   HudBar, ProgressStrip, HelpButton
    organisms/   Board, RulesPopover, ShopGrid
  pages/         MenuPage, GamePage, ShopPage
  i18n/          pt.ts, en.ts and the useText hook
  audio/         sound effects synthesized with the Web Audio API
  assets/        SVG sprites
docs/
Dockerfile
.dockerignore    node_modules, dist, .git
```

## Layers and dependency rule

Dependencies point one way:

```
pages -> organisms -> molecules -> atoms
pages -> state -> game
state -> storage
```

- `game/` imports nothing from the rest of the app. No React, no DOM, no `localStorage`, no `Math.random` (it takes a seeded RNG).
- `components/` never import from `game/` except for types. They receive ready-to-render props and emit events.
- `Board` is presentational: it receives the cells and calls `onCellTap(index)`, `onPlaceCat(index)` and `onStroke(mode, indices)`. It does not know the rules. The reducer decides what a tap or a stroke means.

### Board input

The board uses Pointer Events, which cover touch, mouse and pen with one code path.

- On `pointerdown`, the board captures the pointer and remembers the starting cell. On `pointermove`, it finds the cell under the finger with `document.elementFromPoint` and a `data-index` attribute on each cell, and collects each new index once.
- If the pointer is released on the starting cell without having entered another one, it is a tap: `onCellTap(index)`, sent immediately.
- A second tap on the same cell within 300 ms **(proposed)** also sends `onPlaceCat(index)`. The reducer turns that cell into a cat, overriding what the first tap did, so the player never waits for a timer.
- Holding the pointer on one cell for 450 ms **(proposed)** without leaving it sends `onPlaceCat(index)` and swallows the tap that would follow on release. Leaving the cell before that cancels the hold and the touch becomes a stroke.
- Cells disable text selection and the long-press callout (`user-select: none`, `-webkit-touch-callout: none`) and cancel the context menu, so holding a cell never opens a system menu on Android or iPhone.
- Otherwise it is a stroke. The mode comes from the starting cell (empty: `mark`; marked: `erase`), and the board calls `onStroke(mode, indices)` once, on `pointerup`, so the whole stroke is one reducer action and one undo step.
- The board shows the cells being stroked as a live preview while the finger moves, without touching the reducer.
- On the world map, a horizontal swipe (more than about 50 px) changes world; the map sets `touch-action: pan-y` so vertical scrolling still works. A tap on a tile is never treated as a swipe.
- `touch-action: none` on the board stops the page from scrolling or zooming while the player drags. When board zoom arrives for large boards, panning uses two fingers so a one-finger drag stays a stroke.
- `storage/` is the only place that touches `localStorage`.

## Data model

```ts
type CellMark = 'empty' | 'marked' | 'cat';

interface Puzzle {
  size: number;        // N, board is N x N
  zones: number[];     // length N*N, zone id 0..N-1 per cell, row-major
  solution: number[];  // length N, cell index of the cat in each row
}

interface LevelState {
  level: number;
  puzzle: Puzzle;
  marks: CellMark[];   // length N*N
  lives: number;
  score: number;
  elapsedSeconds: number;
  status: 'playing' | 'won' | 'lost';
}

interface SaveData {
  schemaVersion: number;
  levelsCleared: number;
  coins: number;
  fish: number;
  ownedCats: string[];
  selectedCat: string;
  bestTimes: Record<number, number>; // board size -> seconds
  bestScores: Record<number, number>; // level -> best score, for replay rewards
  options: {
    autoMark: boolean;
    theme: 'system' | 'light' | 'dark';
    language: 'system' | 'pt' | 'en';
    sound: boolean;
  };
}
```

## Puzzle generation

A level's puzzle is a pure function of its level number: `generatePuzzle(level)` seeds a deterministic RNG with the level, so level 12 is the same board every time and puzzles are never stored.

1. Pick a valid cat placement: one per row and column, no two in adjacent rows within one column of each other.
2. Grow one zone outward from each cat until the board is full. Zone sizes are free and uneven.
3. Count solutions with the solver, stopping at 2.
4. If there is more than one solution, repair the zones (move a border cell so the alternative solution breaks) or retry with the next RNG draw.

Cost grows quickly with board size, because a unique solution gets rarer as the board grows. A quick prototype of this approach, measured on a desktop-class machine over 40 seeds per size:

| Board | Median | Slowest |
| --- | --- | --- |
| 9x9 | under 1 ms | 45 ms |
| 10x10 | 4 ms | 63 ms |
| 11x11 | 12 ms | 0.7 s |
| 12x12 | 90 ms | 1.4 s |

A phone is several times slower, so 11x11 and 12x12 can take seconds in the worst case. For that reason:

- The largest board is 12x12.
- Generation of large boards runs in a Web Worker so the interface never freezes, with a short loading state on the level screen.
- The next level can be generated ahead of time while the player is on the world map.
- Asking the generator for harder boards (no single-cell zones) costs more attempts; measure again when that is added.

The solver is a row-by-row backtracking search with column and zone bitmasks. It is the source of truth for uniqueness and has the heaviest test coverage in the project.

A later, separate "human-style" solver (explains the next logical step) will power the lamp help and difficulty grading. It is out of scope until the basic game is playable.

## State

Two reducers, each behind its own context:

- `levelReducer`: the level being played. Actions: `tapCell`, `placeCat`, `strokeCells`, `useReveal`, `useEraser`, `tick`, `restart`.
- `profileReducer`: everything that outlives a level. Actions: `levelCleared`, `spendCoins`, `buyCat`, `selectCat`, `setOption`, `importSave`.

Reducers call into `game/` for decisions and contain no rule logic of their own.

## Persistence

- One key, `nekodoku.save`, holding `SaveData` as JSON.
- `schemaVersion` starts at 1. Any change to the shape adds a migration function in `storage/migrations.ts`; never read an old save without migrating it.
- The profile is saved after every profile action. A level in progress is never saved, by design: `LevelState` lives only in memory and is discarded when the level is closed (see `docs/GAME_RULES.md`).
- Reads and writes are wrapped in `try/catch`. If storage is unavailable the game still runs with an in-memory profile.
- Data lasts until the browser's site data is cleared. iOS Safari may also clear it for sites not opened for a while unless the app is installed to the home screen, which is why the PWA install and the backup code both matter.

### Backup code

Export encodes the `SaveData` JSON as a base64url string followed by a short checksum, which the player can copy. Import verifies the checksum (catching a mistyped or truncated code), decodes, validates the shape, runs migrations, shows a summary of what the code contains and replaces the profile after an in-page confirmation. No server is involved.

The code is a snapshot of the moment it was generated; it does not update itself. It is deliberately not encrypted: any key shipped to the browser is readable by the player, so encryption would only obscure the content. Tamper-proof progress needs a server; see `docs/FUTURE_BACKEND.md`.

## Languages

Two languages, Portuguese and English, with no i18n library:

- `src/i18n/pt.ts` and `src/i18n/en.ts` each export one flat object of strings. `pt.ts` defines the keys; `en.ts` is typed against it, so a missing translation is a compile error.
- A `useText()` hook returns the object for the current language. Components read `text.play`, never a literal.
- The language comes from `options.language`; `'system'` resolves from `navigator.language`, falling back to Portuguese.
- Strings with a number in them are small functions: `levelLabel: (n: number) => ...`.
- `src/game/` produces no player-facing text. It returns data and the components choose the words.

## Sound

Sound effects are synthesized at runtime with the Web Audio API: short oscillator notes (square and triangle waves) with quick volume envelopes. No audio files and no library, so nothing to download, license or cache.

- `src/audio/` holds one `AudioContext`, created lazily on the first user tap, and a `play(effect)` function. Effects are named, not built inline: `play('placeCat')`, `play('mistake')`.
- Each effect is data: a list of notes (frequency, duration, wave type, volume). Changing a sound means editing numbers, not code.
- `play()` does nothing when `options.sound` is off, when the context is not yet unlocked, or when the browser has no Web Audio. It never throws.
- Reducers do not play sounds. A small effect in the page layer watches state transitions (a cat was placed, a life was lost, the level was won) and calls `play()`. This keeps `game/` and `state/` free of side effects and their tests silent.
- Respect the system: no sound plays while the page is hidden.

## Testing

- `game/`: unit tests for rules, solver and generator. The generator test asserts a unique solution for a wide range of levels and every board size.
- `state/`: reducer tests for lives, score, win and loss, helps and purchases.
- `storage/`: migration and backup round-trip tests.
- Components: light. Their logic is in the layers above.
