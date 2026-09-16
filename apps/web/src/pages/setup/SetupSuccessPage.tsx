import { Button } from "../../components/Button.js";
import { RecoveryPanel } from "../../components/RecoveryPanel.js";
import { SuccessState } from "../../components/SuccessState.js";
import { TransactionProgress } from "../../components/TransactionProgress.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { useSession } from "../../state/session.js";

export function SetupSuccessPage() {
  useDocumentTitle("Organization created");
  const { publicStore, busy, busyAction, walletError, selectedContract, refreshLedger } = useSession();
  const created = Boolean(publicStore.organization);

  if (busyAction === "deploy") {
    return (
      <div className="page">
        <h1 id="page-heading" className="display" tabIndex={-1}>
          Deploying organization
        </h1>
        <TransactionProgress phase="proving" status="pending" />
      </div>
    );
  }

  if (!created) {
    return (
      <div className="page">
        <RecoveryPanel
          title={selectedContract ? "Waiting for indexer confirmation" : "Organization was not deployed"}
          body={
            selectedContract
              ? "A contract address exists locally, but the public organization record is not confirmed on the indexer yet. Do not redeploy while confirmation is pending."
              : walletError ?? "Midnight did not return a confirmed organization. Encrypted operator state is still on this device."
          }
        >
          {selectedContract ? (
            <button type="button" className="btn" disabled={busy} onClick={() => void refreshLedger()}>
              {busyAction === "refresh" ? "Checking indexer…" : "Check indexer again"}
            </button>
          ) : null}
          <Button to="/app/setup/review">Return to review</Button>
          <Button to="/app/setup" variant="secondary">
            Check readiness
          </Button>
        </RecoveryPanel>
      </div>
    );
  }

  return (
    <div className="page">
      <SuccessState
        title="Organization created on Midnight"
        body="The public organization and founding member are on the indexer. Configure the first agent next."
      >
        <Button to={`/app/org/${selectedContract}/agent/new`}>Configure first agent</Button>
        <Button to="/app/org" variant="secondary">
          Open organization
        </Button>
      </SuccessState>
    </div>
  );
}
