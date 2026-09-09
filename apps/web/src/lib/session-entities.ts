import type { Hex32, PublicAgent, PublicMember } from "@velios/shared-types";

export function selectedMember(
  members: PublicMember[],
  selectedMemberId?: string,
): PublicMember | undefined {
  if (selectedMemberId) {
    return members.find((member) => member.memberId === selectedMemberId);
  }
  return members.length === 1 ? members[0] : undefined;
}

export function selectedAgent(
  agents: PublicAgent[],
  selectedAgentId?: string,
): PublicAgent | undefined {
  if (selectedAgentId) {
    return agents.find((agent) => agent.agentId === selectedAgentId);
  }
  return agents.length === 1 ? agents[0] : undefined;
}

export function asSelectedId(value: string | undefined): Hex32 | undefined {
  return value as Hex32 | undefined;
}
