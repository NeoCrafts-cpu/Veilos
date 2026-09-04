# VELIOS Roadmap

## Wave 1 — VELIOS CORE

Goal:
Prove the core private authorization loop.

Deliver:
- organization
- agent
- private policy
- action request
- proof
- Compact verification
- real Midnight transaction
- indexer result
- Privacy Inspector
- contract tests
- E2E tests

## Wave 2 — VELIOS ECONOMY

Status: implemented in-repo. Official Midnight DID/VC adapters are experimental until MidnightJS 4.1.1 compatibility is proven. Preview economy evidence is not retained yet.

Deliver:
- organization-issued private credentials and revocation
- intent-bound unshielded NIGHT treasury
- private ballot commitments / public final tally
- sealed procurement bound to treasury authorization
- scoped auditor disclosure

## Wave 3 — VELIOS NETWORK

Goal:
Turn VELIOS into a broader autonomous organization protocol.

Deliver:
- credit
- reputation
- escrow
- agent marketplace
- external verification
- Effectstream integration where justified
- Kuira/mobile flow where justified
- developer APIs

## Implementation order

Do not skip ahead.

```text
PHASE 0   Repository + tooling
PHASE 1   Architecture docs
PHASE 2   Compact core
PHASE 3   Contract tests
PHASE 4   MidnightJS / wallet / proof / indexer
PHASE 5   Real end-to-end transaction
PHASE 6   Wave 1 UI
PHASE 7   Privacy Inspector
PHASE 8   Security + QA
PHASE 9   Demo + README + submission
```

Progress is tracked in `docs/wave-progress.md`.
