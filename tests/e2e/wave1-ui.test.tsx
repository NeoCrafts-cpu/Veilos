import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../../apps/web/src/App.js";
import { TransactionProgress } from "../../apps/web/src/components/TransactionProgress.js";
import { resultExplanation, resultHeadline } from "../../apps/web/src/lib/result-copy.js";
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

describe("E1–E10 Wave 1 UI flow", () => {
  afterEach(() => cleanup());
  it("E1–E3 public preview and organization screens exist", async () => {
    renderAt("/app/preview");
    expect(screen.getAllByText(/ACME AUTONOMOUS SYSTEMS/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Inspect public\/private boundary|public Preview|Authorizations/i).length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toMatch(/25000|ownerSecret|treasury balance/i);
  });

  it("E4 pending and proving copy never claims AUTHORIZED", () => {
    expect(resultHeadline({ kind: "pending", phase: "proving" }, true)).toBe("AUTHORIZING");
    expect(resultExplanation({ outcome: { kind: "pending", phase: "proving" }, circuitSubmitted: true })).not.toMatch(
      /AUTHORIZATION RECORDED|authorized public action/,
    );
  });

  it("E5 submitted and indexing stay unconfirmed until the indexer row exists", () => {
    render(<TransactionProgress phase="indexing" status="pending" />);
    expect(document.body.textContent).toMatch(/Keep this tab open|Confirming on the indexer/i);
    expect(document.body.textContent).not.toMatch(/AUTHORIZATION RECORDED/);
  });

  it("E6 stale after SucceedEntirely is not AUTHORIZED", () => {
    expect(resultHeadline({ kind: "stale" }, true)).toBe("SUBMITTED, AWAITING INDEXER");
    expect(resultExplanation({ outcome: { kind: "stale" }, circuitSubmitted: true })).toMatch(/not AUTHORIZED/i);
    render(<TransactionProgress phase="indexing" status="stale" />);
    expect(document.body.textContent).toMatch(/has not confirmed the public action/i);
  });

  it("E7 rejected and recovery never disclose the private limit", () => {
    const text = resultExplanation({
      outcome: { kind: "rejected", code: "policy_violation" },
      previewCode: "preview_deny_amount",
      circuitSubmitted: false,
    });
    expect(text).toMatch(/Midnight was not called/i);
    expect(text).not.toMatch(/25000|48000/);
  });

  it("E8–E10 authorization UI never prints the private limit", async () => {
    renderAt("/app/agents/demo/action");
    const amount = screen.getByLabelText(/amount/i);
    fireEvent.change(amount, { target: { value: "100000" } });
    expect(screen.getByRole("button", { name: /review authorization/i })).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/25000/);
    expect(document.body.textContent).not.toMatch(/private policy limit: \$25,000/i);
  });
});
