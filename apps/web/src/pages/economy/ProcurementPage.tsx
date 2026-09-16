import { useState } from "react";
import { Button } from "../../components/Button.js";
import { DeskStats } from "../../components/DeskStats.js";
import { FormField } from "../../components/FormField.js";
import { MaskedValue } from "../../components/MaskedValue.js";
import { PageHeader } from "../../components/PageHeader.js";
import { PublicId } from "../../components/PublicId.js";
import { Wave2CallBanner, Wave2Gate } from "../../components/Wave2Controls.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { useTaskSection } from "../../hooks/useTaskSection.js";
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
    registerBidder,
    createProcurement,
    submitBid,
    awardProcurement,
    refreshLedgers,
  } = useEconomy();
  useTaskSection("/app/procurement", "bidders");
  const [duration, setDuration] = useState("300");
  const [lotId, setLotId] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [selectedBidder, setSelectedBidder] = useState("");
  const [selectedWinningBid, setSelectedWinningBid] = useState("");
  const [treasuryActionId, setTreasuryActionId] = useState("");
  const [error, setError] = useState<string>();
  const bidderCommitment = selectedBidder || vault.bidders.at(-1)?.holderCommitment || "";
  const lotBids = vault.bids.filter((item) => item.procurementId === lotId.trim());
  const winnerBidCommitment =
    lotBids.some((item) => item.bidCommitment === selectedWinningBid)
      ? selectedWinningBid
      : lotBids.length === 1
        ? lotBids[0]!.bidCommitment
        : "";

  return (
    <div className="page">
      <PageHeader
        compact
        title="Bids"
        objective="Suppliers submit sealed bids. Losing amounts stay private. An award cannot settle without a matching treasury authorization."
      />
      <DeskStats
        items={[
          { label: "Bidders", value: procurement?.bidderCount.toString() ?? "0" },
          { label: "Lots", value: procurement?.procurementCount.toString() ?? "0" },
          { label: "Bids", value: String(procurement?.bidCommitments.length ?? 0) },
        ]}
        onRefresh={() => void refreshLedgers()}
      />
      {ledgerError ? <p className="field-error">{ledgerError}</p> : null}
      <Wave2CallBanner result={lastResult} />
      <Wave2Gate
        contractAddress={contracts.procurement}
        ownerSecret={vault.procurementOwnerSecret}
        idleTitle="Inspect bids"
        idleBody="Fill the form. Writes wait until bidding is live for this organization."
      >
        <form
          id="task-lots"
          className="form card desk-form"
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
          <div className="row" id="task-bidders" style={{ marginTop: 12 }}>
            <Button loading={busy} loadingLabel="Proving createProcurement">
              Create on Midnight
            </Button>
            <Button type="button" variant="secondary" loading={busy} onClick={() => void registerBidder()}>
              Register bidder
            </Button>
          </div>
        </form>
        <form
          id="task-bids"
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
            void submitBid({
              procurementId: lotId.trim(),
              amount: parsed.amount,
              bidderCommitment,
            });
          }}
        >
          <h2>Submit sealed bid</h2>
          <FormField id="lot-id" label="Procurement id" value={lotId} onChange={(event) => setLotId(event.target.value)} />
          <label htmlFor="bidder-credential">
            Bidder credential
            <select
              id="bidder-credential"
              value={bidderCommitment}
              onChange={(event) => setSelectedBidder(event.target.value)}
              disabled={vault.bidders.length === 0}
            >
              {vault.bidders.length === 0 ? <option value="">Register a bidder first</option> : null}
              {vault.bidders.map((item, index) => (
                <option key={item.holderCommitment} value={item.holderCommitment}>
                  Bidder {index + 1} · {item.holderCommitment.slice(0, 10)}…
                </option>
              ))}
            </select>
          </label>
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
          <Button disabled={!bidderCommitment} loading={busy} loadingLabel="Proving submitBid">
            Commit bid
          </Button>
        </form>
        <form
          className="form card"
          style={{ marginTop: 24 }}
          onSubmit={(event) => {
            event.preventDefault();
            void awardProcurement({
              procurementId: lotId.trim(),
              treasuryActionId: treasuryActionId.trim(),
              winnerBidCommitment,
            });
          }}
        >
          <h2>Award (bound to treasury authorization)</h2>
          <label htmlFor="winning-bid">
            Winning sealed bid
            <select
              id="winning-bid"
              value={winnerBidCommitment}
              onChange={(event) => setSelectedWinningBid(event.target.value)}
              disabled={lotBids.length === 0}
            >
              {lotBids.length === 0 ? <option value="">Select a lot with a local bid</option> : null}
              {lotBids.map((item, index) => (
                <option key={item.bidCommitment} value={item.bidCommitment}>
                  Bid {index + 1} · {item.bidCommitment.slice(0, 10)}…
                </option>
              ))}
            </select>
          </label>
          <FormField
            id="treasury-action"
            label="Treasury authorization"
            value={treasuryActionId}
            onChange={(event) => setTreasuryActionId(event.target.value)}
            hint="Must already be an authorized treasury payment. An award cannot settle without it."
          />
          <Button disabled={!winnerBidCommitment} loading={busy} loadingLabel="Proving awardProcurement">
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
