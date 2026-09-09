import { PageHeader } from "../../components/PageHeader.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";

export function GovernancePage() {
  useDocumentTitle("Governance");
  return (
    <div className="page">
      <PageHeader
        title="Private ballots"
        objective="A vote writes a ballot commitment and a proposal-scoped nullifier. Individual yes/no values are not incremented on the ledger."
      />
      <article className="card" style={{ marginTop: 24 }}>
        <h2>Public outcome</h2>
        <p>Only the finalized aggregate is public. Full trustless tally completeness remains an experimental adapter.</p>
      </article>
    </div>
  );
}
