import { useState } from "react";
import { Button } from "../../components/Button.js";
import { DeskStats } from "../../components/DeskStats.js";
import { FormField } from "../../components/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { PublicId } from "../../components/PublicId.js";
import { Wave2CallBanner, Wave2Gate } from "../../components/Wave2Controls.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { useTaskSection } from "../../hooks/useTaskSection.js";
import { validatePolicyAmount } from "../../lib/validation.js";
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
    publishedEconomy,
    issueCredential,
    revokeCredential,
    refreshLedgers,
  } = useEconomy();
  const [className, setClassName] = useState<CredentialClass>("treasury");
  const [days, setDays] = useState("30");
  const [recipient, setRecipient] = useState("");
  const [perAction, setPerAction] = useState("100");
  const [daily, setDaily] = useState("100");
  const [errors, setErrors] = useState<Record<string, string>>({});
  useTaskSection("/app/credentials", "issue");

  return (
    <div className="page">
      <PageHeader
        compact
        title="Credentials"
        objective="Issue a membership credential. The body stays private. Only a commitment is public."
      />
      <DeskStats
        items={[
          { label: "Active", value: economy?.credentialCount?.toString() ?? "0" },
          { label: "Revoked", value: String(economy?.revokedNullifiers.length ?? 0) },
        ]}
        onRefresh={() => void refreshLedgers()}
      />
      {ledgerError ? <p className="field-error">{ledgerError}</p> : null}
      <Wave2CallBanner result={lastResult} />
      <Wave2Gate
        contractAddress={contracts.economy ?? publishedEconomy?.contractAddress}
        ownerSecret={vault.economyOwnerSecret}
        publishedAddress={publishedEconomy?.contractAddress}
        idleTitle="Inspect credentials"
        idleBody="Fill the form. Writes wait until credentials are live for this organization."
      >
        <form
          id="task-issue"
          className="form card desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            const next: Record<string, string> = {};
            const parsedLimit = className === "treasury" ? validatePolicyAmount(perAction, "Per-action limit") : undefined;
            const parsedDaily = className === "treasury" ? validatePolicyAmount(daily, "Daily cap") : undefined;
            if (className === "treasury" && !recipient.trim()) next.recipient = "Treasury credentials bind one unshielded recipient.";
            if (parsedLimit?.error) next.perAction = parsedLimit.error;
            if (parsedDaily?.error) next.daily = parsedDaily.error;
            setErrors(next);
            if (Object.keys(next).length) return;
            void issueCredential({
              className,
              expiryDays: Number(days) || 30,
              ...(recipient.trim() ? { recipient: recipient.trim() } : {}),
              ...(parsedLimit?.amount !== undefined ? { perActionLimit: parsedLimit.amount } : {}),
              ...(parsedDaily?.amount !== undefined ? { dailyLimit: parsedDaily.amount } : {}),
            });
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
          {className === "treasury" ? (
            <>
          <FormField
            id="cred-vendor"
            label="Vendor address"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            hint="Private. This credential can only pay this vendor."
            error={errors.recipient}
            required
          />
          <FormField
            id="cred-per-action"
            label="Max per payment (private)"
            inputMode="numeric"
            value={perAction}
            onChange={(event) => setPerAction(event.target.value)}
            error={errors.perAction}
            required
          />
          <FormField
            id="cred-daily"
            label="Daily max (private)"
            inputMode="numeric"
            value={daily}
            onChange={(event) => setDaily(event.target.value)}
            error={errors.daily}
            required
          />
            </>
          ) : null}
          <Button loading={busy} loadingLabel="Issuing credential">
            Issue credential
          </Button>
        </form>
        <article id="task-registry" className="card" style={{ marginTop: 24 }}>
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
