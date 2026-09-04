# Wave 1 Compact Contract Spec

This is a **domain spec**, not compilable Compact. Phase 2 must adapt names and types to the installed Compact compiler. Do not copy this file into `.compact` blindly.

Language baseline from official docs (2026-09-12): Compact language version **0.23**, `pragma language_version 0.23`, `import CompactStandardLibrary`.

Implemented file: `packages/contracts/compact/authorization.compact`.

Deviations from the draft names below:

- Witnesses are primitives (not structs) because struct witness returns were not compiler-verified.
- Extra owner-gated circuits: `setAgentStatus`, `setOrganizationStatus` (constructor stores `adminCommitment`).
- `authorizeAction` takes private `amount` and `vendorId` (not disclosed); `claimedOrganizationId` is compared against the ledger value without being written.
- Constructor argument: `orgId: Bytes<32>`. One organization per deploy.
- Membership is implemented (`registerMember` / `setMemberStatus`), and `createAgent` requires an active member who can open that member's commitment.
- Credential expiry is enforced against the real ledger clock. See §6.6 for why the expiry is compared to a public window instead of being passed to `kernel.blockTimeGreaterThan` directly.
- The daily limit is a genuine rolling window, not a lifetime cap: the spend commitment binds a `periodStart`.
- Public `Counter` fields track members, agents and authorized actions.

### Verified against the installed compiler (0.31.1, language 0.23)

These were probed with a throwaway contract before use, per rule 2:

| Primitive | Result |
| --- | --- |
| `Counter` ledger ADT + `.increment(n)` | available |
| `kernel.blockTimeGreaterThan(Uint<64>)` | available; lowercase `kernel`, argument is seconds since the UNIX epoch (ledger `BlockContext.secondsSinceEpoch`) |
| `kernel.blockTimeLessThan(Uint<64>)` | available |
| `Kernel.blockTimeGreaterThan` (capitalised) | **rejected** — "invalid context for reference to ledger ADT type name Kernel" |
| `Field` argument to the clock | **rejected** — the parameter is `Uint<64>` |
| private witness passed to the clock | **rejected** — requires `disclose`; see §6.6 |
| top-level `const` declaration | **rejected** — parse error in language 0.23 |

---

## 1. Goal

Prove that an **active agent** in an **organization** may perform an **action** under a **private policy**, without publishing the policy values.

Happy path public result: action id + authorized.
Failure path: Compact `assert` fails → proof / transaction does not succeed → UI shows rejection. There is **no** Wave 1 `rejectAction` ledger write.

---

## 2. Confirmed primitives this spec may use

From the Compact reference and official bboard example:

| Primitive | Use |
| --- | --- |
| `export ledger` + `Cell` / assignment | Public fields |
| `Counter` | Optional public counters (avoid if the increment would leak a private quantity) |
| `Map<K, V>` | Agents, actions |
| `Set<T>` | Used action ids (replay) |
| `enum` / `struct` | Public records |
| `Bytes<32>` | Ids and commitments |
| `Uint<64>` | Amounts and limits **inside witnesses / preimages**, not necessarily on ledger |
| `Boolean` | Flags |
| `witness name(...): T;` | Private callbacks (untrusted) |
| `constructor(...)` | One-time init |
| `export circuit` | Entry points |
| `assert(expr, "msg")` | Predicates |
| `disclose(expr)` | Explicit public writes |
| `persistentHash` + `pad` | Commitments (bboard `publicKey` pattern) |
| `default<T>` | Nested map init |

### Must not assume until verified in CompactStandardLibrary + compiler

- Merkle-tree membership proof helpers (the `MerkleTree` **ledger type** exists; the exact witness path API is not pinned here)
- `msg.sender` or wallet-address implicit caller
- DID / VC Compact modules
- Token transfer / Zswap inside this authorization contract (Wave 2 treasury)

---

## 3. Public ledger (intended)

Exact field names are not frozen.

