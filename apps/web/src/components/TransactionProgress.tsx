import type { ProofPhase } from "@velios/shared-types";

const PHASES: { id: ProofPhase; label: string }[] = [
  { id: "preparing", label: "Preparing" },
  { id: "awaiting_wallet", label: "Approve in wallet" },
  { id: "proving", label: "Generating proof" },
  { id: "submitting", label: "Sending" },
  { id: "indexing", label: "Confirming" },
];

export function TransactionProgress({
  phase,
  status,
}: {
  phase?: ProofPhase | undefined;
  status?: string | undefined;
}) {
  const currentIndex = PHASES.findIndex((item) => item.id === phase);
  return (
    <section className="card transaction-progress">
      <ol>
        {PHASES.map((item, index) => {
          const done = currentIndex > index || status === "authorized";
          const current = item.id === phase && (status === "pending" || status === "stale");
          return (
            <li key={item.id} data-done={done} data-current={current}>
              <div className="label">{item.label}</div>
              <div className="progress" data-done={done || current} />
            </li>
          );
        })}
      </ol>
      <p className="muted" role="status">
        {status === "pending"
          ? "Keep this tab open. Leave only after Midnight confirms the transaction."
          : status === "stale"
            ? "The transaction was submitted. The indexer has not confirmed the public action yet."
            : "Authorization is no longer in progress."}
      </p>
    </section>
  );
}
