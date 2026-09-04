# Wave 1 Test Matrix

Implemented unit, Compact replica, UI lifecycle, and gated live Midnight tests are mapped below. “Proven on Preview” is a separate claim in `docs/preview-evidence.md`.

Authority: Compact circuit + real Midnight transaction. Local policy helpers are non-authoritative.

---

## 1. Unit tests (`packages/policy-engine`, `packages/shared-types`)

| ID | Case | Expected |
| --- | --- | --- |
| U1 | Domain validation: empty agent id | reject locally |
| U2 | Amount encoding / overflow to `Uint<64>` | fail closed |
| U3 | Commitment encoder matches Compact encoding | byte-identical |
| U4 | Local preview: 4800 vs limit 25000 | preview allow |
| U5 | Local preview: 48000 vs limit 25000 | preview deny |
| U6 | Preview must not set UI Authorized | state remains preview |

---

## 2. Compact contract tests (`tests/contracts`)

| ID | Scenario | Expected | Plan table |
| --- | --- | --- | --- |
| C1 | Valid payment action | PASS | Valid action |
| C2 | Amount above per-action limit | REJECT | Amount above limit |
| C3 | Daily spend + amount above daily limit | REJECT | Amount / policy |
| C4 | Inactive agent | REJECT | Inactive agent |
| C5 | `credentialOk` false | REJECT | Invalid credential |
| C6 | Invalid credential fixture | REJECT | Invalid credential |
| C7 | Wrong organization id | REJECT | Wrong organization |
| C8 | Duplicate action id | REJECT | Duplicate action |
| C9 | Replay successful action | REJECT | Replay attempt |
| C10 | Witness preimage does not open policy commitment | REJECT | Modified witness |
| C11 | Wrong owner secret | REJECT | Unauthorized |
| C12 | Unauthorized `setAgentPolicy` | REJECT | Unauthorized policy change |
| C13 | Inactive organization | REJECT | — |
| C14 | Vendor id ≠ committed vendor | REJECT | — |
| C15 | Create agent twice with same id | REJECT | — |
| C16 | Credential expires before the window ends | REJECT | **Expired credential** |
| C17 | Credential valid exactly to the window end | PASS | — |
| C18 | Daily limit resets in the next window | PASS | — |
| C19 | Spend bucket committed for a later window | REJECT | — |
| C20 | Authorization window has not started | REJECT | — |
| C21 | Authorization window already elapsed | REJECT | — |
| C22 | Window longer than one day | REJECT | — |
| C23 | Inverted window | REJECT | — |
| C24 | `createAgent` for an unknown member | REJECT | Wrong agent |
| C25 | `createAgent` with a wrong member secret | REJECT | Unauthorized |
| C26 | `createAgent` under an inactive member | REJECT | Revoked credential |
| C27 | Revoked member disables its agent's authorizations | REJECT | Revoked credential |
| C28 | `registerMember` by a non-admin | REJECT | Unauthorized |
| C29 | Duplicate member id | REJECT | — |
| C30 | Self policy modification denied, and flag-forgery blocked | REJECT | Unauthorized policy change |
| C31 | Self policy modification with a wrong agent key | REJECT | Unauthorized |

Plus, in the same file: public counters track members/agents/actions; the
action record carries the chain-bound window; the role commitment hides the
role; authorized policy rotation invalidates the old preimage; one agent's
preimage cannot authorize another; spend accumulates within a window.

C6 no longer stands in for expiry. C16 is the real expired-credential case,
enforced against the ledger clock — see `docs/contract-spec.md` §6.6.

Wave 2 (do not implement now): valid governance vote, double vote.

### 2.1 Compiled-contract parity (X5)

`packages/contracts/src/generated.test.ts` asserts, against the real
compiler-generated module:

