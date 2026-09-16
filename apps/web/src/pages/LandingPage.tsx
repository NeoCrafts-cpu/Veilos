import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeroArt } from "../components/HeroArt.js";
import { Logo } from "../components/Logo.js";
import { Reveal } from "../components/Reveal.js";
import { SkipLink } from "../components/SkipLink.js";
import { WindowChrome } from "../components/WindowChrome.js";
import { LIVE_AGENT_NAME, LIVE_MEMBER_NAME, LIVE_ORG_NAME } from "../lib/org-display.js";
import "../landing.css";
import { useSession } from "../state/session.js";

const SECTIONS = [
  { id: "product", label: "Use" },
  { id: "protocol", label: "Protocol" },
  { id: "modules", label: "Organization" },
  { id: "architecture", label: "Runtime" },
  { id: "demo", label: "Path" },
  { id: "roadmap", label: "Roadmap" },
] as const;

const MARQUEE = [
  "Request a payment",
  "Prove on Midnight",
  "Record the result",
  "Issue a credential",
  "Settle in public",
  LIVE_AGENT_NAME,
  "Midnight Preview",
];

const USE_CASES = [
  {
    title: "Request a payment",
    body: `${LIVE_AGENT_NAME} asks to pay a vendor. Amount and reason stay private. Authorization does not move funds.`,
    stamp: "On Preview",
    to: "/app/authorize/new",
    cta: "Request a payment",
    tone: "scan",
  },
  {
    title: "Issue a credential",
    body: "Bind a treasury credential to one unshielded recipient and private limits. Only a commitment is public.",
    stamp: "On Preview",
    to: "/app/credentials",
    cta: "Open credentials",
    tone: "",
  },
  {
    title: "Settle a payment",
    body: "Deposit unshielded NIGHT, authorize against the credential, then settle. Amount and recipient become public on purpose.",
    stamp: "On Preview",
    to: "/app/treasury",
    cta: "Open treasury",
    tone: "blue",
  },
] as const;

const PROTOCOL = [
  {
    n: "01",
    title: "Private",
    body: "Policy, credential, amount, and reason stay in witnesses. The chain never receives the budget.",
  },
  {
    n: "02",
    title: "Proof",
    body: "Compact checks the request against those commitments. If it is outside policy, nothing is written.",
  },
  {
    n: "03",
    title: "Public",
    body: "The ledger records an action id and a result. Settlement is a later, optional, unshielded step.",
  },
] as const;

const ARCH = [
  { title: "Compact", detail: "authorization.compact · economy-preview.compact · language 0.23" },
  { title: "Private state", detail: "Witnesses rebound to public commitments" },
  { title: "ZK proof", detail: "1AM Proof Station or proof-server 8.1.0 · never mocked" },
  { title: "Wallet", detail: "DApp Connector v4 · Lace / 1AM" },
  { title: "Indexer", detail: "GraphQL v4 · public result only" },
  { title: "MidnightJS", detail: "4.1.1 deployContract / submitCallTx" },
] as const;

const PATH = [
  { n: "01", title: "Request", body: `Ask ${LIVE_AGENT_NAME} to pay a vendor. The values stay in this browser.` },
  { n: "02", title: "Prove", body: "Connect 1AM. Compact authorizes against the private policy." },
  { n: "03", title: "Record", body: "A public authorized row appears. Funds have not moved." },
  { n: "04", title: "Settle", body: "Optional. Amount and recipient become public on the treasury contract." },
] as const;

