# QA report — sidebar and Wave 2 completion

Date: 2026-09-20

## Verified

Node 22.19.0.

| Check | Result |
| --- | --- |
| `pnpm --filter @velios/web test` | 16 files, 47 tests passed; targeted post-fix suite passed 18/18 |
| `pnpm --filter @velios/midnight test` | 12 files, 39 tests passed |
| `pnpm --filter @velios/tests test` | 6 files, 22 passed, 2 live cases skipped |
| `pnpm --filter @velios/web exec tsc -b` | passed |
| `pnpm build` after `copy-zk-artifacts.sh` | passed; `dist/index.html` has `velios-build=e1ffc61` |
| `pnpm audit --prod --audit-level high` | no known vulnerabilities |
| Local `/app`, `/docs`, `/app/credentials/issue` | HTTP 200 |
| Browser pass on `http://127.0.0.1:4177` | Sidebar groups, direct authorization guard, explicit not-found recovery, `/docs` deep link, and no document-level horizontal overflow at 390px or 1024px |
| Playwright desktop/tablet/mobile | 6 applicable scenarios passed; 3 project-inapplicable cases skipped |

Wave 2 write controls require a connected wallet, an unlocked operator vault, a ready Wave 2 vault, and the owner secret from a user-owned deploy. The published ACME `economy-preview` address is observer-only. Circuits still use MidnightJS `deployContract` / `submitCallTx`. Success is `SucceedEntirely` plus indexer read-back.

## Live Preview limitation

W2-L2–W2-L7 credential, payment, settlement, companion, and award transactions are not retained in `docs/preview-evidence.md`. Those cases require `VELIOS_LIVE_PREVIEW=1`, a real Preview wallet, and a proof provider. Local replica tests are supplemental only.

## Production deployment blocker

The source build passes, but `https://veilos-web-ten.vercel.app` is currently stale. Direct `/docs` and `/app/treasury/authorize` checks return to the landing page, and the deployed document lacks the local `velios-build=e1ffc61` marker. Redeploy and repeat production browser QA before judge use.

## Remaining product limits

- Full `economy.compact` still cannot deploy on Preview (`Transaction would exhaust the block limits`).
- Governance finalize still uses the documented experimental tally limitation.
- Unshielded settlement amount and recipient are public by design after explicit acknowledgement.
