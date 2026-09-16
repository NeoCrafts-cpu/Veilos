# VELIOS Bugs and Fixes

Audit date: 2026-09-20  
Target: Midnight Preview, Vercel UI `https://veilos-web-ten.vercel.app`

## AUD-001 — Production deployment is behind the audited source

- Severity: Blocker
- Environment: Vercel production
- Reproduce: Open `/docs` or `/app/treasury/authorize` directly.
- Expected: The dedicated docs page or task route renders.
- Actual: Both routes resolve to the landing page. The served document has no `velios-build` marker and uses `assets/index-DUZ7-Mgs.js`.
- Root cause: The target Vercel project is serving an older application bundle. Current source already contains explicit SPA rewrites and both routes.
- Fix: Source-side route rewrites and build identity are present. Rechecked 2026-09-21: production serves `velios-build=136c61f2c67d` (git `136c61f`) with SPA 200 for `/docs` and `/app/treasury/authorize`. In-progress fail-closed wallet/proving work is still ahead of that deploy.
- Regression: `production-build.smoke.test.ts`, route tests in `App.test.tsx`, and `workspace-sidebar.spec.ts`.
- Status: FIXED ON PRODUCTION for 136c61f; redeploy still required after the current uncommitted hardening.

## AUD-002 — Authorization review accepted an unvalidated deep link

- Severity: High
- Environment: Web application
- Reproduce: Open `/app/authorize/review` without first completing the request form.
- Expected: Submission is blocked with a recovery action.
- Actual: The button only checked wallet, DUST, and proving booleans; invalid input could silently return.
- Root cause: Validation existed only in `ActionPage`.
- Fix: Added shared `validateAuthorizationDraft`; review now requires a valid draft, agent, verified operator context, wallet, confirmed DUST, and confirmed proving.
- Regression: `validation.test.ts`; `App.test.tsx` direct-review case.
- Status: FIXED

## AUD-003 — Blocked request review silently did nothing

- Severity: Medium
- Environment: Web application
- Reproduce: Fill `/app/authorize/new` while wallet/operator prerequisites are absent and select Review.
- Expected: The action is visibly unavailable while the recovery panel explains why.
- Actual: The click returned without feedback.
- Root cause: `blocked` was checked inside the click handler but not reflected in button state.
- Fix: The button is now disabled whenever the request cannot safely proceed.
- Regression: `App.test.tsx`.
- Status: FIXED

## AUD-004 — Unknown readiness states were treated as ready

- Severity: High
- Environment: Onboarding and deployment
- Reproduce: Connect while DUST or proof readiness is still `null`.
- Expected: Continue/deploy remains disabled until both checks are positively confirmed.
- Actual: `null !== false` allowed progress.
- Root cause: Permissive three-state checks.
- Fix: Readiness and deployment now require `dustReady === true` and `networkLive === true`. Deployment rechecks DUST through the official connector before calling Midnight.
- Regression: Type check and web UI suite.
- Status: FIXED

## AUD-005 — Operator vault failures had no inline recovery

- Severity: Medium
- Environment: Organization page
- Reproduce: Unlock with the wrong passphrase, import no file, or import an invalid backup.
- Expected: A local, non-sensitive error and retry path.
- Actual: Promise rejection was not surfaced inline.
- Root cause: Fire-and-forget handlers omitted rejection handling.
- Fix: Added separate vault/import errors with actionable, secret-free copy.
- Regression: Existing vault cryptography tests plus web UI regression.
- Status: FIXED

## AUD-006 — Bid confirmation was not tied to the submitted bid

- Severity: High
- Environment: Wave 2 procurement
- Reproduce: Submit a bid when the public ledger already contains another bid commitment.
- Expected: Confirmation waits for the exact new commitment.
- Actual: Any non-empty commitment list could satisfy confirmation.
- Root cause: `present` checked `length > 0`.
- Fix: Confirmation now requires the calculated submitted commitment to be present.
- Regression: Type check and integration call-path review.
- Status: FIXED

## AUD-007 — Repeat voters and bidders implicitly used the newest secret