export function LandingPage() {
  const { choosePreview, walletError } = useSession();
  const [active, setActive] = useState<string>("product");
  const [menuOpen, setMenuOpen] = useState(false);

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
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.15, 0.4] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="shell landing">
      <SkipLink />
      <header className="nav landing-nav">
        <a className="brand-lockup-link landing-brand" href="#top">
          <Logo size={48} />
        </a>
        <div className="nav-tools">
          <Link className="btn landing-nav-cta" to="/app" onClick={() => choosePreview()}>
            Open organization
          </Link>
          <button
            type="button"
            className="btn ghost nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="landing-nav-links"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>
      <nav
        id="landing-nav-links"
        className={`tabs landing-tabs ${menuOpen ? "is-open" : ""}`}
        aria-label="Landing"
      >
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            data-active={active === section.id}
            aria-current={active === section.id ? "true" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {section.label}
          </a>
        ))}
        <Link to="/docs" onClick={() => setMenuOpen(false)}>
          Docs
        </Link>
        <Link to="/app/privacy" onClick={() => setMenuOpen(false)}>
          Privacy design
        </Link>
      </nav>

      <main id="main-content">
        <section id="top" className="hero-stage">
          <p className="hero-watermark" aria-hidden="true">
            VEILOS
          </p>
          <div className="hero-copy">
            <WindowChrome />
            <div className="hero-copy-text">
              {walletError ? <p className="footer-note">{walletError}</p> : null}
              <div className="hero-meta">
                <p className="landing-kicker">
                  <span className="pulse" aria-hidden="true">
                    ■
                  </span>
                  Privacy OS · Midnight Network
                </p>
                <span className="hero-stamp">01 / OS</span>
              </div>
              <h1 className="hero-banner">
                <span className="hero-line">Private.</span>
                <span className="hero-line slab">Verifiable.</span>
                <span className="hero-line mark">Autonomous.</span>
              </h1>
              <p className="lede">
                {LIVE_ORG_NAME} is on Midnight Preview. {LIVE_AGENT_NAME} can request a payment without
                publishing the budget. Compact records a verified result. Unshielded settlement is optional
                and public by design.
              </p>
              <div className="hero-cta">
                <Link className="btn" to="/app" onClick={() => choosePreview()}>
                  Open organization
                </Link>
                <Link className="btn ghost" to="/app/authorize/new" onClick={() => choosePreview()}>
                  Request a payment
                </Link>
              </div>
            </div>
            <HeroArt />
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...MARQUEE, ...MARQUEE].map((item, index) => (
              <span key={`${item}-${index}`}>{item} ·</span>
            ))}
          </div>
        </div>

        <section id="product" className="landing-section">
          <Reveal className="section-head">
            <div>
              <p className="section-index">01 / Use</p>
              <h2 className="display">What you can do today</h2>
            </div>
            <p className="section-copy">
              {LIVE_ORG_NAME} is live on Preview. Request a payment against a private policy, issue a
              credential, or settle unshielded NIGHT. Votes, bids, and auditor desks are in the app;
              those contracts are not on Preview yet.
            </p>
          </Reveal>
          <div className="module-grid">
            {USE_CASES.map((item, index) => (
              <Reveal
                key={item.title}
                as="article"
                delayMs={index * 90}
                className={`card use-card ${item.tone === "blue" ? "blue" : ""} ${item.tone === "scan" ? "scan" : ""}`}
              >
                <span className="stamp">{item.stamp}</span>
                <div className="label">Workflow</div>
                <h3>{item.title}</h3>
                {item.tone === "scan" ? <p className="mask">████████ SHIELDED</p> : null}
                <p>{item.body}</p>
                <Link className="btn ghost" to={item.to} onClick={() => choosePreview()}>
                  {item.cta}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="protocol" className="landing-section">
          <Reveal className="section-head">
            <div>
              <p className="section-index">02 / Protocol</p>
              <h2 className="display">How it stays private</h2>
            </div>
            <p className="section-copy">The chain sees the proof. Not the secret. Failed proofs write nothing.</p>
          </Reveal>
          <div className="protocol-track">
            {PROTOCOL.map((step, index) => (
              <Reveal key={step.title} as="article" delayMs={index * 80} className={`card protocol-card ${index === 1 ? "blue" : ""}`}>
                <span className="protocol-num">{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="modules" className="landing-section">
          <Reveal className="section-head">
            <div>
              <p className="section-index">03 / Organization</p>
              <h2 className="display">{LIVE_ORG_NAME}</h2>
            </div>
            <p className="section-copy">
              Humans write constraints. {LIVE_AGENT_NAME} requests actions. Midnight authorizes what is
              allowed. This is the live Preview organization, not a mock.
            </p>
          </Reveal>
          <div className="org-board">
            <Reveal as="article" className="card">
              <div className="label">Roster</div>
              <h3>Who can act</h3>
              <div className="agent-list">
                <div className="agent-row" data-state="active">
                  <span>{LIVE_MEMBER_NAME}</span>
                  <span>
                    <span className="dot on" /> Member
                  </span>
                </div>
                <div className="agent-row" data-state="active">
                  <span>{LIVE_AGENT_NAME}</span>
                  <span>
                    <span className="dot on" /> Active
                  </span>
                </div>
                <div className="agent-row" data-state="paused">
                  <span>Votes · Bids · Auditor</span>
                  <span>
                    <span className="dot" /> Not on Preview
                  </span>
                </div>
              </div>
            </Reveal>
            <Reveal delayMs={100} as="article" className="card blue">
              <div className="label">Execution</div>
              <h3>Agents request. Midnight decides.</h3>
              <p>
                A payment request is a private witness plus a public action id. Authorization does not
                transfer funds. Settlement on the economy contract does, and that amount is public.
              </p>
              <Link className="btn ghost" to="/app" onClick={() => choosePreview()}>
                Open organization
              </Link>
            </Reveal>
          </div>
        </section>

        <section id="architecture" className="landing-section">
          <Reveal className="section-head">
            <div>
              <p className="section-index">04 / Runtime</p>
              <h2 className="display">Official Midnight only</h2>
            </div>
            <p className="section-copy">
              No EVM stand-in. No mocked ledger success. Compact, proof server, indexer, and wallet are
              the runtime.
            </p>
          </Reveal>
          <div className="arch-grid">
            {ARCH.map((item, index) => (
              <Reveal key={item.title} as="article" delayMs={index * 90} className="card arch-card">
                <div className="label">Runtime</div>
                <h3>{item.title}</h3>
                <p className="mono">{item.detail}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="demo" className="landing-section">
          <Reveal className="section-head">
            <div>
              <p className="section-index">05 / Path</p>
              <h2 className="display">One payment, end to end</h2>
            </div>
            <p className="section-copy">
              Authorize first. Settle only if you intend amount and recipient to become public.
            </p>
          </Reveal>
          <div className="journey-strip">
            {PATH.map((step, index) => (
              <Reveal key={step.title} as="article" delayMs={index * 70} className={`card journey-card ${index === 1 ? "lime" : ""}`}>
                <span className="protocol-num">{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="roadmap" className="landing-section">
          <Reveal className="section-head">
            <div>
              <p className="section-index">06 / Roadmap</p>
              <h2 className="display">What is live</h2>
            </div>
            <p className="section-copy">Status from the repository, not from a pitch deck.</p>
          </Reveal>
          <div className="roadmap">
            <Reveal as="article" className="card roadmap-card" data-wave="1">
              <div className="label">On Preview</div>
              <h3>Wave 1 · Core</h3>
              <p>
                Organization, {LIVE_MEMBER_NAME}, {LIVE_AGENT_NAME}, private policy, Compact
                authorization, Privacy Inspector.
              </p>
            </Reveal>
            <Reveal delayMs={80} as="article" className="card roadmap-card" data-wave="2">
              <div className="label">On Preview</div>
              <h3>Wave 2 · Economy</h3>
              <p>
                Credentials, unshielded deposit, authorize, and settle on economy-preview. Votes, bids,
                and auditor circuits are compiled; companion contracts are not deployed yet.
              </p>
            </Reveal>
            <Reveal delayMs={160} as="article" className="card roadmap-card">
              <div className="label">Not started</div>
              <h3>Wave 3 · Network</h3>
              <p>Credit, reputation, escrow, marketplace, external verification.</p>
            </Reveal>
          </div>
        </section>

        <section className="landing-cta">
          <Reveal className="cta-panel">
            <WindowChrome />
            <div className="label">Ready</div>
            <h2>Open the live organization</h2>
            <p>
              {LIVE_ORG_NAME} · {LIVE_AGENT_NAME}. Request a payment and inspect what Midnight made
              public versus what stayed private.
            </p>
            <div className="row">
              <Link className="btn" to="/app" onClick={() => choosePreview()}>
                Open organization
              </Link>
              <Link className="btn ghost" to="/app/privacy">
                What's public
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <span>The blockchain sees the proof. Not the secret.</span>
          <span>Midnight Preview · Compact 0.23 · MidnightJS 4.1.1</span>
        </div>
      </footer>
    </div>
  );
}
