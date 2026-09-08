import type { OfficialCredentialAdapter } from "./ports.js";

export function officialMidnightVcAdapter(): OfficialCredentialAdapter {
  return {
    kind: "official-midnight-vc",
    compatible: false,
    reason:
      "midnightntwrk/midnight-verifiable-credentials and @midnight-ntwrk/midnight-did-api are not proven against MidnightJS 4.1.1 in this repository. Organization-issued credentials remain the authorization predicate.",
  };
}
