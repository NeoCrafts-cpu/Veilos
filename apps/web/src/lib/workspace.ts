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
const SIDEBAR_KEY = "velios.workspace.sidebar.v1";

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

export function readSidebarHidden(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIDEBAR_KEY) === "hidden";
}

export function writeSidebarHidden(hidden: boolean): void {
  if (typeof window === "undefined") return;
  if (hidden) window.localStorage.setItem(SIDEBAR_KEY, "hidden");
  else window.localStorage.removeItem(SIDEBAR_KEY);
}
