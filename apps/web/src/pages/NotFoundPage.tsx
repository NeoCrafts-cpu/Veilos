import { Button } from "../components/Button.js";
import { RecoveryPanel } from "../components/RecoveryPanel.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export function NotFoundPage({ inWorkspace = false }: { inWorkspace?: boolean }) {
  useDocumentTitle("Page not found");

  return (
    <main className="page">
      <h1 id="page-heading" className="display" tabIndex={-1}>
        Page not found
      </h1>
      <RecoveryPanel
        title="This VELIOS route does not exist"
        body="Check the address or return to a known screen. No wallet or blockchain action was attempted."
      >
        <Button to={inWorkspace ? "/app" : "/"}>{inWorkspace ? "Open workspace" : "Return home"}</Button>
        <Button to="/docs" variant="secondary">Read documentation</Button>
      </RecoveryPanel>
    </main>
  );
}
