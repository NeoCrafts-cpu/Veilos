import type { VeliosPrivateState } from "@velios/shared-types";
import { PRIVATE_STATE_ID } from "./ids.js";

export type PrivateStateStore = {
  setContractAddress?: (address: string) => void;
  set?: (id: string, state: unknown) => Promise<void>;
};

export async function writeJoinedPrivateState(
  providers: { privateStateProvider?: PrivateStateStore },
  contractAddress: string,
  privateState: VeliosPrivateState,
): Promise<void> {
  const store = providers.privateStateProvider;
  if (!store?.set) {
    throw new Error("environment missing: private state provider");
  }
  store.setContractAddress?.(contractAddress);
  await store.set(PRIVATE_STATE_ID, privateState);
}
