# Local development

Reproduces the official Midnight hello-world stack.

## Requirements

- Linux, macOS, or WSL2 Ubuntu (not native Windows for Compact)
- Node.js 22+
- pnpm 10
- Docker
- Midnight Compact compiler: https://github.com/midnightntwrk/compact

Do not use Windows `compact.exe` (NTFS compression).

## Commands

From the repository root:

```bash
pnpm install
pnpm env:up
pnpm compile:contracts
pnpm test
pnpm --filter @velios/web dev
```

Proof server: `http://127.0.0.1:6300`  
Indexer: `http://127.0.0.1:8088/api/v4/graphql`  
Node: `ws://127.0.0.1:9944`

Images and ports are copied from `midnightntwrk/example-hello-world` compose.yml (Apache-2.0):

- `midnightntwrk/proof-server:8.1.0`
- `midnightntwrk/indexer-standalone:4.3.3`
- `midnightntwrk/midnight-node:1.0.0`

Point Lace at **Settings → Midnight → Local (`http://localhost:6300`)**.
