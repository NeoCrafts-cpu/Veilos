/**
 * Public Wave 2 contract addresses. Never store private state here.
 */

const KEY = "velios.wave2.contracts.v1";

export type Wave2ContractKind = "economy" | "governance" | "procurement" | "auditor";

export type Wave2ContractSelection = {
  networkId: string;
  economy?: string | undefined;
  governance?: string | undefined;
  procurement?: string | undefined;
  auditor?: string | undefined;
};

export function readWave2Contracts(): Wave2ContractSelection | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Wave2ContractSelection;
    if (!parsed.networkId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeWave2Contracts(selection: Wave2ContractSelection): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(selection));
}

export function setWave2Contract(
  current: Wave2ContractSelection,
  kind: Wave2ContractKind,
  address: string,
): Wave2ContractSelection {
  const next = { ...current, [kind]: address };
  writeWave2Contracts(next);
  return next;
}
