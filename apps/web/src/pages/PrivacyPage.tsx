import { useState } from "react";
import { useParams } from "react-router-dom";
import { MaskedValue } from "../components/MaskedValue.js";
import { PageHeader } from "../components/PageHeader.js";
import { PublicId } from "../components/PublicId.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { formatWindow } from "../lib/format.js";
import { useSession } from "../state/session.js";

export function PrivacyPage() {
  useDocumentTitle("Privacy inspector");
  const { actionId } = useParams();
  const { publicStore } = useSession();
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
        </article>
        <article className="card blue">
          <h2>Public output</h2>
          <PublicId label="Action ID" value={selected?.actionId ?? actionId} />
          <p>Result {authorized && selected ? "VERIFIED" : selected ? selected.result.toUpperCase() : "NONE"}</p>
          <PublicId label="Contract" value={publicStore.contractAddress} />
          <p>
            Timestamp{" "}
            {selected ? formatWindow(selected.periodStart, selected.periodEnd) : "—"}
          </p>
          <p className="mono">Indexer actions {publicStore.actions.length}</p>
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
            ? "Public ids, commitments, and confirmed results only."
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
          Compact witnesses are untrusted. Limits and vendor ids are hashed into ledger commitments before any assert.
          Failed proofs do not write a public reject row and do not print the private limit.
        </p>
        <p>
          The timestamp is the authorization window the circuit proved against the Midnight ledger clock. The credential
          was proved valid through the end of that window while its expiry date stayed private.
        </p>
      </article>
    </div>
  );
}
