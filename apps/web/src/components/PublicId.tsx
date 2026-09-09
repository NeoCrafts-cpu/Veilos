import { useState } from "react";
import { shortAddress } from "../lib/format.js";

export function PublicId({ label, value }: { label: string; value?: string | undefined }) {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return (
      <div className="public-id">
        <div className="label">{label}</div>
        <p className="muted">Not on the ledger yet</p>
      </div>
    );
  }

  return (
    <div className="public-id">
      <div className="label">{label}</div>
      <p className="mono" title={value}>
        <span className="sr-only">{value}</span>
        <span aria-hidden="true">{shortAddress(value, 12, 10)}</span>
      </p>
      <button
        type="button"
        className="btn ghost copy-id"
        onClick={() => {
          void navigator.clipboard?.writeText(value).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          });
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
