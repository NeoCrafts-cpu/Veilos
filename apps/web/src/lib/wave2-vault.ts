/**
 * Encrypted Wave 2 operator records. PBKDF2 + AES-GCM, scoped to network.
 * Never log the passphrase. Ciphertext may be stored; plaintext stays in memory.
 * Bodies, ballot choices, and bid amounts stay here — never in public ledger types.
 */

const ITERATIONS = 210_000;
const KEY = "velios.wave2.vault.v1";

export type EncryptedWave2Vault = {
  version: 1;
  kind: "velios-wave2-vault";
  networkId: string;
  kdf: "PBKDF2";
  hash: "SHA-256";
  algo: "AES-GCM";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
};

export type StoredCredentialRecord = {
  commitment: string;
  className: string;
  expiry: string;
  holderSecret: string;
  salt: string;
  revocationSecret: string;
  vendorCommitment?: string;
  perActionLimit?: string;
  dailyLimit?: string;
  txId?: string;
};

export type StoredTreasurySpend = {
  periodStart: string;
  dailySpend: string;
  spendSalt: string;
};

export type StoredPaymentRecord = {
  actionId: string;
  agentId: string;
  amount: string;
  recipient: string;
  recipientBytes: string;
  vendorCommitment: string;
  intentSalt: string;
  reasonDigest: string;
  periodStart: string;
  periodEnd: string;
  perActionLimit: string;
  dailyLimit: string;
  spendPeriodStart: string;
  spendDaily: string;
  txId?: string;
};

export type StoredMembershipRecord = {
  holderCommitment: string;
  holderSecret: string;
  revocationSecret: string;
  txId?: string;
};

export type StoredBallotRecord = {
  proposalId: string;
  choice: "0" | "1";
  salt: string;
  holderSecret: string;
  revocationSecret: string;
  nullifier: string;
  txId?: string;
};

export type StoredBidRecord = {
  procurementId: string;
  amount: string;
  salt: string;
  holderSecret: string;
  revocationSecret: string;
  bidCommitment: string;
  txId?: string;
};

export type Wave2VaultPayload = {
  economyOwnerSecret?: string;
  governanceOwnerSecret?: string;
  procurementOwnerSecret?: string;
  auditorOwnerSecret?: string;
  credentials: StoredCredentialRecord[];
  payments: StoredPaymentRecord[];
  voters: StoredMembershipRecord[];
  ballots: StoredBallotRecord[];
  bidders: StoredMembershipRecord[];
  bids: StoredBidRecord[];
  treasurySpend?: StoredTreasurySpend;
};

export function emptyWave2Vault(): Wave2VaultPayload {
  return {
    credentials: [],
    payments: [],
    voters: [],
    ballots: [],
    bidders: [],
    bids: [],
  };
}

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

function vaultStorageKey(networkId: string): string {
  return `${KEY}.${networkId}`;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, [
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

export function readEncryptedWave2Vault(networkId: string): EncryptedWave2Vault | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(vaultStorageKey(networkId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as EncryptedWave2Vault;
    if (parsed.kind !== "velios-wave2-vault") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function encryptWave2Vault(
  payload: Wave2VaultPayload,
  passphrase: string,
  networkId: string,
): Promise<EncryptedWave2Vault> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const vault: EncryptedWave2Vault = {
    version: 1,
    kind: "velios-wave2-vault",
    networkId,
    kdf: "PBKDF2",
    hash: "SHA-256",
    algo: "AES-GCM",
    iterations: ITERATIONS,
    salt: bytesToB64(salt),
    iv: bytesToB64(iv),
    ciphertext: bytesToB64(new Uint8Array(ciphertext)),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(vaultStorageKey(networkId), JSON.stringify(vault));
  }
  return vault;
}

export async function decryptWave2Vault(vault: EncryptedWave2Vault, passphrase: string): Promise<Wave2VaultPayload> {
  const key = await deriveKey(passphrase, b64ToBytes(vault.salt));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(vault.iv) as BufferSource },
    key,
    b64ToBytes(vault.ciphertext) as BufferSource,
  );
  const parsed = JSON.parse(new TextDecoder().decode(plain)) as Wave2VaultPayload;
  return {
    ...emptyWave2Vault(),
    ...parsed,
    credentials: parsed.credentials ?? [],
    payments: parsed.payments ?? [],
    voters: parsed.voters ?? [],
    ballots: parsed.ballots ?? [],
    bidders: parsed.bidders ?? [],
    bids: parsed.bids ?? [],
  };
}
