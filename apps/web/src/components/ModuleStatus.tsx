import { StatusChip } from "./StatusChip.js";

export type ModuleStateKind = "idle" | "ready" | "pending" | "ok" | "warn";

export function ModuleStatus({
  vault,
  wallet,
  contract,
  indexer,
}: {
  vault: { label: string; tone: ModuleStateKind };
  wallet: { label: string; tone: ModuleStateKind };
  contract: { label: string; tone: ModuleStateKind };
  indexer: { label: string; tone: ModuleStateKind };
}) {
  const chip = (item: { label: string; tone: ModuleStateKind }) => (
    <StatusChip tone={item.tone === "ok" ? "ok" : item.tone === "warn" ? "warn" : "neutral"} label={item.label} />
  );
  return (
    <article className="card module-status">
      <h2>State boundaries</h2>
      <div className="grid">
        <div>
          <p className="label">UI / local vault</p>
          {chip(vault)}
        </div>
        <div>
          <p className="label">Wallet / proof</p>
          {chip(wallet)}
        </div>
        <div>
          <p className="label">Contract / on-chain</p>
          {chip(contract)}
        </div>
        <div>
          <p className="label">Indexer confirmation</p>
          {chip(indexer)}
        </div>
      </div>
    </article>
  );
}
