# VELIOS Full Application Audit

Audit date: 2026-09-20  
Audited source: `/mnt/e/AKINDO/Velios`  
Target network: Midnight Preview  
Target UI: `https://veilos-web-ten.vercel.app`

## Executive summary

VELIOS has a real Midnight architecture rather than a simulated production path: Compact contracts, MidnightJS providers, DApp Connector v4, proof generation, transaction submission, and exact indexer read-back are separated into typed packages. Private operator and Wave 2 state is encrypted locally; public views contain commitments, identifiers, counters, results, and intentionally public unshielded settlement fields.

The source is materially stronger after this audit. Critical flows now fail closed while DUST/proving status is unknown, direct authorization-review bypass is blocked, wallet account/network changes lock operator state, procurement confirmation is exact, repeated voter/bidder/award use requires an explicit credential or bid, stale indexer confirmation no longer discards submitted private openings, and route/vault recovery is visible.

A follow-up security pass then bound Wave 2 Preview policy and spend openings to public commitments, made revocation deterministic, stopped treating a missing deploy status as success, required the CLI private-store password, and locked the local operator-state endpoint behind a token on localhost. Wave 1 Compact remains frozen; official clients now refuse a premature daily-bucket reset.

The application is not ready for an unconditional production claim yet. The requested Vercel hostname serves an older bundle: `/docs` and new Wave 2 task deep links redirect to the landing page, and the build marker is absent. Complete retained real-wallet evidence for every Wave 1/Wave 2 write is also not available. Those scenarios are recorded as BLOCKED, not PASS.

## Environment

- OS: Linux under WSL2
- Node: 22.19.0
- Package manager: pnpm 10.28.2
- Frontend: React 19.1, React Router 7.8, Vite 7
- Wallet API: `@midnight-ntwrk/dapp-connector-api` 4.0.0
- MidnightJS: 4.1.1 provider/client family
- Compact language/compiler target: 0.23 / active managed toolchain 0.31.1 (`compact` manager 0.5.2)
- Ledger/runtime pins: ledger v8 8.1.0, proof server 8.1.0
- Persistence: encrypted browser local storage plus in-memory unlocked state; no application backend/database
- Hosting: static Vite SPA on Vercel; Render-compatible static output

No secret value was printed or copied into this report.

## Architecture and data flow

```text
User action
  → React route/page
  → SessionProvider (Wave 1) or EconomyProvider (Wave 2)
  → typed @velios/midnight adapter
  → DApp Connector wallet + wallet Proof Station (preferred)
     or pinned local HTTP proof server
  → Midnight submit
  → transaction status classification
  → exact indexer read-back
  → public UI state

Private witness/state
  → encrypted operator/Wave 2 vault
  → Compact witness
  → commitment/proof
  → only required public fields
```

Primary breakpoints reviewed:

1. Wallet injection, permission, disconnection, account change, and network mismatch.
2. DUST availability and proof-provider readiness.
3. Operator-vault ownership/commitment mismatch.
4. Invalid or stale route state.
5. User rejection, proving failure, submission status, and indexer lag.
6. Exact confirmation predicates after Wave 2 writes.
7. Production bundle/deep-link parity.

## Feature and route inventory

### Public entry

- `/`: marketing, product scope, public Preview entry.
- `/docs`: privacy, architecture, module, and operational documentation.
- Unknown routes: explicit recovery screen in current source.

### Wave 1 workspace

- `/app`: current task/dashboard.
- `/app/setup`, `/org`, `/vault`, `/review`, `/success`: readiness and owner deployment.
- `/app/preview`: read-only published Preview organization.
- `/app/authorize/new`, `/review`: private request preview and Midnight authorization.
- `/app/actions`, `/:id/progress`, `/:id`, `/:id/privacy`: public activity, lifecycle, result, and privacy boundary.
- `/app/org`, `/app/org/:contract`: organization, member, agent, policy, and encrypted operator access.

### Wave 2 workspace

- Credentials: deploy, issue, registry/revoke.
- Treasury: deploy, unshielded NIGHT deposit, private authorization, settlement review.
- Governance: voter registration, proposal creation, private ballot, finalize.
- Procurement: bidder registration, lot creation, sealed bid, award bound to a treasury authorization.
- Auditor: scoped disclosure grant and public anchors.

Task sub-routes are route-backed deep links that scroll to a section inside their module page. This is intentional in current source, but they are not isolated screens.

## Midnight integration findings

- Provider construction uses installed official packages; no invented API was introduced.
- Browser proving prefers connector `getProvingProvider`, so a wallet Proof Station can work on a hosted UI without local Docker.
- HTTP proving is restricted to trusted loopback/same-origin development paths; arbitrary hosted prover URLs are rejected to avoid sending witnesses to an unknown service.
- Transaction success is not inferred from a click. Client adapters classify actual statuses and confirmation helpers read public state back.
- Wave 1 authorization maintains a pending operation journal and reconciles indexed actions after refresh.
- Wave 2 confirmation predicates were checked. The procurement bid predicate was too broad and is now tied to the exact calculated commitment.
- Preview public contract addresses remain configuration data; private owner secrets are not baked into the UI.
- Unshielded NIGHT settlement amount and recipient are public by design and labeled accordingly.

