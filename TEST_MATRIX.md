# VELIOS Audit Test Matrix

Audit date: 2026-09-20  
Statuses are limited to PASS, FAIL, BLOCKED, and NOT TESTED. PASS means the listed evidence was actually executed or directly verified.

| ID | Feature | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Evidence |
|---|---|---|---|---|---|---|---|---|
| T-001 | Landing | Load production landing page | Network access | Open production root | Product statement and entry actions render | Rendered with accessible heading and links | PASS | Browser snapshot, 2026-09-20 |
| T-002 | Production routing | Open `/docs` directly | Production deployment | Navigate to URL | Docs page remains at `/docs` | Redirected to landing page | FAIL | Browser URL/read-back |
| T-003 | Production routing | Open `/app/treasury/authorize` directly | Production deployment | Navigate to URL | Treasury task renders | Redirected to landing page | FAIL | Browser URL/read-back |
| T-004 | Build identity | Inspect production build marker | Production deployment | Read `meta[name=velios-build]` | Current build id exists | Marker absent; old asset served | FAIL | CDP document inspection |
| T-005 | Source routing | Unknown workspace route | Node 22 test runtime | Render `/app/treasry` | Recovery screen, no silent redirect | Recovery screen rendered | PASS | `App.test.tsx` |
| T-006 | Authorization | Direct review with empty draft | Node 22 test runtime | Render review route | Submission disabled; edit recovery shown | Fail-closed state rendered | PASS | `App.test.tsx` |
| T-007 | Authorization | Shared draft validation | Node 22 test runtime | Validate invalid and valid inputs | Invalid fields rejected; bigint parsed | 4 validation tests pass | PASS | `validation.test.ts` |
| T-008 | Accessibility | Disabled navigation action | Node 22 test runtime | Render disabled link-button | Not exposed as a link/tab action | Non-interactive element rendered | PASS | `Button.test.tsx` |
| T-009 | Sidebar | Grouped desktop navigation | Node 22 test runtime | Render sidebar | All module task groups visible | Passed | PASS | `Sidebar.test.tsx` |
| T-010 | Sidebar | Mobile drawer controls | Node 22 test runtime | Toggle drawer | Accessible expanded state and close path | Passed | PASS | `Sidebar.test.tsx` |
| T-011 | Sidebar | Hide/show desktop sidebar | Node 22 test runtime | Hide then show | Navigation can be restored | Passed | PASS | `Sidebar.test.tsx` |
| T-012 | Operator vault | Encrypt/decrypt round trip | Node 22 test runtime | Encrypt and unlock | Private state round-trips; envelope has ciphertext only | Passed | PASS | `operator-vault.test.ts` |
| T-013 | Operator vault | Wrong passphrase | Node 22 test runtime | Decrypt with wrong passphrase | Reject without exposing secret | Passed | PASS | `operator-vault.test.ts` |
| T-014 | Wave 2 vault | Encrypted private records | Node 22 test runtime | Encrypt/decrypt credential records | No plaintext secrets in envelope | Passed | PASS | `wave2-vault.test.ts` |
| T-015 | Pending operations | Journal reconciliation | Node 22 test runtime | Reconcile local journal and public actions | Confirmed entries settle without fake success | Passed | PASS | `operation-journal.test.ts` |
| T-016 | Privacy | Static secret/log/storage regression | Node 22 root test runtime | Run privacy suite | Disallowed secret persistence/log patterns absent | 3 privacy tests passed | PASS | `privacy/privacy.test.ts` |
| T-017 | Type safety | Web TypeScript project | Node 22.19.0 | Run `tsc -b --pretty false` | Exit 0 | Exit 0 | PASS | Terminal validation |
| T-018 | Production build | Build Vite SPA | Node 22, copied ZK artifacts | Run web build | Exit 0; build marker emitted | Build completed in 5m 52s | PASS | `pnpm build` terminal output |
| T-019 | Compact contracts | Compile and verify current contracts | Active Compact 0.31.1 | Run contract test suite | Compiler-backed Wave 1 compile and generated parity pass | 8 files, 50 tests passed | PASS | `pnpm --filter @velios/contracts test` |
| T-020 | Preview read | Public Wave 1 deployment | Indexer reachable | Open Preview and read exact address | Public data or actionable indexer error | Previously rendered; current retest pending | NOT TESTED | Existing `chrome-prod-qa.json` is stale evidence |
| T-021 | Wallet connect | Connect 1AM/Lace on Preview | Unlocked extension | Connect through DApp Connector v4 | Correct Preview session and address | Not available in audit browser tab | BLOCKED | Requires user wallet session |
| T-022 | Wallet rejection | Reject connection | Unlocked extension | Start then reject | Recoverable error, no stuck busy state | Not executed | BLOCKED | Requires interactive wallet |
| T-023 | Wallet change | Switch account/network after unlock | Current deployment and wallet | Change connector session | Vault locks and providers clear | Source implemented; live retest not executed | BLOCKED | Requires redeploy + wallet |
| T-024 | Proof provider | Hosted UI with Docker closed | Wallet exposing `getProvingProvider` | Connect and submit | Wallet Proof Station proves; no local Docker needed | Source uses official method; production bundle stale | BLOCKED | Requires redeploy + funded wallet |
| T-025 | Wave 1 deploy | Create organization and founding member | Wallet, DUST, proof provider | Complete setup and wait for read-back | Exact contract state confirmed | Not executed in this audit | BLOCKED | External Preview transaction required |
| T-026 | Wave 1 authorize | Policy → request → proof → result | Deployed org/agent | Submit valid request, refresh | `SucceedEntirely` plus exact indexed action | Not executed in this audit | BLOCKED | External Preview transaction required |
| T-027 | Wave 1 refusal | Request outside private policy | Same as T-026 | Submit disallowed request | Local refusal or failed proof; no public success row | Not executed in this audit | BLOCKED | External Preview setup required |
| T-028 | Credentials | Issue and revoke | Owner Wave 2 contract/vault | Execute both circuits | Exact commitment/read-back confirmed | Not executed in this audit | BLOCKED | Live Wave 2 environment required |
| T-029 | Treasury | Deposit and authorize | Owner economy contract, DUST/NIGHT | Execute circuits | Exact public amount/authorization confirmed | Not executed in this audit | BLOCKED | Live Wave 2 environment required |
| T-030 | Settlement | Acknowledge disclosure and settle | Existing authorization | Submit settlement | Public recipient/amount and exact settlement confirmed | Not executed in this audit | BLOCKED | Live Wave 2 environment required |
| T-031 | Governance | Register, propose, vote, finalize | Governance owner vault | Execute sequence with selected voter | Commitments/final tally read back | Not executed in this audit | BLOCKED | Live Wave 2 environment required |
| T-032 | Procurement | Register, lot, bid, award | Procurement owner and treasury authorization | Execute sequence with selected bidder | Exact bid commitment and award read back | Not executed in this audit | BLOCKED | Live Wave 2 environment required |
| T-033 | Auditor | Record disclosure grant | Auditor owner vault | Submit grant | Exact scoped grant read back | Not executed in this audit | BLOCKED | Live Wave 2 environment required |
| T-034 | Responsive | Desktop/tablet/mobile workspace | Playwright Chromium and host libraries | Run Playwright projects | No broken navigation/overflow | 6 applicable scenarios passed; 3 project-inapplicable cases skipped | PASS | `pnpm test:e2e` |
| T-035 | Accessibility | Keyboard/focus/announcements | Browser engine available | Navigate critical routes by keyboard | Visible focus and useful announcements | Unit foundations pass; full journey pending | NOT TESTED | Requires Playwright/manual pass |

## Live evidence rule

A blockchain row may move from BLOCKED to PASS only after retaining its network, contract address, transaction id/status, and exact indexer read-back. A button click, wallet popup, local replica test, or optimistic UI is not sufficient.
