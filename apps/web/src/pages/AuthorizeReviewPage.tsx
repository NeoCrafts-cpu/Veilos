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
    connectWallet,
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
      title="Review this request"
      objective="Confirm what stays private before proving. No funds are transferred."
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
          { label: "Type", value: "payment" },
          { label: "Agent", value: "TREASURY-01" },
          { label: "If allowed", value: "authorized" },
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
          title="Unlock this organization to authorize"
          body="Select the live agent and unlock organization access before submitting."
        >
          <Button to="/app/org">Members & access</Button>
        </RecoveryPanel>
      ) : null}
      {!wallet ? (
        <RecoveryPanel
          title="Connect a Midnight wallet"
          body="The wallet signs the request. Veilos never asks for a recovery phrase."
          role="status"
        >
          <Button type="button" onClick={() => void connectWallet()}>
            Connect wallet
          </Button>
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
