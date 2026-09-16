/**
 * Browser PrivateStateProvider with AES-GCM envelopes.
 * Never labels plaintext as encrypted. Signing keys stay in the same store.
 */

import type { ContractAddress, SigningKey } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
import type {
  ExportPrivateStatesOptions,
  ExportSigningKeysOptions,
  ImportPrivateStatesOptions,
  ImportPrivateStatesResult,
  ImportSigningKeysOptions,
  ImportSigningKeysResult,
  PrivateStateExport,
  PrivateStateId,
  PrivateStateProvider,
  SigningKeyExport,
} from "@midnight-ntwrk/midnight-js-types";

const ITERATIONS = 210_000;
const PREFIX = "velios.midnight.ps.v1";

export type EncryptedBrowserStoreOptions = {
  accountId: string;
  passwordProvider: () => string | Promise<string>;
  storage?: Storage;
};

type Envelope = {
  format: "velios-aes-gcm";
  salt: string;
  iv: string;
  ciphertext: string;
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

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") {
    return { __velios: "bigint", value: value.toString() };
  }
  if (value instanceof Uint8Array) {
    return {
      __velios: "bytes",
      value: [...value].map((byte) => byte.toString(16).padStart(2, "0")).join(""),
    };
  }
  return value;
}

function jsonReviver(_key: string, value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const record = value as { __velios?: unknown; value?: unknown };
  if (record.__velios === "bigint" && typeof record.value === "string") {
    return BigInt(record.value);
  }
  if (record.__velios === "bytes" && typeof record.value === "string") {
    const hex = record.value;
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i += 1) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return out;
  }
  return value;
}

async function encryptJson(value: unknown, password: string): Promise<Envelope> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(JSON.stringify(value, jsonReplacer)),
  );
  return {
    format: "velios-aes-gcm",
    salt: bytesToB64(salt),
    iv: bytesToB64(iv),
    ciphertext: bytesToB64(new Uint8Array(ciphertext)),
  };
}

async function decryptJson<T>(envelope: Envelope, password: string): Promise<T> {
  const key = await deriveKey(password, b64ToBytes(envelope.salt));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(envelope.iv) as BufferSource },
    key,
    b64ToBytes(envelope.ciphertext) as BufferSource,
  );
  return JSON.parse(new TextDecoder().decode(plain), jsonReviver) as T;
}

