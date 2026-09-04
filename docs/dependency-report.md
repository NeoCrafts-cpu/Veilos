# VELIOS Dependency and Version Report

Updated: 2026-09-12

Method: official `midnightntwrk/example-hello-world` `package.json` + `compose.yml` + MidnightJS 4.1.1 type definitions on unpkg + Compact reference / ledger ADT docs.

---

## 1. Pinned from official hello-world (lockfile-intended)

| Package | Version | Role |
| --- | --- | --- |
| `@midnight-ntwrk/midnight-js-protocol` | 4.1.1 | Compact-js `CompiledContract`, runtime |
| `@midnight-ntwrk/midnight-js-contracts` | 4.1.1 | `deployContract`, `submitCallTx`, `findDeployedContract` |
| `@midnight-ntwrk/midnight-js-types` | 4.1.1 | `MidnightProviders` |
| `@midnight-ntwrk/midnight-js-network-id` | 4.1.1 | `setNetworkId` |
| `@midnight-ntwrk/midnight-js-utils` | 4.1.1 | helpers |
| `@midnight-ntwrk/midnight-js-indexer-public-data-provider` | 4.1.1 | `indexerPublicDataProvider(indexer, indexerWS)` |
| `@midnight-ntwrk/midnight-js-http-client-proof-provider` | 4.1.1 | `httpClientProofProvider(proofServer, zkConfigProvider)` |
| `@midnight-ntwrk/midnight-js-level-private-state-provider` | 4.1.1 | `levelPrivateStateProvider({ privateStateStoreName, privateStoragePasswordProvider, accountId })` |
| `@midnight-ntwrk/midnight-js-node-zk-config-provider` | 4.1.1 | `NodeZkConfigProvider` |
| `@midnight-ntwrk/midnight-js-fetch-zk-config-provider` | 4.1.1 | Browser `FetchZkConfigProvider` |
| `@midnight-ntwrk/dapp-connector-api` | 4.0.0 | Browser `InitialAPI.connect(networkId)` |
| `@midnight-ntwrk/wallet-sdk` | 1.2.0 | Official barrel used by hello-world / acquire-tokens (`WalletFacade.init`) |
| `@noble/hashes` | 1.8.x | SHA-256 for local commitment preview |

## 2. Official local stack images (hello-world compose.yml)

| Image | Tag |
| --- | --- |
| `midnightntwrk/proof-server` | 8.1.0 |
| `midnightntwrk/indexer-standalone` | 4.3.3 |
| `midnightntwrk/midnight-node` | 1.0.0 |

Indexer GraphQL: `/api/v4/graphql` (hello-world `LOCAL_CONFIG`).

## 3. Compact

| Item | Value |
| --- | --- |
| Language | `pragma language_version 0.23` (hello-world + Compact reference) |
| CLI | `compact compile <src> <out>` |
| Hash | `persistentHash` + `pad` (bboard) |
| Collections | `Map.insert/lookup/member`, `Set.insert/member` (ledger ADT docs) |

`Kernel.blockTime*` exists in current ledger ADT docs (language 0.26 / compiler 0.34). Wave 1 does **not** use Kernel; credential expiry is the committed `credentialOk` predicate until that API is compiled in this repo.

## 4. Confirmed TypeScript call shape (hello-world test)

```ts
deployContract(providers, {
  compiledContract,
  privateStateId,
  initialPrivateState,
  args, // constructor parameters when present
});

submitCallTx(providers, {
  compiledContract,
  contractAddress,
  privateStateId,
  circuitId,
  args,
});
```

Success status: `SucceedEntirely`. `FailFallible` / `FailEntirely` are failures.

## 5. Still environment-dependent

1. Compact compiler is installed locally (`compact` 0.31 / language 0.23). Artifacts are gitignored under `packages/contracts/managed/`.
2. Docker is not on PATH here; integration I2–I7 skip unless `VELIOS_REQUIRE_MIDNIGHT=1`. Preview deploys need a reachable proof server (Docker or wallet Proof Station).
3. Browser providers follow the official leaderboard DApp: `FetchZkConfigProvider` + wallet `balanceUnsealedTransaction` / `submitTransaction`.
4. Node 22.20.0 is installed at `$HOME/.local/node-v22.20.0-linux-x64`.

## 6. Wave 2 verified Compact APIs (2026-09-16, compiler 0.31.1)

| API | Spike | Result |
| --- | --- | --- |
| `receiveUnshielded` / `sendUnshielded` | `compact/spikes/unshielded-night.compact` | compiled |
| `HistoricMerkleTree` / `merkleTreePathRoot` | `compact/spikes/historic-merkle.compact` | compiled with disclosed root |
| `UserAddress.bytes` | `compact/spikes/user-address.compact` | compiled |

Wallet unshielded transfers use installed Wallet SDK 1.2.0 `WalletFacade.transferTransaction`. `@midnight-ntwrk/midnight-did-api` 0.5.0 targets MidnightJS 4.0.2 and is not a production dependency.

## 7. Intentionally not added

- No Solidity / EVM / generic ZK substitutes.
- No production DID/VC dependency until 4.1.1 compatibility tests pass.
- No analytics SDKs.
