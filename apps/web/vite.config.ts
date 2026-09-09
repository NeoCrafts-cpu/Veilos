import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { IncomingMessage } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";

const webDir = path.dirname(fileURLToPath(import.meta.url));
const webRequire = createRequire(import.meta.url);
const midnightRequire = createRequire(path.resolve(webDir, "../../packages/midnight/package.json"));
const viteRequire = createRequire(webRequire.resolve("vite/package.json"));
const esbuild = viteRequire("esbuild") as typeof import("esbuild");

const CJS_BROWSER_PACKAGES = [
  "@subsquid/scale-codec",
  "@subsquid/util-internal-hex",
  "@subsquid/util-internal-json",
] as const;

const assertShim = path.resolve(webDir, "src/shims/node-assert.js");
const bufferEntry = webRequire.resolve("buffer");

function cjsPackageToEsmPlugin(): Plugin {
  const cache = new Map<string, string>();
  return {
    name: "cjs-package-to-esm",
    enforce: "pre",
    resolveId(source) {
      if ((CJS_BROWSER_PACKAGES as readonly string[]).includes(source)) {
        return `\0cjs-esm:${source}`;
      }
      return null;
    },
    async load(id) {
      if (!id.startsWith("\0cjs-esm:")) return null;
      const source = id.slice("\0cjs-esm:".length);
      const cached = cache.get(source);
      if (cached) return cached;
      const entry = webRequire.resolve(source);
      const result = await esbuild.build({
        absWorkingDir: webDir,
        alias: {
          assert: assertShim,
          buffer: bufferEntry,
        },
        bundle: true,
        define: {
          global: "globalThis",
        },
        entryPoints: [entry],
        format: "esm",
        logLevel: "silent",
        platform: "browser",
        write: false,
      });
      const bundled = result.outputFiles[0]?.text;
      if (!bundled) {
        throw new Error(`unable to convert ${source} from CommonJS for the browser`);
      }
      const exported = Object.keys(webRequire(source)).filter((name) => /^[A-Za-z_$][\w$]*$/.test(name));
      const named = exported.map((name) => `export const ${name} = __cjs[${JSON.stringify(name)}];`).join("\n");
      const code = bundled.includes("export default require_index();")
        ? bundled.replace(
            "export default require_index();",
            `const __cjs = require_index();\nexport default __cjs;\n${named}`,
          )
        : `${bundled}\n`;
      cache.set(source, code);
      return code;
    },
  };
}

