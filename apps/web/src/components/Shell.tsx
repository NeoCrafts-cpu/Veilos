import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { readSidebarHidden, writeSidebarHidden } from "../lib/workspace.js";
import { useSession } from "../state/session.js";
import { Banner } from "./Banner.js";
import { RouteAnnouncer } from "./RouteAnnouncer.js";
import { Sidebar } from "./Sidebar.js";
import { SkipLink } from "./SkipLink.js";
import { WalletStatus } from "./WalletStatus.js";

const BUSY_COPY: Record<string, string> = {
  createAgent: "Creating the agent. Keep this tab open and approve the wallet popup.",
  payment: "Authorizing. Approve the wallet popup if it appears. Keep this tab open.",
  deploy: "Setting up the organization. Keep this tab open.",
  policy: "Updating the private policy. Approve the wallet popup if it appears.",
  join: "Opening the organization.",
  refresh: "Refreshing public data.",
  connect: "Connecting wallet…",
  vault: "Unlocking organization access.",
  economy: "Updating treasury. Approve the wallet popup if it appears.",
  governance: "Recording a vote. Approve the wallet popup if it appears.",
  procurement: "Recording a bid. Approve the wallet popup if it appears.",
  auditor: "Recording an auditor grant.",
};

export function Shell() {
  const { walletError, ledgerError, busyAction, walletReconnectNeeded, wallet } = useSession();
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
            <WalletStatus />
          </div>
        </header>
        {walletReconnectNeeded && !wallet ? (
          <Banner tone="info">Wallet disconnected. Reconnect to continue.</Banner>
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
