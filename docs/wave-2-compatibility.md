# Wave 2 Compatibility

| Component | Verified |
| --- | --- |
| Compact 0.31.1 / language 0.23 | Yes, spikes compiled |
| MidnightJS 4.1.1 `submitCallTx` | Same client pattern as Wave 1 |
| Wallet SDK 1.2.0 unshielded transfer | Documented `WalletFacade.transferTransaction` |
| Full `economy.compact` Preview deploy | **Rejected** — `Transaction would exhaust the block limits` |
| `economy-preview.compact` Preview deploy | **SucceedEntirely** — `bb910a79…e4df` |
| Indexer v4 GraphQL | Same confirmation adapter as Wave 1 |
| `@midnight-ntwrk/midnight-did-api` 0.5.0 | **Not production** — depends on MidnightJS 4.0.2 |
| midnight-verifiable-credentials | Experimental adapter only |