function readRequestBody(req: IncomingMessage, limit = 256_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        req.destroy();
        reject(new Error("operator state too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function operatorPrivateStatePlugin(): Plugin {
  const repoRoot = path.resolve(webDir, "../..");
  const exportDir = path.join(repoRoot, ".private-state");
  const exportPath = path.join(exportDir, "preview.json");
  return {
    name: "velios-operator-private-state",
    apply: "serve",
    configureServer(server) {
      if (process.env.VELIOS_DEV_OPERATOR_STATE !== "1") {
        return;
      }
      server.middlewares.use("/@velios-operator-state", (req, res) => {
        if (req.method === "GET") {
          if (!existsSync(exportPath)) {
            res.statusCode = 404;
            res.end();
            return;
          }
          res.setHeader("content-type", "application/json");
          res.setHeader("cache-control", "no-store");
          res.end(readFileSync(exportPath));
          return;
        }
        if (req.method === "PUT" || req.method === "POST") {
          void readRequestBody(req)
            .then(async (raw) => {
              const parsed: unknown = JSON.parse(raw);
              const { decodePrivateState } = await import("../../packages/midnight/src/private-state-codec.ts");
              decodePrivateState(parsed);
              mkdirSync(exportDir, { recursive: true });
              writeFileSync(exportPath, `${JSON.stringify(parsed, null, 2)}\n`);
              res.statusCode = 204;
              res.end();
            })
            .catch(() => {
              res.statusCode = 400;
              res.end();
            });
          return;
        }
        res.statusCode = 405;
        res.end();
      });
    },
  };
}

function resolveFromWorkspaces(specifier: string): string {
  for (const resolver of [webRequire, midnightRequire]) {
    try {
      return resolver.resolve(specifier);
    } catch {
      // try the next workspace package
    }
  }
  throw new Error(`unable to resolve ${specifier}`);
}

// The package `exports` map does not expose `package.json`, so resolve the
// Node entry and take its directory. The browser entry lives beside it.
const onchainRuntime = path.dirname(resolveFromWorkspaces("@midnight-ntwrk/onchain-runtime-v3"));
const protocolRequire = createRequire(resolveFromWorkspaces("@midnight-ntwrk/midnight-js-protocol"));

function resolveMidnightSpecifier(source: string): string | null {
  if (!source.startsWith("@midnight-ntwrk/")) return null;
  if (source === "@midnight-ntwrk/onchain-runtime-v3") {
    return path.join(onchainRuntime, "midnight_onchain_runtime_wasm.js");
  }
  if (source.startsWith("@midnight-ntwrk/onchain-runtime-v3/")) {
    return path.join(onchainRuntime, source.slice("@midnight-ntwrk/onchain-runtime-v3/".length));
  }
  for (const resolver of [webRequire, midnightRequire, protocolRequire]) {
    try {
      return resolver.resolve(source);
    } catch {
      // keep looking across the workspace tree
    }
  }
  return null;
}

export default defineConfig({
  cacheDir: process.env.VITEST ? "./.vite-test" : "./.vite",
  build: {
    target: "esnext",
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: {
          wasm: ["@midnight-ntwrk/onchain-runtime-v3"],
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      extensions: [".js", ".cjs"],
      ignoreDynamicRequires: true,
    },
  },
  plugins: [
    cjsPackageToEsmPlugin(),
    operatorPrivateStatePlugin(),
    react(),
    wasm(),
    {
      // Official leaderboard hook, plus a real file path. Returning only
      // `{ id: source }` leaves Vite unable to find the package from a
      // prebundled `.vite/deps` chunk in a pnpm workspace.
      name: "wasm-module-resolver",
      resolveId(source) {
        return resolveMidnightSpecifier(source);
      },
    },
  ],
  define: {
    "process.env": {},
    global: "globalThis",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
      supported: { "top-level-await": true },
      platform: "browser",
      format: "esm",
      loader: { ".wasm": "binary" },
    },
    // Prebundle compact-runtime so its CJS helper (`object-inspect`) gets a
    // default export. Leave the WASM packages out so they load natively.
    include: [
      "@midnight-ntwrk/compact-runtime",
      "object-inspect",
      "fetch-retry",
      "cross-fetch",
      "@midnight-ntwrk/wallet-sdk-address-format",
    ],
    exclude: [
      "@midnight-ntwrk/onchain-runtime-v3",
      "@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm_bg.wasm",
      "@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm.js",
      "@midnight-ntwrk/midnight-js-protocol",
      "@midnight-ntwrk/midnight-js-contracts",
      "@midnight-ntwrk/midnight-js-http-client-proof-provider",
      "@midnight-ntwrk/midnight-js-indexer-public-data-provider",
      "@midnight-ntwrk/midnight-js-fetch-zk-config-provider",
      "@midnight-ntwrk/ledger-v8",
      "@midnight-ntwrk/compact-js",
      "@midnight-ntwrk/platform-js",
    ],
  },
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".wasm"],
    mainFields: ["browser", "module", "main"],
    dedupe: [
      "@midnight-ntwrk/compact-runtime",
      "@midnight-ntwrk/onchain-runtime-v3",
      "@midnight-ntwrk/ledger-v8",
    ],
    alias: {
      "@midnight-ntwrk/onchain-runtime-v3": path.join(onchainRuntime, "midnight_onchain_runtime_wasm.js"),
      "cross-fetch": path.resolve(webDir, "src/shims/cross-fetch.ts"),
      "isomorphic-ws": path.resolve(webDir, "src/shims/websocket.ts"),
      assert: assertShim,
    },
  },
  server: {
    port: 4177,
    host: "0.0.0.0",
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 400,
    },
    fs: {
      allow: ["../..", onchainRuntime, path.dirname(fileURLToPath(import.meta.url))],
    },
    proxy: {
      "/proof-server": {
        target: "http://127.0.0.1:6300",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/proof-server/, ""),
      },
      "/indexer-graphql": {
        target: "https://indexer.preview.midnight.network",
        changeOrigin: true,
        rewrite: () => "/api/v4/graphql",
      },
    },
  },
  test: {
    environment: "jsdom",
  },
});
