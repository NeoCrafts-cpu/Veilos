import { Link } from "react-router-dom";
import { CurrentTaskCard } from "../components/CurrentTaskCard.js";
import { PageHeader } from "../components/PageHeader.js";
import { StatusChip } from "../components/StatusChip.js";
import { formatWindow } from "../lib/format.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useSession } from "../state/session.js";

export function DashboardPage() {
  useDocumentTitle("Home");
  const { publicStore, currentTask, workspaceMode, operatorMatch, vaultStatus, selectedAgentId } = useSession();
  const agent = publicStore.agents.find((item) => item.agentId === selectedAgentId)
    ?? (publicStore.agents.length === 1 ? publicStore.agents[0] : undefined);
  const recent = publicStore.actions.slice(-3).reverse();
  const modeLabel = workspaceMode === "preview" ? "Public preview" : workspaceMode === "owner" ? "Owner" : "Not chosen";

  return (
    <div className="page">
      <PageHeader
        title="Home"
        objective="Veilos authorizes agent actions against a private policy. It does not transfer funds."
        context={<p className="muted">Workspace: {modeLabel}</p>}
      />
      <div className="home-board">
        <CurrentTaskCard task={currentTask} />
        <article className="card">
          <div className="label">Operator access</div>
          <StatusChip
            tone={operatorMatch === "verified" ? "ok" : operatorMatch === "mismatch" ? "warn" : "neutral"}
            label={
              operatorMatch === "verified"
                ? "Verified for this agent"
                : operatorMatch === "stale_spend"
                  ? "Stale spend backup"
                  : operatorMatch === "mismatch"
                    ? "Does not open this agent"
                    : vaultStatus === "locked"
                      ? "Locked"
                      : "Not ready"
            }
          />
          <p className="muted">The wallet pays DUST. The operator vault opens private commitments.</p>
        </article>
        <article className="card">
          <div className="label">Agent status</div>
          <div className="stat">{agent ? "1" : "0"}</div>
          <p>{agent ? `${agent.status} on Midnight` : "No agent on this organization yet."}</p>
        </article>
        <article className="card blue">
          <div className="label">Verified authorizations</div>
          <div className="stat">{publicStore.actions.length.toString()}</div>
          <p>Authorized only after Midnight SucceedEntirely and indexer read-back.</p>
        </article>
        <article className="card">
          <div className="label">Privacy boundary</div>
          <h2>Private → ZK → Public</h2>
          <div className="row">
            <Link className="btn ghost" to="/app/privacy">
              Inspect privacy
            </Link>
          </div>
        </article>
      </div>
      {recent.length > 0 ? (
        <section className="card" style={{ marginTop: 24 }}>
          <div className="label">Recent public activity</div>
          <ul className="activity-list">
            {recent.map((action) => (
              <li key={action.actionId}>
                <Link to={`/app/actions/${action.actionId}`}>
                  {action.result.toUpperCase()} · {formatWindow(action.periodStart, action.periodEnd)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
