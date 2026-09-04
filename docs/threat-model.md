# VELIOS Threat Model

Wave: 1 (CORE). Each row is a threat the Wave 1 authorization loop must address.

Format: Threat → Impact → Mitigation → Test → Residual risk.

---

### 1. Unauthorized agent action

- **Threat:** A caller invokes `authorizeAction` for an agent they do not control.
- **Impact:** Funds or authority used without the principal’s policy.
- **Mitigation:** Bboard-style owner commitment. Witness provides owner secret; circuit hashes and `assert`s equality with the public owner commitment. Do not trust a witness boolean `isOwner`.
- **Test:** Contract negative test: wrong owner secret → assert / proof fail.
- **Residual risk:** Stolen owner secret is equivalent to stolen control. Protect private state storage.

### 2. Excessive spending

- **Threat:** Requested amount exceeds the private per-action or daily limit.
- **Impact:** Policy bypass; overspend.
- **Mitigation:** Witness returns policy preimage and current spend preimage; circuit binds both to public commitments; `assert(amount <= perActionLimit)` and `assert(carried + amount <= dailyLimit)`; write a new daily-spend commitment only on success. The spend commitment binds its window (`periodStart`), so the "daily" cap is genuinely per-window and a balance cannot be replayed into a different window.
- **Test:** C2 amount above limit; C3 daily overflow; C18 next-window reset; C19 spend bucket from a later window. Do not publish the limit in the error.
- **Residual risk:** Commitment-scheme implementation bugs. Covered by hash-binding tests. An agent that simply waits for the next window legitimately gets a fresh allowance — that is the intended meaning of a daily limit, not a bypass.

### 3. Expired credential

- **Threat:** Agent acts after a credential expiry.
- **Impact:** Stale authority.
- **Mitigation:** **Resolved against a real clock.** `credentialExpiry` (unix seconds) is bound inside the policy commitment, so it cannot be edited without invalidating it. `authorizeAction` takes a disclosed `[periodStart, periodEnd]` window, proves via `kernel.blockTimeGreaterThan` that the window is at most 86 400 s long and contains the current block time, then asserts `credentialExpiry >= periodEnd`. The clock is the ledger's, not a client argument, so the window cannot be backdated.
- **Test:** C16 expiry before the window end rejects; C17 expiry exactly at the window end passes; C20/C21 reject a window that has not started or has elapsed; C22/C23 reject an over-long or inverted window.
- **Residual risk:** Expiry is only as precise as the window (one day), and block time carries a documented error bound (`secondsSinceEpochErr`). Tightening precision would leak a narrower bound on the private expiry, so the coarseness is deliberate — see `docs/privacy-model.md` §2.1.

### 4. Revoked credential

- **Threat:** Credential revoked but agent still authorizes.
- **Impact:** Same as expired authority.
- **Mitigation:** Two independent levers. (a) The admin calls `setMemberStatus(memberId, inactive)`; `authorizeAction` re-checks the agent's member on every call, so deactivating a member instantly disables every agent it created without touching those agents. (b) The owner rotates the policy commitment via `setAgentPolicy`, which invalidates the old preimage.
- **Test:** C27 revoked member disables its agent's authorizations; C26 rejects agent creation under an inactive member.
- **Residual risk:** Delayed revocation if the admin does not update state. Revocation costs a transaction, so it is not instant.

### 5. Wrong organization

- **Threat:** Action bound to org A executed against org B’s agent or contract.
- **Impact:** Cross-org authorization.
- **Mitigation:** Agent public record includes `organizationId`. Circuit `assert`s the call’s org id matches the agent’s org. Separate contract instances per org are also acceptable; then the contract address is the org boundary.
- **Test:** Wrong org id → reject.
- **Residual risk:** None beyond mis-deployment of the wrong contract address in the UI.

### 6. Wrong agent

- **Threat:** Policy or action applied to a different agent id.
- **Impact:** Confused-deputy authorization.
- **Mitigation:** Action witness / circuit args include `agentId`. Look up that agent in the public `Map`. `assert` status and commitments for **that** id only.
- **Test:** Action for agent B using agent A’s policy preimage → commitment mismatch → reject.
- **Residual risk:** None if lookups are id-keyed.

