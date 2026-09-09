import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo.js";
import { Reveal } from "../components/Reveal.js";
import { SkipLink } from "../components/SkipLink.js";
import { WindowChrome } from "../components/WindowChrome.js";
import "../landing.css";
import { useSession } from "../state/session.js";

const SECTIONS = [
  { id: "product", label: "Product" },
  { id: "protocol", label: "Protocol" },
  { id: "modules", label: "Modules" },
  { id: "architecture", label: "Architecture" },
  { id: "demo", label: "Live flow" },
  { id: "roadmap", label: "Roadmap" },
] as const;

const MARQUEE = [
  "Private",
  "Verifiable",
  "Autonomous",
  "Compact",
  "Midnight",
  "Proof not secret",
  "Agent control",
  "Privacy OS",
];

const LIVE_MODULES = [
  {
    title: "Private authorization policy",
    body: "Limits stay in private state. The ledger only sees that an action was authorized. No funds are transferred.",
    tone: "scan",
    stamp: "Wave 1",
  },
  {
    title: "Agent authorization",
    body: "Prove amount is inside a committed policy without publishing the policy values.",
    tone: "blue",
    stamp: "Live",
  },
  {
    title: "Privacy inspector",
    body: "Every screen splits PUBLIC vs PRIVATE. Authorized never appears without SucceedEntirely.",
    tone: "",
    stamp: "Live",
  },
] as const;

const NEXT_MODULES = [
  {
    title: "Identity & credentials",
    body: "Prove a fact about a member or agent without dumping the credential.",
    wave: "Wave 2",
  },
  {
    title: "Governance",
    body: "Private eligibility and ballot commitments. Only the finalized aggregate is public. Trustless tally completeness is experimental.",
    wave: "Wave 2",
  },
  {
    title: "Procurement",
    body: "Private bids, public validity. Suppliers stay masked until disclosure.",
    wave: "Wave 2",
  },
  {
    title: "Credit & reputation",
    body: "Network-level standing without a public credit file.",
    wave: "Wave 3",
  },
  {
    title: "Escrow & marketplace",
    body: "Settlements and agent markets after the core authorization loop is real.",
    wave: "Wave 3",
  },
  {
    title: "Selective disclosure",
    body: "Auditors see what they are entitled to. Everyone else sees a proof.",
    wave: "Wave 2",
  },
] as const;

const ARCH = [
  { title: "Compact", detail: "authorization.compact · language 0.23" },
  { title: "Private state", detail: "Witnesses rebound to public commitments" },
  { title: "ZK proof", detail: "Proof server · never mocked on production paths" },
  { title: "Wallet", detail: "DApp Connector v4 · Lace / window.midnight" },
  { title: "Indexer", detail: "GraphQL v4 · public result only" },
  { title: "MidnightJS", detail: "4.1.1 deployContract / submitCallTx" },
] as const;

