# VELIOS Architecture

Status: Wave 1 vertical slice is implemented against official MidnightJS 4.1.1. Wave 2 economy uses a separate `economy.compact` facade. Authorization is recorded only after `SucceedEntirely` and an exact indexer action id. Unshielded NIGHT settlement is public by design.

Sources used (official, retrieved 2026-09-12):

- https://docs.midnight.network/getting-started/installation
- https://docs.midnight.network/getting-started/quickstart
- https://docs.midnight.network/getting-started/hello-world
- https://docs.midnight.network/getting-started/deploy-mn-app
- https://docs.midnight.network/sdks/official/midnight-js
- https://docs.midnight.network/compact/reference/compact-reference
- https://docs.midnight.network/compact/reference/explicit-disclosure
- https://docs.midnight.network/examples/dapps/bboard
- https://docs.midnight.network/llms.txt (API index)

No Midnight packages are installed in this repository. APIs below are **documented**, not **verified against `node_modules`**. Phase 2 must re-check every symbol against the pinned package version before coding.

---

## 1. System architecture

VELIOS is a Midnight DApp. The Wave 1 system has five runtime pieces plus the Compact contract:

```text
┌──────────────────────────────────────────────────────────────────┐
│ apps/web  (Wave 1 UI — Phase 6+)                                 │
│  landing, org, agent, action, proof, result, privacy inspector   │
└────────────┬─────────────────────────────────────────────────────┘
             │ typed adapters only
┌────────────▼─────────────────────────────────────────────────────┐
│ packages/midnight  (Phase 4)                                     │
│  wallet adapter │ proof adapter │ indexer adapter │ network cfg  │
└────────────┬─────────────────────────────────────────────────────┘
             │ MidnightJS providers (documented)
             ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐
│ Lace / DApp  │  │ Proof server │  │ Indexer      │  │ Midnight  │
│ Connector    │  │ :6300        │  │ GraphQL      │  │ node RPC  │
└──────────────┘  └──────────────┘  └──────────────┘  └───────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────┐
│ packages/contracts  Wave 1 Compact authorization contract        │
│  public ledger  +  witnesses  +  exported circuits               │
└──────────────────────────────────────────────────────────────────┘
```

Local development (official `create-mn-app` hello-world / docker-compose) runs node + indexer + proof server together. Browser development uses Lace pointed at a local proof server (`Settings → Midnight → Local http://localhost:6300`).

Node-only scripts (compile, contract tests, deploy) use the Wallet SDK facade path documented in the deploy tutorial. Browser paths use the DApp Connector. These two wallet stacks must be isolated behind adapters so the Compact contract does not depend on either.

---

## 2. Domain model (Wave 1)

Wave 1 entities only:

| Entity | Role |
| --- | --- |
| Organization | Public identifier and active/inactive status. Owns agents. |
| Agent | Public identifier, status, organization binding, owner commitment, policy commitment. |
| Policy | Private values (limits, vendor rule, credential predicate). Only a commitment is public. |
| Action intent | Application-layer request (type, agent, recipient, amount, reason). Not necessarily a Compact circuit. |
| Authorization result | Public outcome of a successful `authorizeAction` circuit, or a local proof rejection. |

Wave 2 economy (organization-issued credentials, unshielded treasury, private ballots, sealed procurement, scoped audit) lives in `economy.compact` and must not mutate Wave 1 openings. Wave 3 stays out of scope until Wave 2 Preview evidence is retained.

---

## 3. Public / private state boundary

Midnight Compact model (official):

| Term | Meaning |
| --- | --- |
| Circuit | Exported function that can update ledger state and produce a ZK proof. |
| Witness | TypeScript callback. Returns private data into the circuit. **Untrusted.** |
| Private state | User-local state. Never stored on-chain. |
| Ledger state | On-chain public contract state. |
| `disclose()` | Required before witness-derived values may be written to the ledger, returned from an exported circuit, or used in ways that affect public outputs. |

VELIOS Wave 1 mapping:

**Public ledger (candidates — exact fields in `docs/contract-spec.md`):**

