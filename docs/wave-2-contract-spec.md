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

`finalizeProposal` writes only the final yes/no counts. Completeness of those counts versus every accepted opening is the experimental tally adapter, not a Compact membership proof.