### 7. Replay / duplicate action

- **Threat:** The same successful action (or the same `actionId`) is submitted twice.
- **Impact:** Double authorization / double spend semantics.
- **Mitigation:** Public `Set` (or `Map`) of used action ids. `assert` not already member; insert on success. Client generates unique `Bytes<32>` action ids.
- **Test:** Second submit of the same id rejects. Duplicate concurrent submits: at most one ledger success.
- **Residual risk:** If action id is attacker-chosen and not bound to intent contents, an attacker might burn ids. Bind `actionId` to a hash of intent fields if Compact hashing of those fields is confirmed.

### 8. Tampered private witness

- **Threat:** Malicious DApp returns inflated limits or `vendorAllowed = true`.
- **Impact:** Complete policy bypass (this is the official Compact witness-untrusted model).
- **Mitigation:** Never accept unbound witness values. Always `persistentHash` (or documented equivalent) the preimage and `assert` against the public commitment.
- **Test:** Modified witness preimage with matching-looking limits but wrong hash → reject. Modified witness with correct hash but mutated after hash → impossible if circuit hashes the same values it asserts.
- **Residual risk:** Weak or truncated hashes. Use documented `persistentHash` / `pad` domain separation (bboard pattern).

### 9. Forged commitment

- **Threat:** Attacker writes an arbitrary policy commitment they can later open to a weak policy.
- **Impact:** Self-issued “easy” policy.
- **Mitigation:** Only `setAgentPolicy` (authorized by owner commitment) may change the policy commitment. Constructor / `createAgent` sets a known empty or initial commitment. `sealed` fields where the language allows and the value must not change.
- **Test:** Unauthorized policy change rejects. After a valid set, only the new preimage opens.
- **Residual risk:** Owner-key compromise.

### 10. Unauthorized policy modification

- **Threat:** Non-owner calls `setAgentPolicy`, or an agent rewrites its own policy to raise its limits.
- **Impact:** Limits raised or vendor list replaced.
- **Mitigation:** `setAgentPolicy` requires the owner commitment to open. The agent-driven path, `setAgentPolicyBySelf`, requires the agent's own key **and** `policySelfModifyAllowed()`. Because that flag lives inside the policy commitment, an agent attempting to flip it fails the committed-policy check *before* the permission check, so it cannot grant itself the permission. Wave 2 may route changes through governance.
- **Test:** C12 unauthorized `setAgentPolicy`; C30 self-modify denied and flag-forgery blocked; C31 wrong agent key.
- **Residual risk:** Same as owner-secret theft. An agent legitimately granted `selfModifyAllowed` can rotate its own role commitment.

### 11a. Unencrypted operator state at rest

- **Threat:** Encoded private state and plaintext policy integers sit in `localStorage`.
- **Impact:** Anyone with device access can open the organization’s commitments.
- **Mitigation:** Contract-scoped WebCrypto vault (PBKDF2 210000 + AES-GCM). Decrypted state stays in memory. Export/import uses the same envelope. DEV plaintext is labelled and never auto-unlocked.
- **Test:** Vault round-trip; privacy suite forbids plaintext `localStorage` outside vault/workspace adapters; ciphertext JSON has no `perActionLimit`.
- **Residual risk:** Weak passphrase or XSS in the origin can still unlock the vault.

### 11. Private-state leakage through frontend logs

- **Threat:** `console.log` of witnesses, limits, or seeds.
- **Impact:** Browser / support / CI leak.
- **Mitigation:** Logging policy in `SECURITY.md`. Privacy regression tests grep for forbidden keys. No production logger in witness code paths.
- **Test:** Privacy suite: no private fields in captured logs.
- **Residual risk:** Third-party wallet extensions may log independently.

### 12. Private-state leakage through URL / query parameters

