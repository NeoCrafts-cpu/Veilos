# Preview deploy (Wave 1)

Fees are DUST, not NIGHT. 1AM **Generate DUST** is not the official testnet deploy path — it talks to `api-preview.1am.xyz` and can fail with a generic transaction submission error even when tNIGHT is present. Do not treat that button as deploy-ready.

The working path is the official Node Wallet SDK flow used by [example-hello-world](https://github.com/midnightntwrk/example-hello-world) and [Funding a wallet](https://docs.midnight.network/guides/acquire-tokens):

1. Local proof server (`midnightntwrk/proof-server:8.1.0` on port 6300)
2. Hex seed or mnemonic in local `.env` (never commit it)
3. Fund the printed **unshielded** address from the Preview faucet
4. `registerNightUtxosForDustGeneration` (WalletFacade clock aligned to indexer `block.timestamp` so DustActions.ctime is not ahead of chain time — ledger error 171)
5. `deployContract` via MidnightJS 4.1.1

`midnight-local-dev` is a local undeployed chain. It does not deploy to Preview.

This repo never writes seeds, mnemonics, or `deployment.json` into git.

## Official CLI

Use a **new** hex seed. Do not paste a recovery phrase from chat.

Use Node 22+ (MidnightJS 4.1.1 / Wallet SDK 1.2.0). If `node -v` is 20.x, put Node 22 on PATH first.

```bash
# 1. Compile Compact artifacts
pnpm compile:contracts

# 2. Proof server (network-agnostic proving)
docker run -d --name velios-proof-server -p 6300:6300 midnightntwrk/proof-server:8.1.0
# or: pnpm env:up   (also starts local node/indexer — not required for Preview)

# 3. First run: print a fresh seed + unshielded address, then wait for faucet + DUST + deploy
pnpm deploy:preview -- --fresh
```

Copy the `mn_addr_preview1...` address into https://faucet.preview.midnight.network (or https://midnight-tmnight-preview.nethermind.dev/). Keep the process running.

Save the printed hex seed into local `.env` as `VELIOS_WALLET_SEED=...` and rerun without `--fresh`:

```bash
pnpm deploy:preview
```

DUST only (no deploy):

```bash
pnpm deploy:preview -- --dust-only
```

Wave 2 Preview core (does not replace the frozen Wave 1 authorization contract):

```bash
pnpm compile:economy-preview
pnpm deploy:preview:economy
```

The full 12-circuit `economy.compact` is too large for a Preview block. Public fields are written to gitignored `deployment.economy.json`.

### 1AM wallet cannot Generate DUST

1AM's **Generate DUST** button talks to `api-preview.1am.xyz` and routinely fails even when tNIGHT is present. Do not keep pressing it.

To put spendable DUST on the **same** 1AM account you connect in the UI:

1. In 1AM, copy the 24-word recovery phrase. Do not paste it into chat.
2. In 1AM, copy the unshielded `mn_addr_preview1…` address and fund it at https://faucet.preview.midnight.network if tNIGHT is 0.
3. Add this to local `.env` (keep `VELIOS_WALLET_SEED` for the old CLI deploy wallet):

```bash
VELIOS_WALLET_MNEMONIC="word1 word2 ... word24"
```

4. Proof server must be up (`http://127.0.0.1:6300/health`).
5. Register NIGHT → DUST with the official Wallet SDK (not 1AM):

```bash
pnpm dust:1am
```

The printed unshielded address must match the 1AM address exactly. After `registerNightUtxosForDustGeneration` the indexer shows `registeredForDustGeneration: true` and `DustInitialUtxo` events; spendable DUST still accrues for several minutes. Wait until the command prints a `DUST:` line. Then reconnect 1AM in the UI and click Create agent.

Success is only `SucceedEntirely` plus a contract address printed and written to gitignored `deployment.json` (public fields only). The same run writes gitignored `.private-state/preview.json` so the local UI can open the on-chain commitments. Never commit that file.

The web app defaults to Preview, joins `PREVIEW_DEPLOYMENT` after wallet connect, and reads public ledger fields from the official indexer. Creating an agent or authorizing a payment is a real `submitCallTx` against that contract.

## Browser wallet (optional)

Lace on a **new** Preview wallet can still sign the web app after tNIGHT + Generate tDUST succeed. 1AM Generate DUST is not required if the CLI deploy already produced a contract address.

## Hosted UI (Vercel / Render)

The GitHub repo builds the static operator UI. `vercel.json` and `render.yaml` both publish `apps/web/dist`. Compact compile and this CLI are **not** part of that host.

Do not add `VELIOS_WALLET_SEED`, `VELIOS_WALLET_MNEMONIC`, or vault passwords to Vercel/Render env vars. Public Preview addresses already live in `@velios/midnight` `PREVIEW_DEPLOYMENT`.

Circuit calls from the hosted origin still require a trusted local proof server (`http://127.0.0.1:6300`) or the wallet Proof Station.

## What not to do

- Do not point the CLI at `api-preview.1am.xyz`. Official Preview indexer: `https://indexer.preview.midnight.network/api/v4/graphql`
- Do not commit `.env`, seeds, or `deployment.json`
- Do not claim a deploy succeeded without the printed contract address
- Do not host the Midnight proof server on Vercel or Render
