import { useState } from "react";
import { useEconomy } from "../state/economy.js";
import { Button } from "./Button.js";

export function TreasuryOperatorImport() {
  const { importEconomyOwnerAccess, busy } = useEconomy();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>();

  return (
    <form
      className="form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!file) {
          setError("Choose the treasury operator backup first.");
          return;
        }
        setError(undefined);
        void importEconomyOwnerAccess(file).catch((caught: unknown) => {
          setError(
            caught instanceof Error ? caught.message : "The backup could not be opened.",
          );
        });
      }}
    >
      <label htmlFor="treasury-operator-backup">
        Treasury operator backup
        <input
          id="treasury-operator-backup"
          type="file"
          accept="application/json"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setError(undefined);
          }}
        />
      </label>
      <p className="field-hint">
        The backup created when treasury went live on this machine. This is not a wallet recovery
        phrase. Unlock organization access first.
      </p>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={busy} loading={busy} loadingLabel="Importing access">
        Import treasury access
      </Button>
    </form>
  );
}
