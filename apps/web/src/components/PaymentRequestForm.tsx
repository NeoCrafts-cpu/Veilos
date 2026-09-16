import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./Button.js";
import { FormField } from "./FormField.js";
import { RecoveryPanel } from "./RecoveryPanel.js";
import { validateAuthorizationDraft } from "../lib/validation.js";
import { localRefuseCopy } from "../lib/result-copy.js";
import { LIVE_AGENT_NAME } from "../lib/org-display.js";
import { useSession } from "../state/session.js";

export function PaymentRequestForm({
  idPrefix = "pay",
}: {
  idPrefix?: string;
}) {
  const navigate = useNavigate();
  const {
    authDraft,
    setAuthDraft,
    previewPayment,
    publicStore,
    operatorMatch,
    wallet,
    canOperate,
    selectedAgentId,
    connectWallet,
  } = useSession();
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string; reason?: string }>({});
  const [localRefuse, setLocalRefuse] = useState<string>();
  const agent =
    publicStore.agents.find((item) => item.agentId === selectedAgentId) ??
    (publicStore.agents.length === 1 ? publicStore.agents[0] : undefined);
  const blocked =
    !wallet || !agent || operatorMatch === "mismatch" || operatorMatch === "stale_spend" || !canOperate;

  return (
    <section className="card payment-desk">
      <p className="label">{LIVE_AGENT_NAME}</p>
      <h2>Request a payment</h2>
      <p className="muted">Vendor, amount, and reason stay private. This does not transfer funds until you settle.</p>
      {!wallet ? (
        <RecoveryPanel
          title="Connect a Midnight wallet"
          body="Look around first. Authorizing needs a connected wallet. Veilos never asks for a recovery phrase."
          role="status"
        >
          <Button type="button" onClick={() => void connectWallet()}>
            Connect wallet
          </Button>
        </RecoveryPanel>
      ) : null}
      {operatorMatch === "mismatch" || operatorMatch === "stale_spend" ? (
        <RecoveryPanel
          title="Unlock this organization"
          body="Restore the access used when TREASURY-01 was created. A payment will not be submitted until it matches."
        >
          <Button to="/app/org">Unlock organization</Button>
        </RecoveryPanel>
      ) : null}
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          const validation = validateAuthorizationDraft(authDraft);
          setErrors({
            ...(validation.recipient ? { recipient: validation.recipient } : {}),
            ...(validation.amount ? { amount: validation.amount } : {}),
            ...(validation.reason ? { reason: validation.reason } : {}),
          });
          if (validation.recipient || validation.amount || validation.reason || validation.parsedAmount === undefined) {
            return;
          }
          const preview = previewPayment({
            recipient: authDraft.recipient.trim(),
            amount: validation.parsedAmount,
          });
          if (!preview.allowed) {
            setLocalRefuse(preview.code);
            return;
          }
          setLocalRefuse(undefined);
          navigate("/app/authorize/review");
        }}
      >
        <FormField
          id={`${idPrefix}-recipient`}
          label="Who gets paid"
          value={authDraft.recipient}
          placeholder="vendor-name"
          onChange={(event) => setAuthDraft({ ...authDraft, recipient: event.target.value })}
          hint="Private. Midnight never sees the vendor name."
          required
          error={errors.recipient}
        />
        <FormField
          id={`${idPrefix}-amount`}
          label="Amount"
          inputMode="numeric"
          value={authDraft.amount}
          placeholder="100"
          onChange={(event) => setAuthDraft({ ...authDraft, amount: event.target.value })}
          hint="Whole numbers. This does not transfer funds until you settle."
          required
          error={errors.amount}
        />
        <FormField
          id={`${idPrefix}-reason`}
          label="Reason"
          value={authDraft.reason}
          placeholder="Supplier payout"
          onChange={(event) => setAuthDraft({ ...authDraft, reason: event.target.value })}
          hint="Stays on this device. Never written to the ledger."
          required
          error={errors.reason}
        />
        {localRefuse ? (
          <RecoveryPanel title="Not authorized" body={localRefuseCopy(localRefuse)}>
            <p className="muted">Midnight was not called.</p>
          </RecoveryPanel>
        ) : null}
        <div className="row">
          <Button type="submit" disabled={blocked}>
            Review request
          </Button>
          <Button to="/app/privacy" variant="secondary">
            What's public
          </Button>
        </div>
      </form>
    </section>
  );
}
