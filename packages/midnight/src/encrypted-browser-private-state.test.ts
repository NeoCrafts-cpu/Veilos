import { describe, expect, it } from "vitest";
import { encryptedBrowserPrivateStateProvider } from "./encrypted-browser-private-state.js";

class MemoryStorage implements Storage {
  private readonly map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

describe("encrypted browser private-state store", () => {
  it("round-trips private state as ciphertext", async () => {
    const storage = new MemoryStorage();
    const provider = encryptedBrowserPrivateStateProvider({
      accountId: "wallet-1",
      passwordProvider: () => "SixteenCharsPass1!",
      storage,
    });
    provider.setContractAddress("aa".repeat(32));
    await provider.set("velios", { ownerSecret: "hidden-secret", perActionLimit: 99 });
    const stored = [...Array(storage.length)].map((_, i) => storage.getItem(storage.key(i)!));
    expect(JSON.stringify(stored)).not.toMatch(/hidden-secret|perActionLimit|99/);
    const next = await provider.get("velios");
    expect(next).toEqual({ ownerSecret: "hidden-secret", perActionLimit: 99 });
  });

  it("exports an AES-GCM envelope, not plaintext JSON", async () => {
    const storage = new MemoryStorage();
    const provider = encryptedBrowserPrivateStateProvider({
      accountId: "wallet-1",
      passwordProvider: () => "SixteenCharsPass1!",
      storage,
    });
    provider.setContractAddress("bb".repeat(32));
    await provider.set("velios", { ownerSecret: "hidden-secret" });
    const exported = await provider.exportPrivateStates();
    expect(exported.encryptedPayload).not.toMatch(/hidden-secret/);
    expect(exported.salt).not.toBe("in-memory");
  });
});
