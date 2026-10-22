# Round 1 check proof

Verified locally on 2026-10-22 with Node.js 22.23.1, Playwright 1.63.0 and its Chromium browser on macOS.

| Entry | Result |
| --- | --- |
| Published base (unimplemented renderer) | 0/12 pass; all fail for missing implementation |
| Private local reference | 12/12 pass |
| Server exits 0 without serving | 0/12 pass |
| Seed validation removed | Seed refusal check fails |
| Invalid times accepted | Time refusal check fails |
| Crops always use world origin | Crop alignment check fails |

The reports' test names match check.json exactly. The reference implementation is stored only on a local branch and must never be pushed. Reports and mutation scripts are outside this repository.

The official check-kit files and GitHub Actions workflow match the download script's SHA-256 digests. A fresh `npm ci --ignore-scripts` and build succeed.

Docker is installed but its daemon was stopped; no Podman engine was running. The real pinned Linux container gate has **not** been proven locally. GitHub Actions uses that gate on incoming entries. Local browser success is not a substitute for Linux container verification.

Later rounds' checks are authored on the preceding winner before those rounds open. Round 1 remains frozen once it opens.
