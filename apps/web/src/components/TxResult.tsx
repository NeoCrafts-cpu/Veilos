import type { ReactNode } from "react";

export function TxResult({
  status,
  txId,
  detail,
}: {
  status: "idle" | "working" | "confirmed" | "refused" | "stale" | "failed";
  txId?: string;
  detail?: ReactNode;
}) {
  if (status === "idle") return null;
  const title =
    status === "working"
      ? "Proving on Midnight"
      : status === "confirmed"
        ? "Indexer confirmed"
        : status === "refused"
          ? "REFUSED"
          : status === "stale"
            ? "Indexer stale"
            : "Failed";
  return (
    <article className={`card${status === "confirmed" ? " lime" : status === "refused" || status === "failed" ? " red" : ""}`}>
      <h2>{title}</h2>
      {txId ? <p className="mono">tx {txId}</p> : null}
      {detail}
    </article>
  );
}