## Security and privacy assessment

Verified strengths:

- No `dangerouslySetInnerHTML`, runtime `eval`, analytics, or production web logging was found.
- Operator vault uses PBKDF2-derived AES-GCM; ciphertext may persist, plaintext unlocked state remains in memory.
- Wave 2 secrets and records are encrypted before browser persistence.
- Privacy regression tests guard known local-storage and logging boundaries.
- Public/private UI copy distinguishes commitments and required disclosures.
- Connector-provided names are rendered as React text, not HTML.
- Account/network/disconnect polling now locks private operator state and invalidates providers.
- Wallet adapters revalidate the connector network and shielded account immediately before balancing and submission.
- Error copy added by this audit is generic and does not include caught secret-bearing values.

Remaining risks:

- Local storage is still available to same-origin script; XSS prevention and dependency hygiene remain essential even with encrypted vaults.
- A complete dependency vulnerability result must be interpreted carefully because Midnight ecosystem pins may not be independently upgradeable.
- Live account-switch, wallet-rejection, timeout, and page-refresh behavior require production retesting after redeploy.
- Governance trustless tally completeness remains experimental and is labeled.

## UX and accessibility assessment

Strengths:

- Grouped sidebar, mobile drawer, focus trap, Escape behavior, skip links, focus-visible styles, reduced motion, and 44px touch targets.
- Loading, recovery, empty, and disabled states exist across core pages.
- Transaction lifecycle copy distinguishes proving, submission, indexing, confirmation, stale, refusal, and failure.
- Private/public boundaries are visible in each economy domain.

Fixes made:

- Blocked authorization review is visibly disabled.
- Direct review/deploy deep links validate their drafts and prerequisites.
- Disabled link-buttons are removed from the link/tab model.
- Privacy actor controls expose selected-state semantics.
- Vault failures and unknown routes have actionable recovery.
- Indexer lag no longer masquerades as definitive deployment failure.
- Multiple voter/bidder credentials require explicit selection.
- Multiple award candidates require explicit winning-bid selection.
- Successfully submitted credential/payment openings survive an indexer-stale result in encrypted local state.

Known UX limitation:

- Each Wave 2 task URL displays the complete module page and scrolls to its task. This reduces isolation compared with separate screens.

## Production browser evidence

On 2026-09-20, the target Vercel root loaded successfully and rendered the landing page. Direct checks then showed:

- `/docs` returned to `/`.
- `/app/treasury/authorize` returned to `/`.
- `meta[name="velios-build"]` was absent.
- Served JavaScript asset: `assets/index-DUZ7-Mgs.js`.
- The alternative hostname documented previously, `https://veilos-web.vercel.app`, returned Vercel `404 DEPLOYMENT_NOT_FOUND`.

This is concrete evidence that the public target is behind the audited source. Documentation now points to the requested `-ten` hostname, but the current source must be redeployed before judge-facing use.

## Issues and fixes

Detailed reproduction, root cause, fix, and status are in `BUGS_AND_FIXES.md`.

- 1 production blocker identified.
- 1 live-evidence blocker identified.
- Critical stale wallet-authority defect fixed in source.
- High-severity authorization/readiness/confirmation/repeat-use defects fixed.
- Medium/low route, vault, indexer-lag, and accessibility defects fixed.

## Test status

The authoritative scenario list is `TEST_MATRIX.md`. Command status is summarized in `PRODUCTION_READINESS.md`.

Evidence available during the audit:

- Node 22 TypeScript project check passed.
- Web tests passed: 16 files, 47 tests.
- Root integration/privacy/UI tests passed: 22 tests, with 2 real Preview cases explicitly skipped because the required live environment was absent.
- Midnight adapter tests passed: 12 files, 39 tests.
- Contract tests passed: 8 files, 50 tests, including a compiler-backed Wave 1 compile and generated/golden parity checks.
- Production dependency audit reported no known vulnerabilities.
- The Vite production build passed and emitted the current split JavaScript/WASM artifact set.
- Playwright passed all 6 applicable desktop/tablet/mobile scenarios; 3 cases were intentionally skipped on projects where the asserted navigation mode does not apply.
- Production browser landing and deep-link behavior was directly inspected.
- Real wallet/on-chain write scenarios remain blocked until the current build is deployed and an unlocked, funded Preview wallet is available.

## Final readiness assessment

Source readiness: release candidate; final local regression passed.  
Current Vercel readiness: not ready; stale bundle/deep links are a blocker.  
Real Midnight claim: architecture is real and fail-closed, but complete browser transaction evidence is incomplete.

Scenario execution coverage is 20/35 (57%): 17 PASS and 3 observed production FAIL. Thirteen real-wallet/on-chain scenarios are BLOCKED, and two broader manual scenarios remain NOT TESTED. Live write coverage must not be inferred from the 57% figure.

VELIOS must not be described as “100% working.” The honest next release gate is:

1. Complete local build/test/Playwright regression.
2. Deploy the exact audited build and verify its build marker.
3. Re-run direct deep links on Vercel.
4. Connect an unlocked funded Preview wallet exposing Proof Station.
5. Execute Wave 1 and Wave 2 live matrices and retain exact transaction/indexer evidence.
