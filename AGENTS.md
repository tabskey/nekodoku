# AGENTS.md

Nekodoku is a pixel-art logic puzzle for mobile browsers: place one cat per row, column and color zone, with no two cats touching. It is a personal, ad-free game, played as an installed PWA and hosted on GitHub Pages.

Read this file first. Consult the other two only when the task needs them:

- `docs/ARCHITECTURE.md`: stack, folder layout, layers, data model, storage, build and deploy pipeline, local container. Read before adding files, moving code, touching state and persistence, or changing the workflow or the `Dockerfile`.
- `docs/GAME_RULES.md`: puzzle rules, lives, score, helps, currencies, progression. Read before changing anything the player can see or feel. If code and this file disagree, the file wins; ask before changing the file.
- `docs/DESIGN.md`: mockup link, sprite list, colors, typefaces and layout notes. Read before building or restyling any screen.
- `docs/SPRITES.md`: canvas sizes, drawing and export rules for pixel art, Boss sceneries and their day and night palettes. Read before adding or changing any sprite.
- `docs/ROADMAP.md`: the seven project phases, with tasks and a "done when" list for each. Read to know which phase is in progress and what counts as finished.

`docs/FUTURE_BACKEND.md` describes what a server would add if the game ever grew, including serving the build with nginx. It is ideas only: do not implement anything from it unless the owner asks.

## How to work here

- The owner is building this hands-on. Propose small steps and explain the reasoning; do not generate whole features unprompted.
- Prefer the smallest solution that works. No new dependency without asking first.
- When a rule or number in `docs/GAME_RULES.md` is marked "proposed", treat it as a default that may change, and keep it in one constant so it is cheap to change.

## Commits and pull requests

Only the owner commits and opens pull requests. Never run `git commit`, `git push`, `git merge`, `gh pr create` or anything else that writes to git history or to GitHub. Your part is to write the text; the owner runs the commands.

Suggest text without being asked in these two moments:

1. **End of a roadmap phase.** When a phase's "done when" list is met, suggest the commit message.
2. **Every major change.** A new module, a change to the folder structure or the layers, a change to the data model or save schema, a change to a game rule, a change to the workflow or the container, or anything spanning several files. Suggest the commit message and the pull request report.

Commit message format:

```
<type>(<scope>): <summary in the imperative, under 72 characters>

<what changed and why, in one to three short lines>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Scope is the folder or area: `game`, `state`, `storage`, `ui`, `pwa`, `ci`, `docker`, `docs`.

Pull request report, always with these sections in this order:

```
## What
What was done, in two or three sentences.

## Why
The reason for the change: the roadmap phase, the rule or the problem it addresses.

## Where
- `path/to/file.ts`: what changed in it
- one line per file or folder touched

## How to test
The commands to run and what to check by hand on a phone, if anything.

## Notes
Decisions taken, anything left out on purpose, and follow-ups. Write "None" if empty.
```

## Hard constraints

- No backend. The app is static files only. Do not add API calls, accounts or analytics.
- No URL routes: GitHub Pages cannot rewrite paths. Screens are switched by state (see Routing on GitHub Pages in `docs/ARCHITECTURE.md`).
- The container is for local development only. Do not make the deploy depend on it, and do not add nginx to it.
- No ads, no real-money purchases, no energy or wait timers. Coins and fish are earned only by playing.
- Every generated puzzle must have exactly one solution. Never ship a generator change without the uniqueness tests passing.
- Game logic lives in `src/game/` as pure TypeScript with no React and no browser APIs.
- `localStorage` is touched only inside `src/storage/`.

## Conventions

- Code, identifiers, comments and commit messages in English.
- The game ships in two languages, Brazilian Portuguese (default) and English, chosen by the player in Options. No player-facing text is written directly in a component: every string goes through the translation files, with both languages filled in.
- Components follow atomic design (atoms, molecules, organisms, pages). Atoms and molecules are presentational: props in, events out, no game rules inside.
- Tests sit next to the file they test: `solver.ts` and `solver.test.ts`.
- Sprites follow the size rules at the top of `docs/SPRITES.md` (12x12 head, one full-body canvas for every cat). Never scale a sprite to a non-whole multiple.
- Art in `src/assets/` and in the mockup is placeholder. Do not polish or extend it; the owner replaces it with her own.
- No black outlines in the UI. Depth comes from a darker shade of the element's own color.

## Commands

Vite defaults; update this list if the scripts change.

- `npm run dev`: local dev server
- `npm test`: Vitest
- `npm run build`: production build into `dist/`
- `npm run lint`: ESLint
- `npm run format`: Prettier, writes files in place

In the container (replace `docker` with `podman` if that is the engine in use; `:Z` is for SELinux hosts and harmless elsewhere):

- `docker build -t nekodoku-dev .`: build the dev image
- `docker run --rm -it -p 5173:5173 -v "$PWD":/app:Z -v /app/node_modules nekodoku-dev npm run dev -- --host`: dev server at `http://localhost:5173`
- Same `run` command with `npm test`, `npm run lint` or `npm run build` at the end for the other scripts.

## Definition of done

- `npm test` and `npm run build` pass, locally and in the GitHub Actions workflow.
- New logic in `src/game/` or `src/state/` has tests.
- The game still works offline after the change.
