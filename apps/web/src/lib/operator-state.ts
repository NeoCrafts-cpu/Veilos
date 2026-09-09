/**
 * Labelled development adapter for plaintext encoded private state.
 * Never log the payload. Production browser persist uses the encrypted vault.
 * Do not auto-read this into a ready-to-operate session.
 */

export function operatorStorageKey(networkId: string): string {
  return `velios.operator.${networkId}`;
}

export function writeOperatorStateLocal(networkId: string, encoded: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(operatorStorageKey(networkId), JSON.stringify(encoded));
}

export function readOperatorStateLocal(networkId: string): unknown | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(operatorStorageKey(networkId));
  if (!raw) return null;
  return JSON.parse(raw) as unknown;
}

export function downloadOperatorBackup(encoded: unknown): void {
  const blob = new Blob([JSON.stringify(encoded)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "velios-operator-state.json";
  anchor.click();
  URL.revokeObjectURL(url);
}
