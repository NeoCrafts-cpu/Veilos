import type { ReactNode } from "react";
import type { Wave2Status } from "../state/economy.js";

const TITLES: Record<Exclude<Wave2Status, "idle">, string> = {
  wallet: "Approve in wallet",
  proving: "Generating proof",
  working: "Generating proof",
  submitted: "Sent to Midnight",
  indexing: "Confirming",
  confirmed: "Confirmed",
  refused: "Refused",
  stale: "Still confirming",
  failed: "Failed",
};

const PHASES: { id: Wave2Status; label: string }[] = [
  { id: "wallet", label: "Approve in wallet" },
  { id: "proving", label: "Generating proof" },
  { id: "submitted", label: "Sent" },
  { id: "indexing", label: "Confirming" },
  { id: "confirmed", label: "Confirmed" },
];

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
  const currentIndex = PHASES.findIndex((phase) => phase.id === current);
  const failed = status === "refused" || status === "failed" || status === "stale";
  return (
    <article className={`card${status === "confirmed" ? " lime" : failed ? " red" : ""}`}>
      <h2>{TITLES[status]}</h2>
      <ol className="wave2-phases">
        {PHASES.map((phase, index) => {
          const done = currentIndex > index || status === "confirmed";
          const active = phase.id === current && !failed && status !== "confirmed";
          return (
            <li key={phase.id} data-done={done} data-current={active}>
              {phase.label}
            </li>
          );
        })}
      </ol>
      {txId ? <p className="mono">tx {txId}</p> : null}
      {detail}
    </article>
  );
}
