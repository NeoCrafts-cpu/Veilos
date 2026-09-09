import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { useEconomy } from "../../state/economy.js";
import { useSession } from "../../state/session.js";

export function TreasuryPage() {
  useDocumentTitle("Treasury");
  const { publicStore } = useSession();
  const { disclosure } = useEconomy();
  return (
    <div className="page">
      <PageHeader
        title="Unshielded treasury"
        objective="Deposit and settle native NIGHT after a private authorization. Amount and recipient are public by design."
      />
      <article className="card" style={{ marginTop: 24 }}>
        <h2>Public treasury facts</h2>
        <p>Contract {publicStore.contractAddress ?? "not selected"}</p>
        <p>Authorizations on indexer {publicStore.actions.length}</p>
        <p>Settlement is a second transaction. Authorization is not payment.</p>
      </article>
      <article className="card" style={{ marginTop: 24 }}>
        <h2>Disclosure before any settlement</h2>
        <p>Public by design: {disclosure.publicByDesign.join(", ")}</p>
        <p>Still private: {disclosure.stillPrivate.join(", ")}</p>
        <Link className="btn" to="/app/treasury/settle">
          Review unshielded settlement
        </Link>
      </article>
    </div>
  );
}
