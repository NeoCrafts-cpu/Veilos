import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "../components/Button.js";
import { EmptyState } from "../components/EmptyState.js";
import { PageHeader } from "../components/PageHeader.js";
import { PublicId } from "../components/PublicId.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { formatWindow } from "../lib/format.js";
import { useSession } from "../state/session.js";

export function PreviewPage() {
  useDocumentTitle("Public Preview");
  const navigate = useNavigate();
  const {
    choosePreview,
    publicStore,
    published,
    refreshLedger,
    busy,
    busyAction,
    startOwnerSetup,
    workspaceMode,
  } = useSession();

  useEffect(() => {
    if (workspaceMode !== "preview") choosePreview();
  }, [choosePreview, workspaceMode]);

  const org = publicStore.organization;
  const agent = publicStore.agents.length === 1 ? publicStore.agents[0] : publicStore.agents.find((item) => item.status === "active");

  return (
    <div className="page">
      <PageHeader
        title="Public Preview organization"
        objective="Inspect the published Preview organization without a wallet. Private policy values stay hidden."
      />
      <p className="banner info" role="status">
        You are viewing public ledger data only. This is not your operator workspace.
      </p>
      <div className="grid" style={{ marginTop: 24 }}>
        <article className="card">
          <div className="label">Organization</div>
          <h2>{publicStore.organizationName}</h2>
          <p>Status {org?.status ?? "syncing"}</p>
        </article>
        <article className="card">
          <div className="label">Members</div>
          <div className="stat">{(org?.memberCount ?? BigInt(publicStore.members.length)).toString()}</div>
        </article>
        <article className="card">
          <div className="label">Agents</div>
          <div className="stat">{(org?.agentCount ?? BigInt(publicStore.agents.length)).toString()}</div>
        </article>
        <article className="card">
          <div className="label">Authorizations</div>
          <div className="stat">{(org?.actionCount ?? BigInt(publicStore.actions.length)).toString()}</div>
        </article>
      </div>
      <article className="card" style={{ marginTop: 24 }}>
        <div className="label">Public identifiers</div>
        <PublicId label="Organization id" value={org?.organizationId ?? published?.organizationId} />
        <PublicId label="Contract" value={publicStore.contractAddress ?? published?.contractAddress} />
        {agent ? (
          <>
            <PublicId label="Agent id" value={agent.agentId} />
            <PublicId label="Policy commitment" value={agent.policyCommitment} />
          </>
        ) : (
          <EmptyState title="No public agent yet" body="The indexer has not returned an agent for this contract." />
        )}
        <div className="row">
          <Button to="/app/privacy">Inspect public/private boundary</Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => {
              startOwnerSetup();
              navigate("/app/setup");
            }}
          >
            Operate my own organization
          </Button>
          <button type="button" className="btn ghost" disabled={busy} onClick={() => void refreshLedger()}>
            {busyAction === "refresh" ? "Refreshing…" : "Retry public data"}
          </button>
        </div>
      </article>
      {publicStore.actions.length > 0 ? (
        <article className="card" style={{ marginTop: 24 }}>
          <div className="label">Public authorization history</div>
          <ul className="activity-list">
            {publicStore.actions.map((action) => (
              <li key={action.actionId}>
                <Link to={`/app/actions/${action.actionId}`}>
                  {action.result.toUpperCase()} · {formatWindow(action.periodStart, action.periodEnd)}
                </Link>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </div>
  );
}
