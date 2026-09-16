# Tests

| Folder | When | What |
| --- | --- | --- |
| `contracts/` | Phase 3 | Compact positive/negative cases |
| `integration/` | Phase 4–5 | Real wallet → proof → network → indexer |
| `privacy/` | Phase 6+ | Leakage regressions |
| `e2e/` | Phase 6+ | Vitest component journeys (not Playwright) |
| `playwright/` | Phase 6+ | Real browser sidebar and recovery specs |

Matrix: `docs/test-matrix.md`. Do not mock Midnight on integration or E2E production paths.