- organization id, organization status
- agent id, agent status, organization binding
- owner commitment (hash of owner secret, bboard pattern)
- policy commitment (hash of private policy preimage)
- daily-spend commitment (hash of private spend preimage)
- used action ids (`Set` — replay protection)
- action id, action type, authorization result for successful actions
- result / policy-satisfaction commitment if a public binding is required

**Private (witnesses + local private state):**

- owner secret
- per-action limit, daily limit
- current daily spend
- allowed vendor identifier(s)
- credential validity / expiry preimage
- action reason, supplier metadata, internal notes
- salts used in commitments

**Must never become public unless explicitly `disclose`d for a documented reason:**

- raw policy integers
- raw daily spend
- credential document contents
- owner secret

Official Compact warning (must drive the design):

> Do not assume in your contract that the code of any `witness` function is the code that you wrote in your own implementation. Any DApp may provide any implementation that it wants for your `witness` functions. Results from them should be treated as untrusted input.

Therefore every private policy value used in an `assert` must be bound to a public commitment (or an equivalent on-ledger check). A witness that simply returns `limit = 999999` is not authorization.

The official bulletin-board example is the reference pattern: witness `localSecretKey()`, circuit computes `publicKey(sk, sequence)` via `persistentHash`, compares to the public `owner` field.

---

## 4. Contract responsibilities

One Wave 1 Compact module (name to be chosen at compile time; do not freeze a filename until the compiler accepts it).

Confirmed Compact surface we intend to use (language version 0.23 docs):

- `pragma language_version` ≥ 0.23
- `import CompactStandardLibrary`
- `export ledger` fields, including `Counter`, `Map<K,V>`, `Set<T>`
- `witness` declarations without bodies
- at most one `constructor`
- `export circuit` entry points
- `assert(condition, "message")` — checked at runtime and constrained in-circuit
- `disclose(expr)` before public writes of witness-derived values
- `persistentHash` / `pad` as used in the official bboard example
- `enum` / `struct` for public records

Confirmed **not** to invent:

- Solidity-style `msg.sender`
- implicit trusted witnesses
- a `rejectAction` circuit that “records failure” unless we later specify a successful public reject path (failed `assert` does not update the ledger)

Application-layer `requestAction` builds the witness and circuit arguments. The Compact entry point for the happy path is `authorizeAction` (final name must match the compiled export).

---

## 5. Provider responsibilities

Documented MidnightJS provider object (`https://docs.midnight.network/sdks/official/midnight-js`):

| Provider | Documented package / factory | Responsibility |
| --- | --- | --- |
| `privateStateProvider` | `@midnight-ntwrk/midnight-js-level-private-state-provider` → `levelPrivateStateProvider` | Encrypted local private state. |
| `publicDataProvider` | `@midnight-ntwrk/midnight-js-indexer-public-data-provider` → `indexerPublicDataProvider` | Indexer GraphQL queries and subscriptions. |
| `zkConfigProvider` | `FetchZkConfigProvider` or `NodeZkConfigProvider` | Prover key, verifier key, ZKIR artifacts. |
| `proofProvider` | `httpClientProofProvider` or DApp Connector proof provider | Prove an unproven transaction. |
| `walletProvider` | Wallet SDK facade or DApp Connector | Balance / sign. |
| `midnightProvider` | Same wallet stack | Submit to the network. |

Documented contract helpers from `@midnight-ntwrk/midnight-js-contracts`:

- `deployContract`
- `findDeployedContract`
- `contract.callTx.<circuit>(...)`
- `getStates` / `getPublicStates`
- `submitCallTx` / `submitDeployTx` / `submitTx`

Documented transaction statuses:

- `SucceedEntirely`
- `FailFallible`
- `FailEntirely`

VELIOS must not treat a call as authorized unless the real status is success (for Wave 1, `SucceedEntirely`). Pending indexer lag is not success.

