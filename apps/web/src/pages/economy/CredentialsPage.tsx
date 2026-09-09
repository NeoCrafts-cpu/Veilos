import { PageHeader } from "../../components/PageHeader.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";

export function CredentialsPage() {
  useDocumentTitle("Credentials");
  return (
    <div className="page">
      <PageHeader
        title="Organization-issued credentials"
        objective="Issue, rotate, and revoke private credentials. Compact proves class, expiry, and non-revocation without publishing the body."
      />
      <article className="card" style={{ marginTop: 24 }}>
        <h2>Classes</h2>
        <p>Administrator, treasury operator, procurement operator, auditor, agent operator.</p>
        <p>Official Midnight DID/VC adapters stay experimental until MidnightJS 4.1.1 compatibility is proven.</p>
      </article>
    </div>
  );
}
