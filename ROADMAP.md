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

Known gap: Preview `authorizeAction` indexer evidence is not retained yet. That write is operator-manual (UI + wallet), not a CLI automation gate.

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

- Operator-manual Preview writes: Wave 1 `authorizeAction`, then Wave 2 credential / authorize / settle (record public tx + indexer rows in `docs/preview-evidence.md`)
- Redeploy the hosted UI after the current fail-closed wallet/proving hardening lands
- Publish companion contract addresses after SucceedEntirely deploys
- YouTube demo + X/Discord posts (`docs/DEMO-SCRIPT.md`, `docs/COMMUNITY.md`)
- Compact cross-contract award lookup when the language supports it

## Future — Wave 3 NETWORK

- credit and reputation
- escrow and agent marketplace
- Effectstream / Kuira where justified
- wallet proving API without a hosted prover
- official DID/VC once MidnightJS 4.1.1 compatible
