import { useState } from "react";
import { useEconomy } from "../state/economy.js";
import { Button } from "./Button.js";
import { FormField } from "./FormField.js";
import { RecoveryPanel } from "./RecoveryPanel.js";

export function Wave2VaultPanel() {
  const { wave2VaultStatus, vaultReady, createWave2Vault, unlockWave2Vault, busy } = useEconomy();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string>();
  if (vaultReady && wave2VaultStatus === "ready") return null;
  if (wave2VaultStatus === "missing") {
    return (
      <RecoveryPanel
        title="Create the Wave 2 vault"
        body="Credential openings, ballot choices, bid amounts, and contract owner secrets stay in this encrypted vault. Compact still refuses admin circuits without the matching owner secret."
      >
        <Button type="button" disabled={busy} onClick={() => void createWave2Vault()}>
          Create Wave 2 vault
        </Button>
      </RecoveryPanel>
    );
  }
  return (
    <RecoveryPanel
      title="Unlock the Wave 2 vault"
      body="This tab could not open the encrypted Wave 2 records with the operator passphrase. Enter the passphrase that sealed those records. Wallet recovery phrases are refused."
    >
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!passphrase) {
            setError("Enter the passphrase that sealed this vault.");
            return;
          }
          setError(undefined);
          void unlockWave2Vault(passphrase).catch((caught: unknown) => {
            setError(caught instanceof Error ? "That passphrase did not open the Wave 2 vault." : "Unlock failed.");
          });
        }}
      >
        <FormField
          id="wave2-passphrase"
          label="Wave 2 vault passphrase"
          type="password"
          autoComplete="current-password"
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          error={error}
          hint="Never enter a Midnight wallet recovery phrase."
        />
        <Button type="submit" disabled={busy} loading={busy} loadingLabel="Opening vault">
          Unlock Wave 2 vault
        </Button>
      </form>
    </RecoveryPanel>
  );
}