export function LandingPage() {
  const { startOwnerSetup, choosePreview, walletError } = useSession();
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
          <Link className="btn landing-nav-cta" to="/app/setup" onClick={() => startOwnerSetup()}>
            Get Started
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
              Authorize agent actions without revealing private policy values. Veilos records a verified
              result on Midnight. It does not transfer funds or hold a treasury balance.
            </p>
            <div className="hero-cta">
              <Link className="btn" to="/app/setup" onClick={() => startOwnerSetup()}>
                Get Started
              </Link>
              <Link className="btn ghost" to="/app/preview" onClick={() => choosePreview()}>
                Explore public Preview organization
              </Link>
            </div>
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
          <Reveal>
            <p className="section-index">01 / Product</p>
            <h2 className="display">Live modules</h2>
            <p className="section-copy">
              Wave 1 is the authorization kernel. These modules are in the product now. Later waves stay
              labeled until the Compact path is proven on a real Midnight environment.
            </p>
          </Reveal>
          <div className="module-grid">
            {LIVE_MODULES.map((module, index) => (
              <Reveal
                key={module.title}
                as="article"
                delayMs={index * 90}
                className={`card module-card ${module.tone === "blue" ? "blue" : ""} ${module.tone === "scan" ? "scan" : ""} ${index === 0 ? "span-2" : ""}`}
              >
                <span className="stamp">{module.stamp}</span>
                <div className="label">Live module</div>
                <h3>{module.title}</h3>
                {module.tone === "scan" ? <p className="mask">████████ SHIELDED</p> : <p>{module.body}</p>}
                {module.tone === "scan" ? <p>{module.body}</p> : null}
              </Reveal>
            ))}
          </div>
        </section>

        <section id="protocol" className="landing-section">
          <Reveal>
            <p className="section-index">02 / Protocol</p>
            <h2 className="display">How it works</h2>
            <p className="section-copy">PRIVATE → PROOF → PUBLIC. The chain sees the proof. Not the secret.</p>
          </Reveal>
          <div className="protocol-row">
            <Reveal as="article" className="card protocol-card">
              <h3>PRIVATE</h3>
              <p>Policy values, credentials, and spend stay in private state and witnesses.</p>
            </Reveal>
            <div className="flow-arrow" aria-hidden="true">
              →
            </div>
            <Reveal as="article" delayMs={80} className="card protocol-card blue">
              <h3>PROOF</h3>
              <p>Compact circuits bind untrusted witnesses to public commitments.</p>
            </Reveal>
            <div className="flow-arrow" aria-hidden="true">
              →
            </div>
            <Reveal as="article" delayMs={160} className="card protocol-card">
              <h3>PUBLIC</h3>
              <p>Only action id, result, and commitments hit the ledger.</p>
            </Reveal>
          </div>
        </section>

        <section id="modules" className="landing-section">
          <Reveal>
            <p className="section-index">03 / Operating system</p>
            <h2 className="display">Agent control</h2>
            <p className="section-copy">
              Veilos is an OS for autonomous organizations: humans write constraints, agents request
              actions, Midnight authorizes what is allowed.
            </p>
          </Reveal>
          <div className="os-panel">
            <Reveal as="article" className="card">
              <div className="label">Control plane</div>
              <h3>Humans define the rules</h3>
              <p>Per-action and daily commitments. Approved vendors as hashes. No plaintext limits on-chain.</p>
              <div className="agent-list">
                <div className="agent-row" data-state="active">
                  <span>TREASURY-01</span>
                  <span>
                    <span className="dot on" /> Active
                  </span>
                </div>
                <div className="agent-row" data-state="active">
                  <span>PROCUREMENT-02</span>
                  <span>
                    <span className="dot on" /> Scheduled
                  </span>
                </div>
                <div className="agent-row" data-state="paused">
                  <span>CREDIT-01</span>
                  <span>
                    <span className="dot" /> Wave 3
                  </span>
                </div>
              </div>
            </Reveal>
            <Reveal delayMs={100} as="article" className="card blue">
              <div className="label">Execution</div>
              <h3>Agents execute</h3>
              <p>An authorization request is a private witness plus a public action id. Midnight decides. No funds move.</p>
            </Reveal>
          </div>

          <details className="landing-roadmap">
            <summary>Roadmap modules after Wave 1</summary>
            <p className="section-copy">Shown as product map, not shipped Wave 1 features.</p>
            <div className="module-grid">
              {NEXT_MODULES.map((module) => (
                <article key={module.title} className="card module-card">
                  <span className="stamp">{module.wave}</span>
                  <div className="label">Scheduled module</div>
                  <h3>{module.title}</h3>
                  <p>{module.body}</p>
                </article>
              ))}
            </div>
          </details>
        </section>

        <section id="architecture" className="landing-section">
          <Reveal>
            <p className="section-index">04 / Midnight</p>
            <h2 className="display">Architecture</h2>
            <p className="section-copy">
              No EVM stand-in. No mocked ledger success. Compact, proof server, indexer, and wallet are
              the runtime.
            </p>
          </Reveal>
          <div className="arch-grid">
            {ARCH.map((item, index) => (
              <Reveal key={item.title} as="article" delayMs={index * 110} className="card arch-card">
                <div className="label">Runtime</div>
                <h3>{item.title}</h3>
                <p className="mono">{item.detail}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="demo" className="landing-section">
          <Reveal>
            <p className="section-index">05 / Live path</p>
            <h2 className="display">Authorization loop</h2>
            <p className="section-copy">
              Operators set a private policy, create an agent, and authorize a payment request. Compact proves the
              request against Midnight. Only the verified result becomes public. No funds are transferred.
            </p>
          </Reveal>
          <div className="demo-split">
            <Reveal as="article" className="card lime demo-ok">
              <div className="label">Private</div>
              <h3>Policy and amount</h3>
              <p>Limits, vendor, credential, and reason stay in witnesses. They are never printed.</p>
            </Reveal>
            <Reveal delayMs={90} as="article" className="card red demo-no">
              <div className="label">Public</div>
              <h3>Verified result</h3>
              <p>Authorized only after SucceedEntirely and indexer read-back. Failed proofs write nothing.</p>
            </Reveal>
          </div>
        </section>

        <section id="roadmap" className="landing-section">
          <Reveal>
            <p className="section-index">06 / Roadmap</p>
            <h2 className="display">Waves</h2>
          </Reveal>
          <div className="roadmap">
            <Reveal as="article" className="card roadmap-card" data-wave="1">
              <div className="label">Now</div>
              <h3>Wave 1 · Core</h3>
              <p>Organization, agent, private policy, proof, Compact, Midnight transaction, Privacy Inspector.</p>
            </Reveal>
            <Reveal delayMs={80} as="article" className="card roadmap-card">
              <div className="label">Next</div>
              <h3>Wave 2 · Economy</h3>
              <p>DID, credentials, treasury, payments, governance, procurement, auditors.</p>
            </Reveal>
            <Reveal delayMs={160} as="article" className="card roadmap-card">
              <div className="label">Later</div>
              <h3>Wave 3 · Network</h3>
              <p>Credit, reputation, escrow, marketplace, external verification.</p>
            </Reveal>
          </div>
        </section>

        <section className="landing-cta">
          <Reveal className="cta-panel">
            <WindowChrome />
            <div className="label">Ready</div>
            <h2>Start private authorization</h2>
            <p>Create your organization, protect operator access, and authorize a request. Inspect what stayed private.</p>
            <div className="row">
              <Link className="btn" to="/app/setup" onClick={() => startOwnerSetup()}>
                Get Started
              </Link>
              <Link className="btn ghost" to="/app/privacy">
                Privacy design
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <span>The blockchain sees the proof. Not the secret.</span>
          <span>Midnight Compact · MidnightJS 4.1.1</span>
        </div>
      </footer>
    </div>
  );
}
