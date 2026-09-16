import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button.js";
import { JourneyLayout } from "../../components/JourneyLayout.js";
import { ReadinessChecklist } from "../../components/ReadinessChecklist.js";
import { SETUP_STEPS } from "./steps.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { useSession } from "../../state/session.js";

export function SetupReadinessPage() {
  useDocumentTitle("Check readiness");
  const navigate = useNavigate();
  const { readiness, connectWallet, refreshLedger, startOwnerSetup, wallet, dustReady, networkLive, vaultStatus } =
    useSession();
  const ready = Boolean(wallet) && dustReady === true && networkLive === true;

  return (
    <JourneyLayout
      title="Check readiness"
      objective="Confirm Preview network services before a long Compact circuit."
      steps={SETUP_STEPS}
      current={0}
      actions={
        <>
          <Button
            disabled={!ready}
            onClick={() => {
              startOwnerSetup();
              navigate("/app/setup/org");
            }}
          >
            {ready ? "Continue to organization" : wallet ? "Complete readiness checks" : "Connect wallet to continue"}
          </Button>
          <Button to="/app/preview" variant="secondary">
            Explore public Preview
          </Button>
        </>
      }
    >
      <ReadinessChecklist items={readiness} onConnect={() => void connectWallet()} onRetry={() => void refreshLedger()} />
      {dustReady === false ? (
        <p className="footer-note">
          Spendable DUST is required for proving. tNIGHT alone is not enough. Generate DUST from the official Midnight
          wallet path, then retry.
        </p>
      ) : null}
      {networkLive === false ? (
        <p className="footer-note">
          Vercel only hosts this UI. Circuit proofs need the wallet Proof Station or a local proof-server on this
          computer. Docker on another machine is not used.
        </p>
      ) : null}
      {vaultStatus === "missing" ? (
        <p className="muted">You can create the operator vault in the next steps after naming the organization.</p>
      ) : null}
    </JourneyLayout>
  );
}
