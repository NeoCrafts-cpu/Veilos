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
  if (input.pendingActionId) {
    return {
      title: "Authorization is in progress",
      body: "Keep this tab open and approve the wallet popup if it appears.",
      primary: { label: "View progress", to: `/app/actions/${input.pendingActionId}/progress` },
    };
  }
  if (input.match === "mismatch") {
    return {
      title: "This access does not match the live agent",
      body: "Restore the backup used when this agent was created. A payment will not be submitted until it matches.",
      primary: { label: "Restore access", to: "/app/org" },
    };
  }
  if (input.match === "stale_spend") {
    return {
      title: "Organization access is out of date",
      body: "Restore a later backup before authorizing a payment.",
      primary: { label: "Restore access", to: "/app/org" },
    };
  }
  if (!input.agent) {
    return {
      title: "Your organization is live",
      body: "Public membership is on Midnight. Private budgets stay off the ledger.",
      primary: { label: "View organization", to: "/app/org" },
      secondary: { label: "Request a payment", to: "/app/authorize/new" },
    };
  }
  if (input.vault === "locked" || input.vault === "dev_available") {
    return {
      title: "Unlock to authorize payments",
      body: "Anyone can see public results. Authorizing a payment needs this organization's passphrase.",
      primary: { label: "Unlock organization", to: "/app/org" },
      secondary: { label: "Request a payment", to: "/app/authorize/new" },
    };
  }
  if (!input.wallet) {
    return {
      title: "Request a payment",
      body: "Ask TREASURY-01 to pay a vendor. Connect a Midnight wallet when you are ready to authorize.",
      primary: { label: "Request a payment", to: "/app/authorize/new" },
      secondary:
        input.actions.length > 0
          ? { label: "View activity", to: "/app/actions" }
          : { label: "View organization", to: "/app/org" },
    };
  }
  if (input.vault === "missing") {
    return {
      title: "Request a payment",
      body: "Look around first. Unlock on Members when you need to authorize.",
      primary: { label: "Request a payment", to: "/app/authorize/new" },
      secondary: { label: "Members & access", to: "/app/org" },
    };
  }
  return {
    title: "Request a payment",
    body: "Ask the agent to pay a vendor. Midnight proves the request is inside the private policy. No funds move until you settle.",
    primary: { label: "Request a payment", to: "/app/authorize/new" },
    secondary:
      input.actions.length > 0
        ? { label: "View activity", to: "/app/actions" }
        : { label: "What's public", to: "/app/privacy" },
  };
}
