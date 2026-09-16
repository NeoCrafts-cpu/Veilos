import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../../components/Logo.js";
import { SkipLink } from "../../components/SkipLink.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { PREVIEW_DEPLOYMENT, PREVIEW_ECONOMY_DEPLOYMENT } from "@velios/midnight/published";
import { veliosBuildId } from "../../lib/build-info.js";
import "../../docs.css";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "features", label: "Features" },
  { id: "privacy", label: "Privacy" },
  { id: "authorization", label: "Authorization" },
  { id: "stack", label: "Stack" },
  { id: "contracts", label: "Contracts" },
  { id: "security", label: "Security" },
  { id: "start", label: "Getting started" },
  { id: "roadmap", label: "Roadmap" },
  { id: "faq", label: "FAQ" },
] as const;

export function DocsPage() {
  useDocumentTitle("Docs");
  const [active, setActive] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const year = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const nodes = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit?.target.id) setActive(hit.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.35] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="docs-shell">
      <SkipLink />
      <header className="docs-top">
        <Link to="/" className="brand-lockup-link">
          <Logo size={40} />
        </Link>
        <div className="docs-top-copy">
          <p className="docs-kicker">Veilos documentation</p>
          <p className="muted">Fail-closed authorization OS · Midnight Preview</p>
        </div>
        <div className="nav-tools">
          <Link className="btn" to="/app/setup">
            Open app
          </Link>
          <button
            type="button"
            className="btn ghost nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="docs-toc"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Sections"}
          </button>
        </div>
      </header>
      <div className="docs-layout">
        <nav id="docs-toc" className={`docs-toc${menuOpen ? " is-open" : ""}`} aria-label="Documentation">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              data-active={active === section.id}
              onClick={() => setMenuOpen(false)}
            >
              {section.label}
            </a>
          ))}
        </nav>
        <main id="main-content" className="docs-main">
          <section id="overview">
            <p className="docs-kicker">01 / Overview</p>
            <h1 className="display">Veilos</h1>
            <p className="docs-lead">
              Veilos is a privacy-native operating system for autonomous organizations on Midnight. Sensitive inputs
              stay private. Actions are verified. Only necessary results become public.
            </p>
            <div className="docs-grid">
              <article className="card">
                <h2>Problem</h2>
                <p>
                  Agents can spend, vote, and procure. Public chains force organizations to publish limits, vendors,
                  ballots, and credentials to enforce those rules.
                </p>
              </article>
              <article className="card blue">
                <h2>Philosophy</h2>
                <p>Agents choose how. Humans decide what must stay true. No valid Compact proof means no authorization.</p>
              </article>
              <article className="card lime">
                <h2>Fail-closed</h2>
                <p>
                  AUTHORIZED is never inferred from frontend state. Proof success, transaction SucceedEntirely, and the
                  exact indexer row must all hold. Otherwise the UI reports REFUSED.
                </p>
              </article>
            </div>
            <p>
              Midnight is used because Compact circuits can prove policy predicates without publishing the private
              witnesses. Veilos does not replace Midnight with a generic chain or a mocked ledger.
            </p>
          </section>

          <section id="architecture">
            <p className="docs-kicker">02 / Architecture</p>
            <h2 className="display">The loop</h2>
            <ol className="docs-flow">
              <li>Human commits a private policy and issues credentials.</li>
              <li>Agent requests an intent (amount, vendor, reason, window).</li>
              <li>Witnesses stay in the encrypted operator vault.</li>
              <li>Compact proves the predicates.</li>
              <li>MidnightJS submits the transaction.</li>
              <li>Indexer publishes only the public row.</li>
              <li>UI reads that row back. Missing row → stale, not authorized.</li>
            </ol>
            <p>
              Public: contract addresses, commitments, counters, authorization ids, unshielded settlement amount and
              recipient, finalized yes/no. Private: policy integers, credential bodies, ballot choices, sealed bids,
              owner secrets, intent salts.
            </p>
          </section>

          <section id="features">
            <p className="docs-kicker">03 / Features</p>
            <h2 className="display">Product surface</h2>
            <div className="docs-grid">
              <article className="card">
                <h2>Core</h2>
                <p>
                  Organization deploy, founding-member registration, operator vault (PBKDF2 + AES-GCM), DApp Connector
                  v4 wallet, Wave 1 <code>authorization.compact</code>.
                </p>
              </article>
              <article className="card">
                <h2>Agents</h2>
                <p>Create agents, commit private policies, per-action and daily caps, vendor constraint, roles, self-modify gate.</p>
              </article>
              <article className="card">
                <h2>Authorize</h2>
                <p>
                  Wave 1 <code>authorizeAction</code> and Wave 2 <code>authorizePayment</code>. Circuit asserts amount,
                  vendor, credential class 1, expiry, non-revocation, daily cap, replay nonce, and window against
                  kernel time.
                </p>
              </article>
              <article className="card">
                <h2>Credentials</h2>
                <p>
                  Organization-issued credentials on economy-preview: issue, expiry, revoke by nullifier, membership
                  via public commitment. Official Midnight DID/VC adapters stay experimental (package targets MidnightJS
                  4.0.2; Veilos is pinned to 4.1.1).
                </p>
              </article>
              <article className="card">
                <h2>Treasury</h2>
                <p>
                  <code>depositNight</code> uses Compact <code>receiveUnshielded</code>.{" "}
                  <code>settleAuthorizedPayment</code> uses <code>sendUnshielded</code> after intent reopen. Amount and
                  recipient are public by design.
                </p>
              </article>
              <article className="card">
                <h2>Governance</h2>
                <p>
                  Preview companion: register voter, create proposal, cast ballot (private choice), finalize public
                  yes/no. Compact 0.23 cannot yet prove that a disclosed tally equals every sealed opening.
                </p>
              </article>
              <article className="card">
                <h2>Procurement</h2>
                <p>
                  Sealed bids, unique bid keys, award bound to an economy-preview action id. Companion contracts cannot
                  look up another contract&apos;s map.
                </p>
              </article>
              <article className="card">
                <h2>Inspector</h2>
                <p>
                  Public commitments versus masked private slots. Auditor grants publish scope commitments, not claim
                  bodies.
                </p>
              </article>
            </div>
          </section>

          <section id="privacy">
            <p className="docs-kicker">04 / Privacy model</p>
            <h2 className="display">Minimum disclosure</h2>
            <ul>
              <li>Private state encrypted at rest: PBKDF2 210000 + AES-GCM, scoped to network + contract.</li>
              <li>Witnesses rebound to public commitments inside Compact. Untrusted witness integers are not authorization.</li>
              <li>Nullifiers prevent replay (action ids, settlement, votes, bids, credential revocation).</li>
              <li>
                Proofs use the wallet Proof Station or a local proof-server. Hosted 1AM HTTP provers are rejected.
              </li>
              <li>No secrets in logs. No plaintext policy in URLs.</li>
            </ul>
          </section>

          <section id="authorization">
            <p className="docs-kicker">05 / Authorization lifecycle</p>
            <h2 className="display">No proof, no AUTHORIZED</h2>
            <ol>
              <li>Unlock the operator vault that opens the on-chain commitments.</li>
              <li>Issue a treasury credential if using Wave 2 payments.</li>
              <li>Submit <code>authorizePayment</code> / <code>authorizeAction</code>.</li>
              <li>Wallet proves via Proof Station or local proof-server 8.1.0.</li>
              <li>Status must be SucceedEntirely.</li>
              <li>Indexer must contain the exact action id.</li>
            </ol>
            <p>Failed circuit asserts write nothing. The UI labels that REFUSED, not a guessed success.</p>
          </section>

          <section id="stack">
            <p className="docs-kicker">06 / Technology stack</p>
            <h2 className="display">Pinned versions</h2>
            <table className="docs-table">
              <tbody>
                <tr>
                  <th>Network</th>
                  <td>Midnight Preview</td>
                </tr>
                <tr>
                  <th>Compact</th>
                  <td>language 0.23 (compiler 0.31.x when compiling)</td>
                </tr>
                <tr>
                  <th>MidnightJS</th>
                  <td>4.1.1</td>
                </tr>
                <tr>
                  <th>DApp Connector</th>
                  <td>v4</td>
                </tr>
                <tr>
                  <th>Indexer</th>
                  <td>Official Preview GraphQL v4</td>
                </tr>
                <tr>
                  <th>Proof</th>
                  <td>midnightntwrk/proof-server:8.1.0 on :6300 (loopback / same-origin)</td>
                </tr>
                <tr>
                  <th>Encryption</th>
                  <td>PBKDF2-SHA-256 + AES-GCM</td>
                </tr>
                <tr>
                  <th>UI</th>
                  <td>React 19, Vite 7, react-router-dom 7</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section id="contracts">
            <p className="docs-kicker">07 / Smart contracts</p>
            <h2 className="display">Published Preview</h2>
            <p>Addresses below are from this repository&apos;s published.ts. They are not invented.</p>
            <article className="card">
              <h3>authorization.compact (Wave 1)</h3>
              <p className="mono">{PREVIEW_DEPLOYMENT.contractAddress}</p>
              <p>Organization {PREVIEW_DEPLOYMENT.organizationName}</p>
              <p>Created {PREVIEW_DEPLOYMENT.createdAt}</p>
            </article>
            <article className="card">
              <h3>economy-preview.compact (Wave 2 core)</h3>
              <p className="mono">{PREVIEW_ECONOMY_DEPLOYMENT.contractAddress}</p>
              <p>Deploy tx {PREVIEW_ECONOMY_DEPLOYMENT.deployTxId}</p>
              <p>Created {PREVIEW_ECONOMY_DEPLOYMENT.createdAt}</p>
              <p>Circuits: issueCredential, revokeCredential, authorizePayment, depositNight, settleAuthorizedPayment.</p>
            </article>
            <p>
              governance-preview, procurement-preview, and auditor-preview are Preview-sized companions. They are
              compiled locally and deployed from the app. Full <code>economy.compact</code> (12 circuits +
              HistoricMerkleTree) cannot deploy on Preview: the network rejected it with block-limit exhaustion.
            </p>
          </section>

          <section id="security">
            <p className="docs-kicker">08 / Security</p>
            <h2 className="display">Threat model</h2>
            <ul>
              <li>Frontend tampering cannot authorize: Compact asserts policy, credential, replay, and window.</li>
              <li>Stale policy: spend period and credential expiry are circuit-checked against kernel time.</li>
              <li>Replay: usedActionIds, settlement nullifiers, vote nullifiers, bid keys.</li>
              <li>Unauthorized policy mutation: adminCommitment must open ownerSecret; self-modify is a separate Wave 1 circuit.</li>
              <li>Unshielded NIGHT leakage is explicit and acknowledged before settleAuthorizedPayment.</li>
            </ul>
          </section>

          <section id="start">
            <p className="docs-kicker">09 / Getting started</p>
            <h2 className="display">Run what this repo actually runs</h2>
            <pre>{`nvm use
pnpm install
pnpm env:up
pnpm compile:contracts
pnpm compile:economy-preview
pnpm compile:governance-preview
pnpm compile:procurement-preview
pnpm compile:auditor-preview
pnpm --filter @velios/web dev
pnpm test`}</pre>
            <ul>
              <li>Node &gt;= 22 (<code>.nvmrc</code>).</li>
              <li>
                Proving: wallet Proof Station, or Docker image <code>midnightntwrk/proof-server:8.1.0</code> on port
                6300. Vercel does not host a proof server.
              </li>
              <li>Wallet: Midnight DApp Connector v4. Connect from Open organization. Never paste a seed into the UI.</li>
              <li>Preview deploy: <code>pnpm deploy:preview</code> and <code>pnpm deploy:preview:economy</code> (seed from local <code>.env</code>, never committed).</li>
              <li>Vercel hosts static UI only. Proofs stay in the wallet or on this computer.</li>
              <li>
                Env for the static UI: <code>VITE_VELIOS_NETWORK=preview</code> (already in <code>.env.production</code>).
              </li>
            </ul>
          </section>

          <section id="roadmap">
            <p className="docs-kicker">10 / Roadmap</p>
            <h2 className="display">Truthful status</h2>
            <div className="docs-roadmap">
              <article className="card lime" data-stage="completed">
                <p className="docs-kicker">Completed</p>
                <h3>Wave 1 core</h3>
                <p>
                  Organization, member, agent, private policy, authorizeAction, inspector, encrypted vault, MidnightJS
                  4.1.1, published Preview authorization contract.
                </p>
                <div className="docs-meter" aria-label="Wave 1 complete">
                  <span style={{ width: "92%" }} />
                </div>
              </article>
              <article className="card blue" data-stage="current">
                <p className="docs-kicker">Current</p>
                <h3>Wave 2 Preview economy</h3>
                <p>
                  economy-preview on Preview. Credentials, authorizePayment, unshielded deposit/settle. Companion
                  governance, procurement, and auditor contracts sized to deploy. DID/VC experimental. Tally completeness
                  experimental.
                </p>
                <div className="docs-meter">
                  <span style={{ width: "70%" }} />
                </div>
              </article>
              <article className="card" data-stage="next">
                <p className="docs-kicker">Next</p>
                <h3>Preview evidence + companion publishes</h3>
                <p>
                  Retain authorizeAction Preview evidence. Publish companion contract addresses after SucceedEntirely
                  deploys. Cross-contract award lookup when Compact supports it.
                </p>
                <div className="docs-meter">
                  <span style={{ width: "28%" }} />
                </div>
              </article>
              <article className="card" data-stage="future">
                <p className="docs-kicker">Future</p>
                <h3>Wave 3 network</h3>
                <p>
                  Credit, reputation, escrow, agent marketplace, Effectstream, Kuira/mobile, official DID/VC once
                  MidnightJS 4.1.1 compatible, trustless ballot tally, hosted-prover-free wallet proving API.
                </p>
                <div className="docs-meter">
                  <span style={{ width: "8%" }} />
                </div>
              </article>
            </div>
          </section>

          <section id="faq">
            <p className="docs-kicker">11 / FAQ</p>
            <h2 className="display">Questions</h2>
            <dl className="docs-faq">
              <dt>Why is authorization fail-closed?</dt>
              <dd>A missing or invalid proof must not look like success. Compact assert failures write nothing.</dd>
              <dt>What can agents do?</dt>
              <dd>Request actions inside a committed policy. They cannot raise their own limits unless self-modify was committed.</dd>
              <dt>What is private?</dt>
              <dd>Limits, vendors as preimages, credential bodies, reasons, ballot choices, bid amounts, owner secrets.</dd>
              <dt>What is public?</dt>
              <dd>Ids, commitments, counters, SucceedEntirely transactions, unshielded amount/recipient, finalized tallies.</dd>
              <dt>How do proofs work?</dt>
              <dd>
                MidnightJS submitCallTx plus the wallet Proof Station or a local proof-server. ZK artifacts are fetched
                from this origin. Hosted HTTP provers are rejected.
              </dd>
              <dt>Why does the hosted app say proving is unavailable when Docker is closed?</dt>
              <dd>
                Vercel only serves this static UI. It cannot see Docker on your PC. Connect a Midnight wallet so proofs
                run in the wallet Proof Station, or start <code>midnightntwrk/proof-server:8.1.0</code> on the same
                computer as the browser.
              </dd>
              <dt>How is Midnight used?</dt>
              <dd>Compact contracts, MidnightJS 4.1.1, DApp Connector v4, official Preview indexer. No Solidity stand-in.</dd>
              <dt>What happens when a proof fails?</dt>
              <dd>REFUSED. No public reject row. No private limit printed.</dd>
              <dt>How do credentials work?</dt>
              <dd>Org-issued commitments on economy-preview. Class, expiry, and non-revocation are proved in-circuit.</dd>
              <dt>How does governance privacy work?</dt>
              <dd>The ledger stores ballot commitments and nullifiers. Yes/no is disclosed only at finalize.</dd>
            </dl>
          </section>
          <footer className="docs-footer">
            Veilos · {year} · Apache-2.0 · Build {veliosBuildId()}
          </footer>
        </main>
      </div>
    </div>
  );
}
