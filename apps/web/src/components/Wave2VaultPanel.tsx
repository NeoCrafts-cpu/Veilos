import { useState } from "react";
import { useEconomy } from "../state/economy.js";
import { Button } from "./Button.js";
import { FormField } from "./FormField.js";

export function Wave2VaultPanel() {
  const { wave2VaultStatus, vaultReady, createWave2Vault, unlockWave2Vault, busy } = useEconomy();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string>();
  if (vaultReady && wave2VaultStatus === "ready") return null;
  if (wave2VaultStatus === "missing") {
    return (
      <div className="gate-banner" role="status">
        <p>
          <strong>Create organization records.</strong> Credentials stay encrypted on this device.
        </p>
        <div className="gate-banner-actions">
          <Button type="button" disabled={busy} onClick={() => void createWave2Vault()}>
            Create records
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="gate-banner" role="status">
      <p>
        <strong>Unlock organization records.</strong> Never enter a wallet recovery phrase.
      </p>
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!passphrase) {
            setError("Enter the passphrase that sealed these records.");
            return;
          }
          setError(undefined);
          void unlockWave2Vault(passphrase).catch((caught: unknown) => {
            setError(caught instanceof Error ? "That passphrase did not open these records." : "Unlock failed.");
          });
        }}
      >
        <FormField
          id="wave2-passphrase"
          label="Organization passphrase"
          type="password"
          autoComplete="current-password"
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          error={error}
        />
        <Button type="submit" disabled={busy} loading={busy} loadingLabel="Opening records">
          Unlock records
        </Button>
      </form>
    </div>
  );
}
