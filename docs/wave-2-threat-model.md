# Wave 2 Threat Model

| Threat | Mitigation |
| --- | --- |
| Forge `credentialOk` | Removed. Membership, class, expiry, and revocation are proved. |
| Settle a different amount or recipient | Intent commitment binds amount and `UserAddress.bytes`. |
| Double settlement | Public settlement nullifier. |
| Infer votes from ledger deltas | No public yes/no increment per ballot. |
| Publish losing bids | Only winner/award commitments are public. |
| Global auditor key | No organization-wide decryption. |
| Untrusted prover | Witnesses still go only to the wallet prover or a trusted local proof server. |
| Version-skewed DID/VC | Official adapters stay experimental until MidnightJS 4.1.1 tests pass. |
