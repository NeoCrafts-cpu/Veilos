/**
 * Public build marker so QA can tell a hosted bundle from a stale deploy.
 * Never put seeds, witnesses, or operator secrets here.
 */

export function veliosBuildId(): string {
  const env = (import.meta as { env?: { VITE_VELIOS_BUILD?: string } }).env;
  return env?.VITE_VELIOS_BUILD || "dev";
}

export function veliosBuiltAt(): string {
  const env = (import.meta as { env?: { VITE_VELIOS_BUILT_AT?: string } }).env;
  return env?.VITE_VELIOS_BUILT_AT || "local";
}