- Severity: High
- Environment: Wave 2 governance and procurement
- Reproduce: Register two local voters/bidders, then cast a ballot or submit a bid.
- Expected: The operator explicitly selects the credential.
- Actual: The last vault record was silently selected.
- Root cause: `.at(-1)` in transaction methods.
- Fix: Added explicit credential selectors; state methods resolve the selected commitment and fail closed if multiple records exist without a selection.
- Regression: Type check and web UI regression.
- Status: FIXED

## AUD-008 — Wallet account/network changes could leave stale authority active

- Severity: Critical
- Environment: Browser wallet session
- Reproduce: Connect, unlock operator access, then disconnect, switch Preview network, or switch wallet account.
- Expected: Providers are invalidated and private operator state locks.
- Actual: The connector snapshot persisted until manual disconnect.
- Root cause: DApp Connector v4 has polling APIs, not change events, and they were not monitored.
- Fix: Poll official `getConnectionStatus`, `getConfiguration`, and `getUnshieldedAddress`; lock the vault and clear providers on a definitive change or repeated connector failure. Provider adapters also revalidate network and shielded account immediately before balancing and submitting a transaction.
- Regression: `wallet-session-guard.test.ts`; live rejection/account-switch QA still required after redeploy.
- Status: FIXED IN SOURCE / LIVE RETEST BLOCKED

## AUD-009 — Unknown routes silently became the landing page

- Severity: Medium
- Environment: Router
- Reproduce: Open `/app/treasry`.
- Expected: A recoverable not-found screen.
- Actual: The URL was silently lost.
- Root cause: Global wildcard redirected to `/`.
- Fix: Added public and in-workspace not-found states. No wallet or chain action is attempted.
- Regression: `App.test.tsx`.
- Status: FIXED

## AUD-010 — Legacy agent links could create a fake `current` contract address

- Severity: Medium
- Environment: Router
- Reproduce: Clear workspace selection and open `/app/agents/:id`.
- Expected: Organization-selection recovery.
- Actual: Redirect used `/app/org/current/agent/:id`.
- Root cause: String fallback used as an address.
- Fix: Redirect to `/app/org` when no real contract is selected.
- Regression: Type check and route review.
- Status: FIXED

## AUD-011 — Disabled links stayed in the accessibility navigation model

- Severity: Low
- Environment: Shared button component
- Reproduce: Keyboard-focus a disabled `Button` with `to`.
- Expected: It is not a link or tab stop.
- Actual: It remained an anchor with `aria-disabled`.
- Root cause: ARIA alone does not disable anchor navigation.
- Fix: Disabled navigation actions render as non-interactive spans.
- Regression: `Button.test.tsx`.
- Status: FIXED

## AUD-012 — Indexer lag was described as deployment failure

- Severity: Medium
- Environment: Setup completion
- Reproduce: Reach success while a contract address exists but the indexer has not returned the organization.
- Expected: Pending confirmation with a retry.
- Actual: “Organization was not deployed.”
- Root cause: UI treated missing indexed organization as proof of failed submission.
- Fix: Distinguish local contract-address/pending-indexer state, warn against redeploy, and provide read-back retry.
- Regression: Type check and UI review.
- Status: FIXED

## AUD-013 — Privacy actor controls lacked selected-state semantics

- Severity: Low
- Environment: Privacy inspector
- Reproduce: Navigate actor controls with assistive technology.
- Expected: Current selection is announced.
- Actual: Buttons had no toggle semantics.
- Root cause: Missing group and `aria-pressed`.
- Fix: Added an accessible group and pressed state.
- Regression: Web UI suite.
- Status: FIXED

## AUD-014 — Full real-wallet Wave 1/Wave 2 evidence is incomplete

- Severity: Blocker for a 100% readiness claim
- Environment: Midnight Preview
- Expected: Retained transaction IDs and exact indexer read-back for every write circuit.
- Actual: Source wiring exists, but retained Preview write evidence is incomplete. Hosted UI for git `136c61f` is live; remaining writes are operator-manual.
- Root cause: External wallet approval, funded DUST, proving, and a current deployment are required.
- Fix: No fake substitute is permitted. Operator completes live writes in the UI with a funded Preview wallet and Proof Station or local proof-server, then records public tx + indexer rows in `docs/preview-evidence.md`.
- Regression: `wave2-live-preview.test.ts` is environment-gated and must be run with required live variables.
- Status: OWNER-MANUAL — live Preview writes are not CLI-automated; retain public tx + indexer rows in `docs/preview-evidence.md`

