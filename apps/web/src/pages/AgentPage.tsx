import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/Button.js";
import { MaskedValue } from "../components/MaskedValue.js";
import { PageHeader } from "../components/PageHeader.js";
import { PublicId } from "../components/PublicId.js";
import { RecoveryPanel } from "../components/RecoveryPanel.js";
import { StatusChip } from "../components/StatusChip.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useSession } from "../state/session.js";

export function AgentPage() {
  useDocumentTitle("Agent");
  const { agentId, contractAddress } = useParams();
  const { publicStore, selectedContract, operatorMatch, privateDisplay, selectEntities } = useSession();
  const agent = publicStore.agents.find((item) => item.agentId === agentId);
  const contract = contractAddress ?? selectedContract ?? publicStore.contractAddress;

  useEffect(() => {
    if (agent) selectEntities({ agentId: agent.agentId });
  }, [agent, selectEntities]);

  return (
    <div className="page">
      <PageHeader
        title={agent ? "Agent" : "No agent yet"}
        objective="Public status and commitments. Private policy values stay on this device."
      />
      {!agent ? (
        <RecoveryPanel title="Create the first agent" body="Set a private policy, then create the agent on Midnight.">
          <Button to="/app/org/agent/new">Configure first agent</Button>
        </RecoveryPanel>
      ) : (
        <>
          <div className="grid" style={{ marginTop: 24 }}>
            <article className="card">
              <div className="label">Status</div>
              <StatusChip tone={agent.status === "active" ? "ok" : "warn"} label={agent.status} />
              <p>Role label stays private.</p>
              <p>Credential window: {privateDisplay.credentialValidForWindow ? "Valid for this window" : "Local-only status"}</p>
            </article>
            <article className="card">
              <div className="label">Private policy</div>
              <MaskedValue label="Daily limit" />
              <MaskedValue label="Per-action limit" />
              <MaskedValue label="Approved recipient" />
              <p>Self-modify: {privateDisplay.selfModifyAllowed ? "Yes" : "No"}</p>
            </article>
            <article className="card">
              <div className="label">Public commitments</div>
              <PublicId label="Agent id" value={agent.agentId} />
              <PublicId label="Role" value={agent.roleCommitment} />
              <PublicId label="Policy" value={agent.policyCommitment} />
              <PublicId label="Spend" value={agent.spendCommitment} />
              <PublicId label="Owner" value={agent.ownerCommitment} />
            </article>
          </div>
          {operatorMatch === "mismatch" || operatorMatch === "stale_spend" ? (
            <RecoveryPanel
              title="Operator access does not match this agent"
              body="Import the backup used when this agent was created before authorizing."
            >
              <Button to="/app/org">Restore operator access</Button>
            </RecoveryPanel>
          ) : (
            <div className="row">
              <Button to="/app/authorize/new">Authorize a payment request</Button>
              <Button to={`/app/org/${contract}/agent/${agent.agentId}/policy`} variant="secondary">
                Update private policy
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
