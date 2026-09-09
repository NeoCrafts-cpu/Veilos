import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState.js";
import { PageHeader } from "../components/PageHeader.js";
import { formatWindow } from "../lib/format.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useSession } from "../state/session.js";

export function ActivityPage() {
  useDocumentTitle("Activity");
  const { publicStore, refreshLedger, busy, busyAction, ledgerError } = useSession();

  return (
    <div className="page">
      <PageHeader
        title="Activity"
        objective="Public authorization records from the Midnight indexer. Amounts, recipients, and reasons stay private."
      />
      {ledgerError ? (
        <EmptyState title="Indexer unavailable" body="Public activity could not be read. Retry the official indexer.">
          <button type="button" className="btn" disabled={busy} onClick={() => void refreshLedger()}>
            {busyAction === "refresh" ? "Refreshing…" : "Retry public data"}
          </button>
        </EmptyState>
      ) : publicStore.ledgerSync === "pending" ? (
        <p role="status">Reading public actions…</p>
      ) : publicStore.actions.length === 0 ? (
        <EmptyState
          title="No verified authorizations yet"
          body="Authorize a payment request to create the first public action record."
        >
          <Link className="btn" to="/app/authorize/new">
            Authorize a payment request
          </Link>
        </EmptyState>
      ) : (
        <ul className="activity-list card">
          {publicStore.actions.map((action) => (
            <li key={action.actionId}>
              <Link to={`/app/actions/${action.actionId}`}>
                <strong>{action.result.toUpperCase()}</strong>
                <span className="muted"> {formatWindow(action.periodStart, action.periodEnd)}</span>
              </Link>
              <Link className="btn ghost" to={`/app/actions/${action.actionId}/privacy`}>
                Inspect privacy
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
