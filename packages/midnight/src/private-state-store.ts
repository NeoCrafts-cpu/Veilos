import type { VeliosPrivateState } from "@velios/shared-types";
import { PRIVATE_STATE_ID } from "./ids.js";

export type PrivateStateStore = {
  setContractAddress?: (address: string) => void;
  set?: (id: string, state: unknown) => Promise<void>;
};

export async function writeCircuitPrivateState(
  providers: { privateStateProvider?: PrivateStateStore },
  contractAddress: string,
  privateStateId: string,
  privateState: unknown,
): Promise<void> {
  const store = providers.privateStateProvider;
  if (!store?.set) {
    throw new Error("environment missing: private state provider");
  }
  store.setContractAddress?.(contractAddress);
  await store.set(privateStateId, privateState);
}

export async function writeJoinedPrivateState(
  providers: { privateStateProvider?: PrivateStateStore },
  contractAddress: string,
  privateState: VeliosPrivateState,
): Promise<void> {
  await writeCircuitPrivateState(providers, contractAddress, PRIVATE_STATE_ID, privateState);
}
