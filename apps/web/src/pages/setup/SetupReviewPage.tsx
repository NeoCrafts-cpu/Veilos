import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button.js";
import { JourneyLayout } from "../../components/JourneyLayout.js";
import { ReviewPanel } from "../../components/ReviewPanel.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { useSession } from "../../state/session.js";
import { SETUP_STEPS } from "./steps.js";

export function SetupReviewPage() {
  useDocumentTitle("Review organization");
  const navigate = useNavigate();
  const { setupDraft, createOrganization, vaultStatus, wallet, busy } = useSession();

  return (
    <JourneyLayout
      title="Review and deploy"
      objective="Organization and member labels become public. Operator secrets stay in the encrypted vault."
      steps={SETUP_STEPS}
      current={3}
      actions={
        <>
          <Button
            loading={busy}
            loadingLabel="Deploying…"
            disabled={!wallet || vaultStatus !== "unlocked"}
            onClick={() => {
              void createOrganization(setupDraft.organizationName.trim(), setupDraft.memberLabel.trim()).then((ok) => {
                if (ok) navigate("/app/setup/success");
              });
            }}
          >
            Deploy organization on Midnight
          </Button>
          <Button to="/app/setup/org" variant="secondary">
            Back and edit
          </Button>
        </>
      }
    >
      <ReviewPanel
        privateItems={[
          { label: "Operator vault", value: vaultStatus === "unlocked" ? "Unlocked in this tab" : "Not ready" },
          { label: "Wallet recovery phrase", value: "Never requested" },
        ]}
        publicItems={[
          { label: "Organization name", value: setupDraft.organizationName || "—" },
          { label: "Founding member label", value: setupDraft.memberLabel || "—" },
          { label: "On-chain result", value: "Organization id, member id, and commitments" },
        ]}
      />
      {!wallet ? <p className="footer-note">Connect a Midnight wallet before deploying.</p> : null}
    </JourneyLayout>
  );
}
