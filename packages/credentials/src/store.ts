/**
 * Encrypted credential store. Never log credential bodies or holder secrets.
 */

export type EncryptedCredentialRecord = {
  format: "velios-credential-aes-gcm";
  salt: string;
  iv: string;
  ciphertext: string;
};

export type IssuedCredential = {
  organizationId: string;
  className: string;
  expiry: string;
  commitment: string;
  holderSecret: string;
  salt: string;
  revocationSecret: string;
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
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 210_000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptCredential(record: IssuedCredential, password: string): Promise<EncryptedCredentialRecord> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(JSON.stringify(record)),
  );
  return {
    format: "velios-credential-aes-gcm",
    salt: bytesToB64(salt),
    iv: bytesToB64(iv),
    ciphertext: bytesToB64(new Uint8Array(ciphertext)),
  };
}

export async function decryptCredential(
  envelope: EncryptedCredentialRecord,
  password: string,
): Promise<IssuedCredential> {
  const key = await deriveKey(password, b64ToBytes(envelope.salt));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(envelope.iv) as BufferSource },
    key,
    b64ToBytes(envelope.ciphertext) as BufferSource,
  );
  return JSON.parse(new TextDecoder().decode(plain)) as IssuedCredential;
}
