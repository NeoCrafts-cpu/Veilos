# VELIOS Privacy Model

Wave: 1 CORE + 2 ECONOMY. Update this file when a circuit or UI surface changes what is public. Unshielded settlement amount and recipient are public by design.

Principle: **Sensitive inputs remain private. Actions are verified. Only necessary results become public.**

---

## 1. Default classification

### Private by default

- Agent role details beyond the public status flag (the role label is hashed into `roleCommitment`)
- Private policy values (per-action limit, daily limit, vendor allow-list contents, self-modify permission)
- Raw credential contents and expiry instants (Wave 1 commits to the expiry and proves it against a public window; see §2.1)
- Exact private spend / treasury figures, and which window a spend belongs to beyond what the action record already discloses
- Organization membership secrets used to form member commitments
- Agent keys used for the self-modify path
- Owner / principal secrets used to form owner commitments
- Salts and commitment preimages
- Action reason text and internal business metadata
- Supplier profile details beyond a public recipient identifier if that identifier is intentionally disclosed
- Individual governance ballots (Wave 2)
- Private vendor bids (Wave 2)
- Wallet seeds, mnemonics, spending keys

### Public when required for verification

- Organization identifier and active/inactive status
- Member identifier and active/inactive status
- Agent identifier, organization binding, creating member, active/inactive status
- Owner / member / agent commitments (hashes), not the underlying secrets
- Role commitment (hash), not the role label
- Policy commitment (hash), not the policy values
- Daily-spend commitment (hash), not the spend value or its window
- Action identifier
- Action type (for example PAYMENT) if we choose to disclose it for the demo
- The authorization window `[periodStart, periodEnd]` on the action record — this is the public timestamp, and it is chain-time verified rather than client-asserted
- Member / agent / authorized-action counters (`Counter` ledger fields). These count public records only; they never encode a private quantity
- Authorization result for **successful** actions
- Transaction id / contract address / proof-related public references
- Indexer-visible timestamps or block height after confirmation

Whether action **amount** and **recipient** are public is a product choice. Wave 1 demo copy shows recipient `supplier-8271` and amount `$4,800` on the request screen (local UI). Those values must **not** be written to the ledger unless a later revision of `docs/contract-spec.md` explicitly `disclose`s them. Default: keep amount and recipient private; disclose only that a PAYMENT action was authorized.

---

## 2. Compact disclosure rules

Official Compact behavior:

- Circuit parameters and witness returns are witness data (private by default).
- Storing witness-derived values in the ledger, returning them from an exported circuit, or using them in conditionals that affect public outputs requires `disclose()`.
- Compact 0.31 also requires `disclose()` before a circuit parameter is used as a `Map` / `Set` key (`member`, `lookup`, `insert`). Wave 1 `agentId`, `memberId` and `actionId` are public identifiers, so circuits disclose them before ledger key operations.
- `disclose()` does not encrypt or hash; it only permits disclosure. Hash **before** `disclose` when the public value must be a commitment.

### 2.1 The ledger clock leaks bounds on its argument

Verified against compiler 0.31.1: `kernel.blockTimeGreaterThan(t: Uint<64>)` is a
**ledger operation**. Passing a private value as `t` is rejected with

```text
potential witness-value disclosure must be declared but is not:
  ledger operation might disclose the upper bound of the time being checked the witness value
```

This is correct — a timestamp comparison against the chain clock reveals which
side of "now" the private value sits on, and repeated calls would binary-search
it. Wave 1 therefore **never** passes the private credential expiry to the
clock. Instead `authorizeAction`:

1. takes a **disclosed** `[periodStart, periodEnd]` window,
2. proves against the ledger clock that the window is at most 86 400 s long and
   contains the current block time, then
3. asserts `credentialExpiry >= periodEnd` as ordinary private arithmetic.

The public leak is therefore coarse and bounded: an observer learns only
"this credential was valid through the end of the window in which the action was
authorized", never the expiry instant. See `docs/contract-spec.md` §6.6.

VELIOS rule: if a value is in the private list above, the circuit must either keep it private or disclose only a `persistentHash` (or equivalent documented commitment) of that value.

---

## 3. Channel rules

| Channel | Allowed | Forbidden |
| --- | --- | --- |
| Public ledger | Ids, commitments, success result | Policy integers, secrets, credential bodies |
| Indexer / GraphQL | Same as public ledger | Treating private state as queryable |
| Wallet / DApp Connector | What the wallet already holds | Extra private policy dumps in connector metadata |
| URL / query / hash routes | Public ids, network name | Amounts, limits, seeds, credentials |
| `localStorage` / LevelDB private store | Encrypted operator vault (`velios.vault.v1.{network}.{contract}` via PBKDF2 + AES-GCM); public workspace selection; official Level store; in-memory decrypted state after unlock; labelled DEV export loaded only after a passphrase | Plaintext policy, secrets, or encoded private state in `localStorage` “for convenience” |
| Console / logs / errors | Public error codes, circuit assert **messages** that do not embed secrets | Limits, preimages, seeds |
| UI Privacy Inspector | Labels + masked private slots + public slots | Rendering real private values to “make the demo clearer” except on an explicit local disclosure control owned by that principal |
| Tests / screenshots | Fixtures that never ship as production logs | CI artifacts that print witness preimages |

Official Compact `assert` messages are public in the sense that they appear in local errors. Wave 1 assert messages must be generic (`"policy predicate failed"`, `"replay"`) and must not interpolate private integers.

---

## 4. Privacy Inspector (Phase 7)

Educational, not decorative. It must reflect the real boundary:

```text
PRIVATE INPUTS              PUBLIC OUTPUT
Agent role      ██████      Action ID
Spending limit  ██████      Result
Policy values   ██████      Contract
Credential      ██████      Timestamp
Vendor profile  ██████      Proof / tx ref
```

The inspector may show that a field **exists** and is **private**. It must not print the underlying secret.

---

## 5. Wave 1 residual disclosures (accepted)

- Creating an organization, member and agent reveals that those entities exist.
- A successful authorization reveals that **some** action of a disclosed type was authorized inside a public one-day window.
- The action record's window implies the credential was valid through the end of that window (see §2.1). The expiry instant itself stays private.
- The public counters reveal how many members, agents and authorized actions exist.
- Proof / transaction metadata is public by nature of the network.
- A failed proof reveals that **an attempt failed**. It must not reveal **which** private predicate failed if that would encode the secret (prefer a single generic policy-failure message). `credential expired`, `stale period` and `self modify denied` are accepted as distinct messages because each names a *category* without carrying a value; they are produced locally and are asserted secret-free in `packages/midnight/src/status.test.ts`.

---

## 6. Change control

Any new `disclose()`, new exported ledger field, or new query-string parameter requires an update to this file and a privacy regression test in `docs/test-matrix.md`.
