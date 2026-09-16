import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "./Button.js";

describe("Button", () => {
  afterEach(() => cleanup());

  it("removes disabled navigation actions from the tab and link model", () => {
    render(
      <MemoryRouter>
        <Button to="/app" disabled>Open app</Button>
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link", { name: "Open app" })).toBeNull();
    expect(screen.getByText("Open app").getAttribute("aria-disabled")).toBe("true");
  });

  it("renders enabled navigation actions as links", () => {
    render(
      <MemoryRouter>
        <Button to="/app">Open app</Button>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Open app" }).getAttribute("href")).toBe("/app");
  });
});
