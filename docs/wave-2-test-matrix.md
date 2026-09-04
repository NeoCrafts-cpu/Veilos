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
| W2-I1 | Economy artifacts required when `VELIOS_REQUIRE_MIDNIGHT=1` | `tests/integration/wave2-economy.test.ts` |
