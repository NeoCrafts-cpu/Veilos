# VELIOS Security Rules

Private by default.

Never expose through:
- console.log
- URL/query parameters
- client analytics
- public events
- server logs
- error messages
- telemetry
- screenshots in automated tests

Protect:
- private witnesses
- private credentials
- policy values
- private financial state
- wallet secrets
- signing material
- user-controlled sensitive metadata

Every authorization feature must include negative tests.
Every asynchronous transaction flow must handle:
- pending
- success
- failure
- timeout
- stale state
- rejected proof

The UI must never display a successful result from optimistic state alone.

## Additional VELIOS rules

- Official Compact documentation states that witness callbacks are untrusted input. A circuit must not treat a witness-returned limit, credential, or vendor flag as authoritative unless it is bound to a public commitment or other on-ledger check.
- Failed `assert` in Compact is a dynamic error: the proof / transaction does not succeed. Do not record a public "rejected" ledger row unless that is an intentional, separately specified successful circuit.
- Never persist seed phrases, mnemonics, or `deployment.json` contents in git.
- Indexer data is eventually consistent. Treat it as observed public state, not as proof of local private-state correctness.
- A successful submission followed by stale indexer read-back must retain any encrypted private opening needed to use or reconcile that transaction. It must still be labeled stale, never confirmed.
- Revalidate connector status, network, and account immediately before wallet balancing/submission. A detected account/network change locks operator state and invalidates providers.
- Hosted UI proving uses the wallet `getProvingProvider` capability. Arbitrary hosted HTTP provers are rejected because they would receive private witnesses; loopback proving remains an explicit local fallback.
- Static hosts must ship the CSP and related security headers in `vercel.json` / `render.yaml`.
- Unshielded NIGHT settlement publishes amount, recipient, tx id, and timing. Authorization, credentials, ballots, and losing bids stay private. Official Midnight DID/VC adapters are experimental until MidnightJS 4.1.1 compatibility is proven.
- See `docs/threat-model.md` for the Wave 1 threat catalog.
