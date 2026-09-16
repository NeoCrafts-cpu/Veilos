# Wave 2 Contract Spec

Source: `packages/contracts/compact/economy.compact`.

## Public ledger

- Organization id, status, admin commitment
- Credential Merkle tree and revocation nullifiers
- Authorization receipts: action id, agent id, window, result, intent commitment
- Settlement receipts: action id, public amount, recipient commitment, settlement nullifier
- Proposals: public ids, action commitment, windows, quorum commitment, final yes/no
- Ballot commitments and vote nullifiers (no per-vote yes/no)
- Procurement ids, windows, award commitment, winner bid commitment
- Disclosure receipts: auditor id, scope commitment, expiry

## Private witnesses

Holder secret, credential class/expiry/salt/path, policy and spend openings, intent salt, reason digest, ballot choice, bid amount, tally openings.

## Circuits

`issueCredential`, `revokeCredential`, `authorizePayment`, `depositNight`, `settleAuthorizedPayment`, `createProposal`, `castBallot`, `finalizeProposal`, `createProcurement`, `submitBid`, `awardProcurement(actionId)` (requires an unused authorized intent), `recordDisclosure`.

`finalizeProposal` only marks the proposal finalized. Compact does not write a proven tally. Local openings remain an experimental operator adapter.

Preview `authorizePayment` binds vendor and limits into the issued credential commitment and rotates a public `spendCommitment`. Revocation nullifiers are deterministic from the public commitment. `awardProcurement` must name a bid already present for that lot.
