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
  contractAddress: "0787a1918a339a98a4442e5f1fe370506e1bb838d5819205afa79e53ab2d8e02",
  organizationId: asHex32("84325409dceb448a816ea6dbf96829c207488738ff6c7d4ac1276cae19464cab"),
  organizationName: "ACME AUTONOMOUS SYSTEMS",
  memberId: asHex32("942d796fe7fc58717b191197a0b81a6331fd7d74c9d4ee1b2efb88e07f19ab3c"),
  memberLabel: "FOUNDING-MEMBER",
  createdAt: "2026-09-13T13:22:03.482Z",
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
  contractAddress: "0b4a8d7e906a1c05d2c3c788ecf46682387e2239a4df96b201f34ff489547c8f",
  organizationId: asHex32("84325409dceb448a816ea6dbf96829c207488738ff6c7d4ac1276cae19464cab"),
  organizationName: "ACME AUTONOMOUS SYSTEMS",
  deployTxId: "00a858c27854e88af1c7d9b0d8556c6ce2c30b6dfc237aa79dce45981fcc8d1e2b",
  createdAt: "2026-09-16T01:14:30.761Z",
};

export function publishedDeploymentFor(networkId: string): PublishedDeployment | null {
  if (networkId === "preview") return PREVIEW_DEPLOYMENT;
  return null;
}

export function publishedEconomyDeploymentFor(networkId: string): PublishedEconomyDeployment | null {
  if (networkId === "preview") return PREVIEW_ECONOMY_DEPLOYMENT;
  return null;
}
