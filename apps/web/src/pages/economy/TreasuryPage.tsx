import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button.js";
import { FormField } from "../../components/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { PublicId } from "../../components/PublicId.js";
import { ContractMeta, Wave2CallBanner, Wave2Gate } from "../../components/Wave2Controls.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { useTaskSection } from "../../hooks/useTaskSection.js";
import { validatePolicyAmount } from "../../lib/validation.js";
import { useEconomy } from "../../state/economy.js";
import { useSession } from "../../state/session.js";

export function TreasuryPage() {
  useDocumentTitle("Treasury");
  const { wallet } = useSession();
  const {
    contracts,
    economy,
    vault,
    busy,
    lastResult,
    ledgerError,
    disclosure,
    publishedEconomy,
    deployEconomy,
    authorizeTreasuryPayment,
    depositNight,
    selectSettlement,
    refreshLedgers,
  } = useEconomy();
  useTaskSection("/app/treasury", "deposit");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(wallet?.unshieldedAddress ?? "");
  const [reason, setReason] = useState("");
  const [deposit, setDeposit] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <div className="page">
      <PageHeader
        title="Unshielded treasury"
        objective="Authorize privately, then settle native NIGHT. Amount and recipient become public only at settlement."
      />
      {ledgerError ? <p className="field-error">{ledgerError}</p> : null}
      <div className="privacy-grid" style={{ marginTop: 24 }}>
        <ContractMeta
          label="economy-preview"
          address={contracts.economy}
          publishedAddress={publishedEconomy?.contractAddress}
          onDeploy={() => void deployEconomy()}
          busy={busy}
        />
        <article className="card blue">
          <h2>Public treasury facts</h2>
          <p>Authorizations {economy?.actionCount.toString() ?? "0"}</p>
          <p>Settlements {economy?.settlementCount.toString() ?? "0"}</p>
          <p>Public by design: {disclosure.publicByDesign.join(", ")}</p>
          <Button type="button" variant="secondary" onClick={() => void refreshLedgers()}>
            Refresh indexer
          </Button>
        </article>
      </div>
      <Wave2CallBanner result={lastResult} />
      <Wave2Gate
        contractAddress={contracts.economy}
        ownerSecret={vault.economyOwnerSecret}
        publishedAddress={publishedEconomy?.contractAddress}
      >
        <form
          id="task-deposit"
          className="form card"
          style={{ marginTop: 24 }}
          onSubmit={(event) => {
            event.preventDefault();
            const parsed = validatePolicyAmount(deposit, "Deposit");
            if (parsed.error || parsed.amount === undefined) {
              setErrors({ deposit: parsed.error ?? "Deposit is required." });
              return;
            }
            void depositNight(parsed.amount);
          }}
        >
          <h2>Deposit NIGHT</h2>
          <FormField
            id="deposit"
            label="Amount (atomic units)"
            inputMode="numeric"
            value={deposit}
            onChange={(event) => setDeposit(event.target.value)}
            hint="1 NIGHT = 1 000 000 units. receiveUnshielded on economy-preview."
            error={errors.deposit}
          />
          <Button loading={busy} loadingLabel="Proving depositNight">
            Deposit on Midnight
          </Button>
        </form>
        <form
          id="task-authorize"
          className="form card"
          style={{ marginTop: 24 }}
          onSubmit={(event) => {
            event.preventDefault();
            const parsedAmount = validatePolicyAmount(amount, "Amount");
            const next: Record<string, string> = {};
            if (parsedAmount.error) next.amount = parsedAmount.error;
            if (!recipient.trim()) next.recipient = "Unshielded recipient is required.";
            if (!reason.trim()) next.reason = "Reason stays private but is required for the intent commitment.";
            setErrors(next);
            if (Object.keys(next).length || !parsedAmount.amount) return;
            void authorizeTreasuryPayment({
              amount: parsedAmount.amount,
              recipient: recipient.trim(),
              reason: reason.trim(),
            });
          }}
        >
          <h2>Authorize a payment</h2>
          <p className="muted">
            Requires a treasury credential whose vendor and limits were bound at issue. Compact refuses a different
            recipient or higher caps.
          </p>
          <FormField
            id="recipient"
            label="Unshielded recipient"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            hint="mn_addr_preview1… or 64-char hex UserAddress.bytes. Labels are refused."
            error={errors.recipient}
            required
          />
          <FormField id="amount" label="Amount" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} required error={errors.amount} />
          <FormField id="reason" label="Reason (private)" value={reason} onChange={(event) => setReason(event.target.value)} error={errors.reason} required />
          <Button loading={busy} loadingLabel="Proving authorizePayment">
            Prove authorization
          </Button>
        </form>
        <article className="card" style={{ marginTop: 24 }}>
          <h2>Indexed authorizations</h2>
          {(economy?.authorizations ?? []).map((row) => {
            const settled = economy?.settlements.some((item) => item.actionId === row.actionId);
            return (
              <div key={row.actionId} className="row">
                <PublicId label="Action" value={row.actionId} />
                <p>{settled ? "Settled" : "Authorized"}</p>
                {!settled && vault.payments.some((item) => item.actionId === row.actionId) ? (
                  <Link className="btn ghost" to="/app/treasury/settle" onClick={() => selectSettlement(row.actionId)}>
                    Review settlement
                  </Link>
                ) : null}
              </div>
            );
          })}
          {(economy?.authorizations.length ?? 0) === 0 ? <p className="muted">No authorizePayment rows on the indexer yet.</p> : null}
          <Link className="btn ghost" to="/app/treasury/settle">
            Settlement disclosure
          </Link>
        </article>
      </Wave2Gate>
    </div>
  );
}
