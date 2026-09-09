import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { settlementDisclosureCopy } from "@velios/economy";

export type EconomySelection = {
  credentialId?: string;
  proposalId?: string;
  procurementId?: string;
  settlementActionId?: string;
  acknowledgedLeakage: boolean;
};

export type EconomyValue = {
  selection: EconomySelection;
  acknowledgeLeakage: () => void;
  selectSettlement: (actionId: string) => void;
  disclosure: ReturnType<typeof settlementDisclosureCopy>;
};

const EconomyContext = createContext<EconomyValue | null>(null);

export function EconomyProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<EconomySelection>({ acknowledgedLeakage: false });
  const value = useMemo<EconomyValue>(
    () => ({
      selection,
      acknowledgeLeakage: () => setSelection((prev) => ({ ...prev, acknowledgedLeakage: true })),
      selectSettlement: (actionId) => setSelection((prev) => ({ ...prev, settlementActionId: actionId })),
      disclosure: settlementDisclosureCopy(),
    }),
    [selection],
  );
  return <EconomyContext.Provider value={value}>{children}</EconomyContext.Provider>;
}

export function useEconomy(): EconomyValue {
  const value = useContext(EconomyContext);
  if (!value) throw new Error("economy session missing");
  return value;
}
