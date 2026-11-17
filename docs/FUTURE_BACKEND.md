# Future backend

Status: ideas only. Nothing here is planned or scheduled, and none of it should be implemented without the owner asking. The game today is static files with no server, by decision (see `AGENTS.md`).

This document records what a server would add, how it would be built, and what the current code already does to make that step cheap. It exists so the option is thought through, and as a portfolio note on how the design would scale.

## What a server would make possible

| Capability | Why it needs a server |
| --- | --- |
| Cloud save and sync across devices | Progress has to live somewhere other than one browser |
| Accounts | Something has to identify the same player on two devices |
| Tamper-proof progress | A signing key or the source of truth must be out of the player's reach |
| Leaderboards and friends' progress | Scores must be comparable and trusted |
| Daily puzzle shared by everyone | One seed per day, chosen centrally |
| Remote tuning | Change prices, rewards and progression without a new release |

Without a server, none of these can be trusted: any key or rule shipped to the browser is readable by the player. This is why the backup code is plain text with a checksum and is not encrypted.

## When it would be worth it

Add a backend only when one of these becomes true:

- Players other than the owner use the game regularly and ask for sync.
- Progress is compared between people (ranking, friends), so cheating affects someone else.
- The game is published in an app store or sold.

Until then, the backup code covers the real need.

## Proposed shape

- **API:** .NET Minimal API, REST, JSON. The surface is small enough that controllers and layers would be overhead.
- **Database:** PostgreSQL. One `players` table and one `saves` table cover the first version.
- **Auth:** start with an anonymous player id created on first launch, stored on the device. Offer sign-in (Google or Apple) later, linking the anonymous id to the account so no progress is lost.
- **Hosting:** any container host with a managed Postgres. The frontend stays on static hosting.

First endpoints:

| Method and path | Purpose |
| --- | --- |
| `POST /players` | Create an anonymous player, return its id and token |
| `GET /players/me/save` | Fetch the latest save |
| `PUT /players/me/save` | Upload a save, with its version number for conflict detection |
| `POST /levels/{level}/completions` | Report a cleared level for server-side validation |
| `GET /daily` | Today's puzzle seed |
| `GET /leaderboards/{boardSize}` | Best times for a board size |

## Trusting progress

The client is never trusted. Because a level's puzzle is a pure function of its level number, the server can regenerate the same puzzle from the seed and check a reported solution itself.

- The client sends the level number, the cat positions, the number of mistakes and the elapsed time.
- The server regenerates the puzzle, validates the positions and grants the coins and fish.
- Currency balances live on the server. The client only displays them.
- Times that are impossibly short are rejected or flagged.

This requires the generator to give identical results on client and server. Either the server runs the same TypeScript module (Node), or the generator is ported to C# with a shared set of test vectors (level number in, puzzle out) that both implementations must pass.

## Sync rules

- The save keeps a version number that increases on every change.
- On upload, a save older than the server's is rejected and the client is offered the newer one.
- When two devices diverge, keep the one with more levels cleared and tell the player which was kept. Do not merge field by field in the first version.
- The game stays fully playable offline; sync happens when a connection is available.

## What the current design already does for this

- `localStorage` is touched only inside `src/storage/`. A remote save becomes a second implementation behind the same functions, with no change to reducers or components.
- `SaveData` carries a `schemaVersion` and migrations, which a server needs as much as the client does.
- Puzzles come from a seed and are never stored, so there is nothing to upload per level and the server can verify results.
- Game rules live in `src/game/` with no browser dependencies, so the same module can run on a server.
- Prices, rewards and progression sit in constants, ready to be replaced by values fetched from the server.

## If the game were sold or published

Points to settle before that, outside the code:

- **Packaging:** a PWA can be wrapped for the app stores (Trusted Web Activity on Android, a native wrapper such as Capacitor on iOS). Store review rules apply.
- **Business model:** the game's identity is no ads and no pay-to-progress. A one-time paid app or paid cosmetic packs fit that; energy timers and paid helps do not.
- **Privacy:** accounts mean personal data. A privacy policy and compliance with LGPD (and the stores' data declarations) become necessary.
- **Name and originality:** the puzzle type is a known genre, which is fine to build on. The name, art and text must be original, and the name "Nekodoku" should be checked for existing trademarks and apps before publishing.
- **Costs:** hosting, the developer accounts for each store, and support time.
