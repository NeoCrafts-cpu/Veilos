/**
 * Node wallet adapter from the official funding guide:
 * https://docs.midnight.network/guides/acquire-tokens
 * and midnightntwrk/example-hello-world `src/wallet.ts` (Apache-2.0).
 *
 * Isolated in the CLI. Never log seeds, mnemonics, or private keys.
 */

import {
  DustSecretKey,
  LedgerParameters,
  ZswapSecretKeys,
  type CoinPublicKey,
  type EncPublicKey,
  type FinalizedTransaction,
} from "@midnight-ntwrk/midnight-js-protocol/ledger";
import { getNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import type { MidnightProvider, UnboundTransaction, WalletProvider } from "@midnight-ntwrk/midnight-js-types";
import { ttlOneHour } from "@midnight-ntwrk/midnight-js-utils";
import {
  DustWallet,
  HDWallet,
  NoOpTransactionHistoryStorage,
  PublicKey,
  Roles,
  ShieldedWallet,
  UnshieldedWallet,
  WalletFacade,
  createKeystore,
  validateMnemonic,
  type FacadeState,
  type UnshieldedKeystore,
} from "@midnight-ntwrk/wallet-sdk";
import { mnemonicToSeedSync } from "@scure/bip39";
import type { NetworkConfig } from "@velios/midnight";
import * as Rx from "rxjs";
import { createIndexerAlignedClock } from "./clock.js";
import type { WalletSecret } from "./secret.js";

/** Official acquire-tokens Preview/Preprod fee buffer (0.3 DUST). */
const DUST_COST_PARAMETERS = {
  additionalFeeOverhead: 300_000_000_000_000n,
  feeBlocksMargin: 5,
};

export function masterSeedFromSecret(secret: WalletSecret): string {
  if (secret.kind === "seed") return secret.value;
  if (!validateMnemonic(secret.value)) {
    throw new Error("VELIOS_WALLET_MNEMONIC is not a valid BIP39 mnemonic");
  }
  // Same derivation official testkit-js WalletSeeds.fromMnemonic uses.
  return Buffer.from(mnemonicToSeedSync(secret.value)).toString("hex");
}

function deriveKeys(seed: string) {
  const hd = HDWallet.fromSeed(Buffer.from(seed, "hex"));
  if (hd.type !== "seedOk") {
    throw new Error("Failed to initialize HDWallet from seed");
  }
  const result = hd.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== "keysDerived") {
    throw new Error("Failed to derive keys from seed");
  }
  hd.hdWallet.clear();
  return result.keys;
}

export class MidnightWalletProvider implements MidnightProvider, WalletProvider {
  readonly wallet: WalletFacade;
  readonly unshieldedKeystore: UnshieldedKeystore;

  private constructor(
    wallet: WalletFacade,
    private readonly zswapSecretKeys: ZswapSecretKeys,
    private readonly dustSecretKey: DustSecretKey,
    unshieldedKeystore: UnshieldedKeystore,
  ) {
    this.wallet = wallet;
    this.unshieldedKeystore = unshieldedKeystore;
  }

  getCoinPublicKey(): CoinPublicKey {
    return this.zswapSecretKeys.coinPublicKey;
  }

  getEncryptionPublicKey(): EncPublicKey {
    return this.zswapSecretKeys.encryptionPublicKey;
  }

  async balanceTx(tx: UnboundTransaction, ttl: Date = ttlOneHour()): Promise<FinalizedTransaction> {
    const recipe = await this.wallet.balanceUnboundTransaction(
      tx,
      {
        shieldedSecretKeys: this.zswapSecretKeys,
        dustSecretKey: this.dustSecretKey,
      },
      { ttl },
    );
    return await this.wallet.finalizeRecipe(recipe);
  }

  submitTx(tx: FinalizedTransaction): Promise<string> {
    return this.wallet.submitTransaction(tx);
  }

  async start(): Promise<void> {
    await this.wallet.start(this.zswapSecretKeys, this.dustSecretKey);
  }

  async stop(): Promise<void> {
    await this.wallet.stop();
  }

  static async build(config: NetworkConfig, secret: WalletSecret): Promise<MidnightWalletProvider> {
    const keys = deriveKeys(masterSeedFromSecret(secret));
    const networkId = getNetworkId();
    const shieldedSecretKeys = ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
    const dustSecretKey = DustSecretKey.fromSeed(keys[Roles.Dust]);
    const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);

    const shieldedConfig = {
      networkId,
      indexerClientConnection: {
        indexerHttpUrl: config.indexer,
        indexerWsUrl: config.indexerWS,
      },
      provingServerUrl: new URL(config.proofServer),
      relayURL: new URL(config.node.replace(/^http/, "ws")),
      batchSize: 1000,
    };
    const unshieldedConfig = {
      networkId,
      indexerClientConnection: {
        indexerHttpUrl: config.indexer,
        indexerWsUrl: config.indexerWS,
      },
      txHistoryStorage: new NoOpTransactionHistoryStorage(),
    };
    const dustConfig = {
      ...shieldedConfig,
      costParameters: DUST_COST_PARAMETERS,
    };

    const wallet = await WalletFacade.init({
      configuration: { ...shieldedConfig, ...unshieldedConfig, ...dustConfig },
      clock: () => createIndexerAlignedClock(config.indexer),
      shielded: (cfg) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
      unshielded: (cfg) => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
      dust: (cfg) => DustWallet(cfg).startWithSecretKey(dustSecretKey, LedgerParameters.initialParameters().dust),
    });

    return new MidnightWalletProvider(wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore);
  }
}

function isProgressStrictlyComplete(progress: unknown): boolean {
  if (!progress || typeof progress !== "object") return false;
  const candidate = progress as { isStrictlyComplete?: unknown };
  return typeof candidate.isStrictlyComplete === "function" && candidate.isStrictlyComplete();
}

export async function syncWallet(wallet: WalletFacade, timeoutMs: number): Promise<FacadeState> {
  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.filter(
        (state: FacadeState) =>
          isProgressStrictlyComplete(state.shielded.state.progress) &&
          isProgressStrictlyComplete(state.dust.state.progress) &&
          isProgressStrictlyComplete(state.unshielded.progress),
      ),
      Rx.timeout({
        each: timeoutMs,
        with: () => Rx.throwError(() => new Error(`Wallet sync timeout after ${timeoutMs}ms`)),
      }),
    ),
  );
}
