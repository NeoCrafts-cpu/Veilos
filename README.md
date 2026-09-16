# Veilos

Privacy-native operating system for autonomous organizations on Midnight.

**Humans define the rules. Agents execute them. Midnight proves they were followed.**

> The blockchain sees the proof. Not the secret.

## Midnight Buildathon — Wave 1 (judges)

This is the **first** AKINDO submission (not a resubmit). Topic on GitHub: **`midnightntwrk`**. License: **Apache 2.0** (`LICENSE`, `NOTICE`). Midnight-related code is original Compact + official `@midnight-ntwrk/*` adapters — not a fork of another DApp.

| Required | Where |
| --- | --- |
| Public repo | https://github.com/NeoCrafts-cpu/Veilos |
| Compact (technical gate) | `packages/contracts/compact/authorization.compact` (also `economy.compact`, `economy-preview.compact`) |
| Compile | `pnpm compile:contracts` — Compact language 0.23, compiler 0.31.1 |
| README / architecture / Midnight | this file, `ARCHITECTURE.md`, `MIDNIGHT.md`, `docs/dependency-report.md` |
| How to test | section below |
| Slide deck | [docs/pitch/index.html](docs/pitch/index.html) (open in a browser; Print → PDF) |
| Demo / video pitch | record from [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) and paste the public YouTube URL on AKINDO |
| Wave progress | [docs/SUBMISSION.md](docs/SUBMISSION.md), [docs/wave-progress.md](docs/wave-progress.md) |
| Judging rubric map | [docs/RUBRIC.md](docs/RUBRIC.md) |
| Market / GTM | [docs/BUSINESS.md](docs/BUSINESS.md) |
| Community posts to publish | [docs/COMMUNITY.md](docs/COMMUNITY.md) |
| Live UI | https://veilos-web-ten.vercel.app |
| Preview contracts | authorization `4b31d10bf6aba347cc0f041856488fa07cfe2604db7a4b1d432123c277a9e64b` · economy-preview `bb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df` |

