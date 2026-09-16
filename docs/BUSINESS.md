# Veilos — market, adoption, and viability

For Buildathon judges (Business Development, 15 pts). No invented customers or revenue.

## Who the user is

| User | Job to be done | Why public chains fail them |
| --- | --- | --- |
| **Operator / founder** of an autonomous org | Let agents pay vendors inside a budget | Publishing daily caps and vendor lists leaks the operating model |
| **Principal / board** | Prove an agent followed policy after the fact | Off-chain Slack rules are not independently verifiable |
| **Auditor / counsel** | See *only* the scope they are entitled to | Full-ledger dumps over-disclose; PDFs under-prove |
| **Agent runtime** | Submit a payment or award intent | It must not be able to overrule the committed policy |

Not the user (yet): retail consumers, general-purpose wallets, or “any DAO.”

## Problem in one sentence

Organizations that run autonomous agents need **on-chain proof that a rule was followed** without **publishing the rule**.

## Why Midnight (not a token wrapper)

Veilos uses Midnight’s dual ledger as the product, not as decoration:

- **Privacy:** policy values, credential bodies, ballots, and losing bids stay in witnesses.
- **ZK / Compact:** untrusted witnesses are rebound to public commitments; `assert` failures write nothing.
- **Selective disclosure:** auditor receipts commit a scope; they do not dump the vault.
- **Data protection:** operator vault is PBKDF2 + AES-GCM, scoped to network + contract. Proofs stay on a local proof-server or wallet Proof Station.

A token-only Midnight integration would be a transfer. Veilos authorizes first. Unshielded NIGHT settlement is optional and **public by design** (amount + recipient).

## Go-to-market (post-hackathon)

1. **Now — Preview demo.** Hosted UI at https://veilos-web-ten.vercel.app. Judges and operators explore the public Preview org without a wallet. Circuit calls require Lace / 1AM with wallet Proof Station, or a local proof server.
2. **Next — operator deploy.** `pnpm deploy:preview` (or later Preprod) creates *their* organization Compact instance. Vault backup is the onboarding artifact, not a seed phrase in chat.
3. **Then — design-partner orgs.** 3–5 agent-operated treasuries (research DAOs, procurement desks, internal AI ops). Success = one authorize + one settle they will show an auditor.
4. **Later — protocol surface.** Developer API / CLI already started (`packages/cli`). Wave 3 (marketplace, credit) stays closed until Preview authorize + settle evidence is retained.

Access path: public repo (Apache 2.0) → hosted UI → own Compact deploy. No app-store gate.

## Ecosystem fit

| Midnight piece | Veilos use |
| --- | --- |
| Compact | `authorization.compact`, `economy.compact`, `economy-preview.compact` |
| MidnightJS 4.1.1 | `deployContract`, `submitCallTx`, official providers |
| DApp Connector v4 | Lace / 1AM `window.midnight` |
| Indexer GraphQL v4 | Public ledger + exact-action confirmation |
| Proof server 8.1.0 | Local proving; hosted provers rejected |
| NIGHT | Unshielded deposit / settle after authorization |
| DID/VC | Adapter only until MidnightJS 4.1.1 compatibility is proven |

We follow `midnightntwrk/example-hello-world` pins (Apache 2.0). See `NOTICE`.

## Monetization (honest)

Year-1 is not a token launch.

1. **Operator subscription** — hosted UI + vault recovery assistance + Preview/Preprod support for a design-partner org.
2. **Deploy / retain** — paid help compiling Compact and keeping ZK artifacts current (the compile is the hard part).
3. **Later protocol fee** — optional, disclosed, on *public* unshielded settlement only. Never on private witnesses.

If none of that lands, the repo still teaches Midnight’s dual ledger. That is an acceptable public-good outcome.

## Scalability and impact

- **Technical:** one organization per Compact deploy keeps maps small. Economy-preview exists because a 12-circuit facade exceeded Preview block limits — we already hit a real network constraint and shipped a sized slice.
- **Organizational:** the same vault + policy loop scales from one agent to many without publishing each limit.
- **Company test:** if three design partners will not keep a vault for 90 days, we do not pretend it is a unicorn. The roadmap in `ROADMAP.md` is gated on retained Preview evidence, not slide-ware.

## Milestones (execution planning)

| When | Owner-shaped work | Done when |
| --- | --- | --- |
| Wave 1 Core | Compact auth + UI + inspector + tests | C1–C31 + hosted UI |
| Wave 1 Economy (this submit) | Credentials, treasury, governance, procurement, auditor | In-repo + Preview economy-preview deploy |
| Evidence | `authorizeAction` + settle on Preview indexer | `docs/preview-evidence.md` updated |
| Wave 3 | Marketplace / credit / escrow | Only after evidence |
