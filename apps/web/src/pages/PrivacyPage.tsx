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
  useDocumentTitle("Privacy inspector");
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
        title="Privacy inspector"
        objective="What Midnight publishes versus what stays in witnesses. Private slots are hidden on purpose."
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
          <PublicId label="Wave 1 action" value={selected?.actionId ?? actionId} />
          <p>Result {authorized && selected ? "VERIFIED" : selected ? selected.result.toUpperCase() : "NONE"}</p>
          <PublicId label="Wave 1 contract" value={publicStore.contractAddress} />
          <PublicId label="economy-preview" value={contracts.economy} />
          <PublicId label="governance-preview" value={contracts.governance} />
          <PublicId label="procurement-preview" value={contracts.procurement} />
          <PublicId label="auditor-preview" value={contracts.auditor} />
          <p>
            Timestamp{" "}
            {selected ? formatWindow(selected.periodStart, selected.periodEnd) : "—"}
          </p>
          <p className="mono">Wave 1 actions {publicStore.actions.length}</p>
          <p className="mono">Treasury authorizations {economy?.actionCount.toString() ?? "0"}</p>
          <p className="mono">Settlements {economy?.settlementCount.toString() ?? "0"}</p>
          <p className="mono">Credential commitments {economy?.credentialCount.toString() ?? "0"}</p>
          <p className="mono">Ballot commitments {governance?.ballotCommitments.length ?? 0}</p>
          <p className="mono">Bid commitments {procurement?.bidCommitments.length ?? 0}</p>
          <p className="mono">Disclosure grants {auditor?.disclosureCount.toString() ?? "0"}</p>
          <p>Proof {authorized && selected ? "VALID" : "NOT CONFIRMED"}</p>
        </article>
      </div>
      <article className="card" style={{ marginTop: 24 }}>
        <h2>Actor view</h2>
        <div className="row">
          {(["observer", "operator", "holder", "procurement", "auditor"] as const).map((item) => (
            <button type="button" className="btn ghost" key={item} onClick={() => setActor(item)}>
              {item}
            </button>
          ))}
        </div>
        <p>
          {actor === "observer"
            ? "Public ids, commitments, counters, unshielded settlement amount/recipient, and finalized yes/no only."
            : actor === "operator"
              ? "Operator vault can open commitments in this tab. Limits stay masked here."
              : actor === "holder"
                ? "Credential body stays in the encrypted holder store."
                : actor === "procurement"
                  ? "Bid openings are available only to the authorized procurement operator."
                  : "Auditor claims require a scoped, expiring grant recorded on auditor-preview."}
        </p>
      </article>
      <article className="card" style={{ marginTop: 24 }}>
        <h2>Private → proof → public</h2>
        <p>
          Compact witnesses are untrusted. Limits and vendor ids are hashed into ledger commitments before any assert.
          Failed proofs do not write a public reject row and do not print the private limit.
        </p>
        <p>
          Unshielded NIGHT settlement publishes amount and recipient by design. Ballot choices and sealed bids never
          appear as integers on the indexer.
        </p>
      </article>
    </div>
  );
}
