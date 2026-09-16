import type { ReactNode } from "react";
import type { Wave2Status } from "../state/economy.js";

const TITLES: Record<Exclude<Wave2Status, "idle">, string> = {
  wallet: "Awaiting wallet approval",
  proving: "Generating proof",
  working: "Proving on Midnight",
  submitted: "Submitted to Midnight",
  indexing: "Confirming on the indexer",
  confirmed: "Indexer confirmed",
  refused: "REFUSED",
  stale: "Indexer stale",
  failed: "Failed",
};

const PHASES: Wave2Status[] = ["wallet", "proving", "submitted", "indexing", "confirmed"];

export function TxResult({
  status,
  txId,
  detail,
}: {
  status: Wave2Status;
  txId?: string;
  detail?: ReactNode;
}) {
  if (status === "idle") return null;
  const current = status === "working" ? "proving" : status;
  const currentIndex = PHASES.indexOf(current);
  const failed = status === "refused" || status === "failed" || status === "stale";
  return (
    <article className={`card${status === "confirmed" ? " lime" : failed ? " red" : ""}`}>
      <h2>{TITLES[status]}</h2>
      <ol className="wave2-phases">
        {PHASES.map((phase, index) => {
          const done = currentIndex > index || status === "confirmed";
          const active = phase === current && !failed && status !== "confirmed";
          return (
            <li key={phase} data-done={done} data-current={active}>
              {phase}
            </li>
          );
        })}
      </ol>
      {txId ? <p className="mono">tx {txId}</p> : null}
      {detail}
    </article>
  );
}
