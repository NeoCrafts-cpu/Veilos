import { pad32, persistentHash } from "@velios/policy-engine";

function disclosureScopeCommitment(input: {
  auditorId: Uint8Array;
  claims: Uint8Array;
  nonce: Uint8Array;
}): Uint8Array {
  return persistentHash([pad32("velios:disclose:"), input.auditorId, input.claims, input.nonce]);
}

export type DisclosureGrant = {
  auditorId: Uint8Array;
  scope: string[];
  expires: bigint;
  nonce: Uint8Array;
  actionAnchors: string[];
};

export type DisclosureBundle = {
  grantCommitment: Uint8Array;
  claims: Record<string, string>;
  anchors: Record<string, string>;
  expires: bigint;
  auditorId: Uint8Array;
};

export async function encryptDisclosureBundle(
  bundle: DisclosureBundle,
  password: string,
): Promise<{ format: "velios-disclosure-aes-gcm"; salt: string; iv: string; ciphertext: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 210_000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(
      JSON.stringify({
        ...bundle,
        expires: bundle.expires.toString(),
        auditorId: Buffer.from(bundle.auditorId).toString("hex"),
        grantCommitment: Buffer.from(bundle.grantCommitment).toString("hex"),
      }),
    ),
  );
  const toB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
  return {
    format: "velios-disclosure-aes-gcm",
    salt: toB64(salt),
    iv: toB64(iv),
    ciphertext: toB64(new Uint8Array(ciphertext)),
  };
}

export function createDisclosure(input: {
  grant: DisclosureGrant;
  claims: Record<string, string>;
  anchors: Record<string, string>;
  now: bigint;
}): DisclosureBundle {
  if (input.now > input.grant.expires) throw new Error("grant expired");
  for (const key of Object.keys(input.claims)) {
    if (!input.grant.scope.includes(key)) throw new Error("overbroad scope");
  }
  const claimsBytes = new TextEncoder().encode(JSON.stringify(Object.keys(input.claims).sort()));
  const padded = new Uint8Array(32);
  padded.set(claimsBytes.slice(0, 32));
  return {
    grantCommitment: disclosureScopeCommitment({
      auditorId: input.grant.auditorId,
      claims: padded,
      nonce: input.grant.nonce,
    }),
    claims: input.claims,
    anchors: input.anchors,
    expires: input.grant.expires,
    auditorId: input.grant.auditorId,
  };
}

export function verifyDisclosure(
  bundle: DisclosureBundle,
  input: { auditorId: Uint8Array; now: bigint; expectedAnchors: Record<string, string> },
): void {
  if (input.now > bundle.expires) throw new Error("grant expired");
  if (!Buffer.from(bundle.auditorId).equals(Buffer.from(input.auditorId))) throw new Error("wrong auditor");
  for (const [key, value] of Object.entries(input.expectedAnchors)) {
    if (bundle.anchors[key] !== value) throw new Error("modified claims");
  }
}
