import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PREVIEW_ECONOMY_DEPLOYMENT } from "@velios/midnight/published";
import { Button } from "./Button.js";
import { PublicId } from "./PublicId.js";
import { RecoveryPanel } from "./RecoveryPanel.js";
import { TxResult } from "./TxResult.js";
import { Wave2VaultPanel } from "./Wave2VaultPanel.js";
import { Wave2ModuleStatus } from "./Wave2StatusPanel.js";
import { useEconomy, type Wave2CallResult } from "../state/economy.js";
import { useSession } from "../state/session.js";

export function Wave2CallBanner({ result }: { result: Wave2CallResult }) {
  return <TxResult status={result.status} {...(result.txId ? { txId: result.txId } : {})} detail={result.message} />;
}

export function Wave2Gate({
  contractAddress,
  ownerSecret,
  publishedAddress,
  needVault = true,
  children,
}: {
  contractAddress?: string | undefined;
  ownerSecret?: string | undefined;
  publishedAddress?: string | undefined;
  needVault?: boolean;
  children: ReactNode;
}) {
  const { wallet, vaultStatus, connectWallet, busyAction, walletReconnectNeeded } = useSession();
  const { vaultReady, wave2VaultStatus } = useEconomy();
  if (!wallet) {
    return (
      <RecoveryPanel title="Connect a Midnight wallet" body="Wave 2 circuits prove and submit through MidnightJS 4.1.1. Veilos never asks for a recovery phrase.">
        <Button type="button" disabled={busyAction === "connect"} onClick={() => void connectWallet()}>
          {busyAction === "connect" ? "Connecting…" : walletReconnectNeeded ? "Reconnect wallet" : "Connect wallet"}
        </Button>
        <Button to="/app/setup" variant="secondary">
          Check readiness
        </Button>
      </RecoveryPanel>
    );
  }
  if (needVault && vaultStatus !== "unlocked") {
    return (
      <RecoveryPanel
        title="Unlock the operator vault"
        body="Wave 2 witnesses are encrypted with the operator passphrase. Compact will refuse admin circuits without the matching owner secret."
      >
        <Button to="/app/org">Open operator access</Button>
      </RecoveryPanel>
    );
  }
  if (needVault && !vaultReady) {
    return <Wave2VaultPanel />;
  }
  if (!contractAddress) {
    return (
      <>
        <Wave2ModuleStatus publishedAddress={publishedAddress} />
        <RecoveryPanel
          title="No Wave 2 contract on this tab"
          body="Deploy the Preview-sized contract from this screen. The published ACME economy-preview address is public and read-only. Joining it without the deploy secret cannot forge admin proofs."
        />
      </>
    );
  }
  if (publishedAddress && contractAddress === publishedAddress && !ownerSecret) {
    return (
      <RecoveryPanel
        title="Published Preview is read-only"
        body="This address is the public ACME economy-preview deployment. This vault does not hold its owner secret, so issue, authorize, and settle stay disabled. Deploy your own contract to operate write circuits."
      >
        <PublicId label="Published economy-preview" value={publishedAddress} />
      </RecoveryPanel>
    );
  }
  if (!ownerSecret) {
    return (
      <RecoveryPanel
        title="This vault is an observer"
        body="The contract address is public. Admin circuits still require the owner secret created at deploy time. Compact will refuse a guessed secret."
      >
        <PublicId label="Contract" value={contractAddress} />
      </RecoveryPanel>
    );
  }
  return (
    <>
      <Wave2ModuleStatus contractAddress={contractAddress} ownerSecret={ownerSecret} publishedAddress={publishedAddress} />
      {wave2VaultStatus === "mismatch" ? <Wave2VaultPanel /> : null}
      {children}
    </>
  );
}

export function ContractMeta({
  label,
  address,
  onDeploy,
  busy,
  publishedAddress,
}: {
  label: string;
  address?: string | undefined;
  onDeploy: () => void;
  busy: boolean;
  publishedAddress?: string | undefined;
}) {
  const { wallet } = useSession();
  const published = publishedAddress && address === publishedAddress;
  return (
    <article className="card">
      <h2>{label}</h2>
      <PublicId label="Your contract" value={address} />
      {published ? <p className="muted">This is the public Preview core. Deploy a new contract to obtain an owner secret.</p> : null}
      {!address && publishedAddress ? (
        <p className="muted">
          Observer address {PREVIEW_ECONOMY_DEPLOYMENT.contractAddress === publishedAddress ? "is the published ACME core." : "can be read from the indexer."}
        </p>
      ) : null}
      <div className="row">
        <Button
          type="button"
          onClick={onDeploy}
          disabled={!wallet || busy}
          loading={busy}
          loadingLabel="Deploying on Midnight"
        >
          {wallet ? (address ? "Deploy a new contract" : "Deploy on Preview") : "Connect wallet to deploy"}
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
