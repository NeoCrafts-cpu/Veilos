import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button.js";
import { FormField } from "../components/FormField.js";
import { JourneyLayout } from "../components/JourneyLayout.js";
import { RecoveryPanel } from "../components/RecoveryPanel.js";
import { ReviewPanel } from "../components/ReviewPanel.js";
import { SuccessState } from "../components/SuccessState.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { validateLabel, validatePolicyLimits } from "../lib/validation.js";
import { useSession } from "../state/session.js";
import { POLICY_STEPS } from "./setup/steps.js";

export function AgentPolicyPage() {
  const { contractAddress, agentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const creating = location.pathname.includes("/agent/new");
  const reviewing = location.pathname.endsWith("/review");
  const succeeded = location.pathname.endsWith("/success");
  useDocumentTitle(creating ? "Create agent" : "Update policy");
  const {
    policyDraft,
    setPolicyDraft,
    applyPolicyDraft,
    createAgent,
    configurePolicy,
    publicStore,
    operatorMatch,
    selectedContract,
    busy,
    walletError,
  } = useSession();
  const [errors, setErrors] = useState<{
    label?: string | undefined;
    perAction?: string | undefined;
    daily?: string | undefined;
    recipient?: string | undefined;
  }>({});
  const agent = publicStore.agents.find((item) => item.agentId === agentId);
  const contract = contractAddress ?? selectedContract ?? publicStore.contractAddress;
  const parsed = validatePolicyLimits(policyDraft.perAction, policyDraft.daily);

  if (succeeded) {
    return (
      <div className="page">
        <SuccessState
          title={creating ? "Agent created on Midnight" : "Policy updated on Midnight"}
          body="The public commitments changed. Private limits stay on this device. Veilos still does not transfer funds."
        >
          <Button to="/app/authorize/new">Authorize first action</Button>
          <Button to={agent ? `/app/org/${contract}/agent/${agent.agentId}` : "/app/org"} variant="secondary">
            Return to agent
          </Button>
        </SuccessState>
      </div>
    );
  }

  if (operatorMatch === "mismatch") {
    return (
      <div className="page">
        <RecoveryPanel
          title="This vault does not open the on-chain agent"
          body="Import the correct backup before creating or updating a policy."
        >
          <Button to="/app/org">Restore operator access</Button>
        </RecoveryPanel>
      </div>
    );
  }

  if (reviewing) {
    return (
      <JourneyLayout
        title={creating ? "Review private policy" : "Review policy update"}
        objective="Local values stay private. Midnight stores a new policy commitment."
        steps={POLICY_STEPS}
        current={1}
        actions={
          <>
            <Button
              loading={busy}
              loadingLabel={creating ? "Creating agent…" : "Updating policy…"}
              onClick={() => {
                if (!parsed.perActionLimit || !parsed.dailyLimit || !policyDraft.recipient.trim()) return;
                const input = {
                  perActionLimit: parsed.perActionLimit,
                  dailyLimit: parsed.dailyLimit,
                  recipient: policyDraft.recipient.trim(),
                };
                void (async () => {
                  await applyPolicyDraft(input);
                  const ok = creating
                    ? await createAgent(policyDraft.agentLabel.trim())
                    : await configurePolicy(input);
                  if (ok) {
                    navigate(
                      creating
                        ? contract
                          ? `/app/org/${contract}/agent/new/success`
                          : "/app/org/agent/new/success"
                        : `/app/org/${contract}/agent/${agentId}/policy/success`,
                    );
                  }
                })();
              }}
            >
              {creating ? "Create agent on Midnight" : "Update policy on Midnight"}
            </Button>
            <Button to={creating ? "/app/org/agent/new" : `/app/org/${contract}/agent/${agentId}/policy`} variant="secondary">
              Back and edit
            </Button>
          </>
        }
      >
        <ReviewPanel
          privateItems={[
            { label: "Agent label", value: policyDraft.agentLabel || "—" },
            { label: "Per-action limit", value: policyDraft.perAction },
            { label: "Daily limit", value: policyDraft.daily },
            { label: "Approved recipient", value: policyDraft.recipient },
          ]}
          publicItems={[
            { label: "Public agent id", value: creating ? "Created after SucceedEntirely" : agent?.agentId ?? "—" },
            { label: "Policy commitment", value: "Rotates on success; old preimages stop working" },
          ]}
        />
        {walletError ? <p className="footer-note">{walletError}</p> : null}
      </JourneyLayout>
    );
  }

  return (
    <JourneyLayout
      title={creating ? "Configure first agent" : "Update private policy"}
      objective="Limits and the approved recipient stay in witnesses. No demo amounts are filled in."
      steps={POLICY_STEPS}
      current={0}
      actions={
        <Button
          onClick={() => {
            const labelError = creating ? validateLabel(policyDraft.agentLabel, "Agent label") : undefined;
            const recipientError = policyDraft.recipient.trim() ? undefined : "Approved recipient is required.";
            setErrors({
              ...(labelError ? { label: labelError } : {}),
              ...parsed.errors,
              ...(recipientError ? { recipient: recipientError } : {}),
            });
            if (labelError || recipientError || parsed.errors.perAction || parsed.errors.daily) return;
            navigate(
              creating
                ? contract
                  ? `/app/org/${contract}/agent/new/review`
                  : "/app/org/agent/new/review"
                : `/app/org/${contract}/agent/${agentId}/policy/review`,
            );
          }}
        >
          Review private policy
        </Button>
      }
    >
      <form className="form card" onSubmit={(event) => event.preventDefault()}>
        {creating ? (
          <FormField
            id="agent-label"
            label="Agent label"
            value={policyDraft.agentLabel}
            onChange={(event) => setPolicyDraft({ ...policyDraft, agentLabel: event.target.value })}
            hint="Example only: TREASURY-01. 32 bytes or fewer."
            error={errors.label}
          />
        ) : null}
        <FormField
          id="per-action-limit"
          label="Per-action limit"
          inputMode="numeric"
          value={policyDraft.perAction}
          onChange={(event) => setPolicyDraft({ ...policyDraft, perAction: event.target.value })}
          hint="Whole-number policy units. This value never appears on the ledger."
          error={errors.perAction}
        />
        <FormField
          id="daily-limit"
          label="Daily limit"
          inputMode="numeric"
          value={policyDraft.daily}
          onChange={(event) => setPolicyDraft({ ...policyDraft, daily: event.target.value })}
          hint="Must be at least the per-action limit."
          error={errors.daily}
        />
        <FormField
          id="approved-recipient"
          label="Approved recipient"
          value={policyDraft.recipient}
          onChange={(event) => setPolicyDraft({ ...policyDraft, recipient: event.target.value })}
          hint="Hashed into the policy commitment. Not printed on public screens."
          error={errors.recipient}
        />
      </form>
    </JourneyLayout>
  );
}
