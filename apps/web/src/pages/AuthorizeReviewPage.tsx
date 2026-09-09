import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button.js";
import { JourneyLayout } from "../components/JourneyLayout.js";
import { ReviewPanel } from "../components/ReviewPanel.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useSession } from "../state/session.js";
import { AUTH_STEPS } from "./setup/steps.js";

export function AuthorizeReviewPage() {
  useDocumentTitle("Review authorization");
  const navigate = useNavigate();
  const { authDraft, requestPayment, publicStore, dustReady, networkLive, wallet, selectedAgentId } = useSession();
  const agent = publicStore.agents.find((item) => item.agentId === selectedAgentId)
    ?? (publicStore.agents.length === 1 ? publicStore.agents[0] : undefined);

  return (
    <JourneyLayout
      title="Review authorization"
      objective="Confirm private inputs and public consequences before proving. No funds are transferred."
      steps={AUTH_STEPS}
      current={1}
      actions={
        <>
          <Button
            disabled={!wallet || dustReady === false || networkLive === false}
            onClick={() => {
              if (!/^\d+$/.test(authDraft.amount)) return;
              void requestPayment({
                recipient: authDraft.recipient.trim(),
                amount: BigInt(authDraft.amount),
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
      {dustReady === false ? <p className="footer-note">This wallet has no spendable DUST yet.</p> : null}
      {networkLive === false ? <p className="footer-note">Proof server is unavailable.</p> : null}
    </JourneyLayout>
  );
}
