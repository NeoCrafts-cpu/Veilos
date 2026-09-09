import { PageHeader } from "../../components/PageHeader.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";

export function ProcurementPage() {
  useDocumentTitle("Procurement");
  return (
    <div className="page">
      <PageHeader
        title="Sealed procurement"
        objective="Bids are salted commitments. Losing amounts stay off the public ledger. An award cannot settle without a treasury authorization."
      />
      <article className="card" style={{ marginTop: 24 }}>
        <h2>Actor boundary</h2>
        <p>Bid openings may be shown to an authorized procurement operator for the winner proof. They are never shown to the public or competing bidders.</p>
      </article>
    </div>
  );
}
