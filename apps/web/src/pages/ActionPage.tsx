import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button.js";
import { FormField } from "../components/FormField.js";
import { JourneyLayout } from "../components/JourneyLayout.js";
import { RecoveryPanel } from "../components/RecoveryPanel.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { localRefuseCopy } from "../lib/result-copy.js";
import { validatePolicyAmount, validateReason } from "../lib/validation.js";
import { useSession } from "../state/session.js";
import { AUTH_STEPS } from "./setup/steps.js";

export function ActionPage() {
  useDocumentTitle("Authorize request");
  const navigate = useNavigate();
  const { authDraft, setAuthDraft, previewPayment, publicStore, operatorMatch, wallet, canOperate, selectedAgentId } = useSession();
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string; reason?: string }>({});
  const [localRefuse, setLocalRefuse] = useState<string>();
  const agent = publicStore.agents.find((item) => item.agentId === selectedAgentId)
    ?? (publicStore.agents.length === 1 ? publicStore.agents[0] : undefined);
  const blocked =
    !wallet || !agent || operatorMatch === "mismatch" || operatorMatch === "stale_spend" || !canOperate;

  return (
    <JourneyLayout
      title="Authorize a payment request"
      objective="Veilos authorizes this request. It does not transfer funds."
      steps={AUTH_STEPS}
      current={0}
      actions={
        <Button
          onClick={() => {
            const amount = validatePolicyAmount(authDraft.amount, "Amount");
            const recipient = authDraft.recipient.trim() ? undefined : "Recipient is required.";
            const reason = validateReason(authDraft.reason);
            setErrors({
              ...(recipient ? { recipient } : {}),
              ...(amount.error ? { amount: amount.error } : {}),
              ...(reason ? { reason } : {}),
            });
            if (recipient || amount.error || reason || amount.amount === undefined) return;
            if (blocked) return;
            const preview = previewPayment({ recipient: authDraft.recipient.trim(), amount: amount.amount });
            if (!preview.allowed) {
              setLocalRefuse(preview.code);
              return;
            }
            setLocalRefuse(undefined);
            navigate("/app/authorize/review");
          }}
        >
          Review authorization
        </Button>
      }
    >
      {!agent ? (
        <RecoveryPanel title="Create an agent first" body="Authorization needs an on-chain agent with a committed private policy.">
          <Button to="/app/org/agent/new">Configure first agent</Button>
        </RecoveryPanel>
      ) : null}
      {operatorMatch === "mismatch" || operatorMatch === "stale_spend" ? (
        <RecoveryPanel
          title="Operator access is not verified for this agent"
          body="Import the matching backup. Veilos will not generate a proof until the commitments match."
        >
          <Button to="/app/org">Restore operator access</Button>
        </RecoveryPanel>
      ) : null}
      {!wallet ? (
        <RecoveryPanel title="Connect a Midnight wallet" body="The wallet pays DUST for proving. Veilos never asks for a recovery phrase.">
          <Button to="/app/setup">Check readiness</Button>
        </RecoveryPanel>
      ) : null}
      <form className="form card" onSubmit={(event) => event.preventDefault()}>
        <p className="muted">
          {agent ? `Agent ${agent.agentId.slice(0, 8)}… is the committed context for this request.` : "Agent context is not on the indexer yet."}
        </p>
        <FormField
          id="recipient"
          label="Recipient"
          value={authDraft.recipient}
          onChange={(event) => setAuthDraft({ ...authDraft, recipient: event.target.value })}
          required
          error={errors.recipient}
        />
        <FormField
          id="amount"
          label="Amount"
          inputMode="numeric"
          value={authDraft.amount}
          onChange={(event) => setAuthDraft({ ...authDraft, amount: event.target.value })}
          hint="Whole-number policy units. No funds are transferred."
          required
          error={errors.amount}
        />
        <FormField
          id="reason"
          label="Reason"
          value={authDraft.reason}
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
      </form>
    </JourneyLayout>
  );
}
