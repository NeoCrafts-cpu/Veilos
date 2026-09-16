import { useState } from "react";
import { useParams } from "react-router-dom";
import { MaskedValue } from "../components/MaskedValue.js";
import { PageHeader } from "../components/PageHeader.js";
import { PublicId } from "../components/PublicId.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { formatWindow } from "../lib/format.js";
import { useEconomy } from "../state/economy.js";
import { useSession } from "../state/session.js";

export function PrivacyPage() {
  useDocumentTitle("What's public");
  const { actionId } = useParams();
  const { publicStore } = useSession();
  const { economy, governance, procurement, auditor, contracts } = useEconomy();
  const selected =
    publicStore.actions.find((action) => action.actionId === actionId) ??
    (actionId ? undefined : publicStore.actions.at(-1));
  const authorized = selected?.result === "authorized";
  const [actor, setActor] = useState<"observer" | "operator" | "holder" | "procurement" | "auditor">("observer");

  return (
    <div className="page">
      <PageHeader
        title="What's public"
        objective="What Midnight publishes versus what stays private."
      />
      <div className="privacy-grid" style={{ marginTop: 24 }}>
        <article className="card">
          <h2>Private inputs</h2>
          <MaskedValue label="Agent role" />
          <MaskedValue label="Spending limit" />
          <MaskedValue label="Daily spend so far" />
          <MaskedValue label="Authorization policy values" />
          <MaskedValue label="Credential" />
          <MaskedValue label="Credential expiry" />
          <MaskedValue label="Self-modify permission" />
          <MaskedValue label="Vendor profile" />
          <MaskedValue label="Reason" />
          <MaskedValue label="Ballot choice" />
          <MaskedValue label="Sealed bid amount" />
        </article>
        <article className="card blue">
          <h2>Public output</h2>
          <PublicId label="Payment" value={selected?.actionId ?? actionId} />
          <p>Result {authorized && selected ? "VERIFIED" : selected ? selected.result.toUpperCase() : "NONE"}</p>
          <details className="ledger-details">
            <summary>Technical details</summary>
            <PublicId label="Organization" value={publicStore.contractAddress} />
            <PublicId label="Treasury" value={contracts.economy} />
            <PublicId label="Votes" value={contracts.governance} />
            <PublicId label="Bids" value={contracts.procurement} />
            <PublicId label="Auditor" value={contracts.auditor} />
          </details>
          <p>
            Timestamp{" "}
            {selected ? formatWindow(selected.periodStart, selected.periodEnd) : "—"}
          </p>
          <p>Payments {publicStore.actions.length}</p>
          <p>Treasury authorizations {economy?.actionCount.toString() ?? "0"}</p>
          <p>Settlements {economy?.settlementCount.toString() ?? "0"}</p>
          <p>Credentials {economy?.credentialCount.toString() ?? "0"}</p>
          <p>Ballots {governance?.ballotCommitments.length ?? 0}</p>
          <p>Bids {procurement?.bidCommitments.length ?? 0}</p>
          <p>Auditor grants {auditor?.disclosureCount.toString() ?? "0"}</p>
          <p>Proof {authorized && selected ? "VALID" : "NOT CONFIRMED"}</p>
        </article>
      </div>
      <article className="card" style={{ marginTop: 24 }}>
        <h2>Actor view</h2>
        <div className="row" role="group" aria-label="Privacy actor view">
          {(["observer", "operator", "holder", "procurement", "auditor"] as const).map((item) => (
            <button
              type="button"
              className="btn ghost"
              key={item}
              aria-pressed={actor === item}
              onClick={() => setActor(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <p>
          {actor === "observer"
            ? "Public ids, commitments, counters, settled amount/recipient, and closed vote totals only."
            : actor === "operator"
              ? "Operator vault can open commitments in this tab. Limits stay masked here."
              : actor === "holder"
                ? "Credential body stays in the encrypted holder store."
                : actor === "procurement"
                  ? "Bid openings are available only to the authorized procurement operator."
                  : "Auditor claims require a scoped, expiring grant."}
        </p>
      </article>
      <article className="card" style={{ marginTop: 24 }}>
        <h2>Private → proof → public</h2>
        <p>
          Private inputs are proved against public commitments. Failed proofs write nothing and do not reveal the private budget.
        </p>
        <p>
          Settlement publishes amount and recipient on purpose. Vote choices and sealed bids never appear as numbers on the public record.
        </p>
      </article>
    </div>
  );
}
