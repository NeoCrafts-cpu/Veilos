import { Link } from "react-router-dom";
import { Button } from "../../components/Button.js";
import { PageHeader } from "../../components/PageHeader.js";
import { PublicId } from "../../components/PublicId.js";
import { Wave2CallBanner, Wave2Gate } from "../../components/Wave2Controls.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { useEconomy } from "../../state/economy.js";

export function SettlementReviewPage() {
  useDocumentTitle("Settlement disclosure");
  const {
    contracts,
    economy,
    vault,
    disclosure,
    selection,
    acknowledgeLeakage,
    selectSettlement,
    settlePayment,
    busy,
    lastResult,
  } = useEconomy();
  const actionId =
    selection.settlementActionId ??
    vault.payments.at(-1)?.actionId ??
    economy?.authorizations.at(-1)?.actionId;
  const authorization = economy?.authorizations.find((row) => row.actionId === actionId);
  const alreadySettled = economy?.settlements.some((row) => row.actionId === actionId);
  const local = vault.payments.find((row) => row.actionId === actionId);

  return (
    <div className="page">
      <PageHeader
        title="Unshielded settlement review"
        objective="Amount and recipient will be public. Authorization is not payment. Compact sendUnshielded runs only after leakage is acknowledged."
      />
      <Wave2CallBanner result={lastResult} />
      <div className="privacy-grid" style={{ marginTop: 24 }}>
        <article className="card">
          <h2>Public by design</h2>
          {disclosure.publicByDesign.map((item) => (
            <p key={item}>{item}</p>
          ))}
          <PublicId label="Action" value={actionId} />
          <PublicId label="Intent commitment" value={authorization?.intentCommitment} />
        </article>
        <article className="card">
          <h2>Still private</h2>
          {disclosure.stillPrivate.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </article>
      </div>
      {(economy?.authorizations ?? []).map((row) => (
        <button type="button" className="btn ghost" key={row.actionId} onClick={() => selectSettlement(row.actionId)}>
          Bind {row.actionId.slice(0, 8)}…
        </button>
      ))}
      <div className="row">
        <Button type="button" onClick={acknowledgeLeakage}>I understand amount and recipient will be public</Button>
        <Link className="btn ghost" to="/app/treasury">
          Cancel
        </Link>
      </div>
      <Wave2Gate contractAddress={contracts.economy} ownerSecret={vault.economyOwnerSecret}>
        {alreadySettled ? (
          <p>This action already has a settlement row on the indexer.</p>
        ) : (
          <Button
            type="button"
            disabled={!selection.acknowledgedLeakage || !actionId || !local || busy}
            loading={busy}
            loadingLabel="Proving settleAuthorizedPayment"
            onClick={() => {
              if (actionId) void settlePayment(actionId);
            }}
          >
            Settle on Midnight
          </Button>
        )}
        {!local && actionId ? (
          <p className="muted">This browser vault does not hold the private intent salt for that action. Settlement cannot be forged from the public receipt.</p>
        ) : null}
      </Wave2Gate>
    </div>
  );
}
