import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button.js";
import { DeskStats } from "../../components/DeskStats.js";
import { FormField } from "../../components/FormField.js";
import { LedgerTable } from "../../components/LedgerTable.js";
import { PageHeader } from "../../components/PageHeader.js";
import { Wave2CallBanner, Wave2Gate } from "../../components/Wave2Controls.js";
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
    publishedEconomy,
    authorizeTreasuryPayment,
    depositNight,
    selectSettlement,
    refreshLedgers,
  } = useEconomy();
  useTaskSection("/app/treasury", "authorize");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(wallet?.unshieldedAddress ?? "");
  const [reason, setReason] = useState("");
  const [deposit, setDeposit] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <div className="page">
      <PageHeader
        compact
        title="Treasury"
        objective="Authorize a payment, then settle it. Amount and recipient become public only at settlement."
      />
      <DeskStats
        items={[
          { label: "Authorized", value: economy?.actionCount.toString() ?? "0" },
          { label: "Settled", value: economy?.settlementCount.toString() ?? "0" },
        ]}
        onRefresh={() => void refreshLedgers()}
      />
      {ledgerError ? <p className="field-error">{ledgerError}</p> : null}
      <Wave2CallBanner result={lastResult} />
      <Wave2Gate
        contractAddress={contracts.economy ?? publishedEconomy?.contractAddress}
        ownerSecret={vault.economyOwnerSecret}
        publishedAddress={publishedEconomy?.contractAddress}
        idleTitle="Inspect treasury"
        idleBody="Fill the form. Writes wait until treasury is live for this organization."
      >
        <form
          id="task-authorize"
          className="form card desk-form"
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
            Requires a treasury credential bound to this vendor and cap. A different recipient or a higher amount is refused.
          </p>
          <FormField
            id="recipient"
            label="Recipient address"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            hint="Midnight unshielded address. Labels are refused."
            error={errors.recipient}
            required
          />
          <FormField
            id="amount"
            label="Amount"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            error={errors.amount}
          />
          <FormField
            id="reason"
            label="Reason (private)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            error={errors.reason}
            required
          />
          <Button loading={busy} loadingLabel="Authorizing payment">
            Authorize payment
          </Button>
        </form>
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
            label="Amount"
            inputMode="numeric"
            value={deposit}
            onChange={(event) => setDeposit(event.target.value)}
            hint="1 token = 1 000 000 units. This deposits into the organization treasury."
            error={errors.deposit}
          />
          <Button loading={busy} loadingLabel="Depositing">
            Deposit
          </Button>
        </form>
        <article className="card" style={{ marginTop: 24 }}>
          <h2>Authorized payments</h2>
          <LedgerTable
            columns={["Status", "Action", "Settle"]}
            empty="No treasury authorizations yet. Authorize a payment, then settle to make amount and recipient public."
          >
            {(economy?.authorizations ?? []).length > 0
              ? (economy?.authorizations ?? []).map((row) => {
                  const settled = economy?.settlements.some((item) => item.actionId === row.actionId);
                  return (
                    <tr key={row.actionId}>
                      <td>{settled ? "Settled" : "Authorized"}</td>
                      <td>{row.actionId.slice(0, 8)}…</td>
                      <td>
                        {!settled && vault.payments.some((item) => item.actionId === row.actionId) ? (
                          <Link className="btn ghost" to="/app/treasury/settle" onClick={() => selectSettlement(row.actionId)}>
                            Settle
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })
              : null}
          </LedgerTable>
          <Link className="btn ghost" to="/app/treasury/settle">
            Settlement disclosure
          </Link>
        </article>
      </Wave2Gate>
    </div>
  );
}
