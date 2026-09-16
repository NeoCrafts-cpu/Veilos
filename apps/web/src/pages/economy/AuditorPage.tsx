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

export function AuditorPage() {
  useDocumentTitle("Auditor");
  const {
    contracts,
    auditor,
    economy,
    busy,
    lastResult,
    ledgerError,
    recordDisclosure,
    vault,
    refreshLedgers,
  } = useEconomy();
  useTaskSection("/app/auditor", "grants");
  const [label, setLabel] = useState("scoped-public-anchors");
  const [hours, setHours] = useState("24");

  return (
    <div className="page">
      <PageHeader
        compact
        title="Auditor"
        objective="Auditors see only the scope they were granted. Claim bodies stay private. Grants expire."
      />
      <DeskStats
        items={[
          { label: "Payments", value: economy?.actionCount.toString() ?? "0" },
          { label: "Settled", value: economy?.settlementCount.toString() ?? "0" },
          { label: "Grants", value: auditor?.disclosureCount.toString() ?? "0" },
        ]}
        onRefresh={() => void refreshLedgers()}
      />
      {ledgerError ? <p className="field-error">{ledgerError}</p> : null}
      <Wave2CallBanner result={lastResult} />
      <Wave2Gate
        contractAddress={contracts.auditor}
        ownerSecret={vault.auditorOwnerSecret}
        idleTitle="Inspect auditor grants"
        idleBody="Fill the form. Writes wait until auditor grants are live for this organization."
      >
        <form
          id="task-grants"
          className="form card desk-form"
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
        <article id="task-anchors" className="card" style={{ marginTop: 24 }}>
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
