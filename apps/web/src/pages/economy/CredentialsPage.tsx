import { useState } from "react";
import { Button } from "../../components/Button.js";
import { FormField } from "../../components/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { PublicId } from "../../components/PublicId.js";
import { ContractMeta, Wave2CallBanner, Wave2Gate } from "../../components/Wave2Controls.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { useEconomy } from "../../state/economy.js";
import type { CredentialClass } from "@velios/shared-types";

const CLASSES: CredentialClass[] = ["admin", "treasury", "procurement", "auditor", "agent"];

export function CredentialsPage() {
  useDocumentTitle("Credentials");
  const {
    contracts,
    economy,
    vault,
    busy,
    lastResult,
    ledgerError,
    deployEconomy,
    issueCredential,
    revokeCredential,
    refreshLedgers,
  } = useEconomy();
  const [className, setClassName] = useState<CredentialClass>("treasury");
  const [days, setDays] = useState("30");

  return (
    <div className="page">
      <PageHeader
        title="Organization-issued credentials"
        objective="Issue a private credential, prove class and expiry in Compact, and revoke by nullifier. The body never hits the ledger."
      />
      {ledgerError ? <p className="field-error">{ledgerError}</p> : null}
      <div className="privacy-grid" style={{ marginTop: 24 }}>
        <ContractMeta label="economy-preview" address={contracts.economy} onDeploy={() => void deployEconomy()} busy={busy} />
        <article className="card blue">
          <h2>Public ledger</h2>
          <p>Credentials {economy?.credentialCount?.toString() ?? "0"}</p>
          <p>Revoked nullifiers {economy?.revokedNullifiers.length ?? 0}</p>
          <PublicId label="Admin commitment" value={economy?.adminCommitment} />
          <Button type="button" variant="secondary" onClick={() => void refreshLedgers()}>
            Refresh indexer
          </Button>
        </article>
      </div>
      <article className="card" style={{ marginTop: 24 }}>
        <h2>Published Preview core</h2>
        <p>
          The ACME economy-preview address is public. Admin circuits still require the owner secret from that deploy.
          If this vault did not deploy it, Compact will refuse issue/revoke/deposit. Deploy your own contract from this
          tab to operate end-to-end.
        </p>
      </article>
      <Wave2CallBanner result={lastResult} />
      <Wave2Gate contractAddress={contracts.economy}>
        <form
          className="form card"
          style={{ marginTop: 24 }}
          onSubmit={(event) => {
            event.preventDefault();
            void issueCredential({ className, expiryDays: Number(days) || 30 });
          }}
        >
          <h2>Issue credential</h2>
          <FormField id="cred-class" label="Class">
            <select id="cred-class" value={className} onChange={(event) => setClassName(event.target.value as CredentialClass)}>
              {CLASSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            id="cred-days"
            label="Expiry (days from this window)"
            inputMode="numeric"
            value={days}
            onChange={(event) => setDays(event.target.value)}
            hint="Expiry stays private. Compact proves it covers the authorization window."
          />
          <Button loading={busy} loadingLabel="Proving issueCredential">
            Issue on Midnight
          </Button>
        </form>
        <article className="card" style={{ marginTop: 24 }}>
          <h2>Commitments on indexer</h2>
          {(economy?.credentialCommitments ?? []).map((commitment) => (
            <div className="row" key={commitment}>
              <PublicId label="Credential commitment" value={commitment} />
              {vault.credentials.some((item) => item.commitment === commitment) ? (
                <Button type="button" variant="danger" disabled={busy} onClick={() => void revokeCredential(commitment)}>
                  Revoke
                </Button>
              ) : (
                <p className="muted">Revoke requires the issuer vault that holds the nullifier secret.</p>
              )}
            </div>
          ))}
          {(economy?.credentialCommitments.length ?? 0) === 0 ? <p className="muted">No credentials on this contract yet.</p> : null}
        </article>
      </Wave2Gate>
    </div>
  );
}
