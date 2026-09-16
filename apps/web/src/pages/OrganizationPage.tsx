import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/Button.js";
import { EmptyState } from "../components/EmptyState.js";
import { FormField } from "../components/FormField.js";
import { PageHeader } from "../components/PageHeader.js";
import { PublicId } from "../components/PublicId.js";
import { RecoveryPanel } from "../components/RecoveryPanel.js";
import { StatusChip } from "../components/StatusChip.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useTaskSection } from "../hooks/useTaskSection.js";
import { veliosBuildId, veliosBuiltAt } from "../lib/build-info.js";
import { validateOperatorPassphrase } from "../lib/passphrase.js";
import { selectedAgent, selectedMember } from "../lib/session-entities.js";
import { useSession } from "../state/session.js";

export function OrganizationPage() {
  useDocumentTitle("Organization");
  useTaskSection("/app/org", "overview");
  const { contractAddress: routeContract } = useParams();
  const {
    publicStore,
    joinPublished,
    refreshLedger,
    importOperatorState,
    exportOperatorState,
    unlockVault,
    lockVault,
    createVault,
    wallet,
    busy,
    busyAction,
    operatorMatch,
    vaultStatus,
    published,
    selectedContract,
    selectWorkspace,
    selectEntities,
    selectedMemberId,
    selectedAgentId,
    workspaceMode,
  } = useSession();
  const [passphrase, setPassphrase] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [vaultError, setVaultError] = useState<string>();
  const [importError, setImportError] = useState<string>();
  const org = publicStore.organization;
  const agent = selectedAgent(publicStore.agents, selectedAgentId);
  const member = selectedMember(publicStore.members, selectedMemberId);
  const contractAddress =
    routeContract ?? selectedContract ?? publicStore.contractAddress ?? org?.contractAddress;

  useEffect(() => {
    if (routeContract) selectWorkspace(workspaceMode === "unset" ? "owner" : workspaceMode, routeContract);
  }, [routeContract, selectWorkspace, workspaceMode]);

  return (
    <div className="page">
      <PageHeader
        title={publicStore.organizationName}
        objective="Public membership and agent records. Veilos authorizes actions; it does not hold a treasury balance."
      />
      {!contractAddress && workspaceMode !== "preview" ? (
        <EmptyState
          title="No organization selected"
          body="Create your own organization or inspect the public Preview deployment."
        >
          <Button to="/app/setup">Create my organization</Button>
          <Button to="/app/preview" variant="secondary">
            Explore public Preview
          </Button>
        </EmptyState>
      ) : null}

      <section id="task-overview" className="card" style={{ marginTop: 24 }}>
        <h2>Overview</h2>
        <div className="grid">
          <article>
            <div className="label">Members</div>
            <div className="stat">{(org?.memberCount ?? BigInt(publicStore.members.length)).toString()}</div>
          </article>
          <article>
            <div className="label">Agents</div>
            <div className="stat">{(org?.agentCount ?? BigInt(publicStore.agents.length)).toString()}</div>
          </article>
          <article>
            <div className="label">Authorizations</div>
            <div className="stat">{(org?.actionCount ?? BigInt(publicStore.actions.length)).toString()}</div>
          </article>
        </div>
        <PublicId label="Organization id" value={org?.organizationId ?? published?.organizationId} />
        <PublicId label="Contract" value={contractAddress ?? published?.contractAddress} />
        <div className="row">
          <button type="button" className="btn ghost" disabled={!contractAddress || busy} onClick={() => void refreshLedger()}>
            {busyAction === "refresh" ? "Refreshing…" : "Refresh public data"}
          </button>
          {wallet ? (
            <button type="button" className="btn ghost" disabled={busy} onClick={() => void joinPublished()}>
              {busyAction === "join" ? "Reconnecting…" : "Reconnect operator session"}
            </button>
          ) : null}
        </div>
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>Members</h2>
        {publicStore.members.length === 0 ? (
          <p>No public members yet.</p>
        ) : (
          <ul>
            {publicStore.members.map((item) => (
              <li key={item.memberId}>
                <button
                  type="button"
                  className="btn ghost"
                  data-selected={item.memberId === (member?.memberId ?? selectedMemberId)}
                  onClick={() => selectEntities({ memberId: item.memberId })}
                >
                  Select member {item.memberId.slice(0, 8)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="task-agents" className="card" style={{ marginTop: 24 }}>
        <h2>Agent and policy</h2>
        {publicStore.agents.length > 1 ? (
          <ul>
            {publicStore.agents.map((item) => (
              <li key={item.agentId}>
                <button
                  type="button"
                  className="btn ghost"
                  data-selected={item.agentId === (selectedAgentId ?? agent?.agentId)}
                  onClick={() => selectEntities({ agentId: item.agentId })}
                >
                  Select agent {item.agentId.slice(0, 8)}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {agent ? (
          <div className="row">
            <Button to={`/app/org/${contractAddress}/agent/${agent.agentId}`}>Open agent</Button>
            <Button to={`/app/org/${contractAddress}/agent/${agent.agentId}/policy`} variant="secondary">
              Update private policy
            </Button>
          </div>
        ) : (
          <EmptyState title="No agent yet" body="Set a private policy, then create the first agent on Midnight.">
            <Button to="/app/org/agent/new">Configure first agent</Button>
          </EmptyState>
        )}
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>Operator access</h2>
        <StatusChip
          tone={operatorMatch === "verified" ? "ok" : operatorMatch === "mismatch" ? "warn" : "neutral"}
          label={
            operatorMatch === "verified"
              ? "Operator access verified for this agent"
              : operatorMatch === "stale_spend"
                ? "Spend commitment is stale"
                : operatorMatch === "mismatch"
                  ? "This vault does not open the on-chain agent"
                  : vaultStatus === "unlocked"
                    ? "Unlocked in this tab"
                    : vaultStatus === "locked"
                      ? "Encrypted vault locked"
                      : vaultStatus === "dev_available"
                        ? "Development export available"
                        : "No vault for this organization"
          }
        />
        {operatorMatch === "mismatch" || operatorMatch === "stale_spend" ? (
          <RecoveryPanel
            title="Restore the matching backup"
            body="A proof will not be submitted until owner, role, policy, and spend commitments match."
          />
        ) : null}
        {vaultStatus === "locked" || vaultStatus === "dev_available" ? (
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault();
              setVaultError(undefined);
              void unlockVault(passphrase).catch(() => {
                setVaultError("That passphrase did not open this operator vault. Retry or import the matching backup.");
              });
            }}
          >
            <FormField
              id="unlock-passphrase"
              label="Operator passphrase"
              type="password"
              autoComplete="current-password"
              value={passphrase}
              onChange={(event) => {
                setPassphrase(event.target.value);
                setVaultError(undefined);
              }}
              hint={
                vaultStatus === "dev_available"
                  ? "A local development export exists. Protect it with a passphrase. This is not a wallet recovery phrase."
                  : "The wallet pays transactions. This passphrase opens the operator vault."
              }
              error={vaultError}
            />
            <button type="submit" className="btn">
              Unlock operator access
            </button>
          </form>
        ) : null}
        {vaultStatus === "missing" ? (
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault();
              const strength = validateOperatorPassphrase(passphrase);
              if (strength) {
                setVaultError(strength);
                return;
              }
              setVaultError(undefined);
              void createVault(passphrase).catch(() => {
                setVaultError("The encrypted operator vault could not be created. Retry without leaving this page.");
              });
            }}
          >
            <FormField
              id="create-passphrase"
              label="Create operator passphrase"
              type="password"
              autoComplete="new-password"
              value={passphrase}
              onChange={(event) => {
                setPassphrase(event.target.value);
                setVaultError(undefined);
              }}
              hint="Use at least 16 characters with three of: uppercase, lowercase, digits, and symbols. Never enter a wallet recovery phrase."
              error={vaultError}
            />
            <button type="submit" className="btn">
              Create secure operator vault
            </button>
          </form>
        ) : null}
        {vaultStatus === "unlocked" ? (
          <div className="row">
            <button type="button" className="btn ghost" onClick={() => void exportOperatorState()}>
              Download encrypted backup
            </button>
            <button type="button" className="btn ghost" onClick={lockVault}>
              Lock operator access
            </button>
          </div>
        ) : null}
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!importFile) {
              setImportError("Choose an encrypted operator backup first.");
              return;
            }
            setImportError(undefined);
            void importOperatorState(importFile, passphrase).catch(() => {
              setImportError("The backup could not be opened. Check the file, passphrase, network, and organization.");
            });
          }}
        >
          <FormField
            id="import-passphrase"
            label="Import backup passphrase"
            type="password"
            value={passphrase}
            onChange={(event) => {
              setPassphrase(event.target.value);
              setImportError(undefined);
            }}
            error={importError}
          />
          <label htmlFor="import-file">
            Encrypted operator backup
            <input
              id="import-file"
              type="file"
              accept="application/json"
              onChange={(event) => {
                setImportFile(event.target.files?.[0] ?? null);
                setImportError(undefined);
              }}
            />
          </label>
          <button type="submit" className="btn ghost">
            Import backup
          </button>
        </form>
      </section>

      <details className="ledger-details">
        <summary>Technical details</summary>
        <p className="mono">{org?.organizationId ?? "not on indexer"}</p>
        <p className="label">Contract</p>
        <p className="mono">{contractAddress ?? published?.contractAddress ?? "not selected"}</p>
        <p className="label">Build</p>
        <p className="mono">
          {veliosBuildId()} · {veliosBuiltAt()}
        </p>
        <p className="label">Admin commitment</p>
        <p className="mono">{org?.adminCommitment ?? "awaiting indexer"}</p>
        {publicStore.members.map((member) => (
          <p key={member.memberId} className="mono">
            member {member.memberId} · {member.status}
          </p>
        ))}
      </details>
      <p className="footer-note">
        <Link to="/app/setup">Create another organization</Link>
      </p>
    </div>
  );
}
