/** Midnight Level store: at least 3 of uppercase, lowercase, digits, special. */
export function privateStorePasswordClasses(password: string): number {
  return [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

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
  const found = privateStorePasswordClasses(password);
  if (found < 3) {
    throw new Error(
      `VELIOS_PRIVATE_STORE_PASSWORD must contain at least 3 of: uppercase, lowercase, digits, special characters. Found: ${found}`,
    );
  }
  return password;
}
