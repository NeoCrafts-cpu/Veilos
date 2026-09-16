# Preview evidence

Claims below are public facts only. No seeds, witnesses, or private state.

## Wave 1 organization (published)

- Network: Preview
- Contract: `0787a1918a339a98a4442e5f1fe370506e1bb838d5819205afa79e53ab2d8e02`
- Organization id: `84325409dceb448a816ea6dbf96829c207488738ff6c7d4ac1276cae19464cab`
- Proven: `deployOrganization` and `registerMember` returned `SucceedEntirely` (2026-09-13)
- Public ledger at last operator read: 1 member, 1 agent, **0 actions**

## Wave 1 authorization on Preview

Not yet retained. A confirmed `authorizeAction` plus exact indexer row is required before calling Wave 1 “proven on Preview.” Local I1–I7 cover the flow when `VELIOS_REQUIRE_MIDNIGHT=1` and a local seed is present. Live Preview is gated on `VELIOS_LIVE_PREVIEW`.

## Wave 2 Preview core (published)

The full 12-circuit `economy.compact` deploy was submitted and rejected by Preview with `Transaction would exhaust the block limits`. The deployable Preview slice is `economy-preview.compact` (credentials, authorize, unshielded settle).

- Network: Preview
- Contract: `0b4a8d7e906a1c05d2c3c788ecf46682387e2239a4df96b201f34ff489547c8f`
- Organization id: `84325409dceb448a816ea6dbf96829c207488738ff6c7d4ac1276cae19464cab`
- Deploy tx: `00a858c27854e88af1c7d9b0d8556c6ce2c30b6dfc237aa79dce45981fcc8d1e2b`
- Proven: `deployContract` returned `SucceedEntirely` (2026-09-16)
- Indexer: `contractAction` typename `ContractDeploy`; `contract(address)` returns this address

Credential issuance, authorize, and unshielded settlement txs are not retained yet.

Companion `governance-preview`, `procurement-preview`, and `auditor-preview` addresses are created from the operator app. They are not baked into git until a `SucceedEntirely` deploy plus exact indexer row is retained here.

Live cases W2-L1–W2-L7 stay gated on `VELIOS_LIVE_PREVIEW=1` plus a real wallet and proof provider. Local replica tests are not Preview evidence.
