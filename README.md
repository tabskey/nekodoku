# Nekodoku

A pixel-art logic puzzle for mobile browsers: place one cat per row, column and color zone, with no two cats touching. Personal, ad-free, and playable offline once installed.

**Play:** https://tabskey.github.io/nekodoku/

## Help wanted: iPhone testers 🐱

The game is built and tested on Android, but nobody on the project has an iPhone. If you have one, a few minutes of testing in Safari would help a lot:

1. Open the link above and solve level 1 (5x5).
2. **Tap** an empty cell: an x appears. Tap the x: it disappears.
3. **Double tap** a cell, and **press and hold** another: both should place a cat.
4. Holding a cell must **not** open a menu, a magnifier or select text.
5. Reach level 5 (9x9) and **drag** a finger across a row: every cell should get an x in one stroke, and the page must not scroll or zoom.
6. Do the cats look sharp, not blurry?

Please open an [issue](https://github.com/tabskey/nekodoku/issues) with your iPhone model, iOS version, and what worked or did not. Screenshots or a short screen recording are very welcome. Thank you!

## Development

See `AGENTS.md` for how the project is organized, and `docs/` for the architecture, game rules, design and roadmap.

```sh
npm install
npm run dev    # local dev server
npm test       # Vitest
npm run build  # production build into dist/
npm run lint   # ESLint
```
