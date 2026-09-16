import { Link } from "react-router-dom";
import { Button } from "./Button.js";
import { PublicId } from "./PublicId.js";
import { RecoveryPanel } from "./RecoveryPanel.js";
import { TxResult } from "./TxResult.js";
import { useEconomy, type Wave2CallResult } from "../state/economy.js";
import { useSession } from "../state/session.js";

export function Wave2CallBanner({ result }: { result: Wave2CallResult }) {
  return <TxResult status={result.status} {...(result.txId ? { txId: result.txId } : {})} detail={result.message} />;
}

export function Wave2Gate({
  contractAddress,
  needVault = true,
  children,
}: {
  contractAddress?: string | undefined;
  needVault?: boolean;
  children: React.ReactNode;
}) {
  const { wallet, vaultStatus } = useSession();
  if (!wallet) {
    return (
      <RecoveryPanel title="Connect a Midnight wallet" body="Wave 2 circuits prove and submit through MidnightJS 4.1.1. Veilos never asks for a recovery phrase.">
        <Button to="/app/setup">Check readiness</Button>
      </RecoveryPanel>
    );
  }
  if (needVault && vaultStatus !== "unlocked") {
    return (
      <RecoveryPanel
        title="Unlock the operator vault"
        body="Wave 2 witnesses are encrypted with the same operator passphrase. Compact will refuse admin circuits without the matching owner secret."
      >
        <Button to="/app/org">Open operator access</Button>
      </RecoveryPanel>
    );
  }
  if (!contractAddress) {
    return (
      <RecoveryPanel
        title="No Wave 2 contract on this tab"
        body="Deploy the Preview-sized contract from this screen. Joining a published address without the deploy secret cannot forge admin proofs."
      />
    );
  }
  return <>{children}</>;
}

export function ContractMeta({
  label,
  address,
  onDeploy,
  busy,
}: {
  label: string;
  address?: string | undefined;
  onDeploy: () => void;
  busy: boolean;
}) {
  return (
    <article className="card">
      <h2>{label}</h2>
      <PublicId label="Contract" value={address} />
      <div className="row">
        <Button type="button" onClick={onDeploy} loading={busy} loadingLabel="Deploying on Midnight">
          {address ? "Deploy a new contract" : "Deploy on Preview"}
        </Button>
        {address ? (
          <Link className="btn ghost" to="/app/privacy">
            Inspector
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function useWave2Busy() {
  const { busy, lastResult, ledgerError } = useEconomy();
  return { busy, lastResult, ledgerError };
}
