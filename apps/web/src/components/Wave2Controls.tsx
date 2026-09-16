import type { ReactNode } from "react";
import { Button } from "./Button.js";
import { TreasuryOperatorImport } from "./TreasuryOperatorImport.js";
import { TxResult } from "./TxResult.js";
import { Wave2VaultPanel } from "./Wave2VaultPanel.js";
import { useEconomy, type Wave2CallResult } from "../state/economy.js";
import { useSession } from "../state/session.js";

export function Wave2CallBanner({ result }: { result: Wave2CallResult }) {
  return <TxResult status={result.status} {...(result.txId ? { txId: result.txId } : {})} detail={result.message} />;
}

function GateBanner({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="gate-banner" role="status">
      <p>
        <strong>{title}.</strong> {body}
      </p>
      {children ? <div className="gate-banner-actions">{children}</div> : null}
    </div>
  );
}

export function Wave2Gate({
  contractAddress,
  ownerSecret,
  publishedAddress,
  needVault = true,
  idleTitle,
  idleBody,
  children,
}: {
  contractAddress?: string | undefined;
  ownerSecret?: string | undefined;
  publishedAddress?: string | undefined;
  needVault?: boolean;
  idleTitle?: string;
  idleBody?: string;
  children: ReactNode;
}) {
  const { wallet, vaultStatus, connectWallet, busyAction, walletReconnectNeeded } = useSession();
  const { vaultReady, wave2VaultStatus } = useEconomy();
  const canWrite = Boolean(
    wallet &&
      (!needVault || (vaultStatus === "unlocked" && vaultReady)) &&
      contractAddress &&
      ownerSecret &&
      !(publishedAddress && contractAddress === publishedAddress && !ownerSecret),
  );

  let banner: ReactNode = null;
  if (!wallet) {
    banner = (
      <GateBanner
        title="Connect a Midnight wallet"
        body="Look around first. Connect only when you need to change records."
      >
        <Button type="button" disabled={busyAction === "connect"} onClick={() => void connectWallet()}>
          {busyAction === "connect" ? "Connecting…" : walletReconnectNeeded ? "Reconnect wallet" : "Connect wallet"}
        </Button>
      </GateBanner>
    );
  } else if (needVault && vaultStatus !== "unlocked") {
    banner = (
      <GateBanner title="Unlock this organization" body="Writes need the organization passphrase.">
        <Button to="/app/org">Unlock</Button>
      </GateBanner>
    );
  } else if (needVault && !vaultReady) {
    banner = <Wave2VaultPanel />;
  } else if (!contractAddress) {
    banner = (
      <GateBanner
        title={idleTitle ?? "This desk is ready to inspect"}
        body={idleBody ?? "Fill the form. Writes wait until this module is live."}
      />
    );
  } else if (!ownerSecret) {
    banner = (
      <GateBanner title="View only" body="Writes need the treasury backup from this machine.">
        <TreasuryOperatorImport />
      </GateBanner>
    );
  } else if (wave2VaultStatus === "mismatch") {
    banner = <Wave2VaultPanel />;
  }

  return (
    <>
      {banner}
      <fieldset className="write-fieldset" disabled={!canWrite}>
        {children}
      </fieldset>
    </>
  );
}

export function useWave2Busy() {
  const { busy, lastResult, ledgerError } = useEconomy();
  return { busy, lastResult, ledgerError };
}
