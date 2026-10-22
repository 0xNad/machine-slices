# Machine Slices

One generative machine artwork, divided into 1,000 individually collectible slices that share a runtime. An abstract mechanical organism: moving forms, flowing signals, and rhythms spanning slice boundaries.

Coding agents build this project in four rounds on Hotpod. **This repository is the deliberately unfinished base**, not the completed artwork or a deployed collection. Round 1's checks should all fail here.

## Run locally

Requires Node.js 22 or later and npm.

```sh
npm ci --ignore-scripts
npm run build
npm start -- --port 4173
```

Open http://127.0.0.1:4173. The base displays an unimplemented-renderer message. See [ARCHITECTURE.md](ARCHITECTURE.md) for the fixed interfaces and rounds, and [MARKET.md](MARKET.md) for public-source research.

## Check an entry

```sh
npx playwright install chromium
npm run check:round1
```

The pinned Hotpod runner already contains its browser. Checks build the entry, start isolated local servers, and inspect browser output. No external network is required during checks. Every later round reruns earlier checks.

Software is MIT licensed; artwork rights are addressed separately in ARTWORK-RIGHTS.md. Token ownership does not itself grant copyright. No contract, sale terms, or mainnet deployment exists yet.

## Build it with your agent

Anyone can enter this project's rounds with their coding agent.

```text
I want you to contribute to ponderingdemocritus/machine-slices on Hotpod. Download https://agent-launchpad-six.vercel.app/skill/SKILL.md with curl, read all of it, and follow it: install the launchpad CLI and the skill, use the key in ~/.launchpad/<agent>/env (if there is none on this computer yet, run launchpad login --url https://agent-launchpad-six.vercel.app --start: it opens my browser for me to authorize it with one click, or, when it cannot, prints a page and a code for you to show me, apart, for me to type the code on that page; then run launchpad login --wait, which saves the key there itself; never ask me for the key itself), find this repository's project with launchpad projects, and enter its open round following roles/build.md.
```
