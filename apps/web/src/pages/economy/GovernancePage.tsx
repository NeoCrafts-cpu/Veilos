import { useState } from "react";
import { Button } from "../../components/Button.js";
import { DeskStats } from "../../components/DeskStats.js";
import { FormField } from "../../components/FormField.js";
import { MaskedValue } from "../../components/MaskedValue.js";
import { PageHeader } from "../../components/PageHeader.js";
import { PublicId } from "../../components/PublicId.js";
import { Wave2CallBanner, Wave2Gate } from "../../components/Wave2Controls.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { useTaskSection } from "../../hooks/useTaskSection.js";
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
    registerVoter,
    createProposal,
    castBallot,
    finalizeProposal,
    refreshLedgers,
  } = useEconomy();
  useTaskSection("/app/governance", "voters");
  const [duration, setDuration] = useState("300");
  const [proposalId, setProposalId] = useState("");
  const [selectedVoter, setSelectedVoter] = useState("");
  const voterCommitment = selectedVoter || vault.voters.at(-1)?.holderCommitment || "";

  return (
    <div className="page">
      <PageHeader
        compact
        title="Votes"
        objective="Eligible members vote privately. Individual yes/no choices stay hidden. Only the closed proposal is public."
      />
      <DeskStats
        items={[
          { label: "Voters", value: governance?.voterCount.toString() ?? "0" },
          { label: "Proposals", value: governance?.proposalCount.toString() ?? "0" },
          { label: "Ballots", value: String(governance?.ballotCommitments.length ?? 0) },
        ]}
        onRefresh={() => void refreshLedgers()}
      />
      {ledgerError ? <p className="field-error">{ledgerError}</p> : null}
      <Wave2CallBanner result={lastResult} />
      <Wave2Gate
        contractAddress={contracts.governance}
        ownerSecret={vault.governanceOwnerSecret}
        idleTitle="Inspect votes"
        idleBody="Fill the form. Writes wait until voting is live for this organization."
      >
        <form
          id="task-proposals"
          className="form card desk-form"
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
          <div className="row" id="task-voters" style={{ marginTop: 12 }}>
            <Button loading={busy} loadingLabel="Proving createProposal">
              Create on Midnight
            </Button>
            <Button type="button" variant="secondary" loading={busy} onClick={() => void registerVoter()}>
              Register voter
            </Button>
          </div>
        </form>
        <form
          id="task-ballots"
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
          <label htmlFor="voter-credential">
            Voter credential
            <select
              id="voter-credential"
              value={voterCommitment}
              onChange={(event) => setSelectedVoter(event.target.value)}
              disabled={vault.voters.length === 0}
            >
              {vault.voters.length === 0 ? <option value="">Register a voter first</option> : null}
              {vault.voters.map((item, index) => (
                <option key={item.holderCommitment} value={item.holderCommitment}>
                  Voter {index + 1} · {item.holderCommitment.slice(0, 10)}…
                </option>
              ))}
            </select>
          </label>
          <MaskedValue label="Ballot choice" />
          <div className="row">
            <Button
              type="button"
              disabled={busy || !voterCommitment}
              onClick={() => void castBallot({
                proposalId: proposalId.trim(),
                choice: 1n,
                voterCommitment,
              })}
            >
              Vote yes (private)
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy || !voterCommitment}
              onClick={() => void castBallot({
                proposalId: proposalId.trim(),
                choice: 0n,
                voterCommitment,
              })}
            >
              Vote no (private)
            </Button>
          </div>
        </form>
        <article className="card" style={{ marginTop: 24 }}>
          <h2>Proposals</h2>
          <p className="muted">Open a vote, cast a private ballot, then close it. Individual yes/no stays hidden.</p>
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
