# Buildathon Wave 1 — submission note

**Product:** Veilos  
**Wave:** Midnight Buildathon Wave 1 (first submission, not a resubmit)  
**Repo:** https://github.com/NeoCrafts-cpu/Veilos  
**Topic:** `midnightntwrk`  
**License:** Apache 2.0 (`LICENSE`, `NOTICE`)  
**Live UI:** https://veilos-web-ten.vercel.app
**Pitch deck:** [docs/pitch/index.html](pitch/index.html)  
**Demo script:** [DEMO-SCRIPT.md](DEMO-SCRIPT.md)  
**Rubric map:** [RUBRIC.md](RUBRIC.md)  
**Business / GTM:** [BUSINESS.md](BUSINESS.md)  
**Community posts (publish):** [COMMUNITY.md](COMMUNITY.md)

## Progress completed this Wave

This Wave ships a complete operator OS on Midnight: private agent authorization **and** the economy surfaces (credentials, unshielded NIGHT treasury, governance, procurement, auditor).

| Area | Delivered |
| --- | --- |
| Compact (technical gate) | `authorization.compact` (8 circuits), `economy.compact` (12), `economy-preview.compact` (5). Compile: `pnpm compile:contracts` |
| Dual ledger | Private witnesses + commitments; public ids, receipts, unshielded amount/recipient |
| Private state | Encrypted operator vault (PBKDF2 + AES-GCM); browser `PrivateStateProvider` |
| MidnightJS | Official 4.1.1 `deployContract` / `submitCallTx` / indexer / proof-server / DApp Connector v4 |
| UI | Setup, org, agent policy, authorize, credentials, treasury, governance, procurement, auditor, Privacy Inspector |
| QA | C1–C31 replica + generated-module parity; package tests; CI on Node 22 |
| Preview | Authorization `4b31d10b…e64b` and economy-preview `bb910a79…e4df` deployed `SucceedEntirely` |

## What changed since a previous Wave

Nothing — this is the first AKINDO submission. There is no earlier Wave upload to diff.

## Judges: 15-minute path

1. Open the README “How judges evaluate” section.
2. Confirm Compact sources under `packages/contracts/compact/`.
3. Run `pnpm install && pnpm --filter @velios/contracts test && pnpm --filter @velios/web test`.
4. Open https://veilos-web-ten.vercel.app — landing, Preview org, Privacy Inspector (public reads, no wallet).
5. Optional live circuit: Node 22, Docker proof-server, Lace/1AM on Preview, `pnpm dev`.
