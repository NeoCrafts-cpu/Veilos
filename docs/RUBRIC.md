# Judging rubric — where to look

Maps the Midnight Hackathon 100-point rubric to this repo. Judges: start at the README, then this file.

## 1. Product Leadership — 20

| Skill | Evidence |
| --- | --- |
| Problem definition | README “Why Veilos”; pitch slide *Problem*; `docs/BUSINESS.md` |
| Vision | PRIVATE / VERIFIABLE / AUTONOMOUS; `ROADMAP.md` |
| Execution planning | `docs/wave-progress.md` phases 0–9; `docs/BUSINESS.md` milestones |
| Product fit with Midnight | Dual ledger in README; Compact sources; Privacy Inspector |
| Presentation clarity | [docs/pitch/index.html](pitch/index.html); [DEMO-SCRIPT.md](DEMO-SCRIPT.md) (non-technical first 30s) |

## 2. Backend Engineering — 20

| Skill | Evidence |
| --- | --- |
| Functional depth | `packages/contracts/compact/*.compact`; `packages/midnight`; CLI deploy |
| Code quality | pnpm workspaces, typed adapters, no Solidity stand-in |
| Decentralized integration | Compact + indexer + proof-server + DApp Connector + unshielded NIGHT |
| Reliability | `SucceedEntirely` + exact indexer id; fail-closed refuses; vault mismatch gate |
| Docs | README judge path; `scripts/local-dev/README.md`; `scripts/deploy/README.md` |

## 3. Frontend & UX — 15

| Skill | Evidence |
| --- | --- |
| Working interface | https://veilos-web.vercel.app |
| Navigation | Get Started vs Explore Preview; guided setup |
| Design cohesion | Midnight tokens (`packages/ui/src/tokens.css`): black / off-white / `#0000FF` / `#B9FF00` |
| Interactivity | Wallet connect, readiness checklist, transaction progress |
| Feedback | AUTHORIZED only after ledger+indexer; refuse copy does not print private limits |

## 4. Quality Assurance — 15

| Skill | Evidence |
| --- | --- |
| Stability | Hosted static UI; production paths do not mock success |
| Completeness | Auth + economy routes under `/app/*` |
| Testing | `pnpm test`; C1–C31; `.github/workflows/wave1.yml` |
| Demo readiness | Vercel UI + Preview org (no wallet). Circuits need local proving — documented, not hidden |
| Version control | Dated commits on `main`; topic `midnightntwrk` |

## 5. Communication & Marketing — 15

| Skill | Evidence |
| --- | --- |
| Messaging | Tagline on landing + pitch |
| Pitch | Deck + `DEMO-SCRIPT.md` |
| Visuals | Deck, landing, Logo mark |
| Community | Copy-paste posts in [COMMUNITY.md](COMMUNITY.md) — **you still have to publish them** |
| Educational | Pitch “How Midnight works”; Privacy Inspector as a teaching surface |

## 6. Business Development — 15

All five questions are answered in [BUSINESS.md](BUSINESS.md): audience, GTM, ecosystem fit, monetization, scale.
