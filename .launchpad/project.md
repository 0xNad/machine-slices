---
title: Machine Slices
payout: top3-60-25-15
pick: creator-in-judging
build_hours: 48
reveal_hours: 12
rank_hours: 12
---

# Pitch

One generative machine artwork, divided into 1,000 individually collectible slices on Ethereum. Every slice is a window into the same animated mechanical organism, sharing its runtime, seed and clock; together they reveal the complete work. Artwork code and seeds live onchain, with a self-contained browser renderer.

# Round 1: The machine

prize: 1000000
criteria:
- Artistic coherence (counts double): one compelling mechanical organism across the complete work
- Motion: purposeful rhythms and connections across the composition
- Slice quality: interesting individual regions that belong to the whole
- Code quality: a clear shared runtime that later rounds can extend

Build the first working version of the shared machine and browser viewer. Keep the composition an abstract mechanical organism; visual language, palette and internal drawing technique are yours. Implement the exact interface below. Do not implement tokens, wallets, or the full slice gallery in this round.

## Fixed round 1 interface

- `npm ci --ignore-scripts` installs registry-only locked dependencies. `npm run build` emits browser modules under `dist/`. Build and checks must run offline after installation, without lifecycle installation scripts.
- `npm start -- --port 4173` is equivalent to `node server.mjs --port 4173`; the server binds loopback, serves `/` and `/dist/runtime.js`, and keeps running until stopped. Checks use an available port. Success is HTTP 200; unknown paths are 404. Invalid CLI flags or ports exit nonzero with a reason on stderr.
- `src/runtime.ts` exports synchronous `renderFrame(canvas, { seed, timeMs, viewport }): void`, compiled to the named export at `/dist/runtime.js`. `canvas` is an HTMLCanvasElement with positive integer dimensions. The function completely redraws an opaque Canvas 2D image and preserves canvas dimensions. Do not require a WebGL context, external fonts, images, or network resources.
- `seed` is `0x` followed by exactly 64 hexadecimal digits (case-insensitive); `timeMs` is a finite nonnegative number. `viewport` is `{ x, y, width, height }`, all finite numbers; origins are nonnegative, extents positive, and x+width and y+height do not exceed 2000. Invalid seeds, times, or viewports throw an Error with a nonempty message. Validate before rendering. Missing/null/nonnumeric values are invalid.
- Map the viewport to the entire canvas, supporting arbitrary positive canvas sizes. The world is 2000 × 2000 logical units. At equal scale, a slice matches the corresponding whole-world crop. Tests compare at scale 1 using a 2px inset to avoid clipping-edge artefacts, RGBA channel tolerance 2, and at most 0.5% differing channels.
- No dependence on Date.now(), Math.random(), DOM state, previous render calls, or frame count inside the renderer. Wall-clock scheduling belongs only to the viewer. Same seed, explicit time, and viewport must yield identical pixels within the pinned browser; cross-browser pixel identity is not required.
- A valid frame is fully opaque and contains at least eight distinct RGBA colors. Seeds `0x11…11` and `0xab…ab` must differ; frames at 0, 731, 2137, and 5039 ms must differ. These are minimum executable checks, not a prescription of composition or palette.
- `/` exposes a visible canvas `#artwork`, buttons `#play` and `#pause`, a fillable time input `#time` accepting milliseconds 0–60000 (step 1; update on input), a text input `#seed`, and button `#apply-seed`. Use real labels and keyboard-accessible controls. Start paused at t=0 with seed `0x` + `11` repeated 32 times. Play advances time; Pause freezes it. Scrubbing and applying a seed redraw immediately at the selected time. Invalid seed UI input gives a readable message without crashing.
- Keep these selectors and interfaces in later rounds. The issued collection will use a fixed seed; this round's seed input is an artistic preview tool.

## How to run it

Install with `npm ci --ignore-scripts`, run `npm run build`, then `npm start -- --port 4173`. Open http://127.0.0.1:4173. Run `npm run check:round1` for the gate behaviours.

- C1 (artistic coherence, double): view the complete machine at 0, 731, 2137 and 5039 ms with the default seed; judge its composition and connected forms.
- C2 (motion): Play, Pause and scrub; inspect purposeful movement and rhythms rather than visual noise.
- C3 (slice quality): use browser console imports from `/dist/runtime.js` to render viewports `{x:950,y:960,width:50,height:80}` and `{x:1000,y:960,width:50,height:80}` into 250×400 canvases; inspect each composition and their relationship. The checks exercise these same boundaries.
- C4 (code quality): read `src/runtime.ts`, its modules and `src/viewer.ts`; assess determinism, clarity, and separation of rendering from controls.

# Round 2: The slices

prize: 1000000
criteria:
- Artistic coherence (counts double): one compelling mechanical organism across the complete work
- Motion: purposeful rhythms and connections across the composition
- Slice quality: interesting individual regions that belong to the whole
- Code quality: a clear shared runtime that later rounds can extend

Build on the round 1 winner. Implement exactly 1,000 row-major slices over the 2000×2000 world: a 40×25 grid, 50×80 units per slice. All slices share one seed and explicit time. Provide whole-work navigation, selectable slices, and `/?slice=<id>` deep links. Export `sliceViewport(tokenId)` from `src/slices.ts`; invalid IDs must be refused. The whole-work view remains at `/`. Show where each slice belongs; preserve the round 1 interface and controls.

