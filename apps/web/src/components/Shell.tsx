import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { networkLabel, shortAddress } from "../lib/format.js";
import { useSession } from "../state/session.js";
import { Banner } from "./Banner.js";
import { Logo } from "./Logo.js";
import { RouteAnnouncer } from "./RouteAnnouncer.js";
import { SkipLink } from "./SkipLink.js";
import { StatusChip } from "./StatusChip.js";

const BUSY_COPY: Record<string, string> = {
  createAgent: "Creating the agent on Midnight. Keep this tab open and approve the wallet popup.",
  payment: "Authorizing the request on Midnight. Approve the wallet popup if it appears.",
  deploy: "Deploying the organization on Midnight. Keep this tab open.",
  policy: "Updating the private policy commitment. Approve the wallet popup if it appears.",
  join: "Reconnecting the operator session to the contract.",
  refresh: "Refreshing public organization data from the indexer.",
  connect: "Connecting the Midnight wallet.",
  vault: "Protecting operator access.",
  economy: "Submitting a Wave 2 economy circuit. Approve the wallet popup if it appears.",
  governance: "Submitting a governance circuit. Approve the wallet popup if it appears.",
  procurement: "Submitting a procurement circuit. Approve the wallet popup if it appears.",
  auditor: "Recording a disclosure grant on Midnight.",
};

export function Shell() {
  const {
    network,
    wallet,
    networkLive,
    connectWallet,
    disconnectWallet,
    publicStore,
    walletError,
    ledgerError,
    dustReady,
    busyAction,
    workspaceMode,
  } = useSession();
  const [navOpen, setNavOpen] = useState(false);
  const onChain = publicStore.ledgerSync === "confirmed";
  const workspaceLabel =
    workspaceMode === "preview" ? "Public preview" : workspaceMode === "owner" ? "Owner" : "Choose a path";
  const closeNav = () => setNavOpen(false);

  return (
    <div className="shell">
      <SkipLink />
      <RouteAnnouncer />
      <header className="nav">
        <div className="nav-brand-block">
          <Link to="/app" className="brand-lockup-link">
            <Logo size={40} />
          </Link>
          <div className="brand-sub">{publicStore.organizationName}</div>
          <div className="status-live">
            <StatusChip
              tone={onChain || networkLive ? "ok" : "warn"}
              label={`Midnight · ${networkLabel(network.networkId)}`}
            />
            <StatusChip tone={onChain ? "ok" : "neutral"} label={workspaceLabel} />
            {dustReady === false ? <StatusChip tone="warn" label="No DUST" /> : null}
          </div>
        </div>
        <div className="nav-tools">
          {wallet ? (
            <button type="button" className="btn ghost wallet-chip" onClick={disconnectWallet}>
              {wallet.unshieldedAddress ? shortAddress(wallet.unshieldedAddress) : "Disconnect"}
            </button>
          ) : (
            <button type="button" className="btn" onClick={() => void connectWallet()}>
              Connect wallet
            </button>
          )}
          <button
            type="button"
            className="btn ghost nav-toggle"
            aria-expanded={navOpen}
            aria-controls="primary-nav"
            onClick={() => setNavOpen((open) => !open)}
          >
            {navOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>
      <nav id="primary-nav" className={`tabs${navOpen ? " is-open" : ""}`} aria-label="Primary">
        <NavLink to="/app/setup" onClick={closeNav}>
          Get Started
        </NavLink>
        <NavLink to="/app" end onClick={closeNav}>
          Home
        </NavLink>
        <NavLink to="/app/authorize/new" onClick={closeNav}>
          Authorize
        </NavLink>
        <NavLink to="/app/actions" onClick={closeNav}>
          Activity
        </NavLink>
        <NavLink to="/app/org" onClick={closeNav}>
          Organization
        </NavLink>
        <NavLink to="/app/privacy" onClick={closeNav}>
          Privacy
        </NavLink>
        <NavLink to="/app/credentials" onClick={closeNav}>
          Credentials
        </NavLink>
        <NavLink to="/app/treasury" onClick={closeNav}>
          Treasury
        </NavLink>
        <NavLink to="/app/governance" onClick={closeNav}>
          Governance
        </NavLink>
        <NavLink to="/app/procurement" onClick={closeNav}>
          Procurement
        </NavLink>
        <NavLink to="/app/auditor" onClick={closeNav}>
          Auditor
        </NavLink>
        <NavLink to="/docs" onClick={closeNav}>
          Docs
        </NavLink>
      </nav>
      {busyAction !== "idle" && BUSY_COPY[busyAction] ? (
        <Banner tone="info">{BUSY_COPY[busyAction]}</Banner>
      ) : null}
      {walletError ? <Banner tone="error">{walletError}</Banner> : null}
      {ledgerError ? <Banner tone="error">{ledgerError}</Banner> : null}
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