**Version drift (do not guess):** the deploy tutorial pins midnight-js `4.0.2` and indexer `/api/v3/graphql`; the MidnightJS guide and `llms.txt` show midnight-js `4.0.4` and `/api/v4/graphql`. Phase 4 must pin one compatible set after installing packages and reading the official compatibility matrix.

---

## 6. Frontend / backend boundaries

There is no separate VELIOS application server in Wave 1.

| Layer | May hold | Must not hold |
| --- | --- | --- |
| Compact ledger | Public ids, commitments, results | Policy values, secrets |
| TypeScript witnesses / private state | Policy preimage, owner secret | Logs, URLs, analytics |
| `packages/midnight` adapters | Network URLs, typed provider wiring | Business-policy decisions |
| `packages/policy-engine` | Local pre-checks for UX (optional) | Authority to authorize; circuit is authority |
| `apps/web` | Public ledger projections, connection status | Raw policy values in router state or query strings |

Local policy-engine checks are **preview only**. The UI may say “this request will likely be rejected” after a local check, but authorization is only real after the Compact circuit / Midnight transaction succeeds or the proof is rejected.

---

## 7. Data flow

### 7.1 Valid action

```text
Principal connects wallet (DApp Connector or script wallet)
        → create/join organization (constructor or createOrganization circuit)
        → createAgent (public agent + owner commitment + empty/initial policy commitment)
        → setAgentPolicy (disclose only the new policy commitment)
        → requestAction in the app (private intent)
        → witnesses read private state
        → authorizeAction circuit:
              bind witness preimage to public commitments
              assert agent active, org match, amount/daily/vendor/credential predicates
              assert action id unused; insert into used-id set
              write public result AUTHORIZED (disclosed fields only)
        → proof server / wallet proves and submits
        → indexer observes ledger
        → UI shows public result only after confirmed success
```

### 7.2 Invalid action (failure demo)

```text
requestAction($48,000) against a lower private per-action limit
        → same witnesses and circuit
        → assert(amount <= perActionLimit) fails
        → Compact dynamic error / proof or transaction does not succeed
        → no successful public ledger write
        → UI shows PROOF REJECTED / POLICY VIOLATION
        → UI must not reveal the private limit
```

### 7.3 Error handling flow

```text
                    ┌─ wallet rejected / disconnected
user action ──► pending
                    ├─ proof rejected / assert failed  → rejected (not authorized)
                    ├─ submit failed / FailEntirely    → failed
                    ├─ FailFallible                    → failed (do not claim success)
                    ├─ timeout / still pending         → pending or timed_out
                    ├─ indexer stale vs local tx       → pending (stale), not success
                    └─ SucceedEntirely + matching ledger result → authorized
```

The UI must never flip to AUTHORIZED from optimistic local state.

---

## 8. Package layout (intended)

```text
apps/web                 Wave 1 UI (Phase 6+)
packages/contracts       Compact sources + compile scripts (Phase 2)
packages/midnight        Typed adapters for wallet/proof/indexer/network (Phase 4)
packages/policy-engine   Local, non-authoritative predicate helpers (Phase 3/4)
packages/shared-types    Public/private TypeScript types shared by app + adapters
packages/identity        Wave 2 holder-commitment ports; official DID adapter experimental
packages/credentials     Wave 2 organization-issued credentials; official VC adapter experimental
packages/economy         Wave 2 settlement replica, leakage copy, commitments
packages/governance      Wave 2 private ballots; experimental tally adapter
packages/procurement     Wave 2 sealed bids bound to treasury authorization
packages/auditor         Wave 2 scoped encrypted disclosure
packages/ui              Shared design-system primitives (Phase 6)
tests/                   contract / integration / privacy / e2e
scripts/local-dev        Reproducible env notes
docs/                    Architecture, privacy, threats, spec, tests
```

---

## 9. What should be implemented first

After this document: **Phase 2 — Wave 1 Compact core** in `packages/contracts`, using only confirmed Compact primitives, compiling with the installed `compact` binary, then Phase 3 contract tests.

Do not start the web app or MidnightJS wiring until that contract compiles and its positive/negative tests pass.
