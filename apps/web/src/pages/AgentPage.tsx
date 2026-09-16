import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/Button.js";
import { MaskedValue } from "../components/MaskedValue.js";
import { PageHeader } from "../components/PageHeader.js";
import { RecoveryPanel } from "../components/RecoveryPanel.js";
import { StatusChip } from "../components/StatusChip.js";
import {
  LIVE_AGENT_NAME,
  LIVE_AGENT_ROLE,
  LIVE_MEMBER_NAME,
  liveAgentStatus,
  liveAgentStatusLabel,
} from "../lib/org-display.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useSession } from "../state/session.js";

export function AgentPage() {
  useDocumentTitle(LIVE_AGENT_NAME);
  const { agentId, contractAddress } = useParams();
  const { publicStore, selectedContract, operatorMatch, privateDisplay, selectEntities } = useSession();
  const agent = publicStore.agents.find((item) => item.agentId === agentId) ?? publicStore.agents[0];
  const contract = contractAddress ?? selectedContract ?? publicStore.contractAddress;
  const status = liveAgentStatus({
    confirmedAgent: Boolean(agent),
    ledgerSync: publicStore.ledgerSync,
    ...(agent ? { agentStatus: agent.status } : {}),
  });

  useEffect(() => {
    if (agent) selectEntities({ agentId: agent.agentId });
  }, [agent, selectEntities]);

  return (
    <div className="page">
      <PageHeader
        title={LIVE_AGENT_NAME}
        objective={`${LIVE_AGENT_ROLE} for this organization. It can request payments. It cannot see or change the private budget.`}
      />
      <div className="desk-split">
        <article className="card agent-desk">
          <p className="label">Live agent</p>
          <h2>{LIVE_AGENT_NAME}</h2>
          <p className="mono">{LIVE_AGENT_ROLE}</p>
          <StatusChip tone={status === "active" ? "ok" : "neutral"} label={liveAgentStatusLabel(status)} />
          <p className="muted">Created by {LIVE_MEMBER_NAME}</p>
          <h3>Private policy</h3>
          <p>These values never appear on the ledger.</p>
          <MaskedValue label="Daily limit" />
          <MaskedValue label="Per-action limit" />
          <MaskedValue label="Approved recipient" />
          <p>Self-modify: {privateDisplay.selfModifyAllowed ? "Yes" : "No"}</p>
          {operatorMatch === "mismatch" || operatorMatch === "stale_spend" ? (
            <RecoveryPanel
              title="Unlock matching access"
              body="Restore the backup used when this agent was created before authorizing a payment."
            >
              <Button to="/app/org">Unlock organization</Button>
            </RecoveryPanel>
          ) : (
            <div className="row">
              <Button to="/app/authorize/new">Request a payment</Button>
              {agent && contract ? (
                <Button to={`/app/org/${contract}/agent/${agent.agentId}/policy`} variant="secondary">
                  Update private policy
                </Button>
              ) : null}
            </div>
          )}
        </article>
        <article className="card">
          <p className="label">How this agent is used</p>
          <ol className="use-list">
            <li>FOUNDING-MEMBER sets the private policy.</li>
            <li>TREASURY-01 requests a payment to a vendor.</li>
            <li>You connect a wallet and authorize.</li>
            <li>Midnight records only whether it was allowed.</li>
          </ol>
          <p className="muted">
            Public ids stay in technical details. Operators work with the agent name, not hex dumps.
          </p>
        </article>
      </div>
    </div>
  );
}
