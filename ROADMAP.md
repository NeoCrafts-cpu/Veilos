# VELIOS Roadmap

Status is taken from the repository, not from marketing copy.

## Completed — Wave 1 CORE

Live on Midnight Preview (`authorization.compact`):

- organization deploy and join
- founding-member registration
- agent create + private policy commitments
- `authorizeAction` fail-closed Compact proof
- operator vault (PBKDF2 + AES-GCM)
- DApp Connector v4 wallet
- official Preview indexer read-back
- Privacy Inspector

Known gap: Preview `authorizeAction` indexer evidence is not retained yet.

## Current — Wave 2 ECONOMY (Preview-sized)

Live in this build:

- `economy-preview.compact` published on Preview (credentials, `authorizePayment`, `depositNight`, `settleAuthorizedPayment`)
- Organization-issued credentials (issue / expiry / revoke)
- Unshielded NIGHT deposit and authorization-bound settlement
- Preview-sized companion contracts: `governance-preview`, `procurement-preview`, `auditor-preview`
- In-app Docs + truthful roadmap

Experimental / not claimed as complete:

- Official Midnight DID/VC (adapter targets MidnightJS 4.0.2; Veilos is 4.1.1)
- Trustless ballot tally completeness
- Full 12-circuit `economy.compact` on Preview (rejected: block limits)

## Next

- Retain Wave 1 `authorizeAction` Preview evidence
- Publish companion contract addresses after SucceedEntirely deploys
- Compact cross-contract award lookup when the language supports it

## Future — Wave 3 NETWORK

- credit and reputation
- escrow and agent marketplace
- Effectstream / Kuira where justified
- wallet proving API without a hosted prover
- official DID/VC once MidnightJS 4.1.1 compatible
