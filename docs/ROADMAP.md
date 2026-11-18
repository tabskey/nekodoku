# Roadmap

The project is built in seven phases. Each phase ends with something that runs and can be checked, and each one only depends on the phases before it. Finish a phase's "done when" list before starting the next.

Read `docs/ARCHITECTURE.md` for where code goes and `docs/GAME_RULES.md` for how the game behaves.

## Phase 1: Setup

Goal: an empty app that deploys itself.

- Create the repository and scaffold with Vite (`react-ts` template).
- Add ESLint, Prettier and Vitest.
- Create the folder layout from `docs/ARCHITECTURE.md`, with `AGENTS.md` at the root and the docs in `docs/`.
- Copy the SVG sprites into `src/assets/`.
- Set Vite's `base` to the repository name.
- Add the GitHub Actions workflow `.github/workflows/deploy.yml`: on pull requests it runs lint, tests and build; on every push to `main` it also publishes `dist/` to GitHub Pages (see Build and deploy in `docs/ARCHITECTURE.md`).
- In the repository settings, set **Pages → Source** to **GitHub Actions**.
- Add the `Dockerfile` and `.dockerignore` for the local dev container (see Local container in `docs/ARCHITECTURE.md`).

Done when:
- A push to `main` publishes a page that opens on a phone at the GitHub Pages URL.
- `npm test`, `npm run lint` and `npm run build` pass locally and in the workflow.
- A pull request with a failing test shows a failed check and does not publish.
- The dev server runs from the container (Docker or Podman) and reloads when a file is edited on the host.

## Phase 2: Rules and solver

Goal: the code can tell whether a board is valid and how many solutions it has. No UI.

- Define the `Puzzle` and `SolvedPuzzle` types in `src/game/` (see Data model in `docs/ARCHITECTURE.md`). The solver works on `Puzzle`, which has no solution field.
- `isValidPlacement(puzzle, cats)`: one cat per row, column and zone, none touching.
- `countSolutions(puzzle, limit)`: backtracking search that stops at `limit`.
- `solve(puzzle)`: returns the solution, or nothing if there is not exactly one.
- Hand-write a few small fixture puzzles: one with a unique solution, one with several, one with none. They can be smaller than the game's boards (4x4 is fine) so they stay checkable by hand.
- Add one 9x9 fixture for the timing check below.

Done when:
- Tests cover each rule on its own (row, column, zone, side contact, diagonal contact).
- Tests confirm the solver's answer on all fixtures.
- `countSolutions` on a 9x9 fixture runs in a few milliseconds.

## Phase 3: Generator

Goal: `generatePuzzle(level)` returns a valid, unique `SolvedPuzzle`, always the same one for the same level.

- Seeded random number generator in `src/game/rng.ts`.
- Random valid cat placement.
- Zone growth from each cat, with uneven sizes.
- Uniqueness loop: check with the solver, then repair or retry. Attach the solution the solver confirmed.
- `levelConfig(level)` in `src/game/progression.ts`: returns the world, board size and number of starting cats for a level, read from a worlds data table, and, past the end of the table, from the rule for later worlds (longer worlds, capped length; see Progression in `docs/GAME_RULES.md`). Test that world lengths never decrease and never pass the cap.

Done when:
- A test generates levels 1 to 200 and asserts each has exactly one solution, that it matches the attached `solution`, and that zones are contiguous.
- Calling `generatePuzzle(n)` twice returns identical puzzles.
- Boards up to 10x10 generate without a visible wait on a phone.
- 11x11 and 12x12 generate in a Web Worker behind a loading state, and the time is measured on a real phone.

## Phase 4: Playable board

Goal: one level can be played from start to finish on a phone.

- Text through `useText()` from the first component, with Portuguese and English files (see Languages in `docs/ARCHITECTURE.md`).
- Theme tokens: every color as a CSS variable, with night and day values switched by `data-theme` (see Themes in `docs/DESIGN.md`).
- Atoms: `Cell`, `CatSprite`, `Button`. `CatSprite` plays the idle frames (open eyes with an occasional blink), shows the happy frame on a correct move, and applies the centering shift (see Head frames and Centering the head in `docs/SPRITES.md`).
- Organism: `Board`, presentational, with tiles separated by a gap.
- `levelReducer` with `tapCell` (empty -> x, x -> empty, cat -> empty), `placeCat` (from double tap or press and hold), `strokeCells` (drag to mark or erase x) and win detection.
- Board input with Pointer Events: tap versus stroke, live preview during the stroke (see Board input in `docs/ARCHITECTURE.md`).
- `GamePage` wiring the reducer to the board for a fixed level.
- Molecule: `ProgressStrip` (cat silhouettes filling in).