export function encryptedBrowserPrivateStateProvider<PSI extends PrivateStateId, PS = unknown>(
  options: EncryptedBrowserStoreOptions,
): PrivateStateProvider<PSI, PS> {
  const storage = options.storage ?? globalThis.localStorage;
  let contractAddress: ContractAddress | null = null;

  const requireContractAddress = (): ContractAddress => {
    if (contractAddress === null) throw new Error("Contract address not set");
    return contractAddress;
  };

  const stateKey = (address: ContractAddress, id: PSI) => `${PREFIX}.${options.accountId}.${address}.${id}`;
  const signingKey = (address: ContractAddress) => `${PREFIX}.${options.accountId}.signing.${address}`;

  return {
    setContractAddress(address: ContractAddress): void {
      contractAddress = address;
    },
    async set(key: PSI, state: PS): Promise<void> {
      const password = await options.passwordProvider();
      const envelope = await encryptJson(state, password);
      storage.setItem(stateKey(requireContractAddress(), key), JSON.stringify(envelope));
    },
    async get(key: PSI): Promise<PS | null> {
      const raw = storage.getItem(stateKey(requireContractAddress(), key));
      if (!raw) return null;
      const password = await options.passwordProvider();
      return decryptJson<PS>(JSON.parse(raw) as Envelope, password);
    },
    async remove(key: PSI): Promise<void> {
      storage.removeItem(stateKey(requireContractAddress(), key));
    },
    async clear(): Promise<void> {
      const prefix = `${PREFIX}.${options.accountId}.${requireContractAddress()}.`;
      for (let i = storage.length - 1; i >= 0; i -= 1) {
        const key = storage.key(i);
        if (key?.startsWith(prefix)) storage.removeItem(key);
      }
    },
    async setSigningKey(addr: ContractAddress, key: SigningKey): Promise<void> {
      const password = await options.passwordProvider();
      storage.setItem(signingKey(addr), JSON.stringify(await encryptJson(key, password)));
    },
    async getSigningKey(addr: ContractAddress): Promise<SigningKey | null> {
      const raw = storage.getItem(signingKey(addr));
      if (!raw) return null;
      const password = await options.passwordProvider();
      return decryptJson<SigningKey>(JSON.parse(raw) as Envelope, password);
    },
    async removeSigningKey(addr: ContractAddress): Promise<void> {
      storage.removeItem(signingKey(addr));
    },
    async clearSigningKeys(): Promise<void> {
      const prefix = `${PREFIX}.${options.accountId}.signing.`;
      for (let i = storage.length - 1; i >= 0; i -= 1) {
        const key = storage.key(i);
        if (key?.startsWith(prefix)) storage.removeItem(key);
      }
    },
    async exportPrivateStates(_options?: ExportPrivateStatesOptions): Promise<PrivateStateExport> {
      const password = await options.passwordProvider();
      const address = requireContractAddress();
      const prefix = `${PREFIX}.${options.accountId}.${address}.`;
      const states: Record<string, unknown> = {};
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (!key?.startsWith(prefix) || key.includes(".signing.")) continue;
        const id = key.slice(prefix.length) as PSI;
        states[id] = await this.get(id);
      }
      const envelope = await encryptJson({ contractAddress: address, states }, password);
      return {
        format: "midnight-private-state-export",
        encryptedPayload: JSON.stringify(envelope),
        salt: envelope.salt,
      };
    },
    async importPrivateStates(
      exportData: PrivateStateExport,
      importOptions?: ImportPrivateStatesOptions,
    ): Promise<ImportPrivateStatesResult> {
      const password = await options.passwordProvider();
      const payload = await decryptJson<{ states?: Record<string, PS> }>(
        JSON.parse(exportData.encryptedPayload) as Envelope,
        password,
      );
      const strategy = importOptions?.conflictStrategy ?? "error";
      let imported = 0;
      let skipped = 0;
      let overwritten = 0;
      for (const [id, state] of Object.entries(payload.states ?? {})) {
        const existing = await this.get(id as PSI);
        if (existing) {
          if (strategy === "skip") {
            skipped += 1;
            continue;
          }
          if (strategy === "error") throw new Error(`Conflict: ${id}`);
          overwritten += 1;
        } else {
          imported += 1;
        }
        await this.set(id as PSI, state);
      }
      return { imported, skipped, overwritten };
    },
    async exportSigningKeys(_options?: ExportSigningKeysOptions): Promise<SigningKeyExport> {
      const password = await options.passwordProvider();
      const prefix = `${PREFIX}.${options.accountId}.signing.`;
      const keys: Record<string, SigningKey> = {};
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (!key?.startsWith(prefix)) continue;
        const addr = key.slice(prefix.length) as ContractAddress;
        const value = await this.getSigningKey(addr);
        if (value) keys[addr] = value;
      }
      const envelope = await encryptJson({ keys }, password);
      return {
        format: "midnight-signing-key-export",
        encryptedPayload: JSON.stringify(envelope),
        salt: envelope.salt,
      };
    },
    async importSigningKeys(
      exportData: SigningKeyExport,
      importOptions?: ImportSigningKeysOptions,
    ): Promise<ImportSigningKeysResult> {
      const password = await options.passwordProvider();
      const payload = await decryptJson<{ keys?: Record<string, SigningKey> }>(
        JSON.parse(exportData.encryptedPayload) as Envelope,
        password,
      );
      const strategy = importOptions?.conflictStrategy ?? "error";
      let imported = 0;
      let skipped = 0;
      let overwritten = 0;
      for (const [addr, key] of Object.entries(payload.keys ?? {})) {
        const existing = await this.getSigningKey(addr as ContractAddress);
        if (existing) {
          if (strategy === "skip") {
            skipped += 1;
            continue;
          }
          if (strategy === "error") throw new Error(`Conflict: ${addr}`);
          overwritten += 1;
        } else {
          imported += 1;
        }
        await this.setSigningKey(addr as ContractAddress, key);
      }
      return { imported, skipped, overwritten };
    },
  };
}
