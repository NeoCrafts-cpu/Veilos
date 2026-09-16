# Preview evidence

Claims below are public facts only. No seeds, witnesses, or private state.

## Wave 1 organization (operator-owned, UI default)

- Network: Preview
- Contract: `4b31d10bf6aba347cc0f041856488fa07cfe2604db7a4b1d432123c277a9e64b`
- Organization id: `84325409dceb448a816ea6dbf96829c207488738ff6c7d4ac1276cae19464cab`
- Proven: `deployOrganization` and `registerMember` returned `SucceedEntirely` (2026-09-20)
- Public ledger at last operator read: 1 member, 1 agent, **0 actions**

Earlier public ACME instance `0787a1918a339a98a4442e5f1fe370506e1bb838d5819205afa79e53ab2d8e02` (2026-09-13) remains on Preview and is no longer the UI default.

## Wave 1 authorization on Preview

Not yet retained. After `SucceedEntirely` plus the exact indexer action row, record only public fields here.

- Network:
- Contract:
- Action id:
- Tx id:
- Status:

## Wave 2 Preview core (operator-owned, UI default)

The full 12-circuit `economy.compact` deploy was submitted and rejected by Preview with `Transaction would exhaust the block limits`. The deployable Preview slice is `economy-preview.compact` (credentials, authorize, unshielded settle).

- Network: Preview
- Contract: `bb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df`
- Organization id: `84325409dceb448a816ea6dbf96829c207488738ff6c7d4ac1276cae19464cab`
- Deploy tx: `005e082246788ba1b2215a91ddc9987a480c218e16c494b5667af6e11342235634`
- Proven: `deployContract` returned `SucceedEntirely` (2026-09-20)
- Indexer: `contractAction` typename `ContractDeploy`; `contract(address)` returns this address

Earlier economy-preview `0b4a8d7e906a1c05d2c3c788ecf46682387e2239a4df96b201f34ff489547c8f` remains on Preview and is no longer the UI default.

Credential issuance, authorize, and unshielded settlement txs are not retained yet.

Companion `governance-preview`, `procurement-preview`, and `auditor-preview` addresses are created from the operator app. They are not baked into git until a `SucceedEntirely` deploy plus exact indexer row is retained here.

Local replica tests are not Preview evidence.