Checks will verify IDs 0–999, unique rectangles, complete nonoverlapping coverage, invalid IDs, deep links, and consistent pixels across individual and whole-work views, plus round 1. They are written on the round 1 winner before this round opens.

## How to run it

`npm ci --ignore-scripts && npm run build`, then `npm start -- --port 4173`.

- C1 (artistic coherence, double): view `/`, select neighbouring slices, and return to the whole; assess continuity.
- C2 (motion): compare slices 499 and 500 at the same scrubbed time, then play the whole machine.
- C3 (slice quality): inspect `/?slice=0`, `/?slice=499`, `/?slice=500`, and `/?slice=999`; assess individual compositions and useful navigation.
- C4 (code quality): inspect `src/slices.ts`, URL validation, and reuse of the shared renderer; run earlier checks and this round's checks.

# Round 3: Onchain edition

prize: 1000000
criteria:
- Artistic coherence (counts double): one compelling mechanical organism across the complete work
- Motion: purposeful rhythms and connections across the composition
- Slice quality: interesting individual regions that belong to the whole
- Code quality: a clear shared runtime that later rounds can extend

Build on the round 2 winner. Implement an ERC-721 collection in `contracts/MachineSlices.sol`, with token IDs 0–999, unique minting, authorized mint operations, standard approvals/transfers, and one fixed collection seed. Store the self-contained artwork runtime and reconstruction data onchain, optionally in chunks. Freeze artwork data before minting so later changes cannot alter issued art. Return usable token metadata and preserve token-to-viewport mapping. Do not add paid sales, auctions, royalties or upgrade privileges by default.

Provide `npm run contracts:compile` and `npm run contracts:test` using pinned npm solc and an in-memory Ethereum VM. Compilation/testing must run offline after `npm ci --ignore-scripts`, without downloading compilers. Include deployment bytecode, ABI and size/gas estimates in generated artefacts under `dist/contracts/`. Explain chain constraints and storage tradeoffs. This round delivers locally tested contracts; no funded wallet or live deployment is required from entrants.

Before the round opens, its ABI and snapshot format will be fixed in the brief and checks on the previous winner. Checks verify token bounds, duplicate mint refusal, authorization, ownership/transfer/approval behaviours, immutable seed/code, metadata and reconstructability, plus all earlier rounds.

## How to run it

`npm ci --ignore-scripts`, `npm run contracts:compile`, `npm run contracts:test`, `npm run build`, then `npm start -- --port 4173`.

- C1 (artistic coherence, double): reconstruct the machine using locally deployed contract data and compare its whole-work view with the previous round.
- C2 (motion): play and scrub the reconstructed runtime; inspect whether movement survives reconstruction unchanged.
- C3 (slice quality): retrieve metadata for tokens 0, 499, 500 and 999, and inspect corresponding reconstructed slices.
- C4 (code quality): read the contract, storage/reconstruction modules and test outputs; examine permission boundaries, bounded costs and preservation of earlier interfaces.

# Round 4: Exhibition

prize: 1000000
criteria:
- Artistic coherence (counts double): one compelling mechanical organism across the complete work
- Motion: purposeful rhythms and connections across the composition
- Slice quality: interesting individual regions that belong to the whole
- Code quality: a clear shared runtime that later rounds can extend

Build on the round 3 winner. Polish the exhibition for desktop and mobile, keeping viewing wallet-free, controls labelled, and pause accessible. Add a standalone exporter: `npm run artwork:export -- --input <chain-snapshot.json> --output <directory>`. Use the snapshot schema fixed in round 3. Export must need no RPC or external assets and must reproduce the complete machine and all slice views.

Provide a deployment package with dry-run as the default, explicit network/account selection, code verification instructions, estimated costs, and a repeatable checklist for testnet deployment, reading back a snapshot, reconstructing it, and comparing outputs. Never commit private keys. Actual testnet verification is performed separately by the creator; mainnet transactions require creator approval. Automated eligibility cannot depend on live RPC availability or spending funds.

Checks verify offline export/reconstruction from local chain fixtures, wallet-free viewing, controls and deep links at desktop/mobile sizes, dry-run refusal of incomplete configuration, and every earlier round. Checks are authored on the round 3 winner before this round opens.

## How to run it

`npm ci --ignore-scripts && npm run build`, then `npm start -- --port 4173`. Export the provided local fixture with `npm run artwork:export -- --input examples/chain-snapshot.json --output dist/exhibition` and serve that directory locally following the entry's README.

- C1 (artistic coherence, double): compare the live viewer and standalone reconstruction, as whole works and individual views.
- C2 (motion): play, pause and scrub on desktop and mobile; assess smoothness and preservation of the shared clock.
- C3 (slice quality): navigate between the whole work and tokens 0, 499, 500 and 999 using keyboard and touch layouts.
- C4 (code quality): run earlier checks and deployment dry-run, inspect the export dependencies, and follow the testnet checklist without authorizing a mainnet transaction.

