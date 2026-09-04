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
- Unshielded NIGHT settlement publishes amount, recipient, tx id, and timing. Authorization, credentials, ballots, and losing bids stay private. Official Midnight DID/VC adapters are experimental until MidnightJS 4.1.1 compatibility is proven.
- See `docs/threat-model.md` for the Wave 1 threat catalog.
