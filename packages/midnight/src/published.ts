/**
 * Public Preview deployment. These fields are on the indexer already.
 * Never put private state, seeds, or witnesses here.
 */

import { asHex32, type Hex32 } from "@velios/shared-types";

export type PublishedDeployment = {
  network: "preview";
  contractAddress: string;
  organizationId: Hex32;
  organizationName: string;
  memberId: Hex32;
  memberLabel: string;
  createdAt: string;
};

export const PREVIEW_DEPLOYMENT: PublishedDeployment = {
  network: "preview",
  contractAddress: "4b31d10bf6aba347cc0f041856488fa07cfe2604db7a4b1d432123c277a9e64b",
  organizationId: asHex32("84325409dceb448a816ea6dbf96829c207488738ff6c7d4ac1276cae19464cab"),
  organizationName: "ACME AUTONOMOUS SYSTEMS",
  memberId: asHex32("942d796fe7fc58717b191197a0b81a6331fd7d74c9d4ee1b2efb88e07f19ab3c"),
  memberLabel: "FOUNDING-MEMBER",
  createdAt: "2026-09-20T17:21:17.648Z",
};

export type PublishedEconomyDeployment = {
  network: "preview";
  contractKind: "economy-preview";
  contractAddress: string;
  organizationId: Hex32;
  organizationName: string;
  deployTxId: string;
  createdAt: string;
};

export const PREVIEW_ECONOMY_DEPLOYMENT: PublishedEconomyDeployment = {
  network: "preview",
  contractKind: "economy-preview",
  contractAddress: "bb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df",
  organizationId: asHex32("84325409dceb448a816ea6dbf96829c207488738ff6c7d4ac1276cae19464cab"),
  organizationName: "ACME AUTONOMOUS SYSTEMS",
  deployTxId: "005e082246788ba1b2215a91ddc9987a480c218e16c494b5667af6e11342235634",
  createdAt: "2026-09-20T17:57:49.048Z",
};

export function publishedDeploymentFor(networkId: string): PublishedDeployment | null {
  if (networkId === "preview") return PREVIEW_DEPLOYMENT;
  return null;
}

export function publishedEconomyDeploymentFor(networkId: string): PublishedEconomyDeployment | null {
  if (networkId === "preview") return PREVIEW_ECONOMY_DEPLOYMENT;
  return null;
}