```text
organizationId:        Bytes<32>
organizationStatus:    enum { inactive, active }
adminCommitment:       Bytes<32>

members: Map<Bytes<32>, MemberPublic>
  MemberPublic:
    organizationId:    Bytes<32>
    status:            enum { inactive, active }
    memberCommitment:  Bytes<32>

agents: Map<Bytes<32>, AgentPublic>
  AgentPublic:
    organizationId:    Bytes<32>
    status:            enum { inactive, active }
    memberId:          Bytes<32>         // creating member
    ownerCommitment:   Bytes<32>
    agentCommitment:   Bytes<32>         // agent's own key, for self-modify
    roleCommitment:    Bytes<32>         // hides the private role label
    policyCommitment:  Bytes<32>
    spendCommitment:   Bytes<32>

usedActionIds: Set<Bytes<32>>

actions: Map<Bytes<32>, ActionPublic>   // successful actions only
  ActionPublic:
    agentId:           Bytes<32>
    actionType:        enum { payment }  // disclosed type only
    result:            enum { authorized }
    resultCommitment:  Bytes<32>         // binding of private intent
    periodStart:       Uint<64>          // chain-time-verified public window
    periodEnd:         Uint<64>

memberCount:  Counter
agentCount:   Counter
actionCount:  Counter
```

Do **not** store per-action limit, daily limit, daily spend, vendor list, role labels, credential expiry, or credential bodies on the ledger.

The three `Counter` fields count public records only, so they cannot leak a private quantity. They back the organization screen's MEMBERS / AGENTS numbers with values a judge can verify independently through the indexer.

---

## 4. Private witness surface (intended)

Witnesses are untrusted. Each value used in a predicate must appear in a preimage that the circuit hashes and compares to a public commitment.

Intended witnesses (names not frozen):

Implemented witness surface (16 witnesses, all primitives). This list is
asserted against the compiler-generated `Witnesses` type by
`packages/contracts/src/generated.test.ts`:

```text
witness ownerSecret():              Bytes<32>
witness memberSecret():             Bytes<32>
witness agentSecret():              Bytes<32>
witness agentRole():                Bytes<32>
witness roleSalt():                 Bytes<32>
witness policyPerActionLimit():     Uint<64>
witness policyDailyLimit():         Uint<64>
witness policyVendorId():           Bytes<32>
witness policyCredentialOk():       Boolean
witness policyCredentialExpiry():   Uint<64>   // unix seconds
witness policySelfModifyAllowed():  Boolean
witness policySalt():               Bytes<32>
witness spendPeriodStart():         Uint<64>   // window the spend belongs to
witness spendDaily():               Uint<64>
witness spendSalt():                Bytes<32>
witness nextSpendSalt():            Bytes<32>
```

Intended private structs (local / witness-shaped; only if Compact allows struct witness returns — if not, use a `Vector` of `Bytes<32>` / `Uint<64>` fields and document the encoding):

```text
PolicyPreimage
  perActionLimit:  Uint<64>
  dailyLimit:      Uint<64>
  vendorId:        Bytes<32>    // Wave 1: single allowed vendor
  credentialOk:    Boolean      // Wave 1 stand-in for VC
  salt:            Bytes<32>

SpendPreimage
  dailySpend:      Uint<64>
  salt:            Bytes<32>
```

Wave 1 vendor rule is **one** committed vendor id. That is enough for the $4,800 / supplier-8271 demo and avoids unconfirmed Merkle APIs.

---

## 5. Commitment recipes (adapt to compiler)

Follow the official bboard domain-separation style:

