# VELIOS Production Readiness

Audit date: 2026-09-20  
Release target: Midnight Preview + `https://veilos-web-ten.vercel.app`

## Current status

- Build: PASS — Vite production build completed in 5m 52s
- Type check: PASS — Node 22.19.0, `pnpm --filter @velios/web exec tsc -b --pretty false`
- Lint: PASS for edited-file IDE diagnostics; repository has no standalone lint implementation
- Web unit tests: PASS — 16 files, 48 tests
- Root unit/integration/privacy tests: PASS — 6 files, 22 passed, 2 live cases skipped as environment missing
- Midnight adapter tests: PASS — 13 files, 40 tests
- Playwright: PASS — 6 applicable desktop/tablet/mobile scenarios passed; 3 project-inapplicable cases skipped
- Compact compile/tests: PASS — 8 files, 50 tests; Preview economy/governance/procurement and full economy.compact recompiled after the security follow-up
- Production dependency audit: PASS — no known production vulnerabilities
- Production route parity: PASS for hosting + bundle identity on 2026-09-21 — `velios-build=136c61f2c67d` matches git `136c61f`; `/docs` and `/app/treasury/authorize` return the SPA (`index-moiq_Q4J.js` contains those routes). Source now has uncommitted fail-closed wallet/proving hardening ahead of that deploy.
- Real wallet transaction matrix: OWNER-MANUAL — live Preview writes are not CLI-automated; remaining evidence is a funded 1AM/Lace session with Proof Station or local proof-server
- Security/privacy review: Wave 2 Compact trust-binding and local-dev leaks fixed in source; Wave 1 Compact remains frozen; live retest still required
- UX review: PASS in source with a documented task-route limitation

## Release blockers

1. Operator-manual Preview writes: retain `authorizeAction` then Wave 2 credential/authorize/settle public tx + indexer rows in `docs/preview-evidence.md`.
2. Redeploy after the current fail-closed wallet/proving hardening is committed, then confirm `velios-build` matches that commit.
3. Publish YouTube + X/Discord posts.

## Deployment checklist

- [x] Node 22.19.0 selected.
- [ ] Lockfile install succeeds with pnpm 10.28.2.
- [x] `pnpm --filter @velios/web exec tsc -b --pretty false`.
- [x] `pnpm --filter @velios/web test`.
- [x] `pnpm --filter @velios/tests test`.
- [x] `pnpm build`.
- [x] `pnpm audit --prod --audit-level high`.
- [x] `pnpm --filter @velios/contracts test`.
- [x] `pnpm test:e2e`.
- [x] Contract compile/tests run with active Compact 0.31.1.
- [ ] No wallet seed, mnemonic, vault passphrase, private state, or owner secret is configured in Vercel.
- [x] `VITE_VELIOS_NETWORK=preview`.
- [x] `vercel.json` SPA rewrites are included in the deployment.
- [x] `/`, `/docs`, `/app`, and all task deep links return the current SPA.
- [x] Production build recorded `velios-build=136c61f2c67d` and entry asset `index-moiq_Q4J.js` (git `136c61f`, 2026-09-21).
- [ ] Preview indexer public reads succeed or show actionable failure.
- [ ] 1AM/Lace connects on Preview through DApp Connector v4.
- [ ] Wallet Proof Station works with local Docker stopped.
- [ ] No wallet recovery phrase is requested by VELIOS.
- [ ] DUST absence fails closed.
- [ ] Wallet rejection recovers without false success.
- [ ] Account/network change locks operator access.
- [ ] Duplicate submit controls prevent a second in-flight call.
- [ ] Exact transaction and indexer read-back evidence is retained for live circuits.
- [ ] Mobile, tablet, desktop, and keyboard journeys pass.

## Production proof-server rule

Vercel hosts only static UI assets. It does not and should not host a VELIOS proof server. On the hosted app:

1. Prefer the official connector `getProvingProvider` exposed by the wallet Proof Station.
2. If unavailable, fail closed and explain that the pinned local proof server is required.
3. Never silently send private witnesses to an arbitrary hosted HTTP prover.

This means “works with Docker closed” is valid only when the connected wallet actually exposes a working Proof Station. VELIOS cannot manufacture that external capability.

## Explicit limitations

- Hosted UI matches git `136c61f`. Uncommitted fail-closed wallet/proving work is ahead of that deploy.
- No complete retained browser-wallet transaction set exists for Wave 1 authorize or Wave 2 writes.
- Wallet prompts are operator-manual; they are not CLI-automated.
- Governance tally completeness is experimental.
- Wave 2 task routes are section deep links within module pages.

## Readiness decision

**Demo candidate for public reads; NO-GO for a 100% on-chain claim.**

Judges can open the hosted Preview org, Docs, and Privacy Inspector without a wallet. Critical write evidence (`authorizeAction`, Wave 2 credential/authorize/settle) remains operator-manual.
