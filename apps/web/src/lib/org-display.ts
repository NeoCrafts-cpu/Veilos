export const LIVE_ORG_NAME = "ACME AUTONOMOUS SYSTEMS";
export const LIVE_AGENT_NAME = "TREASURY-01";
export const LIVE_AGENT_ROLE = "Treasury Operator";
export const LIVE_MEMBER_NAME = "FOUNDING-MEMBER";

export type LiveAgentStatus = "active" | "inactive" | "syncing" | "missing";

export function liveAgentStatus(input: {
  confirmedAgent: boolean;
  ledgerSync: "none" | "pending" | "confirmed";
  agentStatus?: "active" | "inactive";
}): LiveAgentStatus {
  if (input.confirmedAgent) return input.agentStatus ?? "active";
  if (input.ledgerSync === "confirmed") return "missing";
  return "syncing";
}

export function liveAgentStatusLabel(status: LiveAgentStatus): string {
  if (status === "active") return "Active";
  if (status === "inactive") return "Paused";
  if (status === "missing") return "Not on ledger";
  return "Syncing";
}