```text
ownerCommitment  = persistentHash([pad(32, "velios:owner:"),    ownerSecret])
memberCommitment = persistentHash([pad(32, "velios:member:"),   memberSecret])
agentCommitment  = persistentHash([pad(32, "velios:agentkey:"), agentSecret])
roleCommitment   = persistentHash([pad(32, "velios:role:"), agentRole, roleSalt])

policyCommitment = persistentHash([
  pad(32, "velios:policy:"),
  encoded(perActionLimit, dailyLimit, vendorId,
          credentialOk, credentialExpiry, selfModifyAllowed, salt)
])

spendCommitment = persistentHash([
  pad(32, "velios:spend:"),
  encoded(periodStart, dailySpend, salt)
])
```

`credentialExpiry` and `selfModifyAllowed` are inside the policy commitment on
purpose: neither can be changed without invalidating the commitment, so an
agent cannot extend its own credential or grant itself self-modify permission.
`periodStart` is inside the spend commitment so a spend balance cannot be
replayed into a different window.

`encoded` must be a Compact-legal encoding (for example fixed `Bytes` concatenation). Phase 2 must use types the compiler accepts. Do not invent a `serialize` API unless it is imported from CompactStandardLibrary (the Compact reference documents generic `serialize` / `deserialize` for events; confirm before using it for commitments).

---

## 6. Operations

### 6.1 `constructor` / `createOrganization`

- Sets `organizationId` (disclosed constructor argument or hash of a disclosed seed).
- Sets `organizationStatus = Active`.
- Initializes empty maps/sets.

Whether organization creation is the contract `constructor` (one org per deploy) or an exported circuit (multi-org in one contract) is an implementation choice. **Prefer one organization per deployed instance** for Wave 1: simpler maps, clearer demo, fewer cross-org bugs.

### 6.1a `registerMember` / `setMemberStatus`

Wave 1 "identity / basic membership".

`registerMember(memberId)` — public arg `memberId`; witnesses `ownerSecret`, `memberSecret`.

- `assert` organization active
- `assert` caller opens `adminCommitment` (admin-gated)
- `assert` member id unused
- write `MemberPublic { active, memberCommitment }`, `memberCount.increment(1)`

`setMemberStatus(memberId, status)` — admin-gated. Revoking a member is the
Wave 1 revocation lever: `authorizeAction` re-checks the agent's member, so
deactivating a member disables every agent it created without touching those
agents.

### 6.2 `createAgent`

Public args: `agentId`, `memberId`.
Witnesses: `ownerSecret`, `memberSecret`, `agentSecret`, `agentRole`, `roleSalt`, policy + spend preimages.
Effects:

- `assert` organization active
- `assert` agent id unused
- `assert` member exists, is active, and `memberSecret` opens its commitment
- write `AgentPublic` with `active`, `memberId`, `ownerCommitment`, `agentCommitment`, `roleCommitment`, and initial policy/spend commitments
- `agentCount.increment(1)`

### 6.3 `setAgentPolicy`

Public args: `agentId`, new `policyCommitment` (or compute commitment in-circuit from witness preimage and `disclose` only the hash).
Witness: `ownerSecret`, `policyPreimage`.
Effects:

- `assert` owner commitment opens
- `assert` hash(preimage) equals the commitment being written
- update `policyCommitment` only

**Preferred:** compute the commitment in-circuit from the witness preimage so a caller cannot publish a commitment they cannot open. This is what the implementation does — no circuit accepts a caller-supplied commitment.

### 6.3a `setAgentPolicyBySelf`

Wave 1 product semantics: **role-only**. The circuit may rewrite `roleCommitment` after opening the committed policy. It does not rotate policy, spend, or owner commitments. Wave 2 policy changes are owner- or governance-gated.

Public arg: `agentId`. Witnesses: `agentSecret`, policy preimage, role preimage.

- `assert` organization active, agent exists and is active
- `assert` `agentSecret` opens `agentCommitment`
- `assert` the **currently committed** policy opens
- `assert` `policySelfModifyAllowed()`

Ordering matters. Because `selfModifyAllowed` is inside the policy commitment,
an agent that tries to flip the flag fails the committed-policy check *before*
the permission check, so it cannot grant itself the permission. Covered by
C30/C31.

