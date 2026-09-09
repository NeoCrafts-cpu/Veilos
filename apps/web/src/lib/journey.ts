import type { OperatorMatch, PublicAction, PublicAgent, WorkspaceMode } from "@velios/shared-types";

export type CurrentTask = {
  title: string;
  body: string;
  primary: { label: string; to: string };
  secondary?: { label: string; to: string };
};

export type ReadinessItem = {
    id: "network" | "indexer" | "wallet" | "dust" | "proof" | "vault";
  label: string;
  ok: boolean | null;
  detail: string;
  repair?: { label: string; to?: string; action?: "connect" | "retry" };
};

export function deriveCurrentTask(input: {
  mode: WorkspaceMode;
  wallet: boolean;
  agent?: PublicAgent | undefined;
  match: OperatorMatch;
  vault: "missing" | "locked" | "unlocked" | "dev_available";
  pendingActionId?: string | undefined;
  actions: PublicAction[];
}): CurrentTask {
  if (input.mode === "unset") {
    return {
      title: "Choose how to start",
      body: "Authorize agent actions without revealing private policy values. Veilos does not transfer funds.",
      primary: { label: "Create my organization", to: "/app/setup" },
      secondary: { label: "Explore public Preview organization", to: "/app/preview" },
    };
  }
  if (input.mode === "preview") {
    return {
      title: "Inspect the public Preview organization",
      body: "Public ids, commitments, and verified authorizations are visible. Private policy values stay hidden.",
      primary: { label: "Inspect public/private boundary", to: "/app/privacy" },
      secondary: { label: "Operate my own organization", to: "/app/setup" },
    };
  }
  if (input.pendingActionId) {
    return {
      title: "Authorization is in progress",
      body: "Keep this tab open and approve the wallet popup if it appears.",
      primary: { label: "View progress", to: `/app/actions/${input.pendingActionId}/progress` },
    };
  }
  if (input.vault === "locked" || input.vault === "dev_available") {
    return {
      title: "Unlock operator access",
      body: "The operator vault opens the private commitments for this organization. The wallet pays transactions; it is not the vault.",
      primary: { label: "Unlock operator access", to: "/app/org" },
    };
  }
  if (input.vault === "missing") {
    return {
      title: "Create operator access",
      body: "Protect this organization’s private state with a passphrase before you deploy or authorize.",
      primary: { label: "Create secure operator vault", to: "/app/setup/vault" },
    };
  }
  if (!input.wallet) {
    return {
      title: "Connect your Midnight wallet",
      body: "The wallet pays DUST for proving. Veilos never asks for your recovery phrase.",
      primary: { label: "Check readiness", to: "/app/setup" },
    };
  }
  if (input.match === "mismatch") {
    return {
      title: "This vault does not open the on-chain agent",
      body: "Import the backup used when this agent was created. A proof will not be submitted until the commitments match.",
      primary: { label: "Restore operator access", to: "/app/org" },
    };
  }
  if (input.match === "stale_spend") {
    return {
      title: "Operator access is stale",
      body: "Owner and policy match, but the spend commitment does not. Import a later backup before authorizing.",
      primary: { label: "Restore operator access", to: "/app/org" },
    };
  }
  if (!input.agent) {
    return {
      title: "Finish agent setup",
      body: "Set a private policy, then create the agent on Midnight. Limits stay off the ledger.",
      primary: { label: "Configure first agent", to: "/app/org/agent/new" },
    };
  }
  return {
    title: "Authorize an action",
    body: "Request authorization against the committed private policy. Veilos records a verified result; it does not transfer funds.",
    primary: { label: "Authorize a payment request", to: "/app/authorize/new" },
    secondary:
      input.actions.length > 0
        ? { label: "View activity", to: "/app/actions" }
        : { label: "Inspect privacy", to: "/app/privacy" },
  };
}
