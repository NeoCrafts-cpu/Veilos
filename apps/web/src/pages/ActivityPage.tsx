import { Link } from "react-router-dom";
import { LedgerTable } from "../components/LedgerTable.js";
import { PageHeader } from "../components/PageHeader.js";
import { formatWindow } from "../lib/format.js";
import { LIVE_AGENT_NAME } from "../lib/org-display.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useSession } from "../state/session.js";

export function ActivityPage() {
  useDocumentTitle("Activity");
  const { publicStore, refreshLedger, busy, busyAction, ledgerError } = useSession();
  const rows = [...publicStore.actions].reverse();

  return (
    <div className="page">
      <PageHeader
        title="Activity"
        objective="Every authorized payment TREASURY-01 has proven. Amounts, vendors, and reasons stay private."
      />
      {ledgerError ? <p className="field-error">{ledgerError}</p> : null}
      <section className="card" style={{ marginTop: 24 }}>
        <div className="row" style={{ marginTop: 0 }}>
          <button type="button" className="btn ghost" disabled={busy} onClick={() => void refreshLedger()}>
            {busyAction === "refresh" ? "Refreshing…" : "Refresh"}
          </button>
          <Link className="btn" to="/app/authorize/new">
            Request a payment
          </Link>
        </div>
        <LedgerTable
          columns={["Result", "Agent", "When", "Public record"]}
          empty="Nothing authorized yet. Request a payment — if Midnight allows it, it shows up here."
        >
          {rows.length > 0
            ? rows.map((action) => (
                <tr key={action.actionId}>
                  <td>
                    <Link to={`/app/actions/${action.actionId}`}>{action.result.toUpperCase()}</Link>
                  </td>
                  <td>{LIVE_AGENT_NAME}</td>
                  <td>{formatWindow(action.periodStart, action.periodEnd)}</td>
                  <td>
                    <Link to={`/app/actions/${action.actionId}/privacy`}>What's public</Link>
                  </td>
                </tr>
              ))
            : null}
        </LedgerTable>
      </section>
    </div>
  );
}
