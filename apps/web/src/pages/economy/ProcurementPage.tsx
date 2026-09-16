import { useState } from "react";
import { Button } from "../../components/Button.js";
import { FormField } from "../../components/FormField.js";
import { MaskedValue } from "../../components/MaskedValue.js";
import { PageHeader } from "../../components/PageHeader.js";
import { PublicId } from "../../components/PublicId.js";
import { ContractMeta, Wave2CallBanner, Wave2Gate } from "../../components/Wave2Controls.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { validatePolicyAmount } from "../../lib/validation.js";
import { useEconomy } from "../../state/economy.js";

export function ProcurementPage() {
  useDocumentTitle("Procurement");
  const {
    contracts,
    procurement,
    economy,
    vault,
    busy,
    lastResult,
    ledgerError,
    deployProcurement,
    registerBidder,
    createProcurement,
    submitBid,
    awardProcurement,
    refreshLedgers,
  } = useEconomy();
  const [duration, setDuration] = useState("300");
  const [lotId, setLotId] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [treasuryActionId, setTreasuryActionId] = useState("");
  const [error, setError] = useState<string>();

  return (
    <div className="page">
      <PageHeader
        title="Sealed procurement"
        objective="Bids are salted commitments. Losing amounts stay off the public ledger. An award cannot settle without a treasury authorization on economy-preview."
      />
      {ledgerError ? <p className="field-error">{ledgerError}</p> : null}
      <div className="privacy-grid" style={{ marginTop: 24 }}>
        <ContractMeta
          label="procurement-preview"
          address={contracts.procurement}
          onDeploy={() => void deployProcurement()}
          busy={busy}
        />
        <article className="card blue">
          <h2>Public lots</h2>
          <p>Bidders {procurement?.bidderCount.toString() ?? "0"}</p>
          <p>Lots {procurement?.procurementCount.toString() ?? "0"}</p>
          <p>Bid commitments {procurement?.bidCommitments.length ?? 0}</p>
          <Button type="button" variant="secondary" onClick={() => void refreshLedgers()}>
            Refresh indexer
          </Button>
        </article>
      </div>
      <Wave2CallBanner result={lastResult} />
      <Wave2Gate contractAddress={contracts.procurement}>
        <div className="row" style={{ marginTop: 24 }}>
          <Button type="button" loading={busy} onClick={() => void registerBidder()}>
            Register bidder
          </Button>
        </div>
        <form
          className="form card"
          style={{ marginTop: 24 }}
          onSubmit={(event) => {
            event.preventDefault();
            void createProcurement({ durationSeconds: Number(duration) || 300 });
          }}
        >
          <h2>Open a lot</h2>
          <FormField
            id="bid-window"
            label="Bidding window (seconds)"
            inputMode="numeric"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          />
          <Button loading={busy} loadingLabel="Proving createProcurement">
            Create on Midnight
          </Button>
        </form>
        <form
          className="form card"
          style={{ marginTop: 24 }}
          onSubmit={(event) => {
            event.preventDefault();
            const parsed = validatePolicyAmount(bidAmount, "Bid amount");
            if (parsed.error || parsed.amount === undefined) {
              setError(parsed.error);
              return;
            }
            setError(undefined);
            void submitBid({ procurementId: lotId.trim(), amount: parsed.amount });
          }}
        >
          <h2>Submit sealed bid</h2>
          <FormField id="lot-id" label="Procurement id" value={lotId} onChange={(event) => setLotId(event.target.value)} />
          <FormField
            id="bid-amount"
            label="Bid amount (private)"
            inputMode="numeric"
            value={bidAmount}
            onChange={(event) => setBidAmount(event.target.value)}
            hint="Stored only in the encrypted vault and as a Compact witness."
            error={error}
          />
          <MaskedValue label="Sealed bid amount" />
          <Button loading={busy} loadingLabel="Proving submitBid">
            Commit bid
          </Button>
        </form>
        <form
          className="form card"
          style={{ marginTop: 24 }}
          onSubmit={(event) => {
            event.preventDefault();
            void awardProcurement({ procurementId: lotId.trim(), treasuryActionId: treasuryActionId.trim() });
          }}
        >
          <h2>Award (bound to treasury authorization)</h2>
          <FormField
            id="treasury-action"
            label="economy-preview action id"
            value={treasuryActionId}
            onChange={(event) => setTreasuryActionId(event.target.value)}
            hint="Must already exist on the economy-preview authorizations map. Compact 0.23 cannot look up another contract."
          />
          <Button loading={busy} loadingLabel="Proving awardProcurement">
            Award on Midnight
          </Button>
        </form>
        <article className="card" style={{ marginTop: 24 }}>
          <h2>Lots on indexer</h2>
          {(procurement?.lots ?? []).map((row) => (
            <div key={row.procurementId} className="row">
              <PublicId label="Lot" value={row.procurementId} />
              <p>{row.status}</p>
              {row.status === "awarded" ? <PublicId label="Treasury action" value={row.treasuryActionId} /> : null}
              <button type="button" className="btn ghost" onClick={() => setLotId(row.procurementId)}>
                Select
              </button>
            </div>
          ))}
          {(procurement?.lots.length ?? 0) === 0 ? <p className="muted">No lots yet.</p> : null}
          <p className="muted">
            Indexed treasury authorizations available for binding: {economy?.authorizations.length ?? 0}. Vault sealed
            bids: {vault.bids.length}.
          </p>
        </article>
      </Wave2Gate>
    </div>
  );
}
