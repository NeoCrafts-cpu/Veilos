import { Link } from "react-router-dom";
import { CurrentTaskCard } from "../components/CurrentTaskCard.js";
import { LedgerTable } from "../components/LedgerTable.js";
import { PageHeader } from "../components/PageHeader.js";
import { PaymentRequestForm } from "../components/PaymentRequestForm.js";
import { StatusChip } from "../components/StatusChip.js";
import { formatWindow } from "../lib/format.js";
import { LIVE_AGENT_NAME, liveAgentStatus, liveAgentStatusLabel } from "../lib/org-display.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useSession } from "../state/session.js";

export function DashboardPage() {
  useDocumentTitle("Home");
  const { publicStore, published, selectedAgentId, vaultStatus, wallet, connectWallet, busyAction, currentTask } =
    useSession();
  const agent =
    publicStore.agents.find((item) => item.agentId === selectedAgentId) ??
    (publicStore.agents.length === 1 ? publicStore.agents[0] : publicStore.agents.find((item) => item.status === "active"));
  const status = liveAgentStatus({
    confirmedAgent: Boolean(agent),
    ledgerSync: publicStore.ledgerSync,
    ...(agent ? { agentStatus: agent.status } : {}),
  });
  const orgName = publicStore.organizationName || published?.organizationName || "Organization";
  const recent = [...publicStore.actions].reverse();

  return (
    <div className="page">
      <PageHeader title={orgName} objective="Ask TREASURY-01 to pay a vendor. The budget stays private." />
      <CurrentTaskCard task={currentTask} />
      <div className="desk-split">
        <PaymentRequestForm idPrefix="home" />
        <article className="card agent-desk">
          <p className="label">This organization</p>
          <h2>{LIVE_AGENT_NAME}</h2>
          <StatusChip tone={status === "active" ? "ok" : status === "missing" ? "warn" : "neutral"} label={liveAgentStatusLabel(status)} />
          <p className="muted">Pays vendors inside a private policy. You can look around without a wallet.</p>
          <div className="row">
            {!wallet ? (
              <button type="button" className="btn" onClick={() => void connectWallet()}>
                {busyAction === "connect" ? "Connecting…" : "Connect wallet"}
              </button>
            ) : (
              <Link className="btn" to="/app/authorize/new">
                Request a payment
              </Link>
            )}
            <Link className="btn ghost" to="/app/org">
              {vaultStatus === "locked" || vaultStatus === "dev_available" ? "Unlock" : "People"}
            </Link>
          </div>
        </article>
      </div>
      <section className="card" style={{ marginTop: 24 }}>
        <div className="label">Activity</div>
        <h2>What Midnight recorded</h2>
        <p className="muted">Only verified results. Amounts stay private until you settle.</p>
        <LedgerTable
          columns={["Result", "Agent", "When", "Details"]}
          empty="Nothing authorized yet. Request a payment — if Midnight allows it, it shows up here."
        >
          {recent.length > 0
            ? recent.map((action) => (
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
