import { PageHeader } from "../../components/PageHeader.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";

export function AuditorPage() {
  useDocumentTitle("Auditor");
  return (
    <div className="page">
      <PageHeader
        title="Scoped auditor view"
        objective="Auditors receive only consented, expiring claims and verify them against public anchors. There is no global decryption key."
      />
      <article className="card" style={{ marginTop: 24 }}>
        <h2>Views</h2>
        <p>Public observer, organization operator, credential holder, procurement operator, authorized auditor.</p>
      </article>
    </div>
  );
}
