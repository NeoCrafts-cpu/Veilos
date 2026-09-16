import { Link, Navigate, useParams } from "react-router-dom";
import { Button } from "../components/Button.js";
import { PublicId } from "../components/PublicId.js";
import { RecoveryPanel } from "../components/RecoveryPanel.js";
import { resultExplanation, resultHeadline, recoveryLabel } from "../lib/result-copy.js";
import { formatWindow } from "../lib/format.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { operationForAction, useSession } from "../state/session.js";

export function ResultPage() {
  useDocumentTitle("Authorization result");
  const { actionId } = useParams();
  const { operations, publicStore, lastIntent } = useSession();
  const operation = operationForAction(operations, actionId);
  const indexed = publicStore.actions.find((action) => action.actionId === actionId);
  const outcome = indexed
    ? {
        kind: "authorized" as const,
        actionId: indexed.actionId,
        contractAddress: publicStore.contractAddress ?? "",
        txId: operation?.txId ?? "",
      }
    : operation?.outcome;
  const circuitSubmitted = operation?.circuitSubmitted ?? Boolean(indexed);

  if (!actionId) return null;
  if (operation?.status === "pending" && !indexed) {
    return <Navigate to={`/app/actions/${actionId}/progress`} replace />;
  }
  if (!outcome) {
    return (
      <div className="page">
        <RecoveryPanel
          title="Waiting for a verified result"
          body="This action is not in the current session and is not on the indexer yet."
        >
          <Button to="/app/actions">View activity</Button>
        </RecoveryPanel>
      </div>
    );
  }

  const authorized = outcome.kind === "authorized" && Boolean(indexed);
  const recovery = recoveryLabel(outcome, circuitSubmitted);

  return (
    <div className="page">
      <article className={authorized ? "card lime" : outcome.kind === "rejected" ? "card red" : "card"}>
        <h1 id="page-heading" className="display" tabIndex={-1}>
          {authorized ? "AUTHORIZATION RECORDED" : resultHeadline(outcome, circuitSubmitted)}
        </h1>
        {authorized ? (
          <ul>
            <li>Midnight allowed this request</li>
            <li>The public result is on the ledger</li>
            <li>Amount and vendor stay private</li>
            <li>No funds were transferred</li>
          </ul>
        ) : (
          <p>
            {resultExplanation({
              outcome,
              previewCode: operation?.previewCode,
              circuitSubmitted,
            })}
          </p>
        )}
      </article>
      <div className="privacy-grid" style={{ marginTop: 24 }}>
        <article className="card">
          <h2>Public data</h2>
          <PublicId label="Action" value={actionId} />
          <p>Result {authorized ? "authorized" : outcome.kind}</p>
          <PublicId label="Contract" value={publicStore.contractAddress} />
          <PublicId label="Tx" value={outcome.kind === "authorized" ? outcome.txId : undefined} />
          <p>
            Window{" "}
            {indexed
              ? formatWindow(indexed.periodStart, indexed.periodEnd)
              : "—"}
          </p>
        </article>
        <article className="card">
          <h2>Private data</h2>
          <p>
            <span aria-hidden="true">████████████████</span>
            <span className="sr-only">Amount: private value hidden</span>
          </p>
          <p>
            <span aria-hidden="true">████████████████</span>
            <span className="sr-only">Recipient: private value hidden</span>
          </p>
          <p>
            <span aria-hidden="true">████████████████</span>
            <span className="sr-only">Reason: private value hidden</span>
          </p>
        </article>
      </div>
      <details className="ledger-details">
        <summary>Technical details</summary>
        <p className="mono">action {actionId}</p>
        <p className="mono">local preview {operation?.previewCode ?? "—"}</p>
        <p className="mono">same-session intent {lastIntent?.actionId === actionId ? "yes" : "no"}</p>
      </details>
      <div className="row">
        <Link
          className="btn"
          to={
            recovery === "Edit request" || recovery === "Review authorization"
              ? "/app/authorize/new"
              : recovery === "Restore operator access"
                ? "/app/org"
                : recovery === "Check readiness"
                  ? "/app/setup"
                  : recovery === "Refresh public data"
                    ? "/app/org"
                    : "/app/authorize/new"
          }
        >
          {recovery}
        </Link>
        <Link className="btn ghost" to={`/app/actions/${actionId}/privacy`}>
          Inspect privacy
        </Link>
        <Link className="btn ghost" to="/app/actions">
          View activity
        </Link>
      </div>
    </div>
  );
}