| Check | Why |
| --- | --- |
| driver witness keys == compiled `Witnesses` keys | a missing or extra witness breaks proving at runtime, not at build time |
| all 8 impure circuits present | catches a renamed or dropped circuit |
| all 6 pure commitment circuits present | the Privacy Inspector calls these |
| all 10 ledger fields present in `ledger()` | catches a dropped public field |

This is the guard that makes a Compact/TypeScript mismatch a failing test
rather than a failed transaction on Preview.

---

## 3. Integration tests (`tests/integration`)

Exercise the documented stack when Phase 4+ exists:

```text
wallet → proof provider → Compact contract → network → indexer → typed state
```

| ID | Case | Expected |
| --- | --- | --- |
| I1 | Deploy Wave 1 contract to local undeployed network | real contract address |
| I2 | createAgent + setAgentPolicy + authorizeAction | `SucceedEntirely` (or pinned success status) + ledger Authorized |
| I3 | authorizeAction over limit | no success status; no Authorized row |
| I4 | `getPublicStates` after I2 matches circuit writes | public fields only |
| I5 | Indexer subscription eventually observes I2 | observed, then confirmed |
| I6 | Forced proof-server down | failure/timeout, not Authorized |
| I7 | `FailEntirely` / submit error | failed, not Authorized |

No mocked ledger on these paths. If a local network is unavailable, the test must skip as **environment missing**, not pass via a mock.

---

## 4. E2E tests (`tests/e2e`)

| ID | Master-plan step | Expected |
| --- | --- | --- |
| E1 | Create organization | public org visible |
| E2 | Create agent | public agent Active |
| E3 | Configure policy | only commitment public |
| E4 | Authorize a permitted payment request | pending → proven → submitted |
| E5 | Verify proof / tx | real success status |
| E6 | Execute transaction | indexer + UI public result |
| E7 | Confirm public result | Authorized + public fields |
| E8 | Authorize a locally refused request | no Midnight call; limit not printed |
| E9 | Confirm rejection | not Authorized |
| E10 | UI reflects rejection | PROOF REJECTED, no limit printed |

---

## 5. Privacy regression (`tests/privacy`)

Private values (limits, spend, secrets, credential bodies, salts, reason) must not appear in:

| ID | Sink |
| --- | --- |
| P1 | console / logger output |
| P2 | thrown Error messages (except generic assert text) |
| P3 | URL path, query, hash |
| P4 | Redux/Zustand (or equivalent) **public** slices |
| P5 | `localStorage` / `sessionStorage` plaintext (encrypted vault envelope only; workspace selection is public) |
| P6 | telemetry (Wave 1: no telemetry package) |
| P7 | public event / ledger payloads |

---

## 6. Environment / reproducibility

| ID | Check |
| --- | --- |
| X1 | `README.md` setup works from a clean Unix/WSL machine with Node 22, pnpm, Docker, Compact |
| X2 | Windows `compact` is not used |
| X3 | No secrets in git |
| X4 | Contract compile command documented after Phase 2 (must stay async — the ~3 min compile would block the vitest worker heartbeat) |
| X5 | Compiled contract / driver parity (see §2.1) |

---

## 7. Current results

| Suite | Command | Status |
| --- | --- | --- |
| Unit | `pnpm --filter @velios/policy-engine test` / `@velios/shared-types` | Wave 1 encoding + intent binding |
| Compact | `pnpm --filter @velios/contracts test` | C1–C31 replica, golden Compact/TS vectors when artifacts exist, economy compile separate |
| Integration | `pnpm --filter @velios/tests test` | I1–I7 run only on a live local stack; `VELIOS_REQUIRE_MIDNIGHT=1` fails if missing |
| E2E | same | E4–E7 pending/indexing/stale/rejected plus Wave 2 leakage UI |
| Privacy | same | P1–P6 source / public-slice checks |
| Wave 2 packages | credentials, economy, governance, procurement, auditor | replica and privacy tests |

```bash
pnpm test
pnpm compile:contracts   # requires Midnight Compact on PATH
```
