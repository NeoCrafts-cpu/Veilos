import { Link } from "react-router-dom";
import { Button } from "../../components/Button.js";
import { PageHeader } from "../../components/PageHeader.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { useEconomy } from "../../state/economy.js";
import { useSession } from "../../state/session.js";

export function SettlementReviewPage() {
  useDocumentTitle("Settlement disclosure");
  const { publicStore } = useSession();
  const { disclosure, selection, acknowledgeLeakage, selectSettlement } = useEconomy();
  const action = publicStore.actions.find((item) => item.actionId === selection.settlementActionId) ?? publicStore.actions.at(-1);
  return (
    <div className="page">
      <PageHeader
        title="Unshielded settlement review"
        objective="Confirm the public leakage before signing a NIGHT transfer. Authorization is not settlement."
      />
      <div className="privacy-grid" style={{ marginTop: 24 }}>
        <article className="card">
          <h2>Public by design</h2>
          {disclosure.publicByDesign.map((item) => (
            <p key={item}>{item}</p>
          ))}
          <p>Action {action?.actionId ?? "none recorded"}</p>
        </article>
        <article className="card">
          <h2>Still private</h2>
          {disclosure.stillPrivate.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </article>
      </div>
      {action ? (
        <button type="button" className="btn ghost" onClick={() => selectSettlement(action.actionId)}>
          Bind this authorization
        </button>
      ) : null}
      <div className="row">
        <Button onClick={acknowledgeLeakage}>I understand amount and recipient will be public</Button>
        <Link className="btn ghost" to="/app/treasury">
          Cancel
        </Link>
      </div>
      {selection.acknowledgedLeakage ? (
        <p>Disclosure recorded in this tab. Settlement still requires SucceedEntirely and an indexed nullifier.</p>
      ) : null}
    </div>
  );
}