## AUD-015 — Public documentation referenced a missing Vercel hostname

- Severity: Medium
- Environment: README/submission docs
- Reproduce: Follow `https://veilos-web.vercel.app`.
- Expected: Live demo.
- Actual: Vercel returns `404 DEPLOYMENT_NOT_FOUND`.
- Root cause: Documentation was not updated after the production hostname changed.
- Fix: Updated README, rubric, demo, community, business, and submission docs to `https://veilos-web-ten.vercel.app`.
- Regression: Repository URL search.
- Status: FIXED

## AUD-016 — Submitted Wave 2 secrets could be discarded during indexer lag

- Severity: Critical
- Environment: Wave 2 credentials and treasury authorization
- Reproduce: Return `SucceedEntirely` from submission but delay the exact indexer row beyond the confirmation window.
- Expected: UI reports stale confirmation while retaining the private credential/payment opening needed after the indexer catches up.
- Actual: The function returned before encrypting the private record.
- Root cause: Local persistence was incorrectly conditional on immediate indexer confirmation.
- Fix: After a successful Midnight submission, retain the encrypted private record for both confirmed and stale read-back states. The UI still reports stale and never claims confirmed without the exact row.
- Regression: Type check, privacy tests, and live stale-indexer scenario required.
- Status: FIXED IN SOURCE / LIVE RETEST BLOCKED

## AUD-017 — Award flow implicitly chose the first local bid

- Severity: High
- Environment: Wave 2 procurement repeat usage
- Reproduce: Store multiple sealed bids for one lot, then award it.
- Expected: Operator explicitly selects the winning commitment.
- Actual: `.find()` silently used the first local bid.
- Root cause: Award input did not carry a selected bid commitment.
- Fix: Added an explicit winning-bid selector and fail-closed state resolution.
- Regression: Type check and live multi-bid scenario required.
- Status: FIXED IN SOURCE / LIVE RETEST BLOCKED

## AUD-018 — Static hosts lacked explicit browser security headers

- Severity: Medium
- Environment: Vercel and Render
- Expected: The private-state UI restricts script, frame, referrer, content-type, and unnecessary browser capabilities.
- Actual: Static-host configs only set artifact caching.
- Root cause: Security headers were not part of deployment configuration.
- Fix: Added a CSP compatible with VELIOS Preview endpoints and wallet/local proving, plus `frame-ancestors 'none'`, `no-referrer`, `nosniff`, and a restrictive permissions policy on both hosts.
- Regression: `production-build.smoke.test.ts`.
- Status: FIXED IN SOURCE / DEPLOYMENT RETEST REQUIRED

## AUD-019 — Production landing page exposed document-level horizontal overflow

- Severity: Low
- Environment: Production browser at 1024px (`clientWidth 1021`, `scrollWidth 1033`)
- Expected: Only intentionally scrollable navigation regions may overflow.
- Actual: The document showed a horizontal scrollbar.
- Root cause: Decorative landing content/shadows could extend the root scroll area.
- Fix: Clip horizontal decorative overflow at the landing root while preserving the navigation region's own horizontal scrolling.
- Regression: Local browser measured equal client/scroll widths at 390px and 1009px document widths.
- Status: FIXED

## AUD-020 — Responsive Playwright projects were not reliably executable

- Severity: Medium
- Environment: WSL2 Playwright
- Actual: Tablet inherited WebKit, host browser libraries were missing, selectors were ambiguous, and parallel cold Vite transforms exceeded default timeouts.
- Root cause: Device presets were allowed to choose different engines and the suite assumed a warm, fast development server.
- Fix: Pin every viewport to Chromium, install documented host/browser dependencies, serialize workers, use bounded 120s/30s test/expect timeouts, and make ambiguous selectors exact.
- Regression: Final run passed all 6 applicable scenarios; 3 project-inapplicable cases were intentionally skipped.
- Status: FIXED

