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
2. `npm ci --ignore-scripts` (no dependency needs an install script, and skipping them blocks a compromised package from running code), then `npm run lint`, `npm test`, `npm run build`.
3. On `main` only: `actions/upload-pages-artifact` with `dist/`, then `actions/deploy-pages`.

Pull requests run steps 1 and 2 only, so a broken change is caught before it reaches `main`.

A second job, `sonar`, runs in parallel on every push to `main` and on pull requests from this repository: it checks out the full history, runs the tests with coverage (`npm run test:coverage`, lcov in `coverage/`), and runs `SonarSource/sonarqube-scan-action` against SonarQube Cloud, configured by `sonar-project.properties` at the root. It is independent of `build` and `deploy`, so a Sonar outage or a failed quality gate never blocks publishing. It needs the `SONAR_TOKEN` repository secret, and **Automatic Analysis** must be off in the SonarQube Cloud project, since the workflow runs the analysis. Pull requests from forks get no secrets and skip it.

In the repository settings, **Settings → Pages → Source** must be **GitHub Actions**, not "Deploy from a branch". Using both makes them compete for the same site.

The Node version is the same in the workflow and in the container image (see below). Change both together.

### Routing on GitHub Pages

GitHub Pages cannot rewrite URLs: a request for a path that is not a real file returns 404. The app therefore has no URL routes. `MenuPage`, `WorldPage`, `GamePage`, `ShopPage`, `CollectionPage` and `OptionsPage` are switched by state, and the URL stays at `/<repo-name>/`.

If URL routes are ever added, use `HashRouter` (`/#/world/2`) or copy `index.html` to `404.html` in the build. Do not rely on server rewrites; see Serving with nginx in `docs/FUTURE_BACKEND.md`.

### Offline

The app is a PWA. `public/manifest.webmanifest` and the icons in `public/icons/` make it installable; the icons are placeholders scaled from a cat head by whole multiples.