Ecosystem attribution: MidnightJS 4.1.1 and Docker pins follow [`midnightntwrk/example-hello-world`](https://github.com/midnightntwrk/example-hello-world) (Apache 2.0). See `NOTICE`.

### How judges evaluate

**No wallet (5–10 min)**

1. Open https://veilos-web-ten.vercel.app — landing, Get Started, Preview organization, Privacy Inspector.
2. Skim `packages/contracts/compact/authorization.compact` and `economy-preview.compact`.
3. `pnpm install && pnpm --filter @velios/contracts test && pnpm --filter @velios/web test` (Node 22).

**Full Midnight (optional)**

```bash
# WSL/Linux/macOS, Node 22, Docker, https://github.com/midnightntwrk/compact
pnpm install
pnpm env:up
pnpm compile:contracts
pnpm test
pnpm dev
```

Lace / 1AM: Preview network. Proof server `http://127.0.0.1:6300` or wallet Proof Station. Never paste a seed into the UI. `AUTHORIZED` is only `SucceedEntirely` plus an exact indexer action id.

**Dual-ledger model:** private witnesses (policy, credentials, ballots, bids) vs public commitments, ids, receipts, and unshielded NIGHT amount/recipient. Failed Compact `assert`s write nothing.

## Why Veilos

If an organization lets an AI agent pay vendors or move treasury, someone must prove the agent stayed inside policy. Publishing that policy on a transparent chain leaks the operating model. Keeping it in a spreadsheet cannot be independently verified.

Veilos is the third path: humans set private rules; Midnight Compact proves a requested action fits those rules; the ledger records the proof and the necessary public result — not the secret.

## Why Midnight

Midnight is the only execution target for VELIOS. Sensitive inputs stay in private state and witnesses. Compact circuits prove predicates. Only commitments, action identifiers, and authorization outcomes are written to the public ledger.

This repository does not use another chain, EVM contracts, or Solidity as a stand-in.

## Current wave

**Wave 1 — VELIOS CORE** is implemented.

| Built | Notes |
| --- | --- |
| Compact authorization contract | `packages/contracts/compact/authorization.compact` |
| Private policy + commitments | owner / member / agent / role / policy / spend hashes, untrusted witnesses rebound in-circuit |
| Organization membership | admin-gated `registerMember`; agents require an active member who can open the member commitment |
| Real credential expiry | private expiry proved against the `kernel` ledger clock via a chain-verified one-day window |
| Rolling daily limit | the spend commitment binds its window, so the daily cap genuinely resets |
| MidnightJS 4.1.1 adapters | Official hello-world provider factories |
| DApp Connector v4 wallet | `window.midnight` enumeration + `connect(networkId)` |
| Wave 1 UI + Privacy Inspector | neo-brutalist Midnight palette |
| Contract tests C1–C31 | Compact semantics replica (labeled, not a production ledger) + X5 parity against the real compiled module |
| Integration tests | Skip as **environment missing** unless local Midnight is up |

A real `SucceedEntirely` authorization still requires Node 22, Docker, Compact compile, and a funded Midnight wallet. The UI never invents AUTHORIZED.

See `docs/wave-progress.md`.

## Wave 1 loop

1. Choose **create my organization** or **explore the public Preview organization**. Preview is read-only public data.
2. Check readiness (indexer, wallet, DUST, proof server, operator vault). Connect a Midnight wallet (Lace / 1AM) only when you will submit a circuit.
3. Create an encrypted, contract-scoped operator vault. The wallet pays DUST; the vault opens private commitments. Never enter a wallet recovery phrase.
4. Deploy your organization and founding member, or unlock/import the backup that opens an existing contract.
5. Set the private policy and create the agent. `createAgent` commits those witnesses on Midnight.
6. Authorize a payment request. Compact proves the amount and vendor against the committed policy using the indexer ledger clock. Veilos does not transfer funds.
7. AUTHORIZED only after `SucceedEntirely` and indexer read-back. A local preview refuse does not call Midnight. A circuit refuse writes nothing and does not print the limit.
8. Inspect public vs private data in the Privacy Inspector. Activity lists public actions only.

## Architecture

See `ARCHITECTURE.md`.

```text
PRIVATE INPUTS → PRIVATE STATE → POLICY CONSTRAINTS
        → ZK PROOF / COMPACT CIRCUIT → PUBLIC RESULT
```

## Public vs private state

| Private by default | Public when necessary |
| --- | --- |
| Policy limits | Organization and agent identifiers |
| Daily spend values | Agent active/inactive status |
| Credential contents | Policy commitment (hash), not values |
| Vendor profile details | Action id, type, authorization result |
| Authorization witnesses | Proof / transaction reference |

Full rules: `docs/privacy-model.md`.

## Compact contracts

Wave 1 file: `packages/contracts/compact/authorization.compact`

```bash
pnpm compile:contracts
# compact compile packages/contracts/compact/authorization.compact packages/contracts/managed/authorization
```

Language: Compact **0.23**, compiler **0.31.1**. Eight ledger circuits:
`registerMember`, `setMemberStatus`, `createAgent`, `setAgentPolicy`,
`setAgentPolicyBySelf`, `setAgentStatus`, `setOrganizationStatus`,
`authorizeAction` — plus six pure commitment circuits. The compile takes about
three minutes.

## DID / credentials

Wave 1 keeps a committed credential predicate (`credentialOk` + private expiry)
on the frozen authorization contract. Wave 2 organization-issued credentials
are the production path: Compact proves class, expiry, Merkle membership, and
non-revocation. Official Midnight DID/VC adapters stay experimental until they
are proven against MidnightJS 4.1.1.

## Agent authorization

Private policy commitment + witness preimage + `assert` predicates. Witnesses are untrusted unless bound to a public commitment. Details: `docs/contract-spec.md`.

## Treasury / governance / procurement

Wave 2 economy contract: `packages/contracts/compact/economy.compact`. Settlement is unshielded NIGHT: amount and recipient are public. Credentials, ballots, and losing bids stay private. Official DID/VC adapters are experimental. See `docs/wave-2-architecture.md`.

## Local development

```bash
# WSL/Linux/macOS, Node 22+, Docker, Midnight Compact
pnpm install
pnpm env:up
pnpm compile:contracts
pnpm test
pnpm dev
```

Lace / 1AM:

- Local undeployed: **Settings → Midnight → Local (`http://localhost:6300`)**.
- Preview: set `VELIOS_NETWORK=preview` and `VITE_VELIOS_NETWORK=preview` in a local `.env`, compile contracts, run `pnpm dev`, connect the wallet on Preview, then **Create organization** and sign. Proof server or Proof Station is required. See `scripts/deploy/README.md`.

Do not run Windows `compact.exe`. Setup details: `scripts/local-dev/README.md`.

## Hosting

The operator UI is a static Vite SPA (`pnpm build` → `apps/web/dist`). **Vercel** is the primary host. **Render** can serve the same folder via `render.yaml`. Neither platform compiles Compact, runs the CLI, or proves circuits.

Import the GitHub repo with root directory `/`. Node 22 comes from `.nvmrc`. Do not set wallet seeds, mnemonics, or private-state passwords on the host. `VITE_VELIOS_NETWORK` defaults to `preview`.

Submitting a circuit uses the wallet Proof Station (`getProvingProvider`) when the connector exposes it. Otherwise it needs a local `midnightntwrk/proof-server:8.1.0` on loopback. Vercel does not run a proof server. Do not point the UI at a hosted HTTP prover — witnesses would leave the operator machine.

Preview contract addresses are public and baked into `@velios/midnight`. Creating an organization from the hosted UI is a real Midnight transaction signed by the connected wallet.

## Testing

```bash
pnpm test
```

Matrix: `docs/test-matrix.md`. Integration tests do not mock Midnight; they skip if the undeployed stack is down.

## Security / threat model

- `SECURITY.md`
- `docs/threat-model.md`

## Wave progress

`docs/wave-progress.md`

## Roadmap

`ROADMAP.md`

## License

Apache License 2.0. See `LICENSE` and `NOTICE`.
