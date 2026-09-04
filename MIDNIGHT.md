# VELIOS Midnight Integration Rules

VELIOS is Midnight-first.

Primary ecosystem concepts:

- Compact smart contracts
- Private state
- Public ledger state
- ZK proofs
- MidnightJS
- DApp Connector / wallet integration
- Proof provider / proof server
- Indexer
- DID
- Verifiable Credentials
- NIGHT / supported asset functionality
- Local development environment

Before using any package:

1. Confirm it is installed.
2. Confirm the current exported APIs.
3. Check the official example/version that matches the installed package.
4. Write a small integration test before building the feature around it.

Never assume API signatures from memory.
Never copy outdated snippets without verification.

## Pinned Wave 1 set

See `docs/dependency-report.md`. Intended pin: MidnightJS **4.1.1** from official `example-hello-world`, Compact language **0.23**, DApp Connector API **4.0.0**, local images proof-server **8.1.0** / indexer-standalone **4.3.3** / midnight-node **1.0.0**.

## Hard constraints

- Do not invent Compact syntax or MidnightJS signatures.
- Do not substitute another chain, EVM, Solidity, or a generic ZK library.
- Do not mock wallet, proof server, indexer, or ledger behavior on production paths.
- When docs disagree with an installed package, the installed package plus the matching official repository win.
- Windows `compact` is NTFS compression, not the Midnight compiler. Midnight Compact must be invoked from a Unix environment (WSL Ubuntu) after installing https://github.com/midnightntwrk/compact.