### 6.4 Application `requestAction` (not a circuit)

Built in TypeScript:

```text
type: PAYMENT
agentId
recipient   → hashed to vendorId Bytes<32>
amount      → Uint<64>  (operator-supplied; never a public default)
reason      → private, never ledger
actionId    → unique Bytes<32>
```

### 6.5 `authorizeAction`

Public args: `agentId`, `actionId`, `actionType`, `periodStart`, `periodEnd`.
Private circuit args or witnesses: `amount`, `vendorId`, `claimedOrganizationId`, preimages, `ownerSecret`.

`amount` and `vendorId` are circuit parameters (private by default) and are never `disclose`d.

Compiled signature (from the generated `index.d.ts`):

```text
authorizeAction(agentId, actionId, actionType, amount,
                vendorId, claimedOrganizationId, periodStart, periodEnd)
```

Predicates (all `assert`, in order):

1. Organization active
2. `claimedOrganizationId == organizationId`
3. Agent exists, belongs to this organization, status active
4. The agent's member exists and is active (revocation check)
5. Window is chain-valid: `periodEnd > periodStart`, `periodEnd - periodStart <= 86400`, `blockTime > periodStart`, `blockTime <= periodEnd`
6. Owner secret opens `ownerCommitment`
7. Policy preimage opens `policyCommitment`
8. Spend preimage opens `spendCommitment`
9. `credentialOk == true`
10. `credentialExpiry >= periodEnd` (real expiry; see §6.6)
11. `vendorId == policy.vendorId`
12. `amount <= policy.perActionLimit`
13. `spendPeriodStart <= periodStart` (a bucket from a later window is rejected)
14. `carried = (spendPeriodStart == periodStart) ? dailySpend : 0` — the rolling reset
15. `carried + amount <= policy.dailyLimit` (with overflow check)
16. `usedActionIds` does not contain `actionId`
17. Insert `actionId` into `usedActionIds`
18. Write `actions[actionId] = { agentId, actionType, authorized, resultCommitment, periodStart, periodEnd }`
19. `actionCount.increment(1)`
20. Write new `spendCommitment` for `(periodStart, carried + amount)` with a new salt from a witness

Assert messages: generic, no interpolated secrets.

### 6.6 Credential expiry and the ledger clock

Wave 1 enforces expiry against real chain time, but **not** by handing the
private expiry to the clock. Compiler 0.31.1 rejects that outright:
`kernel.blockTimeGreaterThan` is a ledger operation, and passing a witness
value would disclose a bound on it (see `docs/privacy-model.md` §2.1).

The implemented pattern instead:

1. the caller discloses a one-day window `[periodStart, periodEnd]`;
2. the circuit proves against `kernel.blockTimeGreaterThan` that the window is
   at most 86 400 s long and contains the current block time — so the window is
   not a client-asserted label;
3. the circuit asserts `credentialExpiry >= periodEnd` as private arithmetic.

Consequences worth knowing:

- The window doubles as the spend bucket key, so it must be **stable** across a
  day. A sliding window would reset the accumulator on every call and silently
  defeat the daily limit. `authorizationWindow` therefore aligns to UTC days.
- Because the circuit requires `blockTime > periodStart` strictly, a window is
  unusable in its first second and if the node's block time still lags into the
  previous day. `windowIsSafeToSubmit` screens for this and the client returns
  a timeout (retry) rather than reporting a policy rejection.
- Block time carries a documented error bound (`secondsSinceEpochErr`), so
  expiry is only as precise as the window, by design.

### 6.7 Not in Wave 1 Compact

- `rejectAction` / `recordResult` as separate public failure records
- Governance vote / double vote
- Transfers, escrow, NIGHT payments
- DID / VC verification circuits
- Multi-vendor Merkle allow-lists (unless Phase 2 confirms the API and still keeps the slice small)

---

## 7. Authorization predicate (product form)

