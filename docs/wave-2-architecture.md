# Wave 2 Architecture

Wave 1 `authorization.compact` is frozen as the legacy organization contract.

New organizations compile `packages/contracts/compact/economy.compact`, a single facade for credentials, authorization v2, unshielded NIGHT treasury, governance, procurement, and disclosure receipts.

Preview currently hosts `economy-preview.compact`: the same credential / authorize / unshielded-settlement circuits without HistoricMerkleTree, governance, or procurement. The full 12-circuit facade exceeded Preview block limits (`Transaction would exhaust the block limits`).

## Decisions

- Credentials: organization-issued first. Official Midnight DID/VC stay behind adapters.
- Settlement: unshielded native NIGHT. Amount, recipient, tx id, and timing are public.
- Authorization remains private: policy, spend openings, credential body, and reason stay in witnesses.
- One economy deployment unless a later verified cross-contract spike proves otherwise.
- Published ACME `economy-preview` is public/read-only. The UI never mints an owner secret for that address. Write circuits require a user-owned deploy whose owner secret is sealed in the Wave 2 vault.
- `depositNight` is `receiveUnshielded`. There is no dedicated public deposit map. The UI reports `submitted` after `SucceedEntirely` and does not invent a unique public deposit row. Amount is disclosed on the unshielded transfer.
- Preview `authorizePayment` binds vendor and limits into the issued credential commitment, binds daily spend to a rotating public `spendCommitment`, and uses a deterministic revocation nullifier. The committed bucket start is disclosed so Compact can prove it elapsed; the spend amount stays private.
- `finalizeProposal` only closes the proposal. Compact does not prove a tally.
- `awardProcurement` requires the winner commitment to exist in `bidCommitments` for that lot.

## Verified Compact APIs (compiler 0.31.1)

| Spike | Result |
| --- | --- |
| `receiveUnshielded` / `sendUnshielded` | Compiled |
| `HistoricMerkleTree` + `merkleTreePathRoot` | Compiled with `disclose(root)` |
| `UserAddress.bytes` | Compiled |

## Packages

`@velios/credentials`, `@velios/identity`, `@velios/economy`, `@velios/governance`, `@velios/procurement`, `@velios/auditor`, plus Midnight adapters in `@velios/midnight`.
