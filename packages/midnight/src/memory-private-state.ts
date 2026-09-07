/**
 * In-memory PrivateStateProvider for tests and Node-less unit wiring.
 * Exports are refused. Production browser paths use the encrypted store.
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

export const inMemoryPrivateStateProvider = <PSI extends PrivateStateId, PS = unknown>(): PrivateStateProvider<
  PSI,
  PS
> => {
  const privateStates = new Map<ContractAddress, Map<PSI, PS>>();
  const signingKeys = new Map<ContractAddress, SigningKey>();
  let contractAddress: ContractAddress | null = null;

  const requireContractAddress = (): ContractAddress => {
    if (contractAddress === null) throw new Error("Contract address not set");
    return contractAddress;
  };

  const getScopedStates = (address: ContractAddress): Map<PSI, PS> => {
    let scopedStates = privateStates.get(address);
    if (!scopedStates) {
      scopedStates = new Map<PSI, PS>();
      privateStates.set(address, scopedStates);
    }
    return scopedStates;
  };

  return {
    setContractAddress(address: ContractAddress): void {
      contractAddress = address;
    },
    set(key: PSI, state: PS): Promise<void> {
      getScopedStates(requireContractAddress()).set(key, state);
      return Promise.resolve();
    },
    get(key: PSI): Promise<PS | null> {
      return Promise.resolve(getScopedStates(requireContractAddress()).get(key) ?? null);
    },
    remove(key: PSI): Promise<void> {
      getScopedStates(requireContractAddress()).delete(key);
      return Promise.resolve();
    },
    clear(): Promise<void> {
      privateStates.delete(requireContractAddress());
      return Promise.resolve();
    },
    setSigningKey(addr: ContractAddress, key: SigningKey): Promise<void> {
      signingKeys.set(addr, key);
      return Promise.resolve();
    },
    getSigningKey(addr: ContractAddress): Promise<SigningKey | null> {
      return Promise.resolve(signingKeys.get(addr) ?? null);
    },
    removeSigningKey(addr: ContractAddress): Promise<void> {
      signingKeys.delete(addr);
      return Promise.resolve();
    },
    clearSigningKeys(): Promise<void> {
      signingKeys.clear();
      return Promise.resolve();
    },
    exportPrivateStates(_options?: ExportPrivateStatesOptions): Promise<PrivateStateExport> {
      return Promise.reject(new Error("in-memory private state cannot be exported"));
    },
    importPrivateStates(
      _exportData: PrivateStateExport,
      _options?: ImportPrivateStatesOptions,
    ): Promise<ImportPrivateStatesResult> {
      return Promise.reject(new Error("in-memory private state cannot be imported"));
    },
    exportSigningKeys(_options?: ExportSigningKeysOptions): Promise<SigningKeyExport> {
      return Promise.reject(new Error("in-memory signing keys cannot be exported"));
    },
    importSigningKeys(
      _exportData: SigningKeyExport,
      _options?: ImportSigningKeysOptions,
    ): Promise<ImportSigningKeysResult> {
      return Promise.reject(new Error("in-memory signing keys cannot be imported"));
    },
  };
};
