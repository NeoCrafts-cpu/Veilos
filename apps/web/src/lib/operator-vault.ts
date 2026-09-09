/**
 * Encrypted operator vault. Never log the passphrase or plaintext payload.
 * Ciphertext may be stored in localStorage. Decrypted state stays in memory.
 */

import { decodePrivateState, encodePrivateState } from "@velios/midnight";
import type { VeliosPrivateState } from "@velios/shared-types";
import { emptyJournal, isOperationJournal, type OperationJournal } from "./operation-journal.js";

export const VAULT_KIND = "velios-operator-vault";
export const VAULT_VERSION = 2;
export const PENDING_VAULT_ADDRESS = "pending";
const ITERATIONS = 210_000;

export type EncryptedOperatorVault = {
  version: number;
  kind: typeof VAULT_KIND;
  networkId: string;
  contractAddress: string;
  kdf: "PBKDF2";
  hash: "SHA-256";
  algo: "AES-GCM";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
};

export type DecryptedVault = {
  state: VeliosPrivateState;
  journal: OperationJournal;
};

function bytesToB64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function b64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

function vaultKey(networkId: string, contractAddress: string): string {
  return `velios.vault.v1.${networkId}.${contractAddress}`;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export function isEncryptedVault(value: unknown): value is EncryptedOperatorVault {
  if (!value || typeof value !== "object") return false;
  const record = value as EncryptedOperatorVault;
  return (
    record.kind === VAULT_KIND &&
    (record.version === 1 || record.version === VAULT_VERSION) &&
    typeof record.ciphertext === "string"
  );
}

export async function encryptOperatorVault(input: {
  state: VeliosPrivateState;
  journal?: OperationJournal;
  passphrase: string;
  networkId: string;
  contractAddress: string;
}): Promise<EncryptedOperatorVault> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(input.passphrase, salt);
  const encoded = new TextEncoder().encode(
    JSON.stringify({
      state: encodePrivateState(input.state),
      journal: input.journal ?? emptyJournal(),
    }),
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encoded,
  );
  return {
    version: VAULT_VERSION,
    kind: VAULT_KIND,
    networkId: input.networkId,
    contractAddress: input.contractAddress,
    kdf: "PBKDF2",
    hash: "SHA-256",
    algo: "AES-GCM",
    iterations: ITERATIONS,
    salt: bytesToB64(salt),
    iv: bytesToB64(iv),
    ciphertext: bytesToB64(new Uint8Array(ciphertext)),
  };
}

export async function decryptOperatorVault(
  vault: EncryptedOperatorVault,
  passphrase: string,
): Promise<VeliosPrivateState> {
  return (await decryptOperatorVaultBundle(vault, passphrase)).state;
}

export async function decryptOperatorVaultBundle(
  vault: EncryptedOperatorVault,
  passphrase: string,
): Promise<DecryptedVault> {
  const key = await deriveKey(passphrase, b64ToBytes(vault.salt));
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64ToBytes(vault.iv) as BufferSource },
      key,
      b64ToBytes(vault.ciphertext) as BufferSource,
    );
    const parsed: unknown = JSON.parse(new TextDecoder().decode(plain));
    if (parsed && typeof parsed === "object" && "state" in parsed) {
      const record = parsed as { state: unknown; journal?: unknown };
      return {
        state: decodePrivateState(record.state),
        journal: isOperationJournal(record.journal) ? record.journal : emptyJournal(),
      };
    }
    return { state: decodePrivateState(parsed), journal: emptyJournal() };
  } catch {
    throw new Error("invalid passphrase");
  }
}

export function readEncryptedVault(networkId: string, contractAddress: string): EncryptedOperatorVault | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(vaultKey(networkId, contractAddress));
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isEncryptedVault(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeEncryptedVault(vault: EncryptedOperatorVault): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(vaultKey(vault.networkId, vault.contractAddress), JSON.stringify(vault));
}

export function listVaultContracts(networkId: string): string[] {
  if (typeof window === "undefined") return [];
  const prefix = `velios.vault.v1.${networkId}.`;
  const contracts: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key?.startsWith(prefix)) contracts.push(key.slice(prefix.length));
  }
  return contracts;
}

export function downloadEncryptedVault(vault: EncryptedOperatorVault): void {
  const blob = new Blob([JSON.stringify(vault)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `velios-operator-vault-${vault.contractAddress.slice(0, 8)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
