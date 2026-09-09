import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button.js";
import { FormField } from "../../components/FormField.js";
import { JourneyLayout } from "../../components/JourneyLayout.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { validateOperatorPassphrase } from "../../lib/passphrase.js";
import { useSession } from "../../state/session.js";
import { SETUP_STEPS } from "./steps.js";

export function SetupVaultPage() {
  useDocumentTitle("Operator vault");
  const navigate = useNavigate();
  const { createVault, vaultStatus } = useSession();
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string>();

  return (
    <JourneyLayout
      title="Secure operator access"
      objective="The wallet pays transactions. The operator vault opens private commitments. Never enter a wallet recovery phrase."
      steps={SETUP_STEPS}
      current={2}
      actions={
        <Button
          onClick={() => {
            const strength = validateOperatorPassphrase(passphrase);
            if (strength) {
              setError(strength);
              return;
            }
            if (passphrase !== confirm) {
              setError("Passphrases do not match.");
              return;
            }
            void createVault(passphrase).then(() => navigate("/app/setup/review"));
          }}
        >
          {vaultStatus === "unlocked" ? "Continue" : "Create secure operator vault"}
        </Button>
      }
    >
      <form className="form card" onSubmit={(event) => event.preventDefault()}>
        <FormField
          id="vault-pass"
          label="Operator passphrase"
          type="password"
          autoComplete="new-password"
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          hint="Use at least 16 characters with three of: uppercase, lowercase, digits, and symbols. This is not a Midnight wallet phrase."
          error={error}
        />
        <FormField
          id="vault-confirm"
          label="Confirm passphrase"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </form>
    </JourneyLayout>
  );
}