```text
agent exists
AND agent is active
AND organization matches and is active
AND the agent's member is still active
AND the claimed authorization window really contains chain time
AND owner commitment opens
AND policy commitment opens
AND spend commitment opens
AND credential predicate holds
AND private credential expiry covers the whole window
AND amount <= private per-action limit
AND spend-so-far in THIS window + requested amount <= private daily limit
AND vendor satisfies committed vendor id
AND action id has not been used
```

---

## 8. TypeScript driver responsibilities

The generated Compact TypeScript (`contract/index.js`, `Witnesses` type, `Contract` class) is the only supported host API. Official compiler outputs:

- `compiler/contract-info.json`
- `contract/index.js` + `index.d.ts`
- `zkir/` and `keys/` for exported circuits that touch the ledger

The driver must:

- Implement witnesses from **encrypted private state**, not from URL parameters
- Pass `initialPrivateState` into `deployContract` / `findDeployedContract` using the installed MidnightJS API
- Treat witness outputs as data the circuit will re-bind, not as authority

---

## 9. Test obligations (contract)

See `docs/test-matrix.md`. Minimum Compact-level cases for Wave 1:

| Scenario | Expected | Case |
| --- | --- | --- |
| Valid action | PASS (circuit succeeds; ledger shows authorized) | C1 |
| Amount above per-action limit | REJECT | C2 |
| Daily limit exceeded | REJECT | C3 |
| Inactive agent | REJECT | C4 |
| Invalid credential (`credentialOk` false) | REJECT | C5, C6 |
| Wrong organization | REJECT | C7 |
| Duplicate action id | REJECT | C8 |
| Replay of a successful action | REJECT | C9 |
| Modified witness / wrong preimage | REJECT | C10, C11 |
| Unauthorized policy change | REJECT | C12 |
| Inactive organization | REJECT | C13 |
| Vendor not the committed vendor | REJECT | C14 |
| Duplicate agent id | REJECT | C15 |
| **Expired credential** (real ledger clock) | REJECT | C16 |
| Credential valid exactly to the window end | PASS | C17 |
| Daily limit resets in the next window | PASS | C18 |
| Spend bucket from a later window | REJECT | C19 |
| Window not started / elapsed / too long / inverted | REJECT | C20–C23 |
| Agent created for unknown / wrong / inactive member | REJECT | C24–C26 |
| Revoked member disables its agents | REJECT | C27 |
| `registerMember` by a non-admin | REJECT | C28 |
| Duplicate member id | REJECT | C29 |
| Self policy modification without permission | REJECT | C30 |
| Agent forging the self-modify flag | REJECT | C30 |
| Self policy modification with a wrong agent key | REJECT | C31 |

Governance vote / double vote: Wave 2 only.

Implemented in `packages/contracts/src/replica.test.ts` (37 cases). The
compiled-contract boundary is covered separately by
`packages/contracts/src/generated.test.ts` (X5), which asserts the driver's
witness set and the circuit/ledger surface against the real generated module.

---

## 10. Public vs private (this contract)

| Item | Public | Private |
| --- | --- | --- |
| Org / member / agent ids and status | yes | |
| Owner / member / agent / role / policy / spend commitments | yes | preimages |
| Action id + authorized | yes (success only) | |
| Authorization window on the action record | yes | exact submission instant |
| Member / agent / action counters | yes | |
| Amount, vendor, reason, limits | | yes |
| Role label | | yes (only `roleCommitment` is public) |
| Credential expiry instant | | yes (only "valid through the window" is implied) |
| Self-modify permission | | yes (inside the policy commitment) |
| Which window a private spend balance belongs to | | yes |
| Failed attempts | not on ledger | local proof error |

---

## 11. Phase 2 exit criteria

1. Compact file compiles with the installed compiler (`compact compile ...`).
2. No invented APIs; any deviation from this spec is written back into this file.
3. Positive and negative tests in `tests/contracts` pass.
4. `docs/wave-progress.md` updated.
