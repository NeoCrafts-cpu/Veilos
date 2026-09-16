import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { PREVIEW_DEPLOYMENT } from "@velios/midnight/published";
import { App } from "./App.js";
import { EconomyProvider } from "./state/economy.js";
import { publicSlice, SessionProvider } from "./state/session.js";

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

describe("Wave 1 UI", () => {
  afterEach(() => cleanup());
  it("renders the landing statement and owner/public entry", () => {
    const { container } = renderAt("/");
    expect(screen.getByRole("heading", { name: /Private\.\s*Verifiable\.\s*Autonomous\./i })).toBeTruthy();
    expect(screen.getAllByText(/Get Started/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Explore public Preview organization/i).length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(/4800|48000|Launch Veilos|Private treasury/i);
  });

  it("renders the privacy inspector without private integers", () => {
    const { container } = renderAt("/app/privacy");
    expect(screen.getAllByText(/PRIVACY INSPECTOR/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/private value hidden/i).length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(/25000|48000/);
  });

  it("shows the published Preview contract on the public preview screen", () => {
    renderAt("/app/preview");
    expect(screen.getAllByText(/ACME AUTONOMOUS SYSTEMS/i).length).toBeGreaterThan(0);
    expect(screen.getByText(PREVIEW_DEPLOYMENT.contractAddress)).toBeTruthy();
  });

  it("keeps authorization copy on the request form", () => {
    renderAt("/app/authorize/new");
    expect(screen.getByLabelText(/amount/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /review authorization/i })).toBeTruthy();
    expect(screen.getAllByText(/does not transfer funds/i).length).toBeGreaterThan(0);
  });

  it("exposes a skip link in the app shell", () => {
    renderAt("/app");
    expect(screen.getAllByRole("link", { name: /skip to main content/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("navigation", { name: /primary/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /^get started$/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /^docs$/i })).toBeTruthy();
  });

  it("P4 public session slice has no policy integers", () => {
    const slice = publicSlice({
      organization: {
        organizationId: "aa".repeat(32) as never,
        status: "active",
        adminCommitment: "bb".repeat(32) as never,
      },
      organizationName: "ACME AUTONOMOUS SYSTEMS",
      members: [],
      agents: [],
      actions: [],
      ledgerSync: "none",
    });
    expect(JSON.stringify(slice)).not.toMatch(/perActionLimit|dailyLimit|ownerSecret|reason/);
  });
});
