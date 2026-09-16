import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button.js";
import { FormField } from "../../components/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { PublicId } from "../../components/PublicId.js";
import { ContractMeta, Wave2CallBanner, Wave2Gate } from "../../components/Wave2Controls.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
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
    deployEconomy,
    authorizeTreasuryPayment,
    depositNight,
    selectSettlement,
    refreshLedgers,
  } = useEconomy();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(wallet?.unshieldedAddress ?? "");
  const [reason, setReason] = useState("");
  const [perAction, setPerAction] = useState("100");
  const [daily, setDaily] = useState("100");
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
        <ContractMeta label="economy-preview" address={contracts.economy} onDeploy={() => void deployEconomy()} busy={busy} />
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
      <Wave2Gate contractAddress={contracts.economy}>
        <form
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
          className="form card"
          style={{ marginTop: 24 }}
          onSubmit={(event) => {
            event.preventDefault();
            const parsedAmount = validatePolicyAmount(amount, "Amount");
            const parsedLimit = validatePolicyAmount(perAction, "Per-action limit");
            const parsedDaily = validatePolicyAmount(daily, "Daily cap");
            const next: Record<string, string> = {};
            if (parsedAmount.error) next.amount = parsedAmount.error;
            if (parsedLimit.error) next.perAction = parsedLimit.error;
            if (parsedDaily.error) next.daily = parsedDaily.error;
            if (!recipient.trim()) next.recipient = "Unshielded recipient is required.";
            if (!reason.trim()) next.reason = "Reason stays private but is required for the intent commitment.";
            setErrors(next);
            if (Object.keys(next).length || !parsedAmount.amount || !parsedLimit.amount || !parsedDaily.amount) return;
            void authorizeTreasuryPayment({
              amount: parsedAmount.amount,
              recipient: recipient.trim(),
              reason: reason.trim(),
              perActionLimit: parsedLimit.amount,
              dailyLimit: parsedDaily.amount,
            });
          }}
        >
          <h2>Authorize a payment</h2>
          <p className="muted">Requires a treasury credential on this contract. Compact class 1, vendor, limits, replay, and window.</p>
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
          <FormField id="per-action" label="Private per-action limit" inputMode="numeric" value={perAction} onChange={(event) => setPerAction(event.target.value)} error={errors.perAction} />
          <FormField id="daily" label="Private daily cap" inputMode="numeric" value={daily} onChange={(event) => setDaily(event.target.value)} error={errors.daily} />
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
