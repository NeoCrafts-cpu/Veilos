# Wave Progress

## Wave 1 — VELIOS CORE

| Phase | Name | Status |
| --- | --- | --- |
| 0 | Repository + tooling | **Done** |
| 1 | Architecture docs | **Done** |
| 2 | Compact core | **Done** (`packages/contracts/compact/authorization.compact`, Compact 0.31 / language 0.23; 8 ledger circuits compiled locally) |
| 3 | Contract tests | **Done** (C1–C31 against the Compact semantics replica, plus X5 parity against the real generated module; compile test skips if `compact` missing) |
| 4 | MidnightJS / wallet / proof / indexer | **Done** (official 4.1.1 adapters + DApp Connector v4 + browser `MidnightProviders`) |
| 5 | Real end-to-end transaction | **Partial on Preview** — deploy + registerMember `SucceedEntirely`. `authorizeAction` indexer evidence is not retained yet (`docs/preview-evidence.md`). Local I1–I7 are real when Midnight is required. |
| 6 | Wave 1 UI | **Done** — owner vs public Preview journeys; guided setup/policy/authorization; public fields from indexer; circuit calls via MidnightJS |
| 7 | Privacy Inspector | **Done** |
| 8 | Security + QA | **Updated** — exact indexer finality, encrypted journal, encrypted browser private state, Node 22 CI |
| 9 | Demo + README + submission | **Deck, rubric map, business, community copy in-repo.** **YouTube + X posts still required** — `docs/DEMO-SCRIPT.md`, `docs/COMMUNITY.md`. |

## Wave 2 — VELIOS ECONOMY

| Claim | Status |
| --- | --- |
| Implemented in-repo | Yes — `economy.compact` plus credentials, treasury, governance, procurement, auditor packages and `/app/*` routes |
| Tested | Unit/replica/UI leakage tests; Compact circuit presence when artifacts exist |
| Proven on Preview | Deploy of `economy-preview.compact` is retained. Full facade and later circuits are not. See `docs/preview-evidence.md` |

Official DID/VC remain experimental adapters (MidnightJS 4.0.2 vs pin 4.1.1). Unshielded settlement leakage is explicit. Tally completeness stays behind `experimentalTallyAdapter`.

See `docs/wave-2-architecture.md` and `docs/preview-evidence.md`.

## Wave 3

Not started.

## What changed this session

- Implemented Wave 1 Compact authorization contract (language 0.23, official primitives only).
- Pinned MidnightJS **4.1.1** and local Docker images from `midnightntwrk/example-hello-world`.
- Added policy-engine, typed Midnight adapters, Wave 1 UI, Privacy Inspector, and test suites.
- Production paths do not mock the ledger. Missing Compact/Docker is reported as environment missing, not success.
- Operator private state now persists after every successful circuit so `authorizeAction` can open the same commitments written at `createAgent`.
- Authorization windows come from the official indexer `block { timestamp }` query, matching Compact `kernel.blockTimeGreaterThan`.
- The UI is an operator loop (create or inspect an organization → encrypt operator access → set policy → create agent → authorize a request), not a fixed-amount demo. Compact remains the only authorization authority. Wave 1 does not transfer funds.
- Operator vaults are encrypted at rest (PBKDF2 + AES-GCM) and scoped to network + contract. A commitment-match gate blocks proving when the vault does not open the selected agent.
- Local preview refuses do not submit a proof. Circuit rejects after a local allow are explained as commitment/window mismatch, not a guessed amount failure.

## Wave 1 gap review (contract completeness)

Reviewed `authorization.compact` against §4 and §5 of `VELIOS_CURSOR_MASTER_PLAN.md`.
Five requirements were specified but unimplemented; all five are now closed.

| Master plan requirement | Was | Now |
| --- | --- | --- |
| "identity/basic membership" (§2), `registerMember()` (§5.2), MEMBERS on Screen A | absent | `members` map, `registerMember`, `setMemberStatus`, `memberCount`; `createAgent` requires an active member who can open the member commitment |
| "Expired credential → REJECT" (§8.2 test matrix, threat #3) | untestable — `credentialOk` boolean stand-in, no clock | real expiry against `kernel.blockTimeGreaterThan` via a chain-verified window (C16/C17) |
| "daily total + requested <= private daily limit" (§5.5) | a lifetime cap — no day boundary existed, so it never reset | spend commitment binds `periodStart`; rolling per-window reset with a 86 400 s bound (C18–C23) |
| `timestamp` public state (§5.3), TIMESTAMP on Screen E and in the Privacy Inspector | absent | `periodStart` / `periodEnd` on the action record, verified against chain time rather than client-asserted |
| Screen B `ROLE` (private) and `SELF MODIFY` | absent | `roleCommitment` hides the role label; `setAgentPolicyBySelf` gated on the committed `selfModifyAllowed` flag, which the agent cannot forge (C30/C31) |

Also added: public `Counter` fields so the organization screen's numbers are
independently verifiable, and X5 parity tests so a Compact/TypeScript mismatch
fails a test instead of a Preview transaction.

Deliberately still out of Wave 1: `rejectAction` / `recordResult` public
failure records (a failed `assert` writes nothing, which is the correct
privacy-preserving rejection), multi-vendor Merkle allow-lists, and DID/VC
circuits. See `docs/contract-spec.md` §6.7.

### Known remaining Wave 1 gaps (not contract-side)

- Wave 1 UI joins the Preview contract (`findDeployedContract` +
  `queryContractState` + Compact `ledger()`). Public org/member/agent/action
  fields come from the indexer without a wallet. Circuit calls require a
  Midnight wallet (DUST) plus the operator private state that opened the
  on-chain commitments. After every successful circuit the operator state is
  persisted in an encrypted contract-scoped vault (optional labelled DEV import,
  downloadable encrypted backup).
  `authorizeAction` uses indexer `block.timestamp`, not `Date.now()`.
- The proof provider is HTTP-only (`httpClientProofProvider`) and so is
  incompatible with 1AM's IN-BROWSER (WASM) mode; that path needs
  `getProvingProvider` + `createProofProvider`.
- Preview deploy uses the official Node Wallet SDK CLI (`pnpm deploy:preview`),
  not 1AM Generate DUST. Wave 1 constructor + `registerMember` are on Preview
  (`SucceedEntirely`). Public address is in gitignored `deployment.json`.
