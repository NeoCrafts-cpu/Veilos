import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const webDir = path.dirname(fileURLToPath(import.meta.url));
const config = readFileSync(path.resolve(webDir, "../vite.config.ts"), "utf8");
const vercel = readFileSync(path.resolve(webDir, "../../../vercel.json"), "utf8");
const renderConfig = readFileSync(path.resolve(webDir, "../../../render.yaml"), "utf8");

describe("production build smoke", () => {
  it("gates the development operator-state endpoint to opted-in local serve", () => {
    expect(config).toMatch(/apply:\s*"serve"/);
    expect(config).toMatch(/VELIOS_DEV_OPERATOR_STATE/);
    expect(config).toMatch(/VELIOS_DEV_OPERATOR_STATE_TOKEN/);
    expect(config).toMatch(/127\.0\.0\.1/);
    expect(config).toMatch(/\.private-state/);
    expect(config).not.toMatch(/vite-plugin-top-level-await/);
    expect(config).toMatch(/velios-build-info/);
    expect(config).toMatch(/VITE_VELIOS_BUILD/);
  });

  it("does not ship the operator-state path in a production dist when present", () => {
    const indexPath = path.resolve(webDir, "../dist/index.html");
    if (!existsSync(indexPath)) return;
    const index = readFileSync(indexPath, "utf8");
    expect(index).not.toMatch(/@velios-operator-state/);
    const assetsDir = path.resolve(webDir, "../dist/assets");
    if (!existsSync(assetsDir)) return;
    for (const name of readdirSync(assetsDir).filter((file) => file.endsWith(".js"))) {
      const text = readFileSync(path.join(assetsDir, name), "utf8");
      expect(text.includes("@velios-operator-state"), name).toBe(false);
    }
  });

  it("sets fail-closed browser security headers on static hosts", () => {
    for (const deployment of [vercel, renderConfig]) {
      expect(deployment).toMatch(/Content-Security-Policy/);
      expect(deployment).toMatch(/frame-ancestors 'none'/);
      expect(deployment).toMatch(/Referrer-Policy/);
      expect(deployment).toMatch(/no-referrer/);
      expect(deployment).toMatch(/X-Content-Type-Options/);
      expect(deployment).toMatch(/nosniff/);
    }
  });
});