The service worker is hand-written in `src/sw.js`, with no plugin. After each build, a small plugin in `vite.config.ts` lists every file in `dist/`, fills that list and a cache name (a hash of the build) into the worker and writes `dist/sw.js`. On install the worker caches every file, so the game plays offline from the first visit, the puzzle worker chunk included. It answers every request from the cache first, and on activate it deletes caches from older builds. It does not call `skipWaiting` on its own: a new build takes over only once every open copy of the game is closed, which on a phone can take weeks. So `src/pwa/update.ts` watches for a version waiting, and Options shows "Update the game" (with a dot on the menu's Options button) until the player takes it. The page sends the worker a `'skip'` message, then reloads when the new version has taken over. The button is not shown in the Options opened from inside a level, because the reload would lose the game. The worker is registered by `registerServiceWorker()` in `main.tsx`, in production builds only.

### Local container

A `Dockerfile` at the root gives a reproducible dev environment, so the project runs the same on any machine without installing Node on the host. It works unchanged with Podman.

- It is for development only: dev server, tests, lint and build. GitHub Pages ignores it, and the workflow does not use it.
- Base image `node:22-alpine`, `WORKDIR /app`, running as the image's unprivileged `node` user. Only `package.json` and `package-lock.json` are copied in, and `npm ci --ignore-scripts` runs at build time; the source arrives through the volume, so nothing else from the host lands in the image.
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
    atoms/       Cell, CatSprite, Heart, Button, CurrencyBadge
    molecules/   HudBar, ProgressStrip, HelpButton
    organisms/   Board, RulesPopover, ShopGrid
  pages/         MenuPage, WorldPage, GamePage, ShopPage, CollectionPage, OptionsPage
  i18n/          pt.ts, en.ts and the useText hook
  audio/         sound effects synthesized with the Web Audio API
  pwa/           service worker registration and the update offer
  assets/        SVG sprites
  sw.js          service worker template, filled in at build time
public/          manifest.webmanifest and icons/
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

The board uses Pointer Events, which cover touch, mouse and pen with one code path. What a touch means (tap, double tap, stroke, or nothing after a hold) is decided by plain functions in `components/organisms/Board/touch.ts`, tested without a browser; the board itself only tracks fingers and cells.

- On `pointerdown`, the board captures the pointer and remembers the starting cell. On `pointermove`, it finds the cell under the finger with `document.elementFromPoint` and a `data-index` attribute on each cell, and collects each new index once.
- If the pointer is released on the starting cell without having entered another one, it is a tap: `onCellTap(index)`, sent immediately.
- A second tap on the same cell within 300 ms **(proposed)** also sends `onPlaceCat(index)`. The reducer turns that cell into a cat, overriding what the first tap did, so the player never waits for a timer.
- Holding the pointer on one cell for 450 ms **(proposed)** without leaving it sends `onPlaceCat(index)` and swallows the tap that would follow on release. Leaving the cell before that cancels the hold and the touch becomes a stroke.
- Cells disable text selection and the long-press callout (`user-select: none`, `-webkit-touch-callout: none`) and cancel the context menu, so holding a cell never opens a system menu on Android or iPhone.
- Otherwise it is a stroke. The mode comes from the starting cell (empty: `mark`; marked: `erase`), and the board calls `onStroke(mode, indices)` once, on `pointerup`, so the whole stroke is one reducer action and one undo step.
- The board shows the cells being stroked as a live preview while the finger moves, without touching the reducer.
- On the world map, a horizontal swipe (more than about 50 px) changes world; the map sets `touch-action: pan-y` so vertical scrolling still works. A tap on a tile is never treated as a swipe.
- `touch-action: none` on the board stops the page from scrolling or zooming while the player drags.
- Boards of 10x10 and up have a zoom button. Zoomed, cells are 44 px (the cat at 3x) inside a square window, and two fingers pan it: a second finger cancels the stroke in progress, and the midpoint of the two fingers scrolls the window. A one-finger drag stays a stroke. Zoom has two fixed steps, not a pinch, so sprites keep whole multiples.
- `storage/` is the only place that touches `localStorage`.

## Data model

```ts
type CellMark = 'empty' | 'marked' | 'cat';

// What the solver works on. It has no solution: solve() exists to find it,
// and test fixtures with zero or several solutions have none to give.
interface Puzzle {
  size: number;        // N, board is N x N
  zones: number[];     // length N*N, zone id 0..N-1 per cell, row-major
}

// What the game plays. Only generatePuzzle() creates it, after solve()
// confirms exactly one solution, so no level reaches the player without one.
interface SolvedPuzzle extends Puzzle {
  solution: number[];  // length N, cell index of the cat in each row
}

interface LevelState {
  level: number;
  puzzle: SolvedPuzzle; // the reducer checks placed cats against the solution
  marks: CellMark[];   // length N*N
  lives: number;
  score: number;
  elapsedSeconds: number;
  status: 'playing' | 'won' | 'lost';
}

interface SaveData {
  schemaVersion: number;
  levelsCleared: number;
  winStreak: number; // levels won in a row with no loss, version 3
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
    music: boolean; // version 2
  };
}
```

`isValidPlacement`, `countSolutions` and `solve` take a `Puzzle`. A `SolvedPuzzle` is also a `Puzzle`, so the solver accepts both.

## Puzzle generation

A level's puzzle is a pure function of its level number: `generatePuzzle(level)` seeds a deterministic RNG with the level, so level 12 is the same board every time and puzzles are never stored. It returns a `SolvedPuzzle`.

1. Pick a valid cat placement: one per row and column, no two in adjacent rows within one column of each other.
2. Grow one zone outward from each cat until the board is full. Zone sizes are free and uneven.
3. Count solutions with the solver, stopping at 2.
4. If there is more than one solution, repair the zones (move a border cell so the alternative solution breaks) or retry with the next RNG draw.
5. Attach the solution confirmed by the solver and return the `SolvedPuzzle`.

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
- `schemaVersion` starts at 1. Any change to the shape adds a migration function in `storage/migrations.ts`; never read an old save without migrating it. Version 2 added `options.music`, on by default. Version 3 added `winStreak`, starting at none: levels won in a row, new or replayed, with no loss in between (see Win streak in `docs/GAME_RULES.md`).
- The profile is saved after every profile action. A level in progress is never saved, by design: `LevelState` lives only in memory and is discarded when the level is closed (see `docs/GAME_RULES.md`).
- Reads and writes are wrapped in `try/catch`. If storage is unavailable the game still runs with an in-memory profile.
- Two copies of the game can be open on one device (the installed app and a browser tab share storage). When one saves, the others get the browser's `storage` event and reload the profile, so a copy left open never overwrites newer progress with its old one. The listener ignores a save it cannot read (one from a newer version), and a save that cannot be read at load is first copied to `nekodoku.save.unreadable` before a fresh profile replaces it, so an older copy of the game never wipes a newer save.
- A save, or a backup code, with more than 10,000 levels cleared is rejected as invalid (`MAX_LEVELS_CLEARED`): finding a level's world walks the worlds one by one, and a hand-edited huge count would freeze the game on every launch.
- Data lasts until the browser's site data is cleared. iOS Safari may also clear it for sites not opened for a while unless the app is installed to the home screen, which is why the PWA install and the backup code both matter.

### Backup code

Export encodes the `SaveData` JSON as a base64url string followed by a dot and an 8-digit hex checksum (`src/storage/backup.ts`), which the player can copy. Spaces and line breaks added while copying are ignored on import. Import verifies the checksum (catching a mistyped or truncated code), decodes, validates the shape, runs migrations, shows a summary of what the code contains and replaces the profile after an in-page confirmation. No server is involved.

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
- Reducers do not play sounds. A small effect in the page layer watches state transitions (a cat was placed, a life was lost, the level was won) and calls `play()`. For a level this is the `useLevelAudio` hook next to `GamePage`, which also starts the music and times the restoration's sounds; which sound a change makes is the pure, tested `levelSound`. This keeps `game/` and `state/` free of side effects and their tests silent.
- Respect the system: no sound plays while the page is hidden.
- Music is data too, in `src/audio/songs.ts`: each song is voices of `[note, beats]` at a tempo. `startMusic(song)` books notes a fraction of a second ahead on the audio clock and loops; `stopMusic()` ends it. A song can have an introduction that plays once (`loopFromBeat`): the celebration song builds up for 6 beats, which at its tempo is the 3.1 s before the cat appears in the restoration, then loops. A song with `once` plays through and stops; the sad song for a lost level does. The level page starts it while playing and stops it otherwise; `options.music` (save version 2) switches it off.

## Testing

- `game/`: unit tests for rules, solver and generator. The generator test asserts a unique solution for a wide range of levels and every board size.
- `state/`: reducer tests for lives, score, win and loss, helps and purchases.
- `storage/`: migration and backup round-trip tests.
- Components: light. Their logic is in the layers above.
- Coverage: SonarQube Cloud's quality gate asks for 80% coverage on new code. It is measured on `src/game/`, `src/storage/` and the reducers in `src/state/`, where the rules live. Components, pages, text files and the browser glue (providers, hooks around timers and workers, `App.tsx`, `main.tsx`) are listed in `sonar.coverage.exclusions` in `sonar-project.properties`: still analyzed for bugs and security, not counted for coverage. New logic goes in the covered layers, never in a component to dodge the rule.
- Duplication: the gate allows 3% duplicated code on new code. `src/i18n/pt.ts` and `src/i18n/en.ts` are listed in `sonar.cpd.exclusions`, because the same keys in the same order is how the translations stay in sync, not copied code.