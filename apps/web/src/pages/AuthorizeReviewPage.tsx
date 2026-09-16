import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button.js";
import { JourneyLayout } from "../components/JourneyLayout.js";
import { RecoveryPanel } from "../components/RecoveryPanel.js";
import { ReviewPanel } from "../components/ReviewPanel.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { validateAuthorizationDraft } from "../lib/validation.js";
import { useSession } from "../state/session.js";
import { AUTH_STEPS } from "./setup/steps.js";

export function AuthorizeReviewPage() {
  useDocumentTitle("Review authorization");
  const navigate = useNavigate();
  const {
    authDraft,
    requestPayment,
    publicStore,
    dustReady,
    networkLive,
    wallet,
    selectedAgentId,
    canOperate,
    busy,
  } = useSession();
  const agent = publicStore.agents.find((item) => item.agentId === selectedAgentId)
    ?? (publicStore.agents.length === 1 ? publicStore.agents[0] : undefined);
  const validation = validateAuthorizationDraft(authDraft);
  const draftReady =
    !validation.recipient &&
    !validation.amount &&
    !validation.reason &&
    validation.parsedAmount !== undefined;
  const environmentReady = Boolean(wallet && agent && canOperate && dustReady === true && networkLive === true);

  return (
    <JourneyLayout
      title="Review authorization"
      objective="Confirm private inputs and public consequences before proving. No funds are transferred."
      steps={AUTH_STEPS}
      current={1}
      actions={
        <>
          <Button
            disabled={busy || !draftReady || !environmentReady}
            onClick={() => {
              if (!draftReady || !environmentReady || validation.parsedAmount === undefined) return;
              void requestPayment({
                recipient: authDraft.recipient.trim(),
                amount: validation.parsedAmount,
                reason: authDraft.reason.trim(),
              }).then((actionId) => navigate(`/app/actions/${actionId}/progress`));
            }}
          >
            Authorize request on Midnight
          </Button>
          <Button to="/app/authorize/new" variant="secondary">
            Back and edit
          </Button>
        </>
      }
    >
      <ReviewPanel
        privateItems={[
          { label: "Recipient", value: authDraft.recipient },
          { label: "Amount", value: authDraft.amount },
          { label: "Reason", value: authDraft.reason },
        ]}
        publicItems={[
          { label: "Action type", value: "payment" },
          { label: "Agent id", value: agent?.agentId ?? "—" },
          { label: "Result if successful", value: "authorized" },
          { label: "Funds transferred", value: "None" },
        ]}
      />
      {!draftReady ? (
        <RecoveryPanel
          title="Request details need review"
          body="Recipient, positive whole-number amount, and reason are required before Midnight can be called."
        >
          <Button to="/app/authorize/new">Return to request details</Button>
        </RecoveryPanel>
      ) : null}
      {!agent || !canOperate ? (
        <RecoveryPanel
          title="Operator context is not ready"
          body="Select an on-chain agent and unlock the vault that opens its commitments before submitting."
        >
          <Button to="/app/org">Open organization</Button>
        </RecoveryPanel>
      ) : null}
      {!wallet ? (
        <RecoveryPanel
          title="Connect a Midnight wallet"
          body="The wallet signs and pays DUST. Veilos does not submit until the connector confirms the session."
        >
          <Button to="/app/setup">Check readiness</Button>
        </RecoveryPanel>
      ) : null}
      {dustReady === false ? <p className="footer-note">This wallet has no spendable DUST yet.</p> : null}
      {wallet && dustReady === null ? (
        <p className="footer-note" role="status">Checking spendable DUST before submission.</p>
      ) : null}
      {networkLive === null ? (
        <p className="footer-note" role="status">Checking the wallet proof provider before submission.</p>
      ) : networkLive === false ? (
        <p className="footer-note">
          Proving is unavailable. This hosted UI does not run a proof server. Use the wallet Proof Station, or start
          midnightntwrk/proof-server:8.1.0 on this computer.
        </p>
      ) : null}
    </JourneyLayout>
  );
}
