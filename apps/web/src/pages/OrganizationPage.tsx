import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/Button.js";
import { EmptyState } from "../components/EmptyState.js";
import { FormField } from "../components/FormField.js";
import { PageHeader } from "../components/PageHeader.js";
import { RecoveryPanel } from "../components/RecoveryPanel.js";
import { StatusChip } from "../components/StatusChip.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useTaskSection } from "../hooks/useTaskSection.js";
import { veliosBuildId, veliosBuiltAt } from "../lib/build-info.js";
import { validateOperatorPassphrase } from "../lib/passphrase.js";
import { selectedAgent, selectedMember } from "../lib/session-entities.js";
import { TreasuryOperatorImport } from "../components/TreasuryOperatorImport.js";
import { useEconomy } from "../state/economy.js";
import { useSession } from "../state/session.js";

export function OrganizationPage() {
  useDocumentTitle("Organization");
  useTaskSection("/app/org", "overview");
  const { contractAddress: routeContract } = useParams();
  const {
    publicStore,
    refreshLedger,
    importOperatorState,
    exportOperatorState,
    unlockVault,
    lockVault,
    createVault,
    busy,
    busyAction,
    operatorMatch,
    vaultStatus,
    published,
    ledgerError,
    selectedContract,
    selectWorkspace,
    selectedMemberId,
    selectedAgentId,
    workspaceMode,
  } = useSession();
  const { vault: treasuryVault } = useEconomy();
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
        objective="Who belongs here. Payments happen from Home — not on this page."
      />
      {!contractAddress && workspaceMode !== "preview" ? (
        <EmptyState
          title="No organization selected"
          body="Open the live organization to see members and agents."
        >
          <Button to="/app">Open organization</Button>
        </EmptyState>
      ) : null}

      {ledgerError ? (
        <EmptyState title="Indexer unavailable" body="Public organization data could not be read. Retry the official indexer. Slow Preview responses can take up to a minute.">
          <button type="button" className="btn" disabled={!contractAddress || busy} onClick={() => void refreshLedger()}>
            {busyAction === "refresh" ? "Refreshing…" : "Retry public data"}
          </button>
        </EmptyState>
      ) : null}

      <section id="task-overview" className="card" style={{ marginTop: 24 }}>
        <h2>How this organization is used</h2>
        <ol className="use-list">
          <li>FOUNDING-MEMBER holds organization access.</li>
          <li>TREASURY-01 requests payments inside a private policy.</li>
          <li>You authorize from Home. Midnight records only the public result.</li>
        </ol>
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
            <div className="label">Authorized payments</div>
            <div className="stat">{(org?.actionCount ?? BigInt(publicStore.actions.length)).toString()}</div>
          </article>
        </div>
        <div className="row">
          <button type="button" className="btn ghost" disabled={!contractAddress || busy} onClick={() => void refreshLedger()}>
            {busyAction === "refresh" ? "Refreshing…" : "Refresh"}
          </button>
          <Button to="/app/authorize/new">Request a payment</Button>
        </div>
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>Members</h2>
        <div className="roster">
          <div className="roster-row" data-selected={Boolean(member) || publicStore.members.length === 1}>
            <span>FOUNDING-MEMBER</span>
            <StatusChip tone="ok" label={publicStore.members[0]?.status ?? "active"} />
          </div>
        </div>
      </section>

      <section id="task-agents" className="card" style={{ marginTop: 24 }}>
        <h2>Agents</h2>
        <div className="roster">
          <div className="roster-row" data-selected={Boolean(agent) || publicStore.agents.length === 1}>
            <span>TREASURY-01</span>
            <StatusChip tone={agent?.status === "active" ? "ok" : "neutral"} label={agent?.status ?? "syncing"} />
          </div>
        </div>
        {agent ? (
          <div className="row">
            <Button to={`/app/org/${contractAddress}/agent/${agent.agentId}`}>Open TREASURY-01</Button>
            <Button to={`/app/org/${contractAddress}/agent/${agent.agentId}/policy`} variant="secondary">
              Update private policy
            </Button>
          </div>
        ) : (
          <p className="muted">The treasury agent is the one that requests payments. Open it once the ledger answers.</p>
        )}
      </section>

      {(() => {
        const needsAccess =
          operatorMatch === "mismatch" ||
          operatorMatch === "stale_spend" ||
          vaultStatus === "locked" ||
          vaultStatus === "dev_available";
        const accessBody = (
          <>
            <StatusChip
              tone={operatorMatch === "verified" ? "ok" : operatorMatch === "mismatch" ? "warn" : "neutral"}
              label={
                operatorMatch === "verified"
                  ? "Ready to authorize"
                  : operatorMatch === "stale_spend"
                    ? "Access is out of date"
                    : operatorMatch === "mismatch"
                      ? "This access does not open the live agent"
                      : vaultStatus === "unlocked"
                        ? "Unlocked in this tab"
                        : vaultStatus === "locked"
                          ? "Locked"
                          : vaultStatus === "dev_available"
                            ? "Access available"
                            : "View only"
              }
            />
            {operatorMatch === "mismatch" || operatorMatch === "stale_spend" ? (
              <RecoveryPanel
                title="Restore matching access"
                body="A payment will not be submitted until this access opens the live agent."
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
                  Unlock organization
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
          </>
        );
        return needsAccess ? (
          <section className="card" style={{ marginTop: 24 }}>
            <h2>Organization access</h2>
            {accessBody}
          </section>
        ) : (
          <details className="access-details" style={{ marginTop: 24 }}>
            <summary>Organization access</summary>
            {accessBody}
          </details>
        );
      })()}

      {(() => {
        const needsTreasury = vaultStatus === "unlocked" && !treasuryVault.economyOwnerSecret;
        const treasuryBody = treasuryVault.economyOwnerSecret ? (
          <StatusChip tone="ok" label="Ready to issue credentials and settle" />
        ) : vaultStatus !== "unlocked" ? (
          <p className="muted">Unlock organization access first, then import the treasury operator backup from this machine.</p>
        ) : (
          <>
            <p className="muted">Credentials and settlement use a second backup. This is not a wallet recovery phrase.</p>
            <TreasuryOperatorImport />
          </>
        );
        return needsTreasury ? (
          <section className="card" id="treasury-access" style={{ marginTop: 24 }}>
            <h2>Treasury access</h2>
            {treasuryBody}
          </section>
        ) : (
          <details className="access-details" id="treasury-access" style={{ marginTop: 24 }}>
            <summary>Treasury access</summary>
            {treasuryBody}
          </details>
        );
      })()}

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
        <Link to="/app/privacy">What's public vs private</Link>
      </p>
    </div>
  );
}
