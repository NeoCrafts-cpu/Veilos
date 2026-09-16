import { useState } from "react";
import { Button } from "../../components/Button.js";
import { FormField } from "../../components/FormField.js";
import { MaskedValue } from "../../components/MaskedValue.js";
import { PageHeader } from "../../components/PageHeader.js";
import { PublicId } from "../../components/PublicId.js";
import { ContractMeta, Wave2CallBanner, Wave2Gate } from "../../components/Wave2Controls.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { useEconomy } from "../../state/economy.js";

export function AuditorPage() {
  useDocumentTitle("Auditor");
  const {
    contracts,
    auditor,
    economy,
    governance,
    procurement,
    busy,
    lastResult,
    ledgerError,
    deployAuditor,
    recordDisclosure,
    refreshLedgers,
  } = useEconomy();
  const [label, setLabel] = useState("scoped-public-anchors");
  const [hours, setHours] = useState("24");

  return (
    <div className="page">
      <PageHeader
        title="Scoped auditor view"
        objective="Auditors receive only consented, expiring grants. Claim bodies stay encrypted. The ledger publishes grant id, auditor id, scope commitment, and expiry."
      />
      {ledgerError ? <p className="field-error">{ledgerError}</p> : null}
      <div className="privacy-grid" style={{ marginTop: 24 }}>
        <ContractMeta label="auditor-preview" address={contracts.auditor} onDeploy={() => void deployAuditor()} busy={busy} />
        <article className="card blue">
          <h2>Public observer</h2>
          <p>Economy authorizations {economy?.actionCount.toString() ?? "0"}</p>
          <p>Settlements {economy?.settlementCount.toString() ?? "0"}</p>
          <p>Finalized proposals {(governance?.proposals ?? []).filter((row) => row.status === "finalized").length}</p>
          <p>Awarded lots {(procurement?.lots ?? []).filter((row) => row.status === "awarded").length}</p>
          <p>Disclosure grants {auditor?.disclosureCount.toString() ?? "0"}</p>
          <Button type="button" variant="secondary" onClick={() => void refreshLedgers()}>
            Refresh indexer
          </Button>
        </article>
      </div>
      <Wave2CallBanner result={lastResult} />
      <Wave2Gate contractAddress={contracts.auditor}>
        <form
          className="form card"
          style={{ marginTop: 24 }}
          onSubmit={(event) => {
            event.preventDefault();
            void recordDisclosure({ auditorLabel: label.trim() || "scoped", expiresHours: Number(hours) || 24 });
          }}
        >
          <h2>Record disclosure grant</h2>
          <FormField
            id="auditor-label"
            label="Scope label (hashed)"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            hint="The label is committed, not published as plaintext."
          />
          <FormField
            id="grant-hours"
            label="Expiry (hours)"
            inputMode="numeric"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
          />
          <Button loading={busy} loadingLabel="Proving recordDisclosure">
            Record on Midnight
          </Button>
        </form>
        <article className="card" style={{ marginTop: 24 }}>
          <h2>Grants on indexer</h2>
          {(auditor?.disclosures ?? []).map((row) => (
            <div key={row.disclosureId} className="row">
              <PublicId label="Grant" value={row.disclosureId} />
              <PublicId label="Auditor" value={row.auditorId} />
              <PublicId label="Scope" value={row.scopeCommitment} />
            </div>
          ))}
          {(auditor?.disclosures.length ?? 0) === 0 ? <p className="muted">No grants yet.</p> : null}
          <h3>Still private</h3>
          <MaskedValue label="Policy values" />
          <MaskedValue label="Credential body" />
          <MaskedValue label="Ballot choice" />
          <MaskedValue label="Sealed bid amount" />
        </article>
      </Wave2Gate>
    </div>
  );
}
