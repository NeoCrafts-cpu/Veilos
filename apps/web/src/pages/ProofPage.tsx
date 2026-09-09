import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RecoveryPanel } from "../components/RecoveryPanel.js";
import { TransactionProgress } from "../components/TransactionProgress.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { operationForAction, useSession } from "../state/session.js";

export function ProofPage() {
  useDocumentTitle("Authorization progress");
  const { actionId } = useParams();
  const navigate = useNavigate();
  const { operations, publicStore } = useSession();
  const operation = operationForAction(operations, actionId);
  const indexed = publicStore.actions.find((action) => action.actionId === actionId);
  const terminal = Boolean(operation && operation.status !== "pending");

  useEffect(() => {
    if (!actionId) return;
    if (indexed || terminal) navigate(`/app/actions/${actionId}`);
  }, [actionId, indexed, navigate, terminal]);

  if (!actionId) return null;
  if (!operation && !indexed) {
    return (
      <div className="page">
        <h1 id="page-heading" className="display" tabIndex={-1}>
          Proof interrupted
        </h1>
        <RecoveryPanel
          title="No confirmed authorization"
          body="This tab reloaded before Midnight confirmed a transaction. No public action was written."
        >
          <Link className="btn" to="/app/authorize/review">
            Review authorization
          </Link>
        </RecoveryPanel>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 id="page-heading" className="display" tabIndex={-1}>
        Authorizing request
      </h1>
      <p className="page-lead">Keep this tab open and approve the wallet popup if it appears.</p>
      <TransactionProgress phase={operation?.phase} status={operation?.status} />
      <details className="ledger-details">
        <summary>What is happening?</summary>
        <p>Veilos is proving the request against the committed private policy. The action id stays on this page only.</p>
      </details>
    </div>
  );
}
