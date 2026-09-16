# Wave 2 Test Matrix

| ID | Case | Location |
| --- | --- | --- |
| W2-C1 | Issue / revoke / wrong class / expired / replay | `@velios/credentials` |
| W2-A1 | Intent tamper fails settlement | `@velios/economy` |
| W2-A2 | Duplicate settlement fails | `@velios/economy` |
| W2-G1 | Duplicate ballot nullifier | `@velios/governance` |
| W2-G2 | Incomplete or altered tally | `@velios/governance` |
| W2-P1 | Late/duplicate bid, losing-bid privacy, award requires treasury authorization | `@velios/procurement` |
| W2-D1 | Expired / wrong auditor / overbroad grant | `@velios/auditor` |
| W2-UI1 | Unshielded leakage review | `tests/e2e/wave2-ui.test.tsx` |
| W2-UI2 | Sidebar groups, child routes, vault/wallet gates | `apps/web/src/components/Sidebar.test.tsx`, `tests/playwright/*.spec.ts` |
| W2-I1 | Economy artifacts required when `VELIOS_REQUIRE_MIDNIGHT=1` | `tests/integration/wave2-economy.test.ts` |
| W2-L1 | Live economy-preview deploy retained | `tests/integration/wave2-live-preview.test.ts` (`VELIOS_LIVE_PREVIEW=1`) |
| W2-L2 | Live credential issue + indexer commitment | gated live |
| W2-L3 | Live payment authorization | gated live |
| W2-L4 | Live NIGHT deposit + settlement row | gated live |
| W2-L5 | Live governance-preview deploy + one circuit | gated live |
| W2-L6 | Live procurement-preview deploy + one circuit | gated live |
| W2-L7 | Live procurement award bound to an economy authorization | gated live |
