/**
 * Public workspace selection. Never store private state here.
 */

import type { WorkspaceMode } from "@velios/shared-types";

export type WorkspaceSelection = {
  mode: WorkspaceMode;
  networkId: string;
  contractAddress?: string | undefined;
  selectedMemberId?: string | undefined;
  selectedAgentId?: string | undefined;
};

const KEY = "velios.workspace.v1";

export function readWorkspaceSelection(): WorkspaceSelection | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as WorkspaceSelection;
    if (parsed.mode !== "owner" && parsed.mode !== "preview" && parsed.mode !== "unset") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeWorkspaceSelection(selection: WorkspaceSelection): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(selection));
}

export function clearWorkspaceSelection(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
