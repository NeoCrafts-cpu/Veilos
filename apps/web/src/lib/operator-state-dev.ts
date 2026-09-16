/**
 * Development-only plaintext operator-state endpoint.
 * Vite must not include this module in production chunks.
 */

const DEV_OPERATOR_STATE_PATH = "/@velios-operator-state";

function devOperatorHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  const token = (import.meta as { env?: { VITE_VELIOS_DEV_OPERATOR_STATE_TOKEN?: string } }).env
    ?.VITE_VELIOS_DEV_OPERATOR_STATE_TOKEN;
  if (token) headers.set("x-velios-dev-token", token);
  return headers;
}

export async function getDevOperatorState(): Promise<Response> {
  return fetch(DEV_OPERATOR_STATE_PATH, { headers: devOperatorHeaders() });
}

export async function putOperatorStateDev(encoded: unknown): Promise<void> {
  const response = await fetch(DEV_OPERATOR_STATE_PATH, {
    method: "PUT",
    headers: devOperatorHeaders({ "content-type": "application/json" }),
    body: JSON.stringify(encoded),
  });
  if (!response.ok && response.status !== 204) {
    throw new Error("operator state persist failed");
  }
}
