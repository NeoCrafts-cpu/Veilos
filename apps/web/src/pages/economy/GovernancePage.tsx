import { useState } from "react";
import { Button } from "../../components/Button.js";
import { FormField } from "../../components/FormField.js";
import { MaskedValue } from "../../components/MaskedValue.js";
import { PageHeader } from "../../components/PageHeader.js";
import { PublicId } from "../../components/PublicId.js";
import { ContractMeta, Wave2CallBanner, Wave2Gate } from "../../components/Wave2Controls.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { useEconomy } from "../../state/economy.js";

export function GovernancePage() {
  useDocumentTitle("Governance");
  const {
    contracts,
    governance,
    vault,
    busy,
    lastResult,
    ledgerError,
    deployGovernance,
    registerVoter,
    createProposal,
    castBallot,
    finalizeProposal,
    refreshLedgers,
  } = useEconomy();
  const [duration, setDuration] = useState("300");
  const [proposalId, setProposalId] = useState("");

  return (
    <div className="page">
      <PageHeader
        title="Private ballots"
        objective="A vote writes a ballot commitment and a proposal-scoped nullifier. Individual yes/no values are not incremented on the ledger."
      />
      {ledgerError ? <p className="field-error">{ledgerError}</p> : null}
      <div className="privacy-grid" style={{ marginTop: 24 }}>
        <ContractMeta
          label="governance-preview"
          address={contracts.governance}
          onDeploy={() => void deployGovernance()}
          busy={busy}
        />
        <article className="card blue">
          <h2>Public outcome</h2>
          <p>Voters {governance?.voterCount.toString() ?? "0"}</p>
          <p>Proposals {governance?.proposalCount.toString() ?? "0"}</p>
          <p>Ballot commitments {governance?.ballotCommitments.length ?? 0}</p>
          <p className="muted">Tally completeness remains an experimental adapter. Finalize discloses yes/no from operator openings held in this vault.</p>
          <Button type="button" variant="secondary" onClick={() => void refreshLedgers()}>
            Refresh indexer
          </Button>
        </article>
      </div>
      <Wave2CallBanner result={lastResult} />
      <Wave2Gate contractAddress={contracts.governance}>
        <div className="row" style={{ marginTop: 24 }}>
          <Button type="button" loading={busy} onClick={() => void registerVoter()}>
            Register voter
          </Button>
        </div>
        <form
          className="form card"
          style={{ marginTop: 24 }}
          onSubmit={(event) => {
            event.preventDefault();
            void createProposal({ durationSeconds: Number(duration) || 300 });
          }}
        >
          <h2>Create proposal</h2>
          <FormField
            id="vote-window"
            label="Vote window (seconds)"
            inputMode="numeric"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            hint="Compact refuses ballots outside kernel.blockTimeGreaterThan(start/end)."
          />
          <Button loading={busy} loadingLabel="Proving createProposal">
            Create on Midnight
          </Button>
        </form>
        <form
          className="form card"
          style={{ marginTop: 24 }}
          onSubmit={(event) => event.preventDefault()}
        >
          <h2>Cast private ballot</h2>
          <FormField
            id="proposal-id"
            label="Proposal id"
            value={proposalId}
            onChange={(event) => setProposalId(event.target.value)}
            hint="64-char hex from the public proposal row."
          />
          <MaskedValue label="Ballot choice" />
          <div className="row">
            <Button
              type="button"
              disabled={busy}
              onClick={() => void castBallot({ proposalId: proposalId.trim(), choice: 1n })}
            >
              Vote yes (private)
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void castBallot({ proposalId: proposalId.trim(), choice: 0n })}
            >
              Vote no (private)
            </Button>
          </div>
        </form>
        <article className="card" style={{ marginTop: 24 }}>
          <h2>Proposals on indexer</h2>
          {(governance?.proposals ?? []).map((row) => (
            <div key={row.proposalId} className="row">
              <PublicId label="Proposal" value={row.proposalId} />
              <p>{row.status}</p>
              {row.status === "finalized" ? (
                <p>
                  Yes {row.yesCount.toString()} / No {row.noCount.toString()}
                </p>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    setProposalId(row.proposalId);
                    void finalizeProposal(row.proposalId);
                  }}
                >
                  Finalize
                </Button>
              )}
            </div>
          ))}
          {(governance?.proposals.length ?? 0) === 0 ? <p className="muted">No proposals yet.</p> : null}
          {vault.ballots.length ? <p className="muted">This vault holds {vault.ballots.length} sealed ballot(s). Choices stay masked.</p> : null}
        </article>
      </Wave2Gate>
    </div>
  );
}