- **Threat:** Amount, limit, or credential in `?amount=4800`.
- **Impact:** History, referrer, analytics leaks.
- **Mitigation:** Routes use only public ids (`/org/:orgId/agent/:agentId/actions/:actionId`). Intent bodies stay in memory or private state.
- **Test:** Router snapshot / privacy test: query string has no private keys.
- **Residual risk:** User-pasted URLs.

### 13. Private-state leakage through analytics

- **Threat:** Telemetry SDK captures form fields.
- **Impact:** Third-party disclosure.
- **Mitigation:** Wave 1 ships **no** analytics SDK.
- **Test:** Dependency review: no analytics packages.
- **Residual risk:** Browser extensions.

### 14. Malicious vendor / supplier input

- **Threat:** Recipient field used for injection, oversized payloads, or to confuse allow-list checks.
- **Impact:** Failed circuits, UI XSS, false allow.
- **Mitigation:** Vendor identity is a fixed-width `Bytes<32>` (or hashed opaque string) inside the commitment. UI treats recipient as data, not HTML. Circuit allow-list check is hash/membership, not string compare of free text.
- **Test:** Oversized / unexpected recipient encodings fail closed.
- **Residual risk:** If Wave 1 discloses a public recipient string, XSS in the result view. Keep it escaped.

### 15. Frontend falsely displaying success when the transaction failed

- **Threat:** Optimistic UI or ignored `FailEntirely` / proof error.
- **Impact:** Judge-visible fake demo; user believes funds moved.
- **Mitigation:** Success only after documented success status (`SucceedEntirely` in current MidnightJS docs) **and** matching public ledger result. Map `FailFallible` to failure for Wave 1.
- **Test:** Integration + E2E: forced proof failure and submit failure never show AUTHORIZED.
- **Residual risk:** Indexer delay; show pending, not success.

### 16. Stale indexer state presented as final truth

- **Threat:** UI reads an old action list and hides a new authorization, or shows a previous result as current.
- **Impact:** Incorrect audit view.
- **Mitigation:** Track in-flight tx ids. Subscriptions + explicit refetch. Label indexer data “observed” until confirmed. Do not clear pending on a stale snapshot that lacks the tx.
- **Test:** Integration: delayed indexer fixture stays pending.
- **Residual risk:** Indexer outage. Show disconnected / stale, never forged success.

### 17. Partial transaction / asynchronous state mismatch

- **Threat:** Wallet submitted, UI crashed, private spend commitment locally advanced but ledger did not (or the reverse).
- **Impact:** Next authorization cannot open the spend commitment; or local preview lies.
- **Mitigation:** Private spend preimage updates only after confirmed success. Rehydrate private state from the last successful opening. Handle pending / timeout explicitly.
- **Test:** Kill-switch mid-submit; restart; state is consistent or clearly pending.
- **Residual risk:** User copies private state across machines incorrectly.

### 18. Experimental Midnight ecosystem integration as a single point of failure

- **Threat:** DID, VC, Effectstream, or Kuira required for Wave 1 core.
- **Impact:** Core demo blocked by immature APIs.
- **Mitigation:** Wave 1 uses only Compact + MidnightJS + wallet + proof + indexer. All other ecosystem features stay behind empty adapters until Wave 2/3.
- **Test:** Architecture review: no Wave 2 imports on the authorize path.
- **Residual risk:** MidnightJS / Compact version drift (see `docs/dependency-report.md`).

---

## Wave 2 threats

| Threat | Mitigation | Residual |
| --- | --- | --- |
| Revoked or expired credential authorizes | Compact Merkle membership + expiry vs chain window + revocation nullifier | Stolen holder secret |
| Altered amount/recipient after authorize | Intent commitment rebound at settlement | Unshielded amount/recipient are public by design |
| Double settlement | Settlement nullifier | Indexer lag shown as stale, not settled |
| Vote choice inferred from per-vote counters | Ballot commitment + proposal-scoped nullifier only | Experimental tally completeness adapter |
| Losing bid leakage | Public state stores commitments only | Procurement operator sees openings for winner proof |
| Overbroad auditor export | Scoped, expiring, encrypted grants | No global org decryption key |
| Official DID/VC version skew | Fail-closed experimental adapters | Organization-issued credentials remain the predicate |
