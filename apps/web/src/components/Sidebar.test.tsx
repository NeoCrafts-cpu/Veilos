import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { EconomyProvider } from "../state/economy.js";
import { SessionProvider } from "../state/session.js";
import { Shell } from "./Shell.js";

function renderShell(path = "/app") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider>
        <EconomyProvider>
          <Shell />
        </EconomyProvider>
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe("workspace sidebar", () => {
  afterEach(() => cleanup());

  it("renders grouped module tasks and the docs system link", () => {
    renderShell("/app/credentials/issue");
    expect(screen.getByText("Credentials")).toBeTruthy();
    expect(screen.getByRole("link", { name: /^credentials$/i }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: /request a payment/i })).toBeTruthy();
    expect(screen.queryByText(/session/i)).toBeNull();
    expect(screen.queryByText(/wave 2 vault locked/i)).toBeNull();
  });

  it("exposes an accessible mobile drawer control", () => {
    renderShell("/app");
    const toggle = screen.getByRole("button", { name: /^menu$/i });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: /^close$/i }).getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("button", { name: /^menu$/i }).getAttribute("aria-expanded")).toBe("false");
  });

  it("hides the sidebar and offers a way to show it again", () => {
    renderShell("/app");
    fireEvent.click(screen.getByRole("button", { name: /^hide$/i }));
    expect(screen.queryByRole("navigation", { name: /primary/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^show sidebar$/i }));
    expect(screen.getByRole("navigation", { name: /primary/i })).toBeTruthy();
  });
});