Done when:
- A 5x5 level can be solved by touch on Android and iPhone.
- Cells are comfortable to tap on a 5x5 and usable on a 9x9.
- Reducer tests cover single tap, placing a cat, strokes (cats skipped, each cell once, erase mode) and the win condition.
- Dragging across a row of a 9x9 board marks it in one stroke on Android and iPhone, without scrolling the page.
- Double tap and press and hold both place a cat on Android and iPhone, and holding never opens a system menu.
- The cat's nose sits on the center of its cell at 2x and 3x, and the sprite stays crisp.

## Phase 5: Lives, score, timer and helps

Goal: a level has stakes.

- Mistake handling in the reducer: reject the cat, keep the x, remove a life, subtract points.
- Lost state after 3 mistakes, with immediate retry and no limit.
- Timer that runs only while the level is being played.
- Atom `Heart`, molecule `HudBar` (lives, score, time, coins).
- Helps: Reveal and Eraser, each with its coin cost. Eraser is free when there is nothing to erase.
- `RulesPopover` behind the "!" button.
- Auto-mark option, off by default.
- Options screen: language (Portuguese or English), mode (night or day), sound effects on or off, auto-mark. The sound option is saved now; the effects themselves come in phase 7.

Done when:
- Reducer tests cover mistakes, loss, retry, both helps and auto-mark.
- Losing a level never blocks the player from trying again.

## Phase 6: Progression, shop and save

Goal: the game remembers the player and gives them something to earn.

- `profileReducer`: levels cleared, coins, fish, owned cats, selected cat, best times, options.
- `src/storage/`: load and save under one versioned key, with a migration hook.
- Level flow: win screen with rewards, next level, a Boss at the end of each world.
- Starting cats on the levels that the worlds table marks.
- `MenuPage` with the current world and the path to its Boss.
- Replaying: world selector on the map, every tile open in cleared worlds, best score per level, reward only when the best score is beaten, restored cat beside a beaten Boss.
- `ShopPage`: cats bought with fish, cats unlocked by progress, helps priced in coins.
- Backup code: export as text, import with validation and an in-page confirmation.

Done when:
- Closing and reopening the app keeps all progress.
- A backup code exported on one device restores the same profile on another.
- Storage tests cover save, load, migration and the backup round trip.
- The game still runs, without saving, when `localStorage` is unavailable.

## Phase 7: PWA and polish

Goal: it feels like an installed game.

- Web app manifest, icons and a service worker that caches the app for offline play.
- Install check on Android and iPhone, and offline check in airplane mode.
- World map walk: the selected cat walks along the path between tiles after a level is cleared, with the side-view walk cycle of its body type.
- Boss scenery, ghost and restoration sequence, with the rotation of scenery drawings and the day and night palettes (see `docs/SPRITES.md`).
- Zone textures or patterns for boards with more than 8 zones, up to the 12 zones of the largest board.
- Zoom or an alternative input for 10x10 to 12x12 boards, where cells are smaller than a comfortable touch target.
- Pixel-art pass on all screens: no black outlines, consistent spacing, blink timing.
- Small feedback touches: shake on a mistake, a short win animation.
- Sound effects for every moment listed under Sound in `docs/GAME_RULES.md`, synthesized in `src/audio/`, with the on/off option working and saved.

Done when:
- The game installs to the home screen on both platforms and plays with no network.
- Every zone is distinguishable on the largest board.

## Later, not scheduled

- Lamp help, built on a human-style solver that explains the next logical step.
- Difficulty grading of generated levels using that same solver.
- More cats and cosmetic themes.
- Serving the production build from an nginx container, for hosting outside GitHub Pages or alongside a backend (see Serving with nginx in `docs/FUTURE_BACKEND.md`).