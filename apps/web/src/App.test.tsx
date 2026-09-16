import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
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
    expect(screen.getAllByText(/Open organization/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Request a payment/i).length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(/4800|48000|Launch Veilos|Private treasury/i);
    expect(container.querySelector(".hero-art[aria-hidden='true']")).toBeTruthy();
  });

  it("renders the privacy inspector without private integers", () => {
    const { container } = renderAt("/app/privacy");
    expect(screen.getAllByText(/What's public/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/private value hidden/i).length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(/25000|48000/);
  });

  it("opens the live organization on home", () => {
    renderAt("/app");
    expect(screen.getAllByText(/ACME AUTONOMOUS SYSTEMS/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Request a payment/i).length).toBeGreaterThan(0);
  });

  it("keeps authorization copy on the request form", () => {
    renderAt("/app/authorize/new");
    expect(screen.getByLabelText(/amount/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /review request/i }).hasAttribute("disabled")).toBe(true);
    expect(screen.getAllByText(/does not transfer funds/i).length).toBeGreaterThan(0);
  });

  it("fails closed when authorization review is opened without a valid draft", () => {
    renderAt("/app/authorize/review");
    expect(screen.getByText(/request details need review/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /authorize request on midnight/i }).hasAttribute("disabled")).toBe(true);
  });

  it("shows recovery instead of silently redirecting unknown workspace routes", () => {
    renderAt("/app/treasry");
    expect(screen.getByRole("heading", { name: /page not found/i })).toBeTruthy();
    expect(screen.getByText(/no wallet or blockchain action was attempted/i)).toBeTruthy();
  });

  it("does not claim the local proof-server is ready before a wallet connects", () => {
    renderAt("/app/setup");
    expect(screen.getByRole("heading", { name: /check readiness/i })).toBeTruthy();
    expect(screen.getByText(/Connect a Midnight wallet\. Hosted UI does not include a proof server/i)).toBeTruthy();
    expect(screen.queryByText(/Local proof-server on loopback/i)).toBeNull();
  });

  it("exposes a skip link in the app shell", () => {
    renderAt("/app");
    expect(screen.getAllByRole("link", { name: /skip to main content/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("navigation", { name: /primary/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /request a payment/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /^activity$/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /^credentials$/i })).toBeTruthy();
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
