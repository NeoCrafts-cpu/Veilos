import { Buffer } from "buffer";

(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { EconomyProvider } from "./state/economy.js";
import { SessionProvider } from "./state/session.js";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <SessionProvider>
          <EconomyProvider>
            <App />
          </EconomyProvider>
        </SessionProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
