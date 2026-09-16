import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { shortAddress } from "../lib/format.js";
import { readSidebarHidden, writeSidebarHidden } from "../lib/workspace.js";
import { useSession } from "../state/session.js";
import { Banner } from "./Banner.js";
import { RouteAnnouncer } from "./RouteAnnouncer.js";
import { Sidebar } from "./Sidebar.js";
import { SkipLink } from "./SkipLink.js";

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
    wallet,
    connectWallet,
    disconnectWallet,
    walletError,
    ledgerError,
    busyAction,
    walletReconnectNeeded,
  } = useSession();
  const [navOpen, setNavOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeNav = useCallback(() => setNavOpen(false), []);
  const hideSidebar = useCallback(() => {
    const mobile = typeof window !== "undefined" && window.matchMedia?.("(max-width: 1080px)")?.matches === true;
    if (mobile) {
      setNavOpen(false);
      return;
    }
    setSidebarHidden(true);
    writeSidebarHidden(true);
    setNavOpen(false);
  }, []);
  const showSidebar = useCallback(() => {
    setSidebarHidden(false);
    writeSidebarHidden(false);
  }, []);

  useEffect(() => {
    setSidebarHidden(readSidebarHidden());
  }, []);

  return (
    <div className={`workspace${sidebarHidden ? " is-sidebar-hidden" : ""}`}>
      <SkipLink />
      <RouteAnnouncer />
      {navOpen ? (
        <button type="button" className="sidebar-backdrop" aria-label="Close menu" onClick={closeNav} />
      ) : null}
      <Sidebar open={navOpen} hidden={sidebarHidden} onClose={closeNav} onHide={hideSidebar} toggleRef={toggleRef} />
      <div className="workspace-main">
        <header className="workspace-top">
          <button
            ref={toggleRef}
            type="button"
            className="btn ghost nav-toggle"
            aria-expanded={navOpen}
            aria-controls="workspace-sidebar"
            onClick={() => setNavOpen((open) => !open)}
          >
            {navOpen ? "Close" : "Menu"}
          </button>
          {sidebarHidden ? (
            <button
              type="button"
              className="btn ghost sidebar-show"
              aria-expanded={false}
              aria-controls="workspace-sidebar"
              onClick={showSidebar}
            >
              Show sidebar
            </button>
          ) : null}
          <div className="nav-tools">
            {wallet ? (
              <button type="button" className="btn ghost wallet-chip" onClick={disconnectWallet}>
                {wallet.unshieldedAddress ? shortAddress(wallet.unshieldedAddress) : "Disconnect"}
              </button>
            ) : (
              <button type="button" className="btn" onClick={() => void connectWallet()}>
                {busyAction === "connect" ? "Connecting…" : walletReconnectNeeded ? "Reconnect wallet" : "Connect wallet"}
              </button>
            )}
          </div>
        </header>
        {walletReconnectNeeded && !wallet ? (
          <Banner tone="info">Wallet session ended. Reconnect the Midnight wallet to prove and submit. Connection is not claimed until the connector confirms it.</Banner>
        ) : null}
        {busyAction !== "idle" && BUSY_COPY[busyAction] ? (
          <Banner tone="info">{BUSY_COPY[busyAction]}</Banner>
        ) : null}
        {walletError ? <Banner tone="error">{walletError}</Banner> : null}
        {ledgerError ? <Banner tone="error">{ledgerError}</Banner> : null}
        <main id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
