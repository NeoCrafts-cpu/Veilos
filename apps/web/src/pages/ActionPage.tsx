import { HowItWorks } from "../components/HowItWorks.js";
import { MaskedValue } from "../components/MaskedValue.js";
import { PaymentRequestForm } from "../components/PaymentRequestForm.js";
import { PageHeader } from "../components/PageHeader.js";
import { LIVE_AGENT_NAME } from "../lib/org-display.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export function ActionPage() {
  useDocumentTitle("Request a payment");

  return (
    <div className="page">
      <PageHeader
        title="Request a payment"
        objective="Ask TREASURY-01 to pay a vendor. The budget stays private. This does not transfer funds until you settle."
      />
      <HowItWorks />
      <div className="desk-split">
        <PaymentRequestForm idPrefix="pay" />
        <article className="card">
          <p className="label">{LIVE_AGENT_NAME}</p>
          <h2>Stays private</h2>
          <MaskedValue label="Amount" />
          <MaskedValue label="Vendor" />
          <MaskedValue label="Reason" />
          <MaskedValue label="Policy limits" />
        </article>
      </div>
    </div>
  );
}
