/**
 * NIGHT → DUST registration, copied from the official funding guide:
 * https://docs.midnight.network/guides/acquire-tokens
 *
 * Preview/Preprod fees are DUST. Holding tNIGHT does nothing until the
 * UTXOs are registered. Do not log coins, keys, or recipes.
 */

import { getNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { unshieldedToken } from "@midnight-ntwrk/midnight-js-protocol/ledger";
import { DustAddress, MidnightBech32m, type UnshieldedKeystore, type WalletFacade } from "@midnight-ntwrk/wallet-sdk";
import { firstValueFrom, throwError } from "rxjs";
import { filter, map, throttleTime, timeout } from "rxjs/operators";

export type NightCoin = {
  utxo?: { type?: unknown };
  meta?: { registeredForDustGeneration?: boolean };
};

export function unregisteredNightUtxos<T extends NightCoin>(coins: readonly T[], nightTokenRaw?: unknown): T[] {
  return coins.filter((coin) => {
    if (coin.meta?.registeredForDustGeneration === true) return false;
    if (nightTokenRaw === undefined || coin.utxo?.type === undefined) return true;
    return coin.utxo.type === nightTokenRaw;
  });
}

export function isDustReady(input: {
  availableCoins: { length: number };
  balance: (now: Date) => bigint;
}): boolean {
  return input.availableCoins.length >= 1 && input.balance(new Date()) > 0n;
}

export function publicDustError(error: unknown): string {
  const message = error instanceof Error ? error.message : "dust registration failed";
  const lower = message.toLowerCase();
  if (lower.includes("171") || lower.includes("outofdustvaliditywindow") || lower.includes("validity window")) {
    return "dust ctime outside validity window; retrying with indexer-aligned clock";
  }
  if (
    lower.includes("1010") ||
    lower.includes("138") ||
    lower.includes("173") ||
    lower.includes("overspend") ||
    lower.includes("insufficient")
  ) {
    return "registration under-funded; waiting for retroactive DUST";
  }
  return "dust registration failed";
}

export function publicUnshieldedAddress(keystore: { getBech32Address: () => unknown }): string {
  const raw = keystore.getBech32Address();
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "asString" in raw && typeof (raw as { asString: unknown }).asString === "function") {
    return (raw as { asString: () => string }).asString();
  }
  return String(raw);
}

export function formatNight(raw: bigint): string {
  return `${raw / 1_000_000n}.${(raw % 1_000_000n).toString().padStart(6, "0")}`;
}

export function formatDust(raw: bigint): string {
  return `${raw / 1_000_000_000_000_000n}.${(raw % 1_000_000_000_000_000n).toString().padStart(15, "0")}`;
}

export async function waitForSyncedState(wallet: WalletFacade) {
  if (typeof wallet.waitForSyncedState === "function") {
    return wallet.waitForSyncedState();
  }
  return firstValueFrom(wallet.state().pipe(filter((state) => Boolean(state.isSynced))));
}

export async function waitForNightBalance(
  wallet: WalletFacade,
  readBalance: (state: unknown) => bigint,
  timeoutMs: number,
): Promise<bigint> {
  return firstValueFrom(
    wallet.state().pipe(
      throttleTime(10_000),
      map((state) => readBalance(state)),
      filter((balance) => balance > 0n),
      timeout({
        each: timeoutMs,
        with: () => throwError(() => new Error("no tNIGHT yet — fund the printed unshielded address")),
      }),
    ),
  );
}

export async function waitForDustReady(wallet: WalletFacade, timeoutMs: number): Promise<void> {
  await firstValueFrom(
    wallet.state().pipe(
      throttleTime(5_000),
      filter((state) => Boolean(state.isSynced)),
      filter((state) => isDustReady(state.dust)),
      timeout({
        each: timeoutMs,
        with: () => throwError(() => new Error("no spendable DUST yet")),
      }),
    ),
  );
}

export async function registerNightForDust(
  wallet: WalletFacade,
  unshieldedKeystore: UnshieldedKeystore,
): Promise<"already" | "submitted"> {
  const state = await waitForSyncedState(wallet);
  if (isDustReady(state.dust)) {
    return "already";
  }

  const unregistered = unregisteredNightUtxos(state.unshielded.availableCoins, unshieldedToken().raw);
  if (unregistered.length === 0) {
    return "already";
  }

  // Official WalletFacade 4.1.0: wait until retroactive DUST covers the
  // registration fee (midnight-wallet#415) before submitting.
  const estimate = await wallet.estimateRegistration(unregistered);
  await wallet.waitForGeneratedDust(unregistered, estimate.fee, { timeoutMs: 300_000 });

  const networkId = getNetworkId();
  const target = String(DustAddress.encodePublicKey(networkId, state.dust.publicKey));
  const dustReceiver = MidnightBech32m.parse(target).decode(DustAddress, networkId);
  const recipe = await wallet.registerNightUtxosForDustGeneration(
    unregistered,
    unshieldedKeystore.getPublicKey(),
    (payload: Uint8Array) => unshieldedKeystore.signData(payload),
    dustReceiver,
  );
  const finalized = await wallet.finalizeRecipe(recipe);
  await wallet.submitTransaction(finalized);
  return "submitted";
}

export async function registerNightForDustWithRetry(
  wallet: WalletFacade,
  unshieldedKeystore: UnshieldedKeystore,
  options?: { attempts?: number; delayMs?: number; onRetry?: (message: string) => void },
): Promise<"already" | "submitted"> {
  const attempts = options?.attempts ?? 5;
  const delayMs = options?.delayMs ?? 30_000;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await registerNightForDust(wallet, unshieldedKeystore);
    } catch (error) {
      lastError = error;
      options?.onRetry?.(publicDustError(error));
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("dust registration failed");
}