## SEC-021 — Wave 2 Preview authorization trusted unbound policy and spend witnesses

- Severity: Critical
- Environment: `economy-preview.compact` / `economy.compact`
- Reproduce: Prove `authorizePayment` with a higher daily or per-action limit, a different vendor, or `spendDaily = 0` after a prior spend.
- Expected: Compact refuses unless those openings match a public commitment and the spend bucket cannot reset until the committed day elapses.
- Actual: Vendor, limits, and spend were witnesses only. Revocation also used an unbound secret, so a different secret evaded a recorded nullifier.
- Root cause: Preview circuits reconstructed a credential from class/expiry/salt only and never rotated a public spend commitment.
- Fix: Credential commitments now include vendor and limits. Spend rotates a public `spendCommitment`. Revocation nullifiers are deterministic from the public commitment. A new day bucket requires `blockTime > spendPeriodStart + 86400`.
- Regression: credentials commitment tests, period `spendBucketMayOpen`, and Compact recompile.
- Status: FIXED IN SOURCE / COMPILE AND LIVE RETEST REQUIRED

## SEC-022 — Governance tallies and procurement awards were not Compact-bound

- Severity: High
- Environment: Preview companions
- Reproduce: Finalize with arbitrary yes/no witnesses, or award a commitment that is not in `bidCommitments`.
- Expected: Finalize does not publish an unproven tally. Award requires a bid already recorded for that lot.
- Actual: `finalizeProposal` disclosed witness tallies. `awardProcurement` accepted any winner bytes.
- Fix: Finalize only closes the proposal (`yesCount`/`noCount` stay 0). Award looks up `bidKeyOf(lot, winnerHolder)` and asserts the stored commitment.
- Regression: companion generated-circuit tests after recompile.
- Status: FIXED IN SOURCE / COMPILE AND LIVE RETEST REQUIRED

## SEC-023 — Deploy status defaulted to success when Midnight omitted a status

- Severity: Critical
- Environment: Wave 2 deploy helper
- Reproduce: Return a contract address with an empty deploy status.
- Expected: Deploy fails closed.
- Actual: `status || SucceedEntirely` treated a missing status as success.
- Fix: `requireSucceedEntirely` now requires the exact Midnight success status.
- Regression: `compiled-call.test.ts`.
- Status: FIXED

## SEC-024 — Local CLI and Vite defaults leaked operator authority

- Severity: High
- Environment: CLI private-state store and Vite dev server
- Reproduce: Run CLI without `VELIOS_PRIVATE_STORE_PASSWORD`; open the dev operator-state endpoint; print a generated seed.
- Expected: Password required, localhost-only serve, token-gated operator-state, no seed print.
- Actual: Password defaulted to `accountId!`, Vite bound `0.0.0.0`, GET served plaintext private state, `--print-seed` printed the seed.
- Fix: Required store password, `127.0.0.1` bind, `.private-state` deny, operator-state token header, `--print-seed` refused.
- Regression: CLI password test, production-build smoke.
- Status: FIXED

## SEC-025 — Auditor verify did not recompute the grant commitment

- Severity: Medium
- Environment: `@velios/auditor`
- Reproduce: Tamper with disclosed claim keys after `createDisclosure`.
- Expected: Verify fails.
- Actual: Verify checked auditor id, expiry, and anchors only.
- Fix: Bundles now carry the nonce; verify recomputes the scope commitment from claim keys.
- Regression: `auditor.test.ts`.
- Status: FIXED

## Known limitations

- Wave 2 task URLs intentionally route to sections within one module page. They are deep-linkable tasks, not isolated page components.
- Governance tally completeness remains an experimental operator adapter. Compact finalize no longer publishes witness yes/no counts.
- Wave 1 `authorization.compact` is frozen. Official clients refuse a new spend bucket until the committed day elapses; a malicious custom prover can still reset Wave 1 spend by disclosing a later `periodStart`.
- Hosted Vercel cannot run a local HTTP proof server. Real hosted writes require the wallet-provided `getProvingProvider`; otherwise the user must run the pinned local proof server.
- Browser tests without an injected/unlocked wallet cannot prove a real on-chain write and must remain BLOCKED, never PASS.
