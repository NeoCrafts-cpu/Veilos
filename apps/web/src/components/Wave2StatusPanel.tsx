import { useMemo } from "react";
import type { Wave2Status } from "../state/economy.js";
import { useEconomy } from "../state/economy.js";
import { useSession } from "../state/session.js";
import { ModuleStatus } from "./ModuleStatus.js";

export function Wave2ModuleStatus({
  contractAddress,
  ownerSecret,
  publishedAddress,
}: {
  contractAddress?: string | undefined;
  ownerSecret?: string | undefined;
  publishedAddress?: string | undefined;
}) {
  const { wallet, provingSource, vaultStatus } = useSession();
  const { vaultReady, lastResult, ledgerError } = useEconomy();
  const publishedObserver = Boolean(publishedAddress && contractAddress === publishedAddress && !ownerSecret);
  const vault = useMemo(() => {
    if (vaultReady) return { label: "Wave 2 vault unlocked", tone: "ok" as const };
    if (vaultStatus === "unlocked") return { label: "Wave 2 vault not ready", tone: "warn" as const };
    if (vaultStatus === "locked") return { label: "Operator vault locked", tone: "warn" as const };
    return { label: "Create operator vault", tone: "warn" as const };
  }, [vaultReady, vaultStatus]);
  const walletState = useMemo(() => {
    if (wallet && provingSource) return { label: `${provingSource === "wallet" ? "Wallet proving" : "Local proving"} ready`, tone: "ok" as const };
    if (wallet) return { label: "Wallet connected, prover unknown", tone: "pending" as const };
    return { label: "Connect Midnight wallet", tone: "warn" as const };
  }, [wallet, provingSource]);
  const contract = useMemo(() => {
    if (ownerSecret && contractAddress) return { label: "Owner secret matches this deploy", tone: "ok" as const };
    if (publishedObserver) return { label: "Published Preview · read-only", tone: "idle" as const };
    if (contractAddress) return { label: "Observer — no owner secret in this vault", tone: "warn" as const };
    return { label: "Deploy a contract to write", tone: "warn" as const };
  }, [contractAddress, ownerSecret, publishedObserver]);
  const indexer = useMemo(() => {
    if (lastResult.status === "confirmed") return { label: "Indexer confirmed", tone: "ok" as const };
    if (lastResult.status === "stale") return { label: "Indexer stale", tone: "warn" as const };
    if (lastResult.status === "indexing" || lastResult.status === "submitted") {
      return { label: "Waiting for indexer", tone: "pending" as const };
    }
    if (ledgerError) return { label: "Indexer read failed", tone: "warn" as const };
    return { label: "No pending confirmation", tone: "idle" as const };
  }, [lastResult.status, ledgerError]);
  return <ModuleStatus vault={vault} wallet={walletState} contract={contract} indexer={indexer} />;
}

export function phaseIndex(status: Wave2Status): number {
  const order: Wave2Status[] = ["idle", "wallet", "proving", "submitted", "indexing", "confirmed"];
  const hit = order.indexOf(status);
  if (hit >= 0) return hit;
  if (status === "working") return 2;
  return -1;
}
