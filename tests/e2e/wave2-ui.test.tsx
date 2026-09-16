import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../../apps/web/src/App.js";
import { EconomyProvider } from "../../apps/web/src/state/economy.js";
import { SessionProvider } from "../../apps/web/src/state/session.js";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider>
        <EconomyProvider>
          <App />
        </EconomyProvider>
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe("Wave 2 economy UI", () => {
  afterEach(() => cleanup());

  it("shows unshielded leakage before settlement", () => {
    renderAt("/app/treasury/settle");
    expect(screen.getAllByText(/amount/i).length).toBeGreaterThan(0);
    expect(document.body.textContent).toMatch(/Still private/i);
    expect(document.body.textContent).not.toMatch(/25000|ownerSecret/);
    expect(document.body.textContent).not.toMatch(/AUTHORIZATION RECORDED/);
  });

  it("keeps credentials and ballots off the public inspector by default", () => {
    renderAt("/app/privacy");
    expect(document.body.textContent).toMatch(/Public observer|observer/i);
    expect(document.body.textContent).not.toMatch(/holderSecret|ballotChoice/);
  });

  it("exposes real credential and treasury circuit actions", () => {
    const creds = renderAt("/app/credentials");
    expect(creds.container.textContent).toMatch(/Issue on Midnight|Connect a Midnight wallet|Unlock the operator vault/i);
    expect(creds.container.textContent).not.toMatch(/AUTHORIZATION RECORDED/);
    cleanup();
    const treasury = renderAt("/app/treasury");
    expect(treasury.container.textContent).toMatch(/Prove authorization|Connect a Midnight wallet|Unlock the operator vault/i);
    cleanup();
    const gov = renderAt("/app/governance");
    expect(gov.container.textContent).toMatch(/Create on Midnight|Deploy on Preview|Connect a Midnight wallet/i);
    cleanup();
    const docs = renderAt("/docs");
    expect(docs.container.textContent).toMatch(/Fail-closed/i);
    expect(docs.container.textContent).toMatch(/economy-preview\.compact/i);
  });

  it("keeps Wave 2 write controls behind wallet, vault, and owner-secret gates", () => {
    const creds = renderAt("/app/credentials/issue");
    expect(creds.container.textContent).toMatch(/Connect a Midnight wallet/i);
    expect(creds.container.textContent).toMatch(/Published Preview|read-only|Deploy/i);
    expect(creds.container.textContent).not.toMatch(/ownerSecret|holderSecret/);
    expect(screen.getByRole("navigation", { name: /primary/i })).toBeTruthy();
  });
});
