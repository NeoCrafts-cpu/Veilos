# Wave 2 Architecture

Wave 1 `authorization.compact` is frozen as the legacy organization contract.

New organizations compile `packages/contracts/compact/economy.compact`, a single facade for credentials, authorization v2, unshielded NIGHT treasury, governance, procurement, and disclosure receipts.

Preview currently hosts `economy-preview.compact`: the same credential / authorize / unshielded-settlement circuits without HistoricMerkleTree, governance, or procurement. The full 12-circuit facade exceeded Preview block limits (`Transaction would exhaust the block limits`).

## Decisions

- Credentials: organization-issued first. Official Midnight DID/VC stay behind adapters.
- Settlement: unshielded native NIGHT. Amount, recipient, tx id, and timing are public.
- Authorization remains private: policy, spend openings, credential body, and reason stay in witnesses.
- One economy deployment unless a later verified cross-contract spike proves otherwise.

## Verified Compact APIs (compiler 0.31.1)

| Spike | Result |
| --- | --- |
| `receiveUnshielded` / `sendUnshielded` | Compiled |
| `HistoricMerkleTree` + `merkleTreePathRoot` | Compiled with `disclose(root)` |
| `UserAddress.bytes` | Compiled |

## Packages

`@velios/credentials`, `@velios/identity`, `@velios/economy`, `@velios/governance`, `@velios/procurement`, `@velios/auditor`, plus Midnight adapters in `@velios/midnight`.
