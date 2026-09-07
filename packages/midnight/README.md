# `@velios/midnight`

Typed adapters for wallet, proof server, indexer, and network configuration.

Pinned to official hello-world MidnightJS **4.1.1**. Inspect `node_modules` types before changing call sites.

- `src/network.ts` — official LOCAL/PREVIEW/PREPROD endpoints
- `src/node.ts` — official provider factories
- `src/browser.ts` — DApp Connector v4
- `src/client.ts` — `deployContract` / `submitCallTx` (dynamic import)
- Preview/Preprod Node deploy lives in `@velios/cli` (`pnpm deploy:preview`) using official Wallet SDK 1.2.0 (`WalletFacade.init`)
- `src/published.ts` — public Preview contract address / org id
- `src/join.ts` — official `findDeployedContract` + indexer `queryContractState`
- `src/ledger-view.ts` — Compact `ledger()` → public UI types
