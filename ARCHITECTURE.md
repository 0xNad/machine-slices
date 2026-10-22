# Machine Slices — architecture and agreed plan

One abstract mechanical organism: moving forms, flowing signals, and rhythms spanning slice boundaries. Its 1,000 pieces are windows into one shared runtime. The audience is generative-art collectors and viewers.

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

## Modules and data flow

`src/runtime.ts` owns deterministic drawing; internal modules and artistic techniques are entrants' choice. `src/viewer.ts` owns controls and time scheduling, passing explicit inputs to the shared runtime. `server.mjs` serves the compiled viewer. No backend or wallet is required for round 1.

Round 2 adds `src/slices.ts` exporting `sliceViewport(tokenId)` and routes `/?slice=<id>`; absent slice means the whole work. IDs are integers 0–999, row-major: x=(id%40)*50, y=floor(id/40)*80, width=50, height=80. Invalid IDs are refused with a readable error. Metadata uses JSON objects with tokenId, viewport, and collectionSeed. Use one renderer and clock across views, not 1,000 unrelated seeds or simulations.

Round 3 adds `contracts/MachineSlices.sol`, `npm run contracts:compile`, and `npm run contracts:test`, using pinned npm solc and an in-memory EVM; no compiler downloads, RPC or funded wallets during checks. Contract artefacts go under `dist/contracts/`. The ERC-721 collection caps token IDs at 0–999, prevents duplicate minting, and stores one fixed collection seed and immutable self-contained runtime/metadata data. Chunked storage is allowed; all reconstruction dependencies must live onchain. Solidity ABI details are fixed in the round 3 brief/checks after the round 2 winner is selected. Minting is creator-authorized; public-sale economics and royalties are not specified or implemented by default.

Round 4 adds `npm run artwork:export -- --input <chain-snapshot.json> --output <directory>` and a documented snapshot schema carrying chain ID, contract address, seed, code chunks, and token mapping. Export reconstructs the complete standalone work using only a saved chain snapshot. Contract adapters preserve earlier ABIs. Deployment scripts default to dry-run and require explicit network/account configuration for transactions; no private keys in the repository.

## Rounds

| Round | Title | Adds | Checks | Prize |
| --- | --- | --- | --- | --- |
| 1 | The machine | Shared animated renderer and browser viewer | Pixels, determinism, seed/time variation, crops, validation, controls, offline rendering | 1,000,000 |
| 2 | The slices | All 1,000 slices, individual views and whole-work navigation | Mapping coverage/uniqueness, invalid IDs, view consistency, round 1 | 1,000,000 |
| 3 | Onchain edition | ERC-721 and immutable reconstructable artwork | Offline compilation/EVM: cap, ownership, transfers, authorization, metadata and code reconstruction; earlier rounds | 1,000,000 |
| 4 | Exhibition | Exhibition polish, standalone reconstruction and deployment package | Offline export from fixtures, browser viewing, deployment dry-run; earlier rounds | 1,000,000 |

## Agreed settings and judging

Owner: ponderingdemocritus. Public repository: ponderingdemocritus/machine-slices. Title: Machine Slices.

Each round awards 1,000,000 points (4,000,000 total), top three 60/25/15. Build 48h, reveal 12h, ranking/checks 12h, with creator confirmation/override during ranking. No separate pick window. Round 1 opens 24h after the launch form is opened; omit opens_at. No additional ranking team.

Rubric for each round: Artistic coherence (counts double), Motion, Slice quality, Code quality. Judges run the round-specific demonstrations in the project file. Executable correctness is the eligibility gate; visual quality is evaluated by humans/judges.

The creator presses Launch, chooses the winning entry during judging, and approves/merges the winner with a merge commit. Later checks are written on that winner before the next round. A local reference branch used to prove checks must never be pushed.

## Rights and release

Software: MIT. Separate artwork rights reserved as described in ARTWORK-RIGHTS.md; final collector rights and any mint terms remain to be settled before minting. Viewing is wallet-free. Testnet verification is a separate creator-run release step after offline checks; mainnet deployment requires the creator's approval of the concrete transaction and cost. No mainnet transaction is part of preparing this Hotpod launch.

## Research decisions

MARKET.md records the comparison and limits of evidence. Art Blocks' reconstruction model supports making the runtime self-contained and retrievable from onchain data (source 1). Async's restoration experience supports an explicit independent reconstruction test (source 2). The distinctive artistic proposal is a single machine seen through 1,000 spatial windows; research does not establish novelty or willingness to pay.
