export function resolvePrivateStorePassword(
  env: NodeJS.ProcessEnv,
  accountId: string,
): string {
  const password = env.VELIOS_PRIVATE_STORE_PASSWORD;
  if (!password) {
    throw new Error("VELIOS_PRIVATE_STORE_PASSWORD is required");
  }
  if (password === accountId || password === `${accountId}!`) {
    throw new Error("VELIOS_PRIVATE_STORE_PASSWORD must not be derived from the account id");
  }
  return password;
}
