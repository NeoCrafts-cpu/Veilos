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
});
